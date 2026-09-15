import { randomUUID } from "node:crypto";
import { getRuntimeData } from "./data.js";
import { OverlayStore } from "./store.js";
import {
  CALCULATION_VERSION,
  SCHEMA_VERSION,
  type GeneratedPath,
  type GrowthEvent,
  type PathTask,
  type Resource,
  type Scenario,
  type User,
} from "./types.js";

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const split = (value: string) => value.split("|").map((item) => item.trim()).filter(Boolean);
const isoDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.valueOf())) throw new ServiceError("INVALID_DATE", `无效日期: ${value}`, 400);
  return date.toISOString();
};

export class ServiceError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
  }
}

export interface ProfileInput {
  user_id: string;
  as_of_date?: string;
}

export interface PathInput {
  user_id: string;
  target_role_id: string;
  horizon_years?: number;
  weekly_hours?: number;
  priority?: "speed" | "depth" | "balanced";
}

export type ScenarioInput =
  | { action: "list"; user_id?: string; module_id?: string; difficulty?: string }
  | { action: "start"; user_id: string; scenario_id: string }
  | { action: "submit_and_evaluate"; user_id: string; session_id: string; response_text: string };

export type ProgressInput =
  | { action: "summary"; user_id: string; limit?: number }
  | { action: "list_events"; user_id: string; limit?: number }
  | { action: "record_event"; user_id: string; idempotency_key: string; event_type: string; detail: string; occurred_at?: string; duration_minutes?: number; skill_id?: string; resource_id?: string; score_delta?: number; sentiment?: string }
  | { action: "update_task"; user_id: string; idempotency_key: string; task_id: string; status: PathTask["status"] }
  | { action: "activate_path"; user_id: string; idempotency_key: string; path_id: string };

export class CareerService {
  readonly data = getRuntimeData();
  readonly store: OverlayStore;
  private readonly generatedPaths = new Map<string, GeneratedPath>();

  constructor(store = new OverlayStore()) {
    this.store = store;
  }

  async init(): Promise<void> {
    await this.store.init();
  }

  private user(userId: string): User {
    const user = [...this.data.users, ...this.data.test_users].find((item) => item.user_id === userId);
    if (!user) throw new ServiceError("USER_NOT_FOUND", `未找到模拟用户 ${userId}`, 404);
    if (user.data_split === "test" && process.env.A02_ENABLE_TEST_DATA !== "true") {
      throw new ServiceError("TEST_DATA_HIDDEN", "测试集仅用于自动评测，默认不对演示开放", 403);
    }
    return user;
  }

  private writeAllowed(user: User): void {
    const stopped = [...user.recent_events, ...(this.store.getState().events[user.user_id] || [])]
      .some((event) => event.event_type === "consent_withdrawn" || event.status === "processing_stopped");
    if (user.consent_status !== "granted_for_demo" || stopped) {
      throw new ServiceError("CONSENT_REQUIRED", "用户未授权演示写入，或已撤回授权", 403);
    }
  }

  private base(user?: User) {
    return {
      schema_version: SCHEMA_VERSION,
      calculation_version: CALCULATION_VERSION,
      trace_id: randomUUID(),
      is_synthetic: true,
      data_split: user?.data_split ?? "dev",
      dataset_version: this.data.metadata.dataset_version,
      dataset_commit: this.data.metadata.dataset_commit,
      disclaimer: this.data.metadata.disclaimer,
      persistence_mode: this.store.mode === "local_file" ? "local_file_ephemeral" : "memory_ephemeral",
    };
  }

  private effectiveScores(user: User, asOf?: string): Map<string, number> {
    const baseline = new Date(this.data.metadata.generated_at);
    const target = new Date(asOf || this.data.metadata.generated_at);
    if (Number.isNaN(target.valueOf())) throw new ServiceError("INVALID_DATE", `无效日期: ${asOf}`, 400);
    const extraDays = Math.max(0, (target.valueOf() - baseline.valueOf()) / 86_400_000);
    const scores = new Map(user.skill_scores.map((item) => [
      item.skill_id,
      clamp(item.current_score * 2 ** (-extraDays / item.half_life_days)),
    ]));
    for (const event of this.store.getState().events[user.user_id] || []) {
      if (event.skill_id && event.score_delta) scores.set(event.skill_id, clamp((scores.get(event.skill_id) || 0) + event.score_delta));
    }
    return scores;
  }

