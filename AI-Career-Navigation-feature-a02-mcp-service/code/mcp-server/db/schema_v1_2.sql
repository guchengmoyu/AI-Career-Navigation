-- A02 MCP canonical MySQL 8.0 schema
-- Use a new database such as ai_career_nav_v12. This file never drops tables.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  external_user_id VARCHAR(32) NOT NULL,
  persona_code VARCHAR(32) NOT NULL,
  is_golden TINYINT(1) NOT NULL DEFAULT 0,
  stage ENUM('student','newcomer') NOT NULL,
  consent_status VARCHAR(40) NOT NULL,
  data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL,
  origin VARCHAR(40) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL,
  verification_status VARCHAR(40) NOT NULL, license_scope VARCHAR(80) NOT NULL,
  is_market_fact TINYINT(1) NOT NULL DEFAULT 0,
  source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  is_synthetic TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (external_user_id),
  UNIQUE KEY uk_users_persona_code (persona_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='A02 anonymous synthetic users';

CREATE TABLE IF NOT EXISTS user_profiles (
  external_user_id VARCHAR(32) NOT NULL,
  major VARCHAR(100), education_level VARCHAR(40), academic_or_job_status VARCHAR(100),
  experience_months INT NOT NULL DEFAULT 0, weekly_learning_hours INT NOT NULL DEFAULT 10,
  target_role_id VARCHAR(40), secondary_role_id VARCHAR(40), preferred_city VARCHAR(50),
  preferred_work_mode VARCHAR(30), career_goal TEXT, current_challenge TEXT,
  data_retention_days INT NOT NULL DEFAULT 365,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (external_user_id),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_dimensions (
  dimension_id VARCHAR(20) NOT NULL, name VARCHAR(80) NOT NULL, description TEXT, display_order INT NOT NULL,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (dimension_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_skills (
  skill_id VARCHAR(40) NOT NULL, skill_key VARCHAR(80) NOT NULL, name VARCHAR(120) NOT NULL,
  dimension_id VARCHAR(20) NOT NULL, definition TEXT, half_life_days INT NOT NULL,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (skill_id), UNIQUE KEY uk_ref_skills_key (skill_key),
  CONSTRAINT fk_ref_skills_dimension FOREIGN KEY (dimension_id) REFERENCES ref_dimensions(dimension_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_roles (
  role_id VARCHAR(40) NOT NULL, name VARCHAR(100) NOT NULL, summary TEXT,
  target_user_stage VARCHAR(60), typical_entry_level VARCHAR(200),
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_role_skills (
  role_skill_id VARCHAR(100) NOT NULL, role_id VARCHAR(40) NOT NULL, skill_id VARCHAR(40) NOT NULL,
  required_score DECIMAL(5,2) NOT NULL, importance_weight DECIMAL(9,6) NOT NULL,
  is_core TINYINT(1) NOT NULL, rationale VARCHAR(200),
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (role_skill_id), UNIQUE KEY uk_role_skill (role_id, skill_id),
  CONSTRAINT fk_role_skills_role FOREIGN KEY (role_id) REFERENCES ref_roles(role_id),
  CONSTRAINT fk_role_skills_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_skills (
  user_skill_id BIGINT NOT NULL AUTO_INCREMENT, external_user_id VARCHAR(32) NOT NULL, skill_id VARCHAR(40) NOT NULL,
  current_score DECIMAL(5,2) NOT NULL, observed_score DECIMAL(5,2) NOT NULL,
  evidence_age_days INT NOT NULL, half_life_days INT NOT NULL, decay_factor DECIMAL(8,6) NOT NULL,
  last_evidence_id VARCHAR(80), confidence DECIMAL(5,4) NOT NULL,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL, license_scope VARCHAR(80) NOT NULL,
  is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (user_skill_id), UNIQUE KEY uk_user_skill (external_user_id, skill_id),
  CONSTRAINT fk_user_skills_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id),
  CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_jobs (
  job_id VARCHAR(50) NOT NULL, role_id VARCHAR(40) NOT NULL, title VARCHAR(200) NOT NULL,
  company_code VARCHAR(100), industry VARCHAR(80), city VARCHAR(50), work_mode VARCHAR(30), experience_level VARCHAR(30),
  required_experience_months INT, education_level VARCHAR(50), salary_min_cny_month INT, salary_max_cny_month INT,
  salary_is_simulated TINYINT(1) NOT NULL DEFAULT 1, summary TEXT, display_disclaimer VARCHAR(500),
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL DEFAULT 0,
  source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  data_split ENUM('golden','dev','test') NOT NULL, schema_version VARCHAR(20) NOT NULL,
  PRIMARY KEY (job_id), CONSTRAINT fk_jobs_role FOREIGN KEY (role_id) REFERENCES ref_roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_job_skills (
  job_skill_id VARCHAR(120) NOT NULL, job_id VARCHAR(50) NOT NULL, skill_id VARCHAR(40) NOT NULL,
  required_score DECIMAL(5,2) NOT NULL, importance_weight DECIMAL(9,6) NOT NULL, requirement_type VARCHAR(30),
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (job_skill_id), UNIQUE KEY uk_job_skill (job_id, skill_id),
  CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES ref_jobs(job_id),
  CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_resources (
  resource_id VARCHAR(50) NOT NULL, resource_type VARCHAR(60) NOT NULL, title VARCHAR(240) NOT NULL,
  provider VARCHAR(200), url VARCHAR(600), difficulty VARCHAR(30), estimated_hours DECIMAL(7,1), cost_type VARCHAR(30),
  prerequisite_score INT, summary TEXT, origin VARCHAR(40), source_ids VARCHAR(300), claim_level VARCHAR(40),
  verification_status VARCHAR(40), license_scope VARCHAR(80), is_synthetic TINYINT(1), is_market_fact TINYINT(1),
  confidence DECIMAL(5,4) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  data_split ENUM('golden','dev','test') NOT NULL, schema_version VARCHAR(20) NOT NULL,
  PRIMARY KEY (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ref_resource_skills (
  resource_skill_id VARCHAR(120) NOT NULL, resource_id VARCHAR(50) NOT NULL, skill_id VARCHAR(40) NOT NULL,
  coverage_weight DECIMAL(9,6) NOT NULL, expected_score_gain DECIMAL(5,2) NOT NULL,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (resource_skill_id), UNIQUE KEY uk_resource_skill (resource_id, skill_id),
  CONSTRAINT fk_resource_skills_resource FOREIGN KEY (resource_id) REFERENCES ref_resources(resource_id),
  CONSTRAINT fk_resource_skills_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS career_profiles (
  profile_id BIGINT NOT NULL AUTO_INCREMENT, external_user_id VARCHAR(32) NOT NULL, profile_version INT NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL, dimension_scores JSON NOT NULL, strengths JSON, improvement_priorities JSON,
  role_matches JSON, calculation_version VARCHAR(30) NOT NULL, formula_json JSON NOT NULL,
  schema_version VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id), UNIQUE KEY uk_profile_version (external_user_id, profile_version),
  CONSTRAINT fk_profiles_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS career_paths (
  path_id VARCHAR(160) NOT NULL, external_user_id VARCHAR(32) NOT NULL, branch_no INT NOT NULL,
  branch_type VARCHAR(30) NOT NULL, target_role_id VARCHAR(40) NOT NULL, horizon_years INT NOT NULL,
  weekly_hours_limit INT NOT NULL, objective TEXT NOT NULL, status VARCHAR(30) NOT NULL,
  is_reference TINYINT(1) NOT NULL DEFAULT 0,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (path_id), CONSTRAINT fk_paths_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id),
  CONSTRAINT fk_paths_role FOREIGN KEY (target_role_id) REFERENCES ref_roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS career_milestones (
  milestone_id VARCHAR(180) NOT NULL, path_id VARCHAR(160) NOT NULL, sequence_no INT NOT NULL,
  month_from_start INT NOT NULL, title VARCHAR(240) NOT NULL, target_skill_id VARCHAR(40),
  target_score DECIMAL(5,2), deliverable VARCHAR(240), acceptance_rule TEXT,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  schema_version VARCHAR(20) NOT NULL, source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (milestone_id), UNIQUE KEY uk_path_milestone_sequence (path_id, sequence_no),
  CONSTRAINT fk_milestones_path FOREIGN KEY (path_id) REFERENCES career_paths(path_id),
  CONSTRAINT fk_milestones_skill FOREIGN KEY (target_skill_id) REFERENCES ref_skills(skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS path_tasks (
  task_id VARCHAR(180) NOT NULL, path_id VARCHAR(160) NOT NULL, phase_order INT NOT NULL,
  title VARCHAR(240) NOT NULL, task_type VARCHAR(60) NOT NULL, difficulty VARCHAR(30), estimated_hours DECIMAL(7,1),
  skill_id VARCHAR(40), resource_id VARCHAR(50), status ENUM('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id), CONSTRAINT fk_path_tasks_path FOREIGN KEY (path_id) REFERENCES career_paths(path_id),
  CONSTRAINT fk_path_tasks_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id),
  CONSTRAINT fk_path_tasks_resource FOREIGN KEY (resource_id) REFERENCES ref_resources(resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scenario_cases (
  scenario_id VARCHAR(60) NOT NULL, module_id VARCHAR(40) NOT NULL, module_name VARCHAR(80) NOT NULL,
  difficulty ENUM('beginner','intermediate','advanced') NOT NULL, target_role_id VARCHAR(40) NOT NULL,
  target_user_stage VARCHAR(40) NOT NULL, title VARCHAR(240) NOT NULL, context TEXT NOT NULL, initial_prompt TEXT NOT NULL,
  expected_actions JSON NOT NULL, rubric_json JSON NOT NULL, red_flags JSON NOT NULL, privacy_focus VARCHAR(20) NOT NULL,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL,
  data_split ENUM('golden','dev','test') NOT NULL, schema_version VARCHAR(20) NOT NULL,
  source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (scenario_id), CONSTRAINT fk_scenario_role FOREIGN KEY (target_role_id) REFERENCES ref_roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scenario_sessions (
  session_id VARCHAR(80) NOT NULL, external_user_id VARCHAR(32) NOT NULL, scenario_id VARCHAR(60) NOT NULL,
  status ENUM('in_progress','completed') NOT NULL, started_at DATETIME NOT NULL, completed_at DATETIME,
  evaluation JSON,
  PRIMARY KEY (session_id), CONSTRAINT fk_sessions_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id),
  CONSTRAINT fk_sessions_case FOREIGN KEY (scenario_id) REFERENCES scenario_cases(scenario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scenario_messages (
  message_id BIGINT NOT NULL AUTO_INCREMENT, session_id VARCHAR(80) NOT NULL,
  role ENUM('user','assistant') NOT NULL, content TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id), INDEX idx_messages_session (session_id),
  CONSTRAINT fk_messages_session FOREIGN KEY (session_id) REFERENCES scenario_sessions(session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS growth_events (
  event_id VARCHAR(100) NOT NULL, external_user_id VARCHAR(32) NOT NULL, event_type VARCHAR(50) NOT NULL,
  event_time DATETIME NOT NULL, skill_id VARCHAR(40), resource_id VARCHAR(50), job_id VARCHAR(50), task_id VARCHAR(180),
  score_delta DECIMAL(5,2) NOT NULL DEFAULT 0, status VARCHAR(40) NOT NULL, sentiment VARCHAR(30),
  user_state VARCHAR(50), risk_level VARCHAR(20), detail VARCHAR(600) NOT NULL, duration_minutes INT, points_earned INT,
  origin VARCHAR(40) NOT NULL, is_synthetic TINYINT(1) NOT NULL, source_ids VARCHAR(300) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL, claim_level VARCHAR(40) NOT NULL, verification_status VARCHAR(40) NOT NULL,
  license_scope VARCHAR(80) NOT NULL, is_market_fact TINYINT(1) NOT NULL,
  schema_version VARCHAR(20) NOT NULL, data_split ENUM('golden','dev','test') NOT NULL,
  source_generated_at VARCHAR(40), last_verified_at VARCHAR(40),
  PRIMARY KEY (event_id), INDEX idx_growth_user_time (external_user_id, event_time),
  CONSTRAINT fk_growth_user FOREIGN KEY (external_user_id) REFERENCES users(external_user_id),
  CONSTRAINT fk_growth_skill FOREIGN KEY (skill_id) REFERENCES ref_skills(skill_id),
  CONSTRAINT fk_growth_resource FOREIGN KEY (resource_id) REFERENCES ref_resources(resource_id),
  CONSTRAINT fk_growth_job FOREIGN KEY (job_id) REFERENCES ref_jobs(job_id),
  CONSTRAINT fk_growth_task FOREIGN KEY (task_id) REFERENCES path_tasks(task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
