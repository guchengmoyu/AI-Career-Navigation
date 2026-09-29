import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql, { type PoolConnection } from "mysql2/promise";
import { getRuntimeData } from "../data.js";

const database = process.env.MYSQL_DATABASE || "";
if (!/_v12$/.test(database) && process.env.A02_ALLOW_EXISTING_SCHEMA !== "YES_I_UNDERSTAND") {
  throw new Error("For safety, MYSQL_DATABASE must end with _v12. To use another dedicated demo database, set A02_ALLOW_EXISTING_SCHEMA=YES_I_UNDERSTAND.");
}
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1", port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database,
  connectionLimit: 4, multipleStatements: true, charset: "utf8mb4",
});

async function upsert(connection: PoolConnection, table: string, columns: string[], rows: unknown[][], updateColumns = columns.slice(1)) {
  for (let offset = 0; offset < rows.length; offset += 200) {
    const chunk = rows.slice(offset, offset + 200);
    const placeholders = chunk.map(() => `(${columns.map(() => "?").join(",")})`).join(",");
    const updates = updateColumns.map((column) => `\`${column}\`=VALUES(\`${column}\`)`).join(",");
    await connection.query(`INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(",")}) VALUES ${placeholders} ON DUPLICATE KEY UPDATE ${updates}`, chunk.flat());
  }
}

const provenanceColumns = ["schema_version","origin","is_synthetic","source_ids","confidence","claim_level","verification_status","license_scope","is_market_fact","data_split","source_generated_at","last_verified_at"];
const provenanceColumnsWithoutConfidence = provenanceColumns.filter((column) => column !== "confidence");
const provenanceValues = (row: any) => [row.schema_version,row.origin,row.is_synthetic,row.source_ids,row.confidence,row.claim_level,row.verification_status,row.license_scope,row.is_market_fact,row.data_split,row.generated_at,row.last_verified_at];
const provenanceValuesWithoutConfidence = (row: any) => provenanceValues(row).filter((_, index) => provenanceColumns[index] !== "confidence");

