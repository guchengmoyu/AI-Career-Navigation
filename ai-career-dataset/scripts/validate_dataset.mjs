import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const DATA_DIR = path.join(ROOT, "data");
const SCHEMA_DIR = path.join(ROOT, "schemas");
const TEMPLATE_DIR = path.join(ROOT, "templates");
const REPORT_DIR = path.join(ROOT, "reports");
const GENERATOR = path.join(SCRIPT_DIR, "generate_dataset.mjs");
const SCHEMA_VERSION = "1.1.0";

const VERSION_EXPECTED = {
  "v0.2-seed": { users: 12, jobs: 60, learning_resources: 60, growth_events: 360, scenario_cases: 15, trend_snapshots: 120, trendMonths: 2, students: 6, newcomers: 6 },
  "v0.5-core": { users: 100, jobs: 300, learning_resources: 200, growth_events: 4000, scenario_cases: 60, trend_snapshots: 360, trendMonths: 6, students: 50, newcomers: 50 },
  "v1.0-full": { users: 500, jobs: 1500, learning_resources: 600, growth_events: 20000, scenario_cases: 150, trend_snapshots: 720, trendMonths: 12, students: 250, newcomers: 250 },
};

const RESOURCE_MIX_EXPECTED = {
  "v0.2-seed": { verified_course_metadata: 6, public_catalog_topic_card: 12, synthetic_project: 24, synthetic_assessment: 12, synthetic_guide: 6 },
  "v0.5-core": { verified_course_metadata: 12, public_catalog_topic_card: 28, synthetic_project: 100, synthetic_assessment: 40, synthetic_guide: 20 },
  "v1.0-full": { verified_course_metadata: 22, public_catalog_topic_card: 98, synthetic_project: 300, synthetic_assessment: 120, synthetic_guide: 60 },
};

const COMMON_FIELDS = [
  "schema_version", "origin", "is_synthetic", "source_ids", "generated_at", "confidence",
  "claim_level", "verification_status", "last_verified_at", "license_scope", "is_market_fact", "data_split",
];
const ORIGINS = new Set(["synthetic", "public_metadata", "derived"]);
const CLAIM_LEVELS = new Set(["verified_primary", "primary_derived", "synthetic"]);
const VERIFICATION_STATUSES = new Set(["verified", "derived", "not_applicable"]);
const LICENSE_SCOPES = new Set(["metadata_only", "cc_by_4_0_attribution", "reference_only", "team_generated"]);
const DATA_SPLITS = new Set(["golden", "dev", "test"]);

function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((value) => value !== "")) rows.push(row);
  }
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0];
  return {
    headers,
    rows: rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))),
  };
}

async function readCsv(filePath) {
  return parseCsv(await fs.readFile(filePath, "utf8"));
}

