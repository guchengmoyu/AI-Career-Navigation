import mysql, { type Pool } from "mysql2/promise";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join as pathJoin } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CareerMilestone,
  Dimension,
  GeneratedPath,
  GrowthEvent,
  Job,
  JobSkill,
  Metadata,
  PathTask,
  ReferencePath,
  Resource,
  ResourceSkill,
  Role,
  RoleSkill,
  RuntimeData,
  Scenario,
  ScenarioSession,
  Skill,
  SkillScore,
  User,
} from "./types.js";

// 配置兜底：环境变量缺失时，从包根目录 db-config.json 读取（本地/Inspector 用；
// 该文件不在 package.json "files" 白名单里，不会随 npm 发布）
function bootstrapDbConfig(): void {
  if (process.env.A02_DISABLE_DB === "1" || process.env.NODE_ENV === "test") return;
  if (process.env.MYSQL_HOST && process.env.MYSQL_DATABASE) return;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    pathJoin(here, "../db-config.json"),   // dist/db.js → 包根
    pathJoin(here, "../../db-config.json"),// src 布局兜底
    pathJoin(process.cwd(), "db-config.json"),
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      const config = JSON.parse(readFileSync(candidate, "utf8")) as Record<string, string | number>;
      process.env.MYSQL_HOST = String(config.host ?? "127.0.0.1");
      process.env.MYSQL_PORT = String(config.port ?? 3306);
      process.env.MYSQL_USER = String(config.user ?? "root");
      process.env.MYSQL_PASSWORD = String(config.password ?? "");
      process.env.MYSQL_DATABASE = String(config.database ?? "");
      console.error("[a02] db config loaded from " + candidate);
      return;
    } catch (error) {
      console.error("[a02] db-config.json parse failed:", (error as Error).message);
    }
  }
}
bootstrapDbConfig();

// ---------------------------------------------------------------------------
// 阶段1：MCP 接真实库（ai_career_nav_v12）
// 启用条件（与 db/import.ts 保持同一套环境变量）：
//   MYSQL_HOST / MYSQL_PORT / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE
//   且 MYSQL_DATABASE 以 _v12 结尾（安全闸，防误连生产库）
// 未配置时 dbEnabled()=false，行为与 0.2.0 完全一致（文件 mock + overlay JSON）。
// ---------------------------------------------------------------------------

export function dbEnabled(): boolean {
  if (process.env.A02_DISABLE_DB === "1" || process.env.NODE_ENV === "test") return false;
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      /_v12$/.test(process.env.MYSQL_DATABASE || "")
  );
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 4,
      charset: "utf8mb4",
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    const closing = pool;
    pool = undefined;
    await closing.end();
  }
}

// 治理列 → Metadata（DB 列名 source_generated_at 对应类型里的 generated_at）
function metadata(row: Record<string, any>): Metadata {
  return {
    schema_version: row.schema_version ?? "v1.2",
    origin: row.origin ?? "unknown",
    is_synthetic: Boolean(Number(row.is_synthetic ?? 1)),
    source_ids: row.source_ids ?? "",
    confidence: Number(row.confidence ?? 0),
    claim_level: row.claim_level ?? "synthetic_demo",
    verification_status: row.verification_status ?? "verified",
    license_scope: row.license_scope ?? "internal_demo",
    is_market_fact: Boolean(Number(row.is_market_fact ?? 0)),
    data_split: (row.data_split ?? "dev") as Metadata["data_split"],
    generated_at: row.source_generated_at ?? "",
    last_verified_at: row.last_verified_at ?? null,
  };
}

async function query(sql: string, params: unknown[] = []): Promise<Record<string, any>[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as Record<string, any>[];
}

