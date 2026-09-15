export const SCHEMA_VERSION = "1.2.0";
export const CALCULATION_VERSION = "a02-mcp-0.1.0";

export interface Metadata {
  schema_version: string;
  origin: string;
  is_synthetic: boolean;
  source_ids: string;
  confidence: number;
  claim_level: string;
  verification_status: string;
  generated_at: string;
  last_verified_at: string | null;
  license_scope: string;
  is_market_fact: boolean;
  data_split: "golden" | "dev" | "test";
}

export interface Dimension extends Metadata {
  dimension_id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface Skill extends Metadata {
  skill_id: string;
  skill_key: string;
  name: string;
  dimension_id: string;
  dimension_name: string;
  definition: string;
  half_life_days: number;
}

export interface Role extends Metadata {
  role_id: string;
  name: string;
  summary: string;
  target_user_stage: string;
  typical_entry_level: string;
}

export interface RoleSkill extends Metadata {
  role_skill_id: string;
  role_id: string;
  skill_id: string;
  required_score: number;
  importance_weight: number;
  is_core: boolean;
  rationale: string;
}

export interface SkillScore {
  skill_id: string;
  current_score: number;
  observed_score: number;
  evidence_age_days: number;
  half_life_days: number;
  decay_factor: number;
  last_evidence_id: string | null;
  confidence: number;
}

export interface GrowthEvent extends Metadata {
  event_id: string;
  event_type: string;
  event_time: string;
  skill_id?: string | null;
  resource_id?: string | null;
  job_id?: string | null;
  task_id?: string | null;
  score_delta: number;
  status: string;
  sentiment: string;
  user_state: string;
  risk_level: string;
  detail: string;
  duration_minutes?: number;
  points_earned?: number;
}

export interface CareerMilestone extends Metadata {
  milestone_id: string;
  path_id: string;
  sequence_no: number;
  month_from_start: number;
  title: string;
  target_skill_id: string;
  target_score: number;
  deliverable: string;
  acceptance_rule: string;
}

export interface ReferencePath extends Metadata {
  path_id: string;
  user_id: string;
  branch_no: number;
  branch_type: string;
  target_role_id: string;
  horizon_years: number;
  weekly_hours_limit: number;
  objective: string;
  status: string;
  milestones: CareerMilestone[];
}

export interface User extends Metadata {
  user_id: string;
  persona_code: string;
  is_golden: boolean;
  stage: "student" | "newcomer";
  major: string;
  education_level: string;
  academic_or_job_status: string;
  experience_months: number;
  weekly_learning_hours: number;
  target_role_id: string;
  secondary_role_id: string;
  preferred_city: string;
  preferred_work_mode: string;
  career_goal: string;
  current_challenge: string;
  consent_status: string;
  data_retention_days: number;
  skill_scores: SkillScore[];
  recent_events: GrowthEvent[];
  career_paths: ReferencePath[];
}

export interface ResourceSkill extends Metadata {
  resource_skill_id: string;
  resource_id: string;
  skill_id: string;
  coverage_weight: number;
  expected_score_gain: number;
}

export interface Resource extends Metadata {
  resource_id: string;
  resource_type: string;
  title: string;
  provider: string;
  url: string;
  difficulty: string;
  estimated_hours: number;
  cost_type: string;
  prerequisite_score: number;
  summary: string;
  skill_mappings: ResourceSkill[];
}

export interface JobSkill extends Metadata {
  job_skill_id: string;
  job_id: string;
  skill_id: string;
  required_score: number;
  importance_weight: number;
  requirement_type: string;
}

export interface Job extends Metadata {
  job_id: string;
  role_id: string;
  title: string;
  company_code: string;
  industry: string;
  city: string;
  work_mode: string;
  experience_level: string;
  required_experience_months: number;
  education_level: string;
  salary_min_cny_month: number;
  salary_max_cny_month: number;
  salary_is_simulated: boolean;
  summary: string;
  display_disclaimer: string;
  skill_requirements: JobSkill[];
}

export interface Scenario extends Metadata {
  scenario_id: string;
  module_id: string;
  module_name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  target_role_id: string;
  target_user_stage: string;
  title: string;
  context: string;
  initial_prompt: string;
  expected_actions: string;
  rubric_json: string;
  red_flags: string;
  privacy_focus: "low" | "medium" | "high";
}

export interface RuntimeData {
  metadata: {
    schema_version: string;
    dataset_version: string;
    dataset_commit: string;
    random_seed: number;
    generated_at: string;
    disclaimer: string;
  };
  dimensions: Dimension[];
  skills: Skill[];
  roles: Role[];
  role_skills: RoleSkill[];
  users: User[];
  test_users: User[];
  jobs: Job[];
  resources: Resource[];
  scenarios: Scenario[];
  evaluation: Record<string, unknown>;
}

export interface PathTask {
  task_id: string;
  title: string;
  task_type: string;
  difficulty: string;
  estimated_hours: number;
  skill_id: string;
  resource_id: string | null;
  provider: string | null;
  resource_url: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped";
}

export interface GeneratedPath {
  path_id: string;
  branch_type: "fast_gap" | "project_driven";
  title: string;
  target_role_id: string;
  target_role_name: string;
  horizon_years: number;
  weekly_hours: number;
  reference_path_id: string | null;
  phases: Array<{
    phase_order: number;
    title: string;
    duration_months: number;
    milestones: string[];
    tasks: PathTask[];
  }>;
  total_estimated_hours: number;
  constraint_checks: {
    within_weekly_limit: boolean;
    within_horizon: boolean;
    has_verifiable_deliverables: boolean;
  };
}

export interface ScenarioSession {
  session_id: string;
  user_id: string;
  scenario_id: string;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at?: string;
  responses: Array<{ response_text: string; submitted_at: string; evaluation: unknown }>;
}

export interface OverlayState {
  events: Record<string, GrowthEvent[]>;
  sessions: Record<string, ScenarioSession>;
  active_paths: Record<string, GeneratedPath>;
  task_updates: Record<string, { status: PathTask["status"]; updated_at: string }>;
  idempotency: Record<string, unknown>;
}
