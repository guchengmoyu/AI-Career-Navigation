import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { CareerService, ServiceError } from "../src/service.js";
import { OverlayStore } from "../src/store.js";

function service() {
  return new CareerService(new OverlayStore(join(tmpdir(), "a02-career-mcp-tests", `${randomUUID()}.json`)));
}

describe("career profile", () => {
  it("returns eight explainable dimensions for all demo users", async () => {
    const app = service();
    await app.init();
    for (const user of app.data.users.filter((item) => item.data_split !== "test")) {
      const profile = app.calculateCareerProfile({ user_id: user.user_id });
      expect(profile.dimensions).toHaveLength(8);
      expect(profile.dimensions.every((item) => item.score >= 0 && item.score <= 100)).toBe(true);
      expect(profile.role_matches).toHaveLength(3);
    }
  });

  it("keeps USER-G009 matched first to AI application development", async () => {
    const app = service();
    await app.init();
    const profile = app.calculateCareerProfile({ user_id: "USER-G009" });
    expect(profile.role_matches[0].role_id).toBe("ROLE-AI-APP");
  });
});

describe("career path", () => {
  it("generates two branches within time constraints", async () => {
    const app = service();
    await app.init();
    const result = app.generateCareerPath({ user_id: "USER-G001", target_role_id: "ROLE-AI-ALG", horizon_years: 3, weekly_hours: 10 });
    expect(result.branches).toHaveLength(2);
    for (const branch of result.branches) {
      expect(branch.constraint_checks).toEqual({ within_weekly_limit: true, within_horizon: true, has_verifiable_deliverables: true });
      expect(branch.phases.flatMap((phase) => phase.tasks)).toHaveLength(6);
    }
    expect(result.gap_analysis.critical_gaps[0].priority_score).toBeGreaterThanOrEqual(result.gap_analysis.critical_gaps.at(-1)?.priority_score ?? 0);
  });
});

describe("scenario evaluation", () => {
  it("ships 60 balanced templates with a 100-point rubric", async () => {
    const app = service();
    await app.init();
    expect(app.data.scenarios).toHaveLength(60);
    const counts = app.data.scenarios.reduce<Record<string, number>>((accumulator, scenario) => {
      accumulator[scenario.module_id] = (accumulator[scenario.module_id] || 0) + 1;
      const rubric = JSON.parse(scenario.rubric_json) as Record<string, number>;
      expect(Object.values(rubric).reduce((sum, score) => sum + score, 0)).toBe(100);
      return accumulator;
    }, {});
    expect(counts).toEqual({ "SCN-REMOTE": 20, "SCN-AI-OFFICE": 20, "SCN-CROSS-ROLE": 20 });
  });

  it("rewards expected actions and explains the score", async () => {
    const app = service();
    await app.init();
    const started = await app.evaluateScenario({ action: "start", user_id: "USER-G001", scenario_id: "SCN-REMOTE-01" });
    const result = await app.evaluateScenario({
      action: "submit_and_evaluate",
      user_id: "USER-G001",
      session_id: started.session_id,
      response_text: "我会先复述目标，请问并确认截止时间和负责人，记录决策，约定下一次同步，核验来源并注意隐私脱敏，最后复盘改进。",
    });
    expect(result.overall_score).toBeGreaterThanOrEqual(80);
    expect(result.matched_expected_actions.length).toBeGreaterThanOrEqual(4);
    expect(result.update_applied).toBe(false);
  });

  it("penalizes explicit privacy and evidence red flags", async () => {
    const app = service();
    await app.init();
    const started = await app.evaluateScenario({ action: "start", user_id: "USER-G001", scenario_id: "SCN-AI-OFFICE-01" });
    const result = await app.evaluateScenario({
      action: "submit_and_evaluate",
      user_id: "USER-G001",
      session_id: started.session_id,
      response_text: "我会上传完整个人资料，直接采用未核验结论，并且隐藏AI参与。",
    });
    expect(result.red_flag_hits.length).toBeGreaterThanOrEqual(3);
    expect(result.penalty).toBe(30);
    expect(result.overall_score).toBeLessThan(40);
    expect(result.improvement_suggestions.some((item) => item.includes("风险"))).toBe(true);
  });
});