/** growth_events 行 → GrowthEvent（init 装载与 v2 跨进程刷新共用同一映射，保证口径一致） */
function growthEventFromRow(row: Record<string, any>): GrowthEvent {
  return {
    ...metadata(row), event_id: row.event_id, event_type: row.event_type,
    event_time: new Date(row.event_time).toISOString(),
    skill_id: row.skill_id ?? null, resource_id: row.resource_id ?? null,
    job_id: row.job_id ?? null, task_id: row.task_id ?? null,
    score_delta: Number(row.score_delta ?? 0), status: row.status ?? "completed",
    sentiment: row.sentiment ?? "", user_state: row.user_state ?? "",
    risk_level: row.risk_level ?? "", detail: row.detail ?? "",
    duration_minutes: row.duration_minutes == null ? undefined : Number(row.duration_minutes),
    points_earned: row.points_earned == null ? undefined : Number(row.points_earned),
  };
}

/** v2 跨进程刷新：重新装载某用户的全部事件（对话写入 → 前端 summary/列表实时可见） */
export async function loadUserEvents(userId: string): Promise<GrowthEvent[]> {
  const rows = await query(
    "SELECT * FROM growth_events WHERE external_user_id = ? ORDER BY event_time",
    [userId]
  );
  return rows.map(growthEventFromRow);
}

const join = (value: unknown): string =>
  Array.isArray(value) ? value.join("|") : String(value ?? "");
const asString = (value: unknown): string =>
  typeof value === "string" ? value : JSON.stringify(value ?? {});

/**
 * 从 ai_career_nav_v12 装载完整 RuntimeData（结构对齐 src/types.ts）。
 * - 参考数据/用户/事件/场景/岗位/资源：一律以 DB 为准
 * - metadata 与 evaluation（schema 里没有对应表）：从包内 runtime-data.json 兜底
 */