  calculateCareerProfile(input: ProfileInput) {
    const user = this.user(input.user_id);
    const scores = this.effectiveScores(user, input.as_of_date);
    const dimensions = this.data.dimensions
      .map((dimension) => {
        const skills = this.data.skills.filter((skill) => skill.dimension_id === dimension.dimension_id);
        const rows = skills.map((skill) => ({ skill, score: scores.get(skill.skill_id) || 0 }));
        return {
          dimension_id: dimension.dimension_id,
          name: dimension.name,
          score: round(average(rows.map((row) => row.score))),
          evidence_count: rows.length,
          confidence: round(average(rows.map((row) => user.skill_scores.find((score) => score.skill_id === row.skill.skill_id)?.confidence || 0)), 2),
          top_skills: rows.sort((a, b) => b.score - a.score).slice(0, 3).map((row) => ({ skill_id: row.skill.skill_id, name: row.skill.name, score: round(row.score) })),
        };
      })
      .sort((a, b) => this.data.dimensions.findIndex((d) => d.dimension_id === a.dimension_id) - this.data.dimensions.findIndex((d) => d.dimension_id === b.dimension_id));

    const roleMatches = this.data.roles.map((role) => {
      const mappings = this.data.role_skills.filter((item) => item.role_id === role.role_id);
      const skillFit = 100 * mappings.reduce((total, mapping) => total + mapping.importance_weight * Math.min((scores.get(mapping.skill_id) || 0) / mapping.required_score, 1), 0);
      const experienceFit = clamp(45 + user.experience_months * 2.2, 45, 100);
      const preferenceFit = user.target_role_id === role.role_id ? 100 : user.secondary_role_id === role.role_id ? 72 : 45;
      return {
        role_id: role.role_id,
        name: role.name,
        skill_fit: round(skillFit, 2),
        experience_fit: round(experienceFit, 2),
        preference_fit: preferenceFit,
        match_score: round(0.8 * skillFit + 0.1 * experienceFit + 0.1 * preferenceFit, 2),
      };
    }).sort((a, b) => b.match_score - a.match_score).map((item, index) => ({ ...item, rank: index + 1 }));

    const rankedDimensions = [...dimensions].sort((a, b) => b.score - a.score);
    return {
      ...this.base(user),
      user_id: user.user_id,
      persona_code: user.persona_code,
      as_of_date: isoDate(input.as_of_date || this.data.metadata.generated_at),
      overall_score: round(average(dimensions.map((dimension) => dimension.score))),
      dimensions,
      strengths: rankedDimensions.slice(0, 2).map((dimension) => `${dimension.name} ${dimension.score}分`),
      improvement_priorities: rankedDimensions.slice(-2).reverse().map((dimension) => `${dimension.name} ${dimension.score}分`),
      role_matches: roleMatches,
      formula: {
        dimension_score: "mean(current_skill_scores_in_dimension)",
        skill_decay: "current_score*2^(-additional_days/half_life_days)",
        role_match: "0.8*skill_fit+0.1*experience_fit+0.1*preference_fit",
      },
    };
  }

  generateCareerPath(input: PathInput) {
    const user = this.user(input.user_id);
    const role = this.data.roles.find((item) => item.role_id === input.target_role_id);
    if (!role) throw new ServiceError("ROLE_NOT_FOUND", `未找到目标岗位 ${input.target_role_id}`, 404);
    const horizon = clamp(Math.round(input.horizon_years ?? 3), 1, 5);
    const weeklyHours = clamp(Math.round(input.weekly_hours ?? user.weekly_learning_hours), 1, 40);
    const priority = input.priority ?? "balanced";
    const scores = this.effectiveScores(user);
    const gaps = this.data.role_skills.filter((item) => item.role_id === role.role_id).map((mapping) => {
      const skill = this.data.skills.find((item) => item.skill_id === mapping.skill_id)!;
      const current = round(scores.get(mapping.skill_id) || 0);
      const gap = round(Math.max(0, mapping.required_score - current));
      return { skill_id: mapping.skill_id, skill_name: skill.name, current_score: current, required_score: mapping.required_score, gap, importance_weight: mapping.importance_weight, priority_score: round(gap * mapping.importance_weight, 3), is_core: mapping.is_core };
    }).sort((a, b) => a.current_score - b.current_score || b.priority_score - a.priority_score);

    const topGaps = gaps.slice(0, 6);
    const fast = this.buildPath(user, role.role_id, role.name, horizon, weeklyHours, priority, "fast_gap", topGaps, scores);
    const project = this.buildPath(user, role.role_id, role.name, horizon, weeklyHours, priority, "project_driven", topGaps, scores);
    this.generatedPaths.set(fast.path_id, fast);
    this.generatedPaths.set(project.path_id, project);
    return {
      ...this.base(user),
      user_id: user.user_id,
      target_role_id: role.role_id,
      target_role_name: role.name,
      gap_analysis: {
        critical_gaps: gaps.filter((gap) => gap.gap >= 20 || gap.is_core).slice(0, 8),
        minor_gaps: gaps.filter((gap) => gap.gap < 20 && !gap.is_core).slice(0, 8),
      },
      branches: [fast, project],
      generation_note: "路径仅为模拟规划；调用 manage_progress(action=activate_path) 后才记录激活状态。",
    };
  }

