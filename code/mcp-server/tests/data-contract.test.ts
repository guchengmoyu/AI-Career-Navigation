import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getRuntimeData } from "../src/data.js";

const requiredProvenance = [
  "schema_version", "origin", "is_synthetic", "source_ids", "confidence",
  "claim_level", "verification_status", "generated_at", "last_verified_at",
  "license_scope", "is_market_fact", "data_split",
];

function expectProvenance(record: object) {
  for (const key of requiredProvenance) expect(record, `missing provenance field ${key}`).toHaveProperty(key);
}

describe("runtime data contract", () => {
  it("keeps exact core counts, stable golden mappings and role weights", () => {
    const data = getRuntimeData();
    expect(data.users).toHaveLength(100);
    expect(data.test_users).toHaveLength(100);
    expect(data.jobs).toHaveLength(300);
    expect(data.resources).toHaveLength(200);
    expect(data.scenarios).toHaveLength(60);
    expect(data.users.flatMap((user) => user.recent_events)).toHaveLength(4000);
    expect(data.users.flatMap((user) => user.career_paths)).toHaveLength(24);
    expect(data.users.find((user) => user.user_id === "USER-G001")?.persona_code).toBe("GOLD-001");
    for (const role of data.roles) {
      const mappings = data.role_skills.filter((item) => item.role_id === role.role_id);
      expect(mappings).toHaveLength(18);
      expect(mappings.reduce((sum, item) => sum + item.importance_weight, 0)).toBeCloseTo(1, 6);
    }
  });

  it("preserves provenance through reference and transactional records", () => {
    const data = getRuntimeData();
    [
      ...data.dimensions, ...data.skills, ...data.roles, ...data.role_skills,
      ...data.users, ...data.jobs, ...data.resources, ...data.scenarios,
      ...data.users.flatMap((user) => user.recent_events),
      ...data.users.flatMap((user) => user.career_paths),
      ...data.users.flatMap((user) => user.career_paths.flatMap((path) => path.milestones)),
      ...data.jobs.flatMap((job) => job.skill_requirements),
      ...data.resources.flatMap((resource) => resource.skill_mappings),
    ].forEach(expectProvenance);
  });
});

describe("MySQL migration safety", () => {
  it("uses additive tables, stable IDs and complete core foreign keys", async () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const schema = await readFile(join(here, "../db/schema_v1_2.sql"), "utf8");
    expect(schema).not.toMatch(/\bDROP\s+(TABLE|DATABASE)\b/i);
    for (const table of ["ref_role_skills", "ref_resource_skills", "scenario_cases", "scenario_messages", "growth_events"]) {
      expect(schema).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(schema).toContain("external_user_id VARCHAR(32)");
    expect(schema).toContain("skill_id VARCHAR(40)");
    expect(schema).toContain("CONSTRAINT fk_growth_task FOREIGN KEY (task_id) REFERENCES path_tasks(task_id)");
  });
});
