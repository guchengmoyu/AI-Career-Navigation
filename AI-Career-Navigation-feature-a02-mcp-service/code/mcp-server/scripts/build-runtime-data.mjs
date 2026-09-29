import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const datasetRoot = process.env.A02_DATASET_ROOT
  ? resolve(process.env.A02_DATASET_ROOT)
  : resolve(ROOT, "../../../AI-Career-Navigation-dataset/ai-career-dataset");
const core = join(datasetRoot, "data", "v0.5-core");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  const [rawHeaders, ...records] = rows;
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, ""));
  return records.map((values) => Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""])));
}

async function json(name) {
  return JSON.parse(await readFile(join(core, "json", `${name}.json`), "utf8"));
}

async function csv(name) {
  return parseCsv(await readFile(join(core, "csv", `${name}.csv`), "utf8"));
}

const [usersDoc, fullUsersDoc, jobsDoc, resourcesDoc, scenariosDoc, evaluationDoc, dimensions, skills, roles, roleSkills] = await Promise.all([
  json("users"),
  readFile(join(datasetRoot, "data", "v1.0-full", "json", "users.json"), "utf8").then(JSON.parse),
  json("jobs"), json("resources"), json("scenarios"), json("evaluation"),
  csv("dimensions"), csv("skills"), csv("roles"), csv("role_skills"),
]);

const cleanMetadata = (row) => ({
  schema_version: row.schema_version,
  origin: row.origin,
  is_synthetic: row.is_synthetic === true || row.is_synthetic === "true",
  source_ids: row.source_ids,
  confidence: Number(row.confidence),
  claim_level: row.claim_level,
  verification_status: row.verification_status,
  generated_at: row.generated_at,
  last_verified_at: row.last_verified_at || null,
  license_scope: row.license_scope,
  is_market_fact: row.is_market_fact === true || row.is_market_fact === "true",
  data_split: row.data_split,
});

const cleanUser = (user) => ({
  user_id: user.user_id,
  persona_code: user.persona_code,
  is_golden: user.is_golden,
  stage: user.stage,
  major: user.major,
  education_level: user.education_level,
  academic_or_job_status: user.academic_or_job_status,
  experience_months: user.experience_months,
  weekly_learning_hours: user.weekly_learning_hours,
  target_role_id: user.target_role_id,
  secondary_role_id: user.secondary_role_id,
  preferred_city: user.preferred_city,
  preferred_work_mode: user.preferred_work_mode,
  career_goal: user.career_goal,
  current_challenge: user.current_challenge,
  consent_status: user.consent_status,
  data_retention_days: user.data_retention_days,
  skill_scores: user.skill_scores.map((score) => ({
    skill_id: score.skill_id,
    current_score: score.current_score,
    observed_score: score.observed_score,
    evidence_age_days: score.evidence_age_days,
    half_life_days: score.half_life_days,
    decay_factor: score.decay_factor,
    last_evidence_id: score.last_evidence_id,
    confidence: score.confidence,
  })),
  recent_events: user.recent_events.map((event) => ({
    event_id: event.event_id,
    event_type: event.event_type,
    event_time: event.event_time,
    skill_id: event.skill_id,
    resource_id: event.resource_id,
    job_id: event.job_id,
    score_delta: event.score_delta,
    status: event.status,
    sentiment: event.sentiment,
    user_state: event.user_state,
    risk_level: event.risk_level,
    detail: event.detail,
    ...cleanMetadata(event),
  })),
  career_paths: user.career_paths,
  ...cleanMetadata(user),
});
const users = usersDoc.records.map(cleanUser);
const evaluationUserIds = new Set([
  ...evaluationDoc.matching.map((row) => row.user_id),
  ...evaluationDoc.path.map((row) => row.user_id),
]);
const testUsers = fullUsersDoc.records.filter((user) => evaluationUserIds.has(user.user_id)).map(cleanUser);

const bundle = {
  metadata: {
    schema_version: "1.2.0",
    dataset_version: "v0.5-core",
    dataset_commit: "9b6a75cdf847132a461a59cb520f90b2e466bb33",
    random_seed: 20260905,
    generated_at: "2026-09-13T00:00:00+08:00",
    disclaimer: "本服务使用合成模拟数据，结果不代表真实市场统计或招聘结论。",
  },
  dimensions: dimensions.map((row) => ({
    dimension_id: row.dimension_id,
    name: row.name,
    description: row.description,
    display_order: Number(row.display_order),
    ...cleanMetadata(row),
  })),
  skills: skills.map((row) => ({
    skill_id: row.skill_id,
    skill_key: row.skill_key,
    name: row.name,
    dimension_id: row.dimension_id,
    dimension_name: row.dimension_name,
    definition: row.definition,
    half_life_days: Number(row.half_life_days),
    ...cleanMetadata(row),
  })),
  roles: roles.map((row) => ({
    role_id: row.role_id,
    name: row.name,
    summary: row.summary,
    target_user_stage: row.target_user_stage,
    typical_entry_level: row.typical_entry_level,
    ...cleanMetadata(row),
  })),
  role_skills: roleSkills.map((row) => ({
    role_skill_id: row.role_skill_id,
    role_id: row.role_id,
    skill_id: row.skill_id,
    required_score: Number(row.required_score),
    importance_weight: Number(row.weight),
    is_core: row.is_core === "true",
    rationale: row.rationale,
    ...cleanMetadata(row),
  })),
  users,
  test_users: testUsers,
  jobs: jobsDoc.records.map((job) => ({
    job_id: job.job_id,
    role_id: job.role_id,
    title: job.title,
    company_code: job.company_code,
    industry: job.industry,
    city: job.city,
    work_mode: job.work_mode,
    experience_level: job.experience_level,
    required_experience_months: job.required_experience_months,
    education_level: job.education_level,
    salary_min_cny_month: job.salary_min_cny_month,
    salary_max_cny_month: job.salary_max_cny_month,
    salary_is_simulated: job.salary_is_simulated,
    summary: job.summary,
    display_disclaimer: job.display_disclaimer,
    skill_requirements: job.skill_requirements,
    ...cleanMetadata(job),
  })),
  resources: resourcesDoc.records.map((resource) => ({
    resource_id: resource.resource_id,
    resource_type: resource.resource_type,
    title: resource.title,
    provider: resource.provider,
    url: resource.url,
    difficulty: resource.difficulty,
    estimated_hours: resource.estimated_hours,
    cost_type: resource.cost_type,
    prerequisite_score: resource.prerequisite_score,
    summary: resource.summary,
    skill_mappings: resource.skill_mappings,
    ...cleanMetadata(resource),
  })),
  scenarios: scenariosDoc.records,
  evaluation: evaluationDoc,
};

const output = `${JSON.stringify(bundle)}\n`;
const outputPath = join(ROOT, "data", "runtime-data.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, "utf8");
const hash = createHash("sha256").update(output).digest("hex");
await writeFile(join(ROOT, "data", "runtime-data.sha256"), `${hash}  runtime-data.json\n`, "utf8");
console.log(JSON.stringify({ outputPath, bytes: Buffer.byteLength(output), sha256: hash, users: users.length, test_users: testUsers.length, jobs: bundle.jobs.length, resources: bundle.resources.length, scenarios: bundle.scenarios.length }, null, 2));