  private buildPath(user: User, roleId: string, roleName: string, horizon: number, weeklyHours: number, priority: string, branch: "fast_gap" | "project_driven", gaps: Array<{ skill_id: string; skill_name: string; current_score: number; required_score: number; gap: number }>, scores: Map<string, number>): GeneratedPath {
    const reference = user.career_paths.find((path) => path.target_role_id === roleId) || null;
    const ordered = branch === "project_driven" ? [...gaps].sort((a, b) => b.gap - a.gap) : gaps;
    const tasks = ordered.map((gap, index) => this.taskForGap(user, gap, branch, scores, index));
    const phaseCount = 3;
    const phases = Array.from({ length: phaseCount }, (_, phaseIndex) => {
      const phaseTasks = tasks.filter((_, index) => index % phaseCount === phaseIndex);
      return {
        phase_order: phaseIndex + 1,
        title: branch === "fast_gap" ? ["核心短板补齐", "技能练习与验证", "岗位综合验证"][phaseIndex] : ["小项目起步", "综合项目交付", "作品集与模拟面试"][phaseIndex],
        duration_months: phaseIndex === phaseCount - 1 ? horizon * 12 - Math.floor(horizon * 12 / phaseCount) * 2 : Math.floor(horizon * 12 / phaseCount),
        milestones: phaseTasks.map((task) => `完成${task.title}并留存可验证产出`),
        tasks: phaseTasks,
      };
    });
    const totalHours = round(tasks.reduce((sum, task) => sum + task.estimated_hours, 0));
    const suffix = `${user.user_id}-${roleId}-${priority}-${horizon}Y-${weeklyHours}H-${branch}`.replace(/[^A-Z0-9-]/gi, "-").toUpperCase();
    return {
      path_id: `GEN-${suffix}`,
      branch_type: branch,
      title: `${roleName}${branch === "fast_gap" ? "快速补差" : "项目驱动"}路线`,
      target_role_id: roleId,
      target_role_name: roleName,
      horizon_years: horizon,
      weekly_hours: weeklyHours,
      reference_path_id: reference?.path_id || null,
      phases,
      total_estimated_hours: totalHours,
      constraint_checks: {
        within_weekly_limit: totalHours <= weeklyHours * 52 * horizon,
        within_horizon: phases.reduce((sum, phase) => sum + phase.duration_months, 0) === horizon * 12,
        has_verifiable_deliverables: phases.every((phase) => phase.milestones.length > 0),
      },
    };
  }

  private taskForGap(user: User, gap: { skill_id: string; skill_name: string; current_score: number; required_score: number }, branch: "fast_gap" | "project_driven", scores: Map<string, number>, index: number): PathTask {
    const mapped = this.data.resources.filter((resource) => resource.data_split !== "test" && resource.skill_mappings.some((mapping) => mapping.skill_id === gap.skill_id) && resource.prerequisite_score <= (scores.get(gap.skill_id) || 0) + 15);
    const preferred = mapped.filter((resource) => branch === "project_driven" ? /project|task|practice/i.test(resource.resource_type) : !/project/i.test(resource.resource_type));
    const candidates = preferred.length ? preferred : mapped;
    const resource = candidates.sort((a, b) => this.resourceRank(a, user, branch) - this.resourceRank(b, user, branch))[0] || null;
    return {
      task_id: `TASK-${user.user_id.slice(5)}-${branch === "fast_gap" ? "F" : "P"}-${String(index + 1).padStart(2, "0")}`,
      title: resource?.title || `${gap.skill_name}可验证练习`,
      task_type: resource?.resource_type || (branch === "project_driven" ? "project" : "practice"),
      difficulty: resource?.difficulty || (gap.current_score < 40 ? "beginner" : "intermediate"),
      estimated_hours: Math.min(Number(resource?.estimated_hours || (branch === "project_driven" ? 24 : 10)), branch === "project_driven" ? 80 : 48),
      skill_id: gap.skill_id,
      resource_id: resource?.resource_id || null,
      provider: resource?.provider || null,
      resource_url: resource?.url || null,
      status: "pending",
    };
  }