async function walkFiles(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function filesForDeterminism() {
  const roots = [DATA_DIR, SCHEMA_DIR, TEMPLATE_DIR];
  const files = [];
  for (const root of roots) files.push(...await walkFiles(root));
  files.push(path.join(REPORT_DIR, "generation_manifest.json"));
  return files.sort((a, b) => a.localeCompare(b));
}

async function hashFile(filePath) {
  const data = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function hashFiles(files) {
  const result = new Map();
  for (const filePath of files) result.set(path.relative(ROOT, filePath).replaceAll("\\", "/"), await hashFile(filePath));
  return result;
}

function sameHashes(left, right) {
  if (left.size !== right.size) return false;
  return [...left.entries()].every(([name, hash]) => right.get(name) === hash);
}

function number(value) {
  return Number(value);
}

function boolean(value) {
  return value === true || value === "true";
}

function counts(rows, field) {
  const result = {};
  for (const row of rows) result[row[field]] = (result[row[field]] ?? 0) + 1;
  return result;
}

function sumBy(rows, keyField, valueField) {
  const result = new Map();
  for (const row of rows) result.set(row[keyField], (result.get(row[keyField]) ?? 0) + number(row[valueField]));
  return result;
}

async function loadPackage(version) {
  const base = path.join(DATA_DIR, version);
  const manifest = JSON.parse(await fs.readFile(path.join(base, "manifest.json"), "utf8"));
  const tables = {};
  const headers = {};
  for (const tableName of Object.keys(manifest.tables)) {
    const parsed = await readCsv(path.join(base, "csv", `${tableName}.csv`));
    tables[tableName] = parsed.rows;
    headers[tableName] = parsed.headers;
  }
  return { version, manifest, tables, headers };
}

const checks = [];
function addCheck(checkId, passed, detail, { version = "global", severity = "error" } = {}) {
  checks.push({ check_id: checkId, version, severity, passed, detail });
}

function checkUnique(rows, key, label, version) {
  const values = rows.map((row) => row[key]);
  addCheck(`${label}_unique`, values.length === new Set(values).size && values.every(Boolean), `${key}: ${new Set(values).size}/${values.length} unique`, { version });
}

function checkForeignKey(rows, field, allowed, label, version, nullable = false) {
  const invalid = rows.filter((row) => {
    const value = row[field];
    return nullable && value === "" ? false : !allowed.has(value);
  });
  addCheck(label, invalid.length === 0, invalid.length ? `${invalid.length} invalid ${field}; example=${invalid[0][field]}` : `${rows.length} references valid`, { version });
}

function checkPackage(pkg, fullTestUserIds, fullTestJobIds) {
  const { version, manifest, tables, headers } = pkg;
  const expected = VERSION_EXPECTED[version];
  addCheck("schema_version", manifest.schema_version === SCHEMA_VERSION, `expected ${SCHEMA_VERSION}, actual ${manifest.schema_version}`, { version });

  for (const [tableName, meta] of Object.entries(manifest.tables)) {
    const rows = tables[tableName];
    addCheck(`${tableName}_manifest_count`, rows.length === meta.rows, `manifest=${meta.rows}, csv=${rows.length}`, { version });
    checkUnique(rows, meta.primary_key, tableName, version);
    const missingCommonHeaders = COMMON_FIELDS.filter((field) => !headers[tableName].includes(field));
    addCheck(`${tableName}_common_headers`, missingCommonHeaders.length === 0, missingCommonHeaders.length ? `missing ${missingCommonHeaders.join(",")}` : "all common metadata fields present", { version });
    const invalidMetadata = rows.filter((row) =>
      row.schema_version !== SCHEMA_VERSION
      || !ORIGINS.has(row.origin)
      || !CLAIM_LEVELS.has(row.claim_level)
      || !VERIFICATION_STATUSES.has(row.verification_status)
      || !LICENSE_SCOPES.has(row.license_scope)
      || !DATA_SPLITS.has(row.data_split)
      || number(row.confidence) < 0
      || number(row.confidence) > 1
    );
    addCheck(`${tableName}_metadata_values`, invalidMetadata.length === 0, invalidMetadata.length ? `${invalidMetadata.length} invalid metadata rows` : `${rows.length} metadata rows valid`, { version });
  }

  for (const [tableName, count] of Object.entries(expected)) {
    if (["trendMonths", "students", "newcomers"].includes(tableName)) continue;
    addCheck(`${tableName}_expected_count`, tables[tableName].length === count, `expected=${count}, actual=${tables[tableName].length}`, { version });
  }

  const stageCounts = counts(tables.users, "stage");
  addCheck("user_stage_balance", stageCounts.student === expected.students && stageCounts.newcomer === expected.newcomers, `student=${stageCounts.student ?? 0}, newcomer=${stageCounts.newcomer ?? 0}`, { version });

  const resourceCounts = counts(tables.learning_resources, "resource_type");
  const mixExpected = RESOURCE_MIX_EXPECTED[version];
  addCheck("resource_mix", Object.entries(mixExpected).every(([type, count]) => resourceCounts[type] === count), JSON.stringify(resourceCounts), { version });

  const trendCounts = counts(tables.trend_snapshots, "skill_id");
  addCheck("trend_coverage", Object.keys(trendCounts).length === 60 && Object.values(trendCounts).every((count) => count === expected.trendMonths), `${Object.keys(trendCounts).length} skills × ${expected.trendMonths} months`, { version });

  const userIds = new Set(tables.users.map((row) => row.user_id));
  const skillIds = new Set(tables.skills.map((row) => row.skill_id));
  const roleIds = new Set(tables.roles.map((row) => row.role_id));
  const jobIds = new Set(tables.jobs.map((row) => row.job_id));
  const resourceIds = new Set(tables.learning_resources.map((row) => row.resource_id));
  const pathIds = new Set(tables.career_paths.map((row) => row.path_id));

  checkForeignKey(tables.user_skill_scores, "user_id", userIds, "user_skill_scores_user_fk", version);
  checkForeignKey(tables.user_skill_scores, "skill_id", skillIds, "user_skill_scores_skill_fk", version);
  checkForeignKey(tables.user_skill_evidence, "user_id", userIds, "user_skill_evidence_user_fk", version);
  checkForeignKey(tables.user_skill_evidence, "skill_id", skillIds, "user_skill_evidence_skill_fk", version);
  checkForeignKey(tables.jobs, "role_id", roleIds, "jobs_role_fk", version);
  checkForeignKey(tables.job_skills, "job_id", jobIds, "job_skills_job_fk", version);
  checkForeignKey(tables.job_skills, "skill_id", skillIds, "job_skills_skill_fk", version);
  checkForeignKey(tables.resource_skills, "resource_id", resourceIds, "resource_skills_resource_fk", version);
  checkForeignKey(tables.resource_skills, "skill_id", skillIds, "resource_skills_skill_fk", version);
  checkForeignKey(tables.growth_events, "user_id", userIds, "growth_events_user_fk", version);
  checkForeignKey(tables.growth_events, "skill_id", skillIds, "growth_events_skill_fk", version, true);
  checkForeignKey(tables.growth_events, "job_id", jobIds, "growth_events_job_fk", version, true);
  checkForeignKey(tables.growth_events, "resource_id", resourceIds, "growth_events_resource_fk", version, true);
  checkForeignKey(tables.golden_profile_snapshots, "user_id", userIds, "golden_snapshots_user_fk", version);
  checkForeignKey(tables.career_paths, "user_id", userIds, "career_paths_user_fk", version);
  checkForeignKey(tables.career_milestones, "path_id", pathIds, "career_milestones_path_fk", version);

  const roleWeights = sumBy(tables.role_skills, "role_id", "weight");
  addCheck("role_weights", [...roleWeights.values()].every((value) => Math.abs(value - 1) < 0.00001), JSON.stringify(Object.fromEntries(roleWeights)), { version });
  const jobWeights = sumBy(tables.job_skills, "job_id", "importance_weight");
  addCheck("job_weights", [...jobWeights.values()].every((value) => Math.abs(value - 1) < 0.00001), `${jobWeights.size} job weight sums checked`, { version });
  const resourceWeights = sumBy(tables.resource_skills, "resource_id", "coverage_weight");
  addCheck("resource_weights", [...resourceWeights.values()].every((value) => Math.abs(value - 1) < 0.00001), `${resourceWeights.size} resource weight sums checked`, { version });

  const invalidScores = tables.user_skill_scores.filter((row) => number(row.current_score) < 0 || number(row.current_score) > 100 || number(row.observed_score) < 0 || number(row.observed_score) > 100);
  addCheck("score_range", invalidScores.length === 0, invalidScores.length ? `${invalidScores.length} scores outside 0-100` : `${tables.user_skill_scores.length} scores within 0-100`, { version });

  if (version === "v1.0-full") {
    const splitCounts = counts(tables.users, "data_split");
    addCheck("user_split_counts", splitCounts.golden === 12 && splitCounts.dev === 388 && splitCounts.test === 100, JSON.stringify(splitCounts), { version });
    const jobSplitCounts = counts(tables.jobs, "data_split");
    addCheck("job_split_counts", jobSplitCounts.dev === 1200 && jobSplitCounts.test === 300, JSON.stringify(jobSplitCounts), { version });
    for (const roleId of roleIds) {
      const roleJobs = tables.jobs.filter((row) => row.role_id === roleId);
      const levelCounts = counts(roleJobs, "experience_level");
      addCheck(`job_level_mix_${roleId}`, levelCounts.campus === 167 && levelCounts.entry === 167 && levelCounts.junior === 166, JSON.stringify(levelCounts), { version });
    }
    const eventCounts = counts(tables.growth_events, "user_id");
    addCheck("events_per_user", Object.keys(eventCounts).length === 500 && Object.values(eventCounts).every((count) => count === 40), "500 users × 40 events", { version });
  }

  const testEvalTables = ["matching_eval", "path_eval", "dialogue_eval", "fairness_eval", "privacy_security_eval", "retrieval_eval"];
  for (const tableName of testEvalTables) {
    addCheck(`${tableName}_test_split`, tables[tableName].every((row) => row.data_split === "test"), `${tables[tableName].length} held-out rows`, { version });
  }
  addCheck("matching_eval_inputs", tables.matching_eval.every((row) => fullTestUserIds.has(row.user_id) && fullTestJobIds.has(row.candidate_job_id) && Object.keys(JSON.parse(row.input_skill_scores_json)).length === 60), `${tables.matching_eval.length} matching inputs self-contained`, { version });
  addCheck("path_eval_inputs", tables.path_eval.every((row) => fullTestUserIds.has(row.user_id) && Object.keys(JSON.parse(row.input_skill_scores_json)).length === 60), `${tables.path_eval.length} path inputs self-contained`, { version });
  addCheck("fairness_pairs", tables.fairness_eval.every((row) => number(row.expected_score_delta) === 0 && number(row.base_expected_score) === number(row.variant_expected_score)), `${tables.fairness_eval.length} counterfactual pairs have zero expected delta`, { version });

  const sourceIds = new Set(tables.source_registry.map((row) => row.source_id));
  let invalidSourceLinks = 0;
  for (const rows of Object.values(tables)) {
    for (const row of rows) {
      for (const sourceId of row.source_ids.split("|").filter(Boolean)) if (!sourceIds.has(sourceId)) invalidSourceLinks += 1;
    }
  }
  addCheck("source_registry_fk", invalidSourceLinks === 0, invalidSourceLinks ? `${invalidSourceLinks} unknown source references` : "all source_ids resolve", { version });
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const beforeFiles = await filesForDeterminism();
  const beforeHashes = await hashFiles(beforeFiles);
  await execFileAsync(process.execPath, [GENERATOR], { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 });
  const afterFiles = await filesForDeterminism();
  const afterHashes = await hashFiles(afterFiles);
  addCheck("deterministic_regeneration", sameHashes(beforeHashes, afterHashes), `${afterHashes.size} generated files compared byte-for-byte`);

  const packages = [];
  for (const version of Object.keys(VERSION_EXPECTED)) packages.push(await loadPackage(version));
  const full = packages.find((pkg) => pkg.version === "v1.0-full");
  const fullTestUserIds = new Set(full.tables.users.filter((row) => row.data_split === "test").map((row) => row.user_id));
  const fullTestJobIds = new Set(full.tables.jobs.filter((row) => row.data_split === "test").map((row) => row.job_id));
  for (const pkg of packages) checkPackage(pkg, fullTestUserIds, fullTestJobIds);

  const fullTables = full.tables;
  const verifiedResources = fullTables.learning_resources.filter((row) => row.claim_level === "verified_primary");
  addCheck("verified_primary_resource_minimum", verifiedResources.length >= 20, `${verifiedResources.length} official course/course-series pages verified`);
  addCheck("verified_resource_fields", verifiedResources.every((row) => row.resource_type === "verified_course_metadata" && row.url.startsWith("https://higher.smartedu.cn/") && row.verification_status === "verified" && row.last_verified_at && row.license_scope === "metadata_only" && !boolean(row.is_synthetic)), "verified resources use official URLs and metadata-only scope");
  const topicCards = fullTables.learning_resources.filter((row) => row.resource_type === "public_catalog_topic_card");
  addCheck("topic_card_labeling", topicCards.every((row) => row.claim_level === "primary_derived" && boolean(row.is_synthetic) && row.page_kind === "derived_topic_card" && row.title.includes("主题卡")), `${topicCards.length} derived topic cards are not labeled as official courses`);
  addCheck("market_claim_boundaries", fullTables.jobs.every((row) => !boolean(row.is_market_fact) && boolean(row.salary_is_simulated)) && fullTables.trend_snapshots.every((row) => !boolean(row.is_market_fact) && row.display_disclaimer.includes("模拟")), "jobs, salaries and trends remain explicitly simulated");

  const onet = fullTables.source_registry.find((row) => row.source_id === "SRC-ONET");
  addCheck("onet_attribution", onet?.title.includes("31.0") && onet?.license_or_terms.includes("CC BY 4.0") && onet?.transform_note.includes("修改") && onet?.license_scope === "cc_by_4_0_attribution", "O*NET version, attribution license and modification notice present");

  const goldenResults = fullTables.golden_expected_results;
  addCheck("golden_case_counts", goldenResults.length === 12 && fullTables.career_paths.length === 24 && fullTables.golden_profile_snapshots.length === 768, "12 golden users, two paths each, eight 8-dimension snapshots each");
  addCheck("golden_g009_rank", goldenResults.find((row) => row.user_id === "USER-G009")?.expected_primary_rank === "1", "USER-G009 target AI application role ranks first");
  addCheck("golden_target_top_two", goldenResults.every((row) => number(row.expected_primary_rank) <= 2), "all golden target roles rank in top two");
  let chainFailures = 0;
  for (const user of fullTables.users.filter((row) => boolean(row.is_golden))) {
    const events = fullTables.growth_events.filter((row) => row.user_id === user.user_id).sort((a, b) => a.event_time.localeCompare(b.event_time));
    const chain = ["course_completed", "project_completed", "profile_recalculated", "plan_adjusted"];
    let cursor = -1;
    for (const type of chain) {
      cursor = events.findIndex((row, index) => index > cursor && row.event_type === type);
      if (cursor < 0) {
        chainFailures += 1;
        break;
      }
    }
  }
  addCheck("golden_closed_loop", chainFailures === 0, chainFailures ? `${chainFailures} golden users missing ordered event chain` : "12 golden users contain ordered learning→project→recalculation→adjustment chain");

  const piiPatterns = [
    /\b1[3-9]\d{9}\b/g,
    /\b\d{17}[\dXx]\b/g,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /\b\d{8,12}\b/g,
  ];
  const piiFields = {
    users: ["career_goal", "current_challenge"],
    jobs: ["title", "company_code", "summary"],
    growth_events: ["detail"],
    scenario_cases: ["title", "context", "initial_prompt"],
    dialogue_eval: ["user_utterance"],
    privacy_security_eval: ["input"],
  };
  let piiHits = 0;
  for (const [tableName, fields] of Object.entries(piiFields)) {
    for (const row of fullTables[tableName]) {
      const text = fields.map((field) => row[field] ?? "").join(" ");
      for (const pattern of piiPatterns) piiHits += [...text.matchAll(pattern)].length;
    }
  }
  addCheck("no_pii_patterns", piiHits === 0, piiHits ? `${piiHits} PII-like patterns found` : "no phone, ID, email or long account-number patterns found");

  const reviewTemplate = await readCsv(path.join(TEMPLATE_DIR, "golden_manual_review_template.csv"));
  addCheck("golden_manual_review_template", reviewTemplate.rows.length === 12, `${reviewTemplate.rows.length} review rows prepared`);
  const signedReviews = reviewTemplate.rows.filter((row) => row.status === "approved" && row.reviewer && row.review_date).length;
  addCheck("golden_manual_signoff", signedReviews === 12, `${signedReviews}/12 signed; team signoff is required before competition freeze`, { severity: "warning" });

  const checksumLines = [...afterHashes.entries()].map(([name, hash]) => `${hash}  ${name}`).join("\n");
  await fs.writeFile(path.join(REPORT_DIR, "checksums.sha256"), `${checksumLines}\n`, "utf8");

  const failed = checks.filter((row) => row.severity === "error" && !row.passed);
  const warnings = checks.filter((row) => row.severity === "warning" && !row.passed);
  const report = {
    status: failed.length ? "FAIL" : "PASS",
    schema_version: SCHEMA_VERSION,
    validated_at: new Date().toISOString(),
    summary: {
      checks: checks.length,
      passed: checks.filter((row) => row.passed).length,
      failed: failed.length,
      warnings: warnings.length,
      verified_primary_resources: verifiedResources.length,
      deterministic_files_compared: afterHashes.size,
    },
    versions: Object.fromEntries(packages.map((pkg) => [pkg.version, {
      users: pkg.tables.users.length,
      jobs: pkg.tables.jobs.length,
      resources: pkg.tables.learning_resources.length,
      events: pkg.tables.growth_events.length,
      trends: pkg.tables.trend_snapshots.length,
      scenarios: pkg.tables.scenario_cases.length,
    }])),
    checks,
  };
  await fs.writeFile(path.join(REPORT_DIR, "validation_report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const rows = checks.map((row) => `| ${row.version} | ${row.check_id} | ${row.severity} | ${row.passed ? "通过" : row.severity === "warning" ? "待完成" : "失败"} | ${String(row.detail).replaceAll("|", "\\|")} |`);
  const markdown = [
    "# 数据验证报告",
    "",
    `- 自动验证状态：${report.status}`,
    `- 检查项：${report.summary.checks}`,
    `- 失败：${report.summary.failed}`,
    `- 待人工完成：${report.summary.warnings}`,
    `- 已核验官方课程/专题页：${report.summary.verified_primary_resources}`,
    `- 确定性比较文件：${report.summary.deterministic_files_compared}`,
    "",
    "| 版本 | 检查 | 级别 | 结果 | 说明 |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "自动检查通过不等于完成人工签字或真实用户测试。比赛冻结前须填写黄金案例复核表，并开展真实用户测试。",
    "",
  ].join("\n");
  await fs.writeFile(path.join(REPORT_DIR, "validation_report.md"), markdown, "utf8");

  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));
  if (failed.length) process.exitCode = 1;
}

await main();