export async function loadRuntimeDataFromDb(): Promise<RuntimeData> {
  // 延迟 import，避免文件模式（未装依赖场景）被顶层绑定拖垮
  const { getRuntimeData } = await import("./data.js");
  const base = getRuntimeData();

  const [
    dimensionRows, skillRows, roleRows, roleSkillRows,
    userRows, profileRows, userSkillRows, eventRows,
    pathRows, milestoneRows, jobRows, jobSkillRows,
    resourceRows, resourceSkillRows, scenarioRows,
  ] = await Promise.all([
    query("SELECT * FROM ref_dimensions"),
    query("SELECT * FROM ref_skills"),
    query("SELECT * FROM ref_roles"),
    query("SELECT * FROM ref_role_skills"),
    query("SELECT * FROM users"),
    query("SELECT * FROM user_profiles"),
    query("SELECT * FROM user_skills"),
    query("SELECT * FROM growth_events ORDER BY event_time"),
    query("SELECT * FROM career_paths WHERE path_id NOT LIKE 'GEN-%'"),
    query("SELECT * FROM career_milestones ORDER BY path_id, sequence_no"),
    query("SELECT * FROM ref_jobs"),
    query("SELECT * FROM ref_job_skills"),
    query("SELECT * FROM ref_resources"),
    query("SELECT * FROM ref_resource_skills"),
    query("SELECT * FROM scenario_cases"),
  ]);

  const dimensions: Dimension[] = dimensionRows.map((row) => ({
    ...metadata(row), dimension_id: row.dimension_id, name: row.name,
    description: row.description ?? "", display_order: Number(row.display_order ?? 0),
  }));
  const dimensionNames = new Map(dimensions.map((item) => [item.dimension_id, item.name]));

  const skills: Skill[] = skillRows.map((row) => ({
    ...metadata(row), skill_id: row.skill_id, skill_key: row.skill_key, name: row.name,
    dimension_id: row.dimension_id,
    dimension_name: dimensionNames.get(row.dimension_id) ?? "",
    definition: row.definition ?? "", half_life_days: Number(row.half_life_days ?? 365),
  }));

  const roles: Role[] = roleRows.map((row) => ({
    ...metadata(row), role_id: row.role_id, name: row.name, summary: row.summary ?? "",
    target_user_stage: row.target_user_stage ?? "", typical_entry_level: row.typical_entry_level ?? "",
  }));

  const roleSkills: RoleSkill[] = roleSkillRows.map((row) => ({
    ...metadata(row), role_skill_id: row.role_skill_id, role_id: row.role_id, skill_id: row.skill_id,
    required_score: Number(row.required_score), importance_weight: Number(row.importance_weight),
    is_core: Boolean(Number(row.is_core)), rationale: row.rationale ?? "",
  }));

  const jobs: Job[] = jobRows.map((row) => ({
    ...metadata(row), job_id: row.job_id, role_id: row.role_id, title: row.title,
    company_code: row.company_code ?? "", industry: row.industry ?? "", city: row.city ?? "",
    work_mode: row.work_mode ?? "", experience_level: row.experience_level ?? "",
    required_experience_months: row.required_experience_months == null ? 0 : Number(row.required_experience_months),
    education_level: row.education_level ?? "", salary_min_cny_month: Number(row.salary_min_cny_month ?? 0),
    salary_max_cny_month: Number(row.salary_max_cny_month ?? 0),
    salary_is_simulated: Boolean(Number(row.salary_is_simulated ?? 1)),
    summary: row.summary ?? "", display_disclaimer: row.display_disclaimer ?? "",
    skill_requirements: jobSkillRows
      .filter((skill) => skill.job_id === row.job_id)
      .map((skill): JobSkill => ({
        ...metadata(skill), job_skill_id: skill.job_skill_id, job_id: skill.job_id, skill_id: skill.skill_id,
        required_score: Number(skill.required_score), importance_weight: Number(skill.importance_weight),
        requirement_type: skill.requirement_type ?? "preferred",
      })),
  }));

  const resources: Resource[] = resourceRows.map((row) => ({
    ...metadata(row), resource_id: row.resource_id, resource_type: row.resource_type, title: row.title,
    provider: row.provider ?? "", url: row.url ?? "", difficulty: row.difficulty ?? "",
    estimated_hours: Number(row.estimated_hours ?? 0), cost_type: row.cost_type ?? "free_or_demo",
    prerequisite_score: Number(row.prerequisite_score ?? 0), summary: row.summary ?? "",
    skill_mappings: resourceSkillRows
      .filter((skill) => skill.resource_id === row.resource_id)
      .map((skill): ResourceSkill => ({
        ...metadata(skill), resource_skill_id: skill.resource_skill_id, resource_id: skill.resource_id,
        skill_id: skill.skill_id, coverage_weight: Number(skill.coverage_weight),
        expected_score_gain: Number(skill.expected_score_gain),
      })),
  }));

  // 旧库/迁移数据的 privacy_focus 用 strict/normal，运行时类型是 low/medium/high —— 归一化
  const privacy = (value: string): Scenario["privacy_focus"] => {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized === "strict" || normalized === "high") return "high";
    if (normalized === "normal" || normalized === "medium") return "medium";
    return "low";
  };
  const scenarios: Scenario[] = scenarioRows.map((row) => ({
    ...metadata(row), scenario_id: row.scenario_id, module_id: row.module_id, module_name: row.module_name,
    difficulty: row.difficulty as Scenario["difficulty"], target_role_id: row.target_role_id,
    target_user_stage: row.target_user_stage ?? "", title: row.title, context: row.context,
    initial_prompt: row.initial_prompt, expected_actions: join(row.expected_actions),
    rubric_json: asString(row.rubric_json), red_flags: join(row.red_flags),
    privacy_focus: privacy(row.privacy_focus),
  }));

  const profilesByUser = new Map(profileRows.map((row) => [row.external_user_id, row]));
  const skillScoresByUser = new Map<string, SkillScore[]>();
  for (const row of userSkillRows) {
    const list = skillScoresByUser.get(row.external_user_id) ?? [];
    list.push({
      skill_id: row.skill_id, current_score: Number(row.current_score),
      observed_score: Number(row.observed_score), evidence_age_days: Number(row.evidence_age_days ?? 0),
      half_life_days: Number(row.half_life_days ?? 365), decay_factor: Number(row.decay_factor ?? 1),
      last_evidence_id: row.last_evidence_id ?? null, confidence: Number(row.confidence ?? 1),
    });
    skillScoresByUser.set(row.external_user_id, list);
  }
  const eventsByUser = new Map<string, GrowthEvent[]>();
  for (const row of eventRows) {
    const list = eventsByUser.get(row.external_user_id) ?? [];
    list.push(growthEventFromRow(row));
    eventsByUser.set(row.external_user_id, list);
  }
  const pathsByUser = new Map<string, ReferencePath[]>();
  for (const row of pathRows) {
    const milestones: CareerMilestone[] = milestoneRows
      .filter((item) => item.path_id === row.path_id)
      .map((item) => ({
        ...metadata(item), milestone_id: item.milestone_id, path_id: item.path_id,
        sequence_no: Number(item.sequence_no), month_from_start: Number(item.month_from_start),
        title: item.title, target_skill_id: item.target_skill_id ?? "",
        target_score: Number(item.target_score ?? 0), deliverable: item.deliverable ?? "",
        acceptance_rule: item.acceptance_rule ?? "",
      }));
    const list = pathsByUser.get(row.external_user_id) ?? [];
    list.push({
      ...metadata(row), path_id: row.path_id, user_id: row.external_user_id,
      branch_no: Number(row.branch_no ?? 1), branch_type: row.branch_type,
      target_role_id: row.target_role_id, horizon_years: Number(row.horizon_years),
      weekly_hours_limit: Number(row.weekly_hours_limit), objective: row.objective,
      status: row.status, milestones,
    });
    pathsByUser.set(row.external_user_id, list);
  }

  const buildUser = (row: Record<string, any>): User => {
    const profile = profilesByUser.get(row.external_user_id) ?? {};
    return {
      ...metadata(row), user_id: row.external_user_id, persona_code: row.persona_code,
      is_golden: Boolean(Number(row.is_golden ?? 0)), stage: row.stage as User["stage"],
      major: profile.major ?? "", education_level: profile.education_level ?? "",
      academic_or_job_status: profile.academic_or_job_status ?? "",
      experience_months: Number(profile.experience_months ?? 0),
      weekly_learning_hours: Number(profile.weekly_learning_hours ?? 10),
      target_role_id: profile.target_role_id ?? "", secondary_role_id: profile.secondary_role_id ?? "",
      preferred_city: profile.preferred_city ?? "", preferred_work_mode: profile.preferred_work_mode ?? "",
      career_goal: profile.career_goal ?? "", current_challenge: profile.current_challenge ?? "",
      consent_status: row.consent_status ?? "", data_retention_days: Number(profile.data_retention_days ?? 365),
      skill_scores: skillScoresByUser.get(row.external_user_id) ?? [],
      recent_events: eventsByUser.get(row.external_user_id) ?? [],
      career_paths: pathsByUser.get(row.external_user_id) ?? [],
    };
  };

  const golden = userRows.filter((row) => row.data_split !== "test").map(buildUser);
  const testUsers = userRows.filter((row) => row.data_split === "test").map(buildUser);

  return {
    ...base, // metadata / evaluation：文件兜底（schema 无对应表）
    dimensions, skills, roles, role_skills: roleSkills,
    users: golden, test_users: testUsers,
    jobs, resources, scenarios,
  };
}