  private resourceRank(resource: Resource, user: User, branch: string): number {
    const typePenalty = branch === "project_driven" && /project|task|practice/i.test(resource.resource_type) ? 0 : 5;
    const stagePenalty = user.stage === "student" && resource.difficulty === "advanced" ? 4 : 0;
    return typePenalty + stagePenalty + resource.estimated_hours / 100;
  }

  async evaluateScenario(input: ScenarioInput) {
    if (input.action === "list") {
      if (input.user_id) this.user(input.user_id);
      const scenarios = this.data.scenarios.filter((scenario) => scenario.data_split !== "test" && (!input.module_id || scenario.module_id === input.module_id) && (!input.difficulty || scenario.difficulty === input.difficulty));
      return { ...this.base(input.user_id ? this.user(input.user_id) : undefined), action: "list", count: scenarios.length, scenarios: scenarios.map((scenario) => this.publicScenario(scenario)) };
    }
    const user = this.user(input.user_id);
    this.writeAllowed(user);
    if (input.action === "start") {
      const scenario = this.data.scenarios.find((item) => item.scenario_id === input.scenario_id && item.data_split !== "test");
      if (!scenario) throw new ServiceError("SCENARIO_NOT_FOUND", `未找到场景 ${input.scenario_id}`, 404);
      const session = { session_id: `SESSION-${randomUUID()}`, user_id: user.user_id, scenario_id: scenario.scenario_id, status: "in_progress" as const, started_at: new Date().toISOString(), responses: [] };
      await this.store.saveSession(session);
      return { ...this.base(user), action: "start", session_id: session.session_id, scenario: this.publicScenario(scenario) };
    }
    const session = this.store.getState().sessions[input.session_id];
    if (!session || session.user_id !== user.user_id) throw new ServiceError("SESSION_NOT_FOUND", `未找到场景会话 ${input.session_id}`, 404);
    if (session.status === "completed") throw new ServiceError("SESSION_COMPLETED", "该场景会话已完成", 409);
    if (!input.response_text.trim() || input.response_text.length > 5000) throw new ServiceError("INVALID_RESPONSE", "回复长度必须为1至5000字", 400);
    const scenario = this.data.scenarios.find((item) => item.scenario_id === session.scenario_id)!;
    const evaluation = this.scoreScenario(scenario, input.response_text);
    session.responses.push({ response_text: input.response_text, submitted_at: new Date().toISOString(), evaluation });
    session.status = "completed";
    session.completed_at = new Date().toISOString();
    await this.store.saveSession(session);
    return { ...this.base(user), action: "submit_and_evaluate", session_id: session.session_id, scenario_id: scenario.scenario_id, ...evaluation };
  }

  private publicScenario(scenario: Scenario) {
    return { scenario_id: scenario.scenario_id, module_id: scenario.module_id, module_name: scenario.module_name, title: scenario.title, difficulty: scenario.difficulty, target_role_id: scenario.target_role_id, target_user_stage: scenario.target_user_stage, context: scenario.context, initial_prompt: scenario.initial_prompt, privacy_focus: scenario.privacy_focus };
  }