const data = getRuntimeData();
const connection = await pool.getConnection();
try {
  const here = dirname(fileURLToPath(import.meta.url));
  const schemaPath = join(here, "../../db/schema_v1_2.sql");
  await connection.query(await readFile(schemaPath, "utf8"));
  await connection.beginTransaction();
  await upsert(connection, "ref_dimensions", ["dimension_id","name","description","display_order",...provenanceColumns], data.dimensions.map((row) => [row.dimension_id,row.name,row.description,row.display_order,...provenanceValues(row)]));
  await upsert(connection, "ref_skills", ["skill_id","skill_key","name","dimension_id","definition","half_life_days",...provenanceColumns], data.skills.map((row) => [row.skill_id,row.skill_key,row.name,row.dimension_id,row.definition,row.half_life_days,...provenanceValues(row)]));
  await upsert(connection, "ref_roles", ["role_id","name","summary","target_user_stage","typical_entry_level",...provenanceColumns], data.roles.map((row) => [row.role_id,row.name,row.summary,row.target_user_stage,row.typical_entry_level,...provenanceValues(row)]));
  await upsert(connection, "ref_role_skills", ["role_skill_id","role_id","skill_id","required_score","importance_weight","is_core","rationale",...provenanceColumns], data.role_skills.map((row) => [row.role_skill_id,row.role_id,row.skill_id,row.required_score,row.importance_weight,row.is_core,row.rationale,...provenanceValues(row)]));
  await upsert(connection, "users", ["external_user_id","persona_code","is_golden","stage","consent_status",...provenanceColumns], data.users.map((row) => [row.user_id,row.persona_code,row.is_golden,row.stage,row.consent_status,...provenanceValues(row)]));
  await upsert(connection, "user_profiles", ["external_user_id","major","education_level","academic_or_job_status","experience_months","weekly_learning_hours","target_role_id","secondary_role_id","preferred_city","preferred_work_mode","career_goal","current_challenge","data_retention_days"], data.users.map((row) => [row.user_id,row.major,row.education_level,row.academic_or_job_status,row.experience_months,row.weekly_learning_hours,row.target_role_id,row.secondary_role_id,row.preferred_city,row.preferred_work_mode,row.career_goal,row.current_challenge,row.data_retention_days]));
  await upsert(connection, "user_skills", ["external_user_id","skill_id","current_score","observed_score","evidence_age_days","half_life_days","decay_factor","last_evidence_id","confidence",...provenanceColumnsWithoutConfidence], data.users.flatMap((user) => user.skill_scores.map((row) => [user.user_id,row.skill_id,row.current_score,row.observed_score,row.evidence_age_days,row.half_life_days,row.decay_factor,row.last_evidence_id,row.confidence,...provenanceValuesWithoutConfidence(user)])), ["current_score","observed_score","evidence_age_days","half_life_days","decay_factor","last_evidence_id","confidence",...provenanceColumnsWithoutConfidence]);
  await upsert(connection, "ref_jobs", ["job_id","role_id","title","company_code","industry","city","work_mode","experience_level","required_experience_months","education_level","salary_min_cny_month","salary_max_cny_month","salary_is_simulated","summary","display_disclaimer",...provenanceColumns], data.jobs.map((row) => [row.job_id,row.role_id,row.title,row.company_code,row.industry,row.city,row.work_mode,row.experience_level,row.required_experience_months,row.education_level,row.salary_min_cny_month,row.salary_max_cny_month,row.salary_is_simulated,row.summary,row.display_disclaimer,...provenanceValues(row)]));
  await upsert(connection, "ref_job_skills", ["job_skill_id","job_id","skill_id","required_score","importance_weight","requirement_type",...provenanceColumns], data.jobs.flatMap((job) => job.skill_requirements.map((row) => [row.job_skill_id || `${job.job_id}-${row.skill_id}`,job.job_id,row.skill_id,row.required_score,row.importance_weight,row.requirement_type,...provenanceValues(row)])));
  await upsert(connection, "ref_resources", ["resource_id","resource_type","title","provider","url","difficulty","estimated_hours","cost_type","prerequisite_score","summary",...provenanceColumns], data.resources.map((row) => [row.resource_id,row.resource_type,row.title,row.provider,row.url,row.difficulty,row.estimated_hours,row.cost_type,row.prerequisite_score,row.summary,...provenanceValues(row)]));
  await upsert(connection, "ref_resource_skills", ["resource_skill_id","resource_id","skill_id","coverage_weight","expected_score_gain",...provenanceColumns], data.resources.flatMap((resource) => resource.skill_mappings.map((row) => [row.resource_skill_id,resource.resource_id,row.skill_id,row.coverage_weight,row.expected_score_gain,...provenanceValues(row)])));
  await upsert(connection, "career_paths", ["path_id","external_user_id","branch_no","branch_type","target_role_id","horizon_years","weekly_hours_limit","objective","status","is_reference",...provenanceColumns], data.users.flatMap((user) => user.career_paths.map((row) => [row.path_id,user.user_id,row.branch_no,row.branch_type,row.target_role_id,row.horizon_years,row.weekly_hours_limit,row.objective,row.status,true,...provenanceValues(row)])));
  await upsert(connection, "career_milestones", ["milestone_id","path_id","sequence_no","month_from_start","title","target_skill_id","target_score","deliverable","acceptance_rule",...provenanceColumns], data.users.flatMap((user) => user.career_paths.flatMap((path) => path.milestones.map((row) => [row.milestone_id,path.path_id,row.sequence_no,row.month_from_start,row.title,row.target_skill_id,row.target_score,row.deliverable,row.acceptance_rule,...provenanceValues(row)]))));
  await upsert(connection, "scenario_cases", ["scenario_id","module_id","module_name","difficulty","target_role_id","target_user_stage","title","context","initial_prompt","expected_actions","rubric_json","red_flags","privacy_focus",...provenanceColumns], data.scenarios.map((row) => [row.scenario_id,row.module_id,row.module_name,row.difficulty,row.target_role_id,row.target_user_stage,row.title,row.context,row.initial_prompt,JSON.stringify(row.expected_actions.split("|")),row.rubric_json,JSON.stringify(row.red_flags.split("|")),row.privacy_focus,...provenanceValues(row)]));
  await upsert(connection, "growth_events", ["event_id","external_user_id","event_type","event_time","skill_id","resource_id","job_id","score_delta","status","sentiment","user_state","risk_level","detail",...provenanceColumns], data.users.flatMap((user) => user.recent_events.map((row) => [row.event_id,user.user_id,row.event_type,new Date(row.event_time),row.skill_id || null,row.resource_id || null,row.job_id || null,row.score_delta,row.status,row.sentiment,row.user_state,row.risk_level,row.detail,...provenanceValues(row)])));
  await connection.commit();
  console.log(JSON.stringify({ status: "imported", database, users: data.users.length, user_skills: data.users.length * data.skills.length, jobs: data.jobs.length, resources: data.resources.length, scenarios: data.scenarios.length, growth_events: data.users.reduce((sum, user) => sum + user.recent_events.length, 0), reference_paths: data.users.reduce((sum, user) => sum + user.career_paths.length, 0) }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