// ---------------------------------------------------------------------------
// 写路径：record_event / 评估会话 持久化到 DB（对话写 → 前端页面可见）
// 治理列缺省由服务层对象提供，未提供时用运行时默认值兜底（NOT NULL 列必须有值）
// ---------------------------------------------------------------------------

function provenanceColumns(event: Partial<Metadata>): Record<string, unknown> {
  return {
    origin: event.origin || "mcp_runtime",
    is_synthetic: event.is_synthetic == null ? 1 : Number(Boolean(event.is_synthetic)),
    source_ids: event.source_ids || "mcp-runtime",
    confidence: Number(event.confidence ?? 1),
    claim_level: event.claim_level || "synthetic_demo",
    verification_status: event.verification_status || "runtime_recorded",
    license_scope: event.license_scope || "internal_demo",
    is_market_fact: Number(Boolean(event.is_market_fact)),
    data_split: event.data_split || "dev",
    schema_version: event.schema_version || "v1.2",
    source_generated_at: event.generated_at || null,
    last_verified_at: event.last_verified_at ?? null,
  };
}

export async function insertGrowthEvent(userId: string, event: GrowthEvent): Promise<void> {
  const provenance = provenanceColumns(event);
  await getPool().query(
    `INSERT INTO growth_events
      (event_id, external_user_id, event_type, event_time, skill_id, resource_id, job_id, task_id,
       score_delta, status, sentiment, user_state, risk_level, detail, duration_minutes, points_earned,
       origin, is_synthetic, source_ids, confidence, claim_level, verification_status, license_scope,
       is_market_fact, data_split, schema_version, source_generated_at, last_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE detail = VALUES(detail), score_delta = VALUES(score_delta)`,
    [
      event.event_id, userId, event.event_type, new Date(event.event_time),
      event.skill_id ?? null, event.resource_id ?? null, event.job_id ?? null, event.task_id ?? null,
      Number(event.score_delta ?? 0), event.status || "completed", event.sentiment || "",
      event.user_state || "", event.risk_level || "", event.detail || "",
      event.duration_minutes ?? null, event.points_earned ?? null,
      provenance.origin, provenance.is_synthetic, provenance.source_ids, provenance.confidence,
      provenance.claim_level, provenance.verification_status, provenance.license_scope,
      provenance.is_market_fact, provenance.data_split, provenance.schema_version,
      provenance.source_generated_at, provenance.last_verified_at,
    ]
  );
}