  private scoreScenario(scenario: Scenario, response: string) {
    const text = response.toLowerCase().replace(/\s+/g, "");
    const expected = split(scenario.expected_actions);
    const redFlags = split(scenario.red_flags);
    const synonyms: Record<string, string[]> = {
      "目标": ["目标", "需求", "结果"], "截止": ["截止", "期限", "时间"], "负责人": ["负责人", "责任人", "谁负责"],
      "记录": ["记录", "纪要", "文档"], "同步": ["同步", "沟通", "跟进"], "来源": ["来源", "引用", "核验"],
      "隐私": ["隐私", "脱敏", "授权", "最小必要"], "风险": ["风险", "影响", "备份"], "反馈": ["反馈", "复盘", "改进"],
    };
    const hitAction = (action: string) => {
      if (text.includes(action.replace(/\s+/g, "").toLowerCase())) return true;
      return Object.entries(synonyms).some(([key, words]) => action.includes(key) && words.some((word) => text.includes(word)));
    };
    const actionHits = expected.filter(hitAction);
    const missingActions = expected.filter((action) => !actionHits.includes(action));
    const redFlagHits = redFlags.filter((flag) => text.includes(flag.replace(/\s+/g, "").toLowerCase()));
    const clarification = /[?？]|确认|澄清|请问|了解/.test(response) ? 20 : actionHits.some((item) => /澄清|确认|询问/.test(item)) ? 12 : 4;
    const privacyWords = ["隐私", "脱敏", "授权", "权限", "来源", "核验", "最小必要"];
    const evidencePrivacy = privacyWords.some((word) => text.includes(word)) ? 20 : scenario.privacy_focus === "high" ? 4 : 12;
    const collaboration = ["负责人", "同步", "协作", "沟通", "共识"].some((word) => text.includes(word)) ? 20 : 8;
    const reflection = ["复盘", "反思", "改进", "下一次", "跟进"].some((word) => text.includes(word)) ? 15 : 5;
    const taskCompletion = round(25 * actionHits.length / Math.max(1, expected.length));
    const penalty = Math.min(30, redFlagHits.length * 10);
    const total = clamp(taskCompletion + clarification + evidencePrivacy + collaboration + reflection - penalty);
    return {
      overall_score: round(total),
      dimensions: {
        task_completion: { score: taskCompletion, max_score: 25 },
        clarification: { score: clarification, max_score: 20 },
        evidence_and_privacy: { score: evidencePrivacy, max_score: 20 },
        collaboration: { score: collaboration, max_score: 20 },
        reflection: { score: reflection, max_score: 15 },
      },
      matched_expected_actions: actionHits,
      missing_expected_actions: missingActions,
      red_flag_hits: redFlagHits,
      penalty,
      evidence_excerpt: response.slice(0, 300),
      highlights: actionHits.slice(0, 3).map((action) => `已覆盖：${action}`),
      improvement_suggestions: [...missingActions.slice(0, 3).map((action) => `建议补充：${action}`), ...(redFlagHits.length ? ["避免上述风险行为，并说明替代做法"] : [])],
      proposed_profile_updates: [
        { dimension_id: "DIM-06", suggested_delta: total >= 80 ? 2 : 0, reason: "问题拆解与任务完成表现" },
        { dimension_id: "DIM-07", suggested_delta: total >= 80 ? 2 : total >= 60 ? 1 : 0, reason: "沟通、协作与隐私表现" },
      ],
      update_applied: false,
      evaluation_rule: "预期行为命中+澄清/隐私/协作/反思规则-红旗行为扣分",
    };
  }