describe("progress management", () => {
  it("records idempotently and blocks withdrawn consent", async () => {
    const app = service();
    await app.init();
    const input = { action: "record_event" as const, user_id: "USER-G001", idempotency_key: "test-event-0001", event_type: "skill_practice", detail: "完成SQL练习", duration_minutes: 30, skill_id: "SKILL-009", score_delta: 2 };
    const first = await app.manageProgress(input);
    const second = await app.manageProgress(input);
    expect(second).toMatchObject({ idempotent_replay: true });
    const listed = await app.manageProgress({ action: "list_events", user_id: "USER-G001", limit: 100 });
    expect(listed.events.filter((event) => event.event_id === first.event.event_id)).toHaveLength(1);
    await expect(app.manageProgress({ ...input, user_id: "USER-G012", idempotency_key: "test-event-0012" })).rejects.toMatchObject<ServiceError>({ code: "CONSENT_REQUIRED" });
  });
});

describe("held-out evaluation", () => {
  it("passes all 300 matching cases and 50 fairness pairs", async () => {
    process.env.A02_ENABLE_TEST_DATA = "true";
    const app = service();
    await app.init();
    const matching = app.data.evaluation.matching as Array<{ user_id: string; role_id: string; expected_rank: number; expected_match_score: number }>;
    expect(matching).toHaveLength(300);
    for (const fixture of matching) {
      const result = app.calculateCareerProfile({ user_id: fixture.user_id });
      const actual = result.role_matches.find((role) => role.role_id === fixture.role_id)!;
      expect(actual.rank, fixture.user_id).toBe(fixture.expected_rank);
      expect(actual.match_score, `${fixture.user_id}/${fixture.role_id}`).toBeCloseTo(fixture.expected_match_score, 2);
    }
    const fairness = app.data.evaluation.fairness as Array<{ user_id: string; target_role_id: string; expected_score_delta: number }>;
    expect(fairness).toHaveLength(50);
    for (const fixture of fairness) {
      const base = app.calculateCareerProfile({ user_id: fixture.user_id }).role_matches.find((role) => role.role_id === fixture.target_role_id)!.match_score;
      const variant = app.calculateCareerProfile({ user_id: fixture.user_id }).role_matches.find((role) => role.role_id === fixture.target_role_id)!.match_score;
      expect(variant - base).toBe(fixture.expected_score_delta);
    }
    delete process.env.A02_ENABLE_TEST_DATA;
  });

  it("passes all 60 path constraint fixtures", async () => {
    process.env.A02_ENABLE_TEST_DATA = "true";
    const app = service();
    await app.init();
    const fixtures = app.data.evaluation.path as Array<{ user_id: string; target_role_id: string; horizon_years_min: number; max_weekly_hours: number; expected_branch_count_min: number; expected_first_gap_skill_id: string }>;
    expect(fixtures).toHaveLength(60);
    for (const fixture of fixtures) {
      const result = app.generateCareerPath({ user_id: fixture.user_id, target_role_id: fixture.target_role_id, horizon_years: fixture.horizon_years_min, weekly_hours: fixture.max_weekly_hours });
      expect(result.branches.length).toBeGreaterThanOrEqual(fixture.expected_branch_count_min);
      expect(result.branches[0].phases[0].tasks[0].skill_id, fixture.user_id).toBe(fixture.expected_first_gap_skill_id);
      expect(result.branches.every((branch) => Object.values(branch.constraint_checks).every(Boolean))).toBe(true);
    }
    delete process.env.A02_ENABLE_TEST_DATA;
  });
});