export async function upsertScenarioSession(session: ScenarioSession): Promise<void> {
  await getPool().query(
    `INSERT INTO scenario_sessions
      (session_id, external_user_id, scenario_id, status, started_at, completed_at, evaluation)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = VALUES(completed_at), evaluation = VALUES(evaluation)`,
    [
      session.session_id, session.user_id, session.scenario_id, session.status,
      new Date(session.started_at), session.completed_at ? new Date(session.completed_at) : null,
      JSON.stringify({ responses: session.responses ?? [] }),
    ]
  );
}

/** 会话状态跨进程恢复：把 DB 里的会话灌回 overlay 内存（供 submit 查询 session_id） */
export async function loadOverlaySessions(): Promise<Record<string, ScenarioSession>> {
  const rows = await query("SELECT * FROM scenario_sessions");
  const sessions: Record<string, ScenarioSession> = {};
  for (const row of rows) {
    let stored: { responses?: ScenarioSession["responses"] } = {};
    try {
      stored = row.evaluation ? JSON.parse(String(row.evaluation)) : {};
    } catch {
      stored = {};
    }
    sessions[row.session_id] = {
      session_id: row.session_id,
      user_id: row.external_user_id,
      scenario_id: row.scenario_id,
      status: row.status as ScenarioSession["status"],
      started_at: new Date(row.started_at).toISOString(),
      completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      responses: Array.isArray(stored.responses) ? stored.responses : [],
    };
  }
  return sessions;
}

// ---------------------------------------------------------------------------
// v2（0.2.1）：路径激活 / 任务状态 落库 —— 对话侧 ↔ 前端侧跨进程共享
//   activate_path → career_paths（objective 列存 GeneratedPath JSON 快照；text 64KB 足够）
//   update_task   → path_tasks（status / updated_at 权威状态）
// 读取方：loadOverlayPaths() 灌回 overlay 内存；summary / update_task 前 refresh 保证跨进程新鲜
// 行识别约定：v2 行 path_id 以 GEN- 开头（种子参考行是 PATH-xxx），两类行互不干扰
// ---------------------------------------------------------------------------