  async manageProgress(input: ProgressInput) {
    const user = this.user(input.user_id);
    if (input.action === "summary" || input.action === "list_events") {
      const events = this.allEvents(user);
      if (input.action === "list_events") return { ...this.base(user), action: input.action, user_id: user.user_id, count: Math.min(input.limit ?? 20, events.length), events: events.slice(0, clamp(input.limit ?? 20, 1, 100)) };
      return { ...this.base(user), action: input.action, user_id: user.user_id, ...this.progressSummary(user, events) };
    }
    this.writeAllowed(user);
    const cached = this.store.getIdempotent(`${user.user_id}:${input.idempotency_key}`);
    if (cached) return { ...cached as object, idempotent_replay: true };

    if (input.action === "record_event") {
      const allowed = new Set(["task_completed", "course_started", "course_completed", "project_started", "project_completed", "skill_practice", "assessment_completed", "feedback_submitted", "plan_adjusted", "manual"]);
      if (!allowed.has(input.event_type)) throw new ServiceError("INVALID_EVENT_TYPE", `不支持的事件类型 ${input.event_type}`, 400);
      if (input.skill_id && !this.data.skills.some((skill) => skill.skill_id === input.skill_id)) throw new ServiceError("SKILL_NOT_FOUND", `未找到技能 ${input.skill_id}`, 404);
      if (input.resource_id && !this.data.resources.some((resource) => resource.resource_id === input.resource_id)) throw new ServiceError("RESOURCE_NOT_FOUND", `未找到资源 ${input.resource_id}`, 404);
      const event: GrowthEvent = {
        event_id: `EVT-DEMO-${randomUUID()}`,
        event_type: input.event_type,
        event_time: isoDate(input.occurred_at),
        skill_id: input.skill_id || null,
        resource_id: input.resource_id || null,
        score_delta: clamp(input.score_delta ?? 0, -20, 20),
        status: "completed",
        sentiment: input.sentiment || "neutral",
        user_state: (input.score_delta ?? 0) > 0 ? "progressing" : "active",
        risk_level: "low",
        detail: input.detail.slice(0, 500),
        duration_minutes: clamp(input.duration_minutes ?? 0, 0, 1440),
        points_earned: Math.max(0, Math.round((input.score_delta ?? 0) * 2 + (input.duration_minutes ?? 0) / 30)),
        schema_version: SCHEMA_VERSION,
        origin: "synthetic",
        is_synthetic: true,
        source_ids: "SRC-MCP-OVERLAY",
        confidence: 1,
        claim_level: "synthetic",
        verification_status: "not_applicable",
        generated_at: new Date().toISOString(),
        last_verified_at: null,
        license_scope: "team_generated",
        is_market_fact: false,
        data_split: user.data_split,
      };
      await this.store.appendEvent(user.user_id, event);
      const result = { ...this.base(user), action: input.action, user_id: user.user_id, event, profile_recalculation_recommended: Boolean(event.skill_id && event.score_delta) };
      await this.store.remember(`${user.user_id}:${input.idempotency_key}`, result);
      return result;
    }

    if (input.action === "activate_path") {
      const path = this.generatedPaths.get(input.path_id);
      if (!path || !path.path_id.includes(user.user_id)) throw new ServiceError("PATH_NOT_FOUND", "路径不存在或不属于该用户，请先调用 generate_career_path", 404);
      await this.store.activatePath(user.user_id, path);
      const result = { ...this.base(user), action: input.action, user_id: user.user_id, active_path: path };
      await this.store.remember(`${user.user_id}:${input.idempotency_key}`, result);
      return result;
    }

    const activePath = this.store.getState().active_paths[user.user_id];
    const task = activePath?.phases.flatMap((phase) => phase.tasks).find((item) => item.task_id === input.task_id);
    if (!task) throw new ServiceError("TASK_NOT_FOUND", `未在激活路径中找到任务 ${input.task_id}`, 404);
    await this.store.updateTask(task.task_id, input.status);
    const result = { ...this.base(user), action: input.action, user_id: user.user_id, task_id: task.task_id, status: input.status, updated_at: new Date().toISOString() };
    await this.store.remember(`${user.user_id}:${input.idempotency_key}`, result);
    return result;
  }

  private allEvents(user: User) {
    return [...user.recent_events, ...(this.store.getState().events[user.user_id] || [])].sort((a, b) => b.event_time.localeCompare(a.event_time));
  }

  private progressSummary(user: User, events: GrowthEvent[]) {
    const completedTypes = new Set(["task_completed", "course_completed", "project_completed", "assessment_completed"]);
    const estimate: Record<string, number> = { task_completed: 45, course_completed: 60, project_completed: 120, skill_practice: 30, assessment_completed: 45, scenario: 20 };
    const totalMinutes = events.reduce((sum, event) => sum + (event.duration_minutes ?? estimate[event.event_type] ?? 0), 0);
    const activeDays = [...new Set(events.filter((event) => event.status === "completed").map((event) => event.event_time.slice(0, 10)))].sort().reverse();
    let streak = activeDays.length ? 1 : 0;
    for (let i = 1; i < activeDays.length; i += 1) {
      if ((new Date(activeDays[i - 1]).valueOf() - new Date(activeDays[i]).valueOf()) / 86_400_000 === 1) streak += 1;
      else break;
    }
    const activePath = this.store.getState().active_paths[user.user_id] || null;
    const taskUpdates = this.store.getState().task_updates;
    const totalTasks = activePath?.phases.flatMap((phase) => phase.tasks).length || 0;
    const completedActiveTasks = activePath?.phases.flatMap((phase) => phase.tasks).filter((task) => taskUpdates[task.task_id]?.status === "completed").length || 0;
    return {
      total_learning_hours: round(totalMinutes / 60, 1),
      duration_is_estimated_for_baseline: true,
      completed_tasks: events.filter((event) => completedTypes.has(event.event_type)).length,
      streak_days: streak,
      points_earned: events.reduce((sum, event) => sum + (event.points_earned || Math.max(0, event.score_delta * 2)), 0),
      active_path: activePath ? { path_id: activePath.path_id, title: activePath.title, completed_tasks: completedActiveTasks, total_tasks: totalTasks, progress_percent: totalTasks ? round(100 * completedActiveTasks / totalTasks) : 0 } : null,
      recent_events: events.slice(0, 20),
      profile_recalculation_recommended: events.some((event) => Boolean(event.skill_id && event.score_delta && event.event_id.startsWith("EVT-DEMO"))),
    };
  }
}