export async function upsertActivePath(userId: string, path: GeneratedPath): Promise<void> {
  const [userRows] = (await getPool().query(
    "SELECT data_split FROM users WHERE external_user_id = ?",
    [userId]
  )) as [Record<string, any>[], unknown];
  const rawSplit = String(userRows[0]?.data_split ?? "");
  const dataSplit = rawSplit === "dev" || rawSplit === "test" ? rawSplit : "golden";
  const provenance = provenanceColumns({ source_ids: "SRC-MCP-OVERLAY" });
  // 每用户只保留一条 active：旧的 GEN 激活行置 superseded（active_paths 是 Record<userId, path>，
  // 若允许多行 active，加载时"谁胜出"不确定）
  await getPool().query(
    "UPDATE career_paths SET status = 'superseded' WHERE external_user_id = ? AND path_id LIKE 'GEN-%' AND path_id <> ?",
    [userId, path.path_id]
  );
  await getPool().query(
    `INSERT INTO career_paths
      (path_id, external_user_id, branch_no, branch_type, target_role_id, horizon_years,
       weekly_hours_limit, objective, status, is_reference,
       origin, is_synthetic, source_ids, confidence, claim_level, verification_status,
       license_scope, is_market_fact, data_split, schema_version, source_generated_at, last_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       objective = VALUES(objective), status = 'active', external_user_id = VALUES(external_user_id),
       branch_no = VALUES(branch_no), branch_type = VALUES(branch_type),
       horizon_years = VALUES(horizon_years), weekly_hours_limit = VALUES(weekly_hours_limit)`,
    [
      path.path_id, userId, path.branch_type === "fast_gap" ? 1 : 2, path.branch_type,
      path.target_role_id, Number(path.horizon_years), Number(path.weekly_hours),
      JSON.stringify(path),
      provenance.origin, provenance.is_synthetic, provenance.source_ids, provenance.confidence,
      provenance.claim_level, provenance.verification_status, provenance.license_scope,
      provenance.is_market_fact, dataSplit, provenance.schema_version,
      provenance.source_generated_at, provenance.last_verified_at,
    ]
  );
}

export async function upsertPathTask(
  pathId: string,
  phaseOrder: number,
  task: PathTask,
  status: PathTask["status"],
  updatedAt: string
): Promise<void> {
  await getPool().query(
    `INSERT INTO path_tasks
      (task_id, path_id, phase_order, title, task_type, difficulty, estimated_hours,
       skill_id, resource_id, status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       status = VALUES(status), updated_at = VALUES(updated_at), title = VALUES(title)`,
    [
      task.task_id, pathId, Number(phaseOrder), task.title, task.task_type, task.difficulty,
      Number(task.estimated_hours || 0), task.skill_id || "", task.resource_id ?? null,
      status, updatedAt,
    ]
  );
}

/** 把 DB 里的激活路径 / 任务状态灌回 overlay 内存（供跨进程 summary / update_task 使用） */
export async function loadOverlayPaths(): Promise<{
  activePaths: Record<string, GeneratedPath>;
  taskUpdates: Record<string, { status: PathTask["status"]; updated_at: string }>;
}> {
  const pathRows = await query(
    "SELECT path_id, external_user_id, objective FROM career_paths WHERE path_id LIKE 'GEN-%' AND status = 'active'"
  );
  const taskRows = await query(
    "SELECT task_id, status, updated_at FROM path_tasks WHERE path_id LIKE 'GEN-%'"
  );
  const activePaths: Record<string, GeneratedPath> = {};
  for (const row of pathRows) {
    try {
      const parsed = JSON.parse(String(row.objective)) as GeneratedPath;
      if (parsed && parsed.path_id === row.path_id && parsed.phases) {
        activePaths[row.external_user_id] = parsed;
      }
    } catch {
      console.error(`[a02] active path snapshot parse failed: ${row.path_id}`);
    }
  }
  const taskUpdates: Record<string, { status: PathTask["status"]; updated_at: string }> = {};
  for (const row of taskRows) {
    taskUpdates[row.task_id] = {
      status: row.status as PathTask["status"],
      updated_at: new Date(row.updated_at).toISOString(),
    };
  }
  return { activePaths, taskUpdates };
}
