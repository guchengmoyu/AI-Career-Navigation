# 数据验证报告

- 自动验证状态：PASS
- 检查项：451
- 失败：0
- 待人工完成：1
- 已核验官方课程/专题页：22
- 确定性比较文件：103

| 版本 | 检查 | 级别 | 结果 | 说明 |
|---|---|---|---|---|
| global | deterministic_regeneration | error | 通过 | 103 generated files compared byte-for-byte |
| v0.2-seed | schema_version | error | 通过 | expected 1.1.0, actual 1.1.0 |
| v0.2-seed | dimensions_manifest_count | error | 通过 | manifest=8, csv=8 |
| v0.2-seed | dimensions_unique | error | 通过 | dimension_id: 8/8 unique |
| v0.2-seed | dimensions_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | dimensions_metadata_values | error | 通过 | 8 metadata rows valid |
| v0.2-seed | skills_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.2-seed | skills_unique | error | 通过 | skill_id: 60/60 unique |
| v0.2-seed | skills_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | skills_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.2-seed | roles_manifest_count | error | 通过 | manifest=3, csv=3 |
| v0.2-seed | roles_unique | error | 通过 | role_id: 3/3 unique |
| v0.2-seed | roles_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | roles_metadata_values | error | 通过 | 3 metadata rows valid |
| v0.2-seed | role_skills_manifest_count | error | 通过 | manifest=54, csv=54 |
| v0.2-seed | role_skills_unique | error | 通过 | role_skill_id: 54/54 unique |
| v0.2-seed | role_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | role_skills_metadata_values | error | 通过 | 54 metadata rows valid |
| v0.2-seed | users_manifest_count | error | 通过 | manifest=12, csv=12 |
| v0.2-seed | users_unique | error | 通过 | user_id: 12/12 unique |
| v0.2-seed | users_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | users_metadata_values | error | 通过 | 12 metadata rows valid |
| v0.2-seed | user_skill_evidence_manifest_count | error | 通过 | manifest=720, csv=720 |
| v0.2-seed | user_skill_evidence_unique | error | 通过 | evidence_id: 720/720 unique |
| v0.2-seed | user_skill_evidence_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | user_skill_evidence_metadata_values | error | 通过 | 720 metadata rows valid |
| v0.2-seed | user_skill_scores_manifest_count | error | 通过 | manifest=720, csv=720 |
| v0.2-seed | user_skill_scores_unique | error | 通过 | user_skill_score_id: 720/720 unique |
| v0.2-seed | user_skill_scores_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | user_skill_scores_metadata_values | error | 通过 | 720 metadata rows valid |
| v0.2-seed | jobs_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.2-seed | jobs_unique | error | 通过 | job_id: 60/60 unique |
| v0.2-seed | jobs_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | jobs_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.2-seed | job_skills_manifest_count | error | 通过 | manifest=909, csv=909 |
| v0.2-seed | job_skills_unique | error | 通过 | job_skill_id: 909/909 unique |
| v0.2-seed | job_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | job_skills_metadata_values | error | 通过 | 909 metadata rows valid |
| v0.2-seed | learning_resources_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.2-seed | learning_resources_unique | error | 通过 | resource_id: 60/60 unique |
| v0.2-seed | learning_resources_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | learning_resources_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.2-seed | resource_skills_manifest_count | error | 通过 | manifest=126, csv=126 |
| v0.2-seed | resource_skills_unique | error | 通过 | resource_skill_id: 126/126 unique |
| v0.2-seed | resource_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | resource_skills_metadata_values | error | 通过 | 126 metadata rows valid |
| v0.2-seed | growth_events_manifest_count | error | 通过 | manifest=360, csv=360 |
| v0.2-seed | growth_events_unique | error | 通过 | event_id: 360/360 unique |
| v0.2-seed | growth_events_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | growth_events_metadata_values | error | 通过 | 360 metadata rows valid |
| v0.2-seed | trend_snapshots_manifest_count | error | 通过 | manifest=120, csv=120 |
| v0.2-seed | trend_snapshots_unique | error | 通过 | trend_id: 120/120 unique |
| v0.2-seed | trend_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | trend_snapshots_metadata_values | error | 通过 | 120 metadata rows valid |
| v0.2-seed | scenario_cases_manifest_count | error | 通过 | manifest=15, csv=15 |
| v0.2-seed | scenario_cases_unique | error | 通过 | scenario_id: 15/15 unique |
| v0.2-seed | scenario_cases_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | scenario_cases_metadata_values | error | 通过 | 15 metadata rows valid |
| v0.2-seed | golden_profile_snapshots_manifest_count | error | 通过 | manifest=768, csv=768 |
| v0.2-seed | golden_profile_snapshots_unique | error | 通过 | snapshot_id: 768/768 unique |
| v0.2-seed | golden_profile_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | golden_profile_snapshots_metadata_values | error | 通过 | 768 metadata rows valid |
| v0.2-seed | career_paths_manifest_count | error | 通过 | manifest=24, csv=24 |
| v0.2-seed | career_paths_unique | error | 通过 | path_id: 24/24 unique |
| v0.2-seed | career_paths_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | career_paths_metadata_values | error | 通过 | 24 metadata rows valid |
| v0.2-seed | career_milestones_manifest_count | error | 通过 | manifest=120, csv=120 |
| v0.2-seed | career_milestones_unique | error | 通过 | milestone_id: 120/120 unique |
| v0.2-seed | career_milestones_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | career_milestones_metadata_values | error | 通过 | 120 metadata rows valid |
| v0.2-seed | golden_expected_results_manifest_count | error | 通过 | manifest=12, csv=12 |
| v0.2-seed | golden_expected_results_unique | error | 通过 | expected_result_id: 12/12 unique |
| v0.2-seed | golden_expected_results_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | golden_expected_results_metadata_values | error | 通过 | 12 metadata rows valid |
| v0.2-seed | knowledge_cards_manifest_count | error | 通过 | manifest=200, csv=200 |
| v0.2-seed | knowledge_cards_unique | error | 通过 | knowledge_card_id: 200/200 unique |
| v0.2-seed | knowledge_cards_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | knowledge_cards_metadata_values | error | 通过 | 200 metadata rows valid |
| v0.2-seed | retrieval_eval_manifest_count | error | 通过 | manifest=50, csv=50 |
| v0.2-seed | retrieval_eval_unique | error | 通过 | retrieval_case_id: 50/50 unique |
| v0.2-seed | retrieval_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | retrieval_eval_metadata_values | error | 通过 | 50 metadata rows valid |
| v0.2-seed | matching_eval_manifest_count | error | 通过 | manifest=36, csv=36 |
| v0.2-seed | matching_eval_unique | error | 通过 | match_case_id: 36/36 unique |
| v0.2-seed | matching_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | matching_eval_metadata_values | error | 通过 | 36 metadata rows valid |
| v0.2-seed | path_eval_manifest_count | error | 通过 | manifest=12, csv=12 |
| v0.2-seed | path_eval_unique | error | 通过 | path_case_id: 12/12 unique |
| v0.2-seed | path_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | path_eval_metadata_values | error | 通过 | 12 metadata rows valid |
| v0.2-seed | dialogue_eval_manifest_count | error | 通过 | manifest=30, csv=30 |
| v0.2-seed | dialogue_eval_unique | error | 通过 | dialogue_case_id: 30/30 unique |
| v0.2-seed | dialogue_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | dialogue_eval_metadata_values | error | 通过 | 30 metadata rows valid |
| v0.2-seed | fairness_eval_manifest_count | error | 通过 | manifest=12, csv=12 |
| v0.2-seed | fairness_eval_unique | error | 通过 | fairness_pair_id: 12/12 unique |
| v0.2-seed | fairness_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | fairness_eval_metadata_values | error | 通过 | 12 metadata rows valid |
| v0.2-seed | privacy_security_eval_manifest_count | error | 通过 | manifest=30, csv=30 |
| v0.2-seed | privacy_security_eval_unique | error | 通过 | security_case_id: 30/30 unique |
| v0.2-seed | privacy_security_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | privacy_security_eval_metadata_values | error | 通过 | 30 metadata rows valid |
| v0.2-seed | source_registry_manifest_count | error | 通过 | manifest=8, csv=8 |
| v0.2-seed | source_registry_unique | error | 通过 | source_id: 8/8 unique |
| v0.2-seed | source_registry_common_headers | error | 通过 | all common metadata fields present |
| v0.2-seed | source_registry_metadata_values | error | 通过 | 8 metadata rows valid |
| v0.2-seed | users_expected_count | error | 通过 | expected=12, actual=12 |
| v0.2-seed | jobs_expected_count | error | 通过 | expected=60, actual=60 |
| v0.2-seed | learning_resources_expected_count | error | 通过 | expected=60, actual=60 |
| v0.2-seed | growth_events_expected_count | error | 通过 | expected=360, actual=360 |
| v0.2-seed | scenario_cases_expected_count | error | 通过 | expected=15, actual=15 |
| v0.2-seed | trend_snapshots_expected_count | error | 通过 | expected=120, actual=120 |
| v0.2-seed | user_stage_balance | error | 通过 | student=6, newcomer=6 |
| v0.2-seed | resource_mix | error | 通过 | {"verified_course_metadata":6,"public_catalog_topic_card":12,"synthetic_project":24,"synthetic_assessment":12,"synthetic_guide":6} |
| v0.2-seed | trend_coverage | error | 通过 | 60 skills × 2 months |
| v0.2-seed | user_skill_scores_user_fk | error | 通过 | 720 references valid |
| v0.2-seed | user_skill_scores_skill_fk | error | 通过 | 720 references valid |
| v0.2-seed | user_skill_evidence_user_fk | error | 通过 | 720 references valid |
| v0.2-seed | user_skill_evidence_skill_fk | error | 通过 | 720 references valid |
| v0.2-seed | jobs_role_fk | error | 通过 | 60 references valid |
| v0.2-seed | job_skills_job_fk | error | 通过 | 909 references valid |
| v0.2-seed | job_skills_skill_fk | error | 通过 | 909 references valid |
| v0.2-seed | resource_skills_resource_fk | error | 通过 | 126 references valid |
| v0.2-seed | resource_skills_skill_fk | error | 通过 | 126 references valid |
| v0.2-seed | growth_events_user_fk | error | 通过 | 360 references valid |
| v0.2-seed | growth_events_skill_fk | error | 通过 | 360 references valid |
| v0.2-seed | growth_events_job_fk | error | 通过 | 360 references valid |
| v0.2-seed | growth_events_resource_fk | error | 通过 | 360 references valid |
| v0.2-seed | golden_snapshots_user_fk | error | 通过 | 768 references valid |
| v0.2-seed | career_paths_user_fk | error | 通过 | 24 references valid |
| v0.2-seed | career_milestones_path_fk | error | 通过 | 120 references valid |
| v0.2-seed | role_weights | error | 通过 | {"ROLE-AI-ALG":1,"ROLE-AI-APP":1,"ROLE-DATA":1} |
| v0.2-seed | job_weights | error | 通过 | 60 job weight sums checked |
| v0.2-seed | resource_weights | error | 通过 | 60 resource weight sums checked |
| v0.2-seed | score_range | error | 通过 | 720 scores within 0-100 |
| v0.2-seed | matching_eval_test_split | error | 通过 | 36 held-out rows |
| v0.2-seed | path_eval_test_split | error | 通过 | 12 held-out rows |
| v0.2-seed | dialogue_eval_test_split | error | 通过 | 30 held-out rows |
| v0.2-seed | fairness_eval_test_split | error | 通过 | 12 held-out rows |
| v0.2-seed | privacy_security_eval_test_split | error | 通过 | 30 held-out rows |
| v0.2-seed | retrieval_eval_test_split | error | 通过 | 50 held-out rows |
| v0.2-seed | matching_eval_inputs | error | 通过 | 36 matching inputs self-contained |
| v0.2-seed | path_eval_inputs | error | 通过 | 12 path inputs self-contained |
| v0.2-seed | fairness_pairs | error | 通过 | 12 counterfactual pairs have zero expected delta |
| v0.2-seed | source_registry_fk | error | 通过 | all source_ids resolve |
| v0.5-core | schema_version | error | 通过 | expected 1.1.0, actual 1.1.0 |
| v0.5-core | dimensions_manifest_count | error | 通过 | manifest=8, csv=8 |
| v0.5-core | dimensions_unique | error | 通过 | dimension_id: 8/8 unique |
| v0.5-core | dimensions_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | dimensions_metadata_values | error | 通过 | 8 metadata rows valid |
| v0.5-core | skills_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.5-core | skills_unique | error | 通过 | skill_id: 60/60 unique |
| v0.5-core | skills_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | skills_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.5-core | roles_manifest_count | error | 通过 | manifest=3, csv=3 |
| v0.5-core | roles_unique | error | 通过 | role_id: 3/3 unique |
| v0.5-core | roles_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | roles_metadata_values | error | 通过 | 3 metadata rows valid |
| v0.5-core | role_skills_manifest_count | error | 通过 | manifest=54, csv=54 |
| v0.5-core | role_skills_unique | error | 通过 | role_skill_id: 54/54 unique |
| v0.5-core | role_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | role_skills_metadata_values | error | 通过 | 54 metadata rows valid |
| v0.5-core | users_manifest_count | error | 通过 | manifest=100, csv=100 |
| v0.5-core | users_unique | error | 通过 | user_id: 100/100 unique |
| v0.5-core | users_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | users_metadata_values | error | 通过 | 100 metadata rows valid |
| v0.5-core | user_skill_evidence_manifest_count | error | 通过 | manifest=6000, csv=6000 |
| v0.5-core | user_skill_evidence_unique | error | 通过 | evidence_id: 6000/6000 unique |
| v0.5-core | user_skill_evidence_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | user_skill_evidence_metadata_values | error | 通过 | 6000 metadata rows valid |
| v0.5-core | user_skill_scores_manifest_count | error | 通过 | manifest=6000, csv=6000 |
| v0.5-core | user_skill_scores_unique | error | 通过 | user_skill_score_id: 6000/6000 unique |
| v0.5-core | user_skill_scores_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | user_skill_scores_metadata_values | error | 通过 | 6000 metadata rows valid |
| v0.5-core | jobs_manifest_count | error | 通过 | manifest=300, csv=300 |
| v0.5-core | jobs_unique | error | 通过 | job_id: 300/300 unique |
| v0.5-core | jobs_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | jobs_metadata_values | error | 通过 | 300 metadata rows valid |
| v0.5-core | job_skills_manifest_count | error | 通过 | manifest=4491, csv=4491 |
| v0.5-core | job_skills_unique | error | 通过 | job_skill_id: 4491/4491 unique |
| v0.5-core | job_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | job_skills_metadata_values | error | 通过 | 4491 metadata rows valid |
| v0.5-core | learning_resources_manifest_count | error | 通过 | manifest=200, csv=200 |
| v0.5-core | learning_resources_unique | error | 通过 | resource_id: 200/200 unique |
| v0.5-core | learning_resources_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | learning_resources_metadata_values | error | 通过 | 200 metadata rows valid |
| v0.5-core | resource_skills_manifest_count | error | 通过 | manifest=414, csv=414 |
| v0.5-core | resource_skills_unique | error | 通过 | resource_skill_id: 414/414 unique |
| v0.5-core | resource_skills_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | resource_skills_metadata_values | error | 通过 | 414 metadata rows valid |
| v0.5-core | growth_events_manifest_count | error | 通过 | manifest=4000, csv=4000 |
| v0.5-core | growth_events_unique | error | 通过 | event_id: 4000/4000 unique |
| v0.5-core | growth_events_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | growth_events_metadata_values | error | 通过 | 4000 metadata rows valid |
| v0.5-core | trend_snapshots_manifest_count | error | 通过 | manifest=360, csv=360 |
| v0.5-core | trend_snapshots_unique | error | 通过 | trend_id: 360/360 unique |
| v0.5-core | trend_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | trend_snapshots_metadata_values | error | 通过 | 360 metadata rows valid |
| v0.5-core | scenario_cases_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.5-core | scenario_cases_unique | error | 通过 | scenario_id: 60/60 unique |
| v0.5-core | scenario_cases_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | scenario_cases_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.5-core | golden_profile_snapshots_manifest_count | error | 通过 | manifest=768, csv=768 |
| v0.5-core | golden_profile_snapshots_unique | error | 通过 | snapshot_id: 768/768 unique |
| v0.5-core | golden_profile_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | golden_profile_snapshots_metadata_values | error | 通过 | 768 metadata rows valid |
| v0.5-core | career_paths_manifest_count | error | 通过 | manifest=24, csv=24 |
| v0.5-core | career_paths_unique | error | 通过 | path_id: 24/24 unique |
| v0.5-core | career_paths_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | career_paths_metadata_values | error | 通过 | 24 metadata rows valid |
| v0.5-core | career_milestones_manifest_count | error | 通过 | manifest=120, csv=120 |
| v0.5-core | career_milestones_unique | error | 通过 | milestone_id: 120/120 unique |
| v0.5-core | career_milestones_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | career_milestones_metadata_values | error | 通过 | 120 metadata rows valid |
| v0.5-core | golden_expected_results_manifest_count | error | 通过 | manifest=12, csv=12 |
| v0.5-core | golden_expected_results_unique | error | 通过 | expected_result_id: 12/12 unique |
| v0.5-core | golden_expected_results_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | golden_expected_results_metadata_values | error | 通过 | 12 metadata rows valid |
| v0.5-core | knowledge_cards_manifest_count | error | 通过 | manifest=600, csv=600 |
| v0.5-core | knowledge_cards_unique | error | 通过 | knowledge_card_id: 600/600 unique |
| v0.5-core | knowledge_cards_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | knowledge_cards_metadata_values | error | 通过 | 600 metadata rows valid |
| v0.5-core | retrieval_eval_manifest_count | error | 通过 | manifest=100, csv=100 |
| v0.5-core | retrieval_eval_unique | error | 通过 | retrieval_case_id: 100/100 unique |
| v0.5-core | retrieval_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | retrieval_eval_metadata_values | error | 通过 | 100 metadata rows valid |
| v0.5-core | matching_eval_manifest_count | error | 通过 | manifest=300, csv=300 |
| v0.5-core | matching_eval_unique | error | 通过 | match_case_id: 300/300 unique |
| v0.5-core | matching_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | matching_eval_metadata_values | error | 通过 | 300 metadata rows valid |
| v0.5-core | path_eval_manifest_count | error | 通过 | manifest=60, csv=60 |
| v0.5-core | path_eval_unique | error | 通过 | path_case_id: 60/60 unique |
| v0.5-core | path_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | path_eval_metadata_values | error | 通过 | 60 metadata rows valid |
| v0.5-core | dialogue_eval_manifest_count | error | 通过 | manifest=75, csv=75 |
| v0.5-core | dialogue_eval_unique | error | 通过 | dialogue_case_id: 75/75 unique |
| v0.5-core | dialogue_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | dialogue_eval_metadata_values | error | 通过 | 75 metadata rows valid |
| v0.5-core | fairness_eval_manifest_count | error | 通过 | manifest=50, csv=50 |
| v0.5-core | fairness_eval_unique | error | 通过 | fairness_pair_id: 50/50 unique |
| v0.5-core | fairness_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | fairness_eval_metadata_values | error | 通过 | 50 metadata rows valid |
| v0.5-core | privacy_security_eval_manifest_count | error | 通过 | manifest=50, csv=50 |
| v0.5-core | privacy_security_eval_unique | error | 通过 | security_case_id: 50/50 unique |
| v0.5-core | privacy_security_eval_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | privacy_security_eval_metadata_values | error | 通过 | 50 metadata rows valid |
| v0.5-core | source_registry_manifest_count | error | 通过 | manifest=8, csv=8 |
| v0.5-core | source_registry_unique | error | 通过 | source_id: 8/8 unique |
| v0.5-core | source_registry_common_headers | error | 通过 | all common metadata fields present |
| v0.5-core | source_registry_metadata_values | error | 通过 | 8 metadata rows valid |
| v0.5-core | users_expected_count | error | 通过 | expected=100, actual=100 |
| v0.5-core | jobs_expected_count | error | 通过 | expected=300, actual=300 |
| v0.5-core | learning_resources_expected_count | error | 通过 | expected=200, actual=200 |
| v0.5-core | growth_events_expected_count | error | 通过 | expected=4000, actual=4000 |
| v0.5-core | scenario_cases_expected_count | error | 通过 | expected=60, actual=60 |
| v0.5-core | trend_snapshots_expected_count | error | 通过 | expected=360, actual=360 |
| v0.5-core | user_stage_balance | error | 通过 | student=50, newcomer=50 |
| v0.5-core | resource_mix | error | 通过 | {"verified_course_metadata":12,"public_catalog_topic_card":28,"synthetic_project":100,"synthetic_assessment":40,"synthetic_guide":20} |
| v0.5-core | trend_coverage | error | 通过 | 60 skills × 6 months |
| v0.5-core | user_skill_scores_user_fk | error | 通过 | 6000 references valid |
| v0.5-core | user_skill_scores_skill_fk | error | 通过 | 6000 references valid |
| v0.5-core | user_skill_evidence_user_fk | error | 通过 | 6000 references valid |
| v0.5-core | user_skill_evidence_skill_fk | error | 通过 | 6000 references valid |
| v0.5-core | jobs_role_fk | error | 通过 | 300 references valid |
| v0.5-core | job_skills_job_fk | error | 通过 | 4491 references valid |
| v0.5-core | job_skills_skill_fk | error | 通过 | 4491 references valid |
| v0.5-core | resource_skills_resource_fk | error | 通过 | 414 references valid |
| v0.5-core | resource_skills_skill_fk | error | 通过 | 414 references valid |
| v0.5-core | growth_events_user_fk | error | 通过 | 4000 references valid |
| v0.5-core | growth_events_skill_fk | error | 通过 | 4000 references valid |
| v0.5-core | growth_events_job_fk | error | 通过 | 4000 references valid |
| v0.5-core | growth_events_resource_fk | error | 通过 | 4000 references valid |
| v0.5-core | golden_snapshots_user_fk | error | 通过 | 768 references valid |
| v0.5-core | career_paths_user_fk | error | 通过 | 24 references valid |
| v0.5-core | career_milestones_path_fk | error | 通过 | 120 references valid |
| v0.5-core | role_weights | error | 通过 | {"ROLE-AI-ALG":1,"ROLE-AI-APP":1,"ROLE-DATA":1} |
| v0.5-core | job_weights | error | 通过 | 300 job weight sums checked |
| v0.5-core | resource_weights | error | 通过 | 200 resource weight sums checked |
| v0.5-core | score_range | error | 通过 | 6000 scores within 0-100 |
| v0.5-core | matching_eval_test_split | error | 通过 | 300 held-out rows |
| v0.5-core | path_eval_test_split | error | 通过 | 60 held-out rows |
| v0.5-core | dialogue_eval_test_split | error | 通过 | 75 held-out rows |
| v0.5-core | fairness_eval_test_split | error | 通过 | 50 held-out rows |
| v0.5-core | privacy_security_eval_test_split | error | 通过 | 50 held-out rows |
| v0.5-core | retrieval_eval_test_split | error | 通过 | 100 held-out rows |
| v0.5-core | matching_eval_inputs | error | 通过 | 300 matching inputs self-contained |
| v0.5-core | path_eval_inputs | error | 通过 | 60 path inputs self-contained |
| v0.5-core | fairness_pairs | error | 通过 | 50 counterfactual pairs have zero expected delta |
| v0.5-core | source_registry_fk | error | 通过 | all source_ids resolve |
| v1.0-full | schema_version | error | 通过 | expected 1.1.0, actual 1.1.0 |
| v1.0-full | dimensions_manifest_count | error | 通过 | manifest=8, csv=8 |
| v1.0-full | dimensions_unique | error | 通过 | dimension_id: 8/8 unique |
| v1.0-full | dimensions_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | dimensions_metadata_values | error | 通过 | 8 metadata rows valid |
| v1.0-full | skills_manifest_count | error | 通过 | manifest=60, csv=60 |
| v1.0-full | skills_unique | error | 通过 | skill_id: 60/60 unique |
| v1.0-full | skills_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | skills_metadata_values | error | 通过 | 60 metadata rows valid |
| v1.0-full | roles_manifest_count | error | 通过 | manifest=3, csv=3 |
| v1.0-full | roles_unique | error | 通过 | role_id: 3/3 unique |
| v1.0-full | roles_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | roles_metadata_values | error | 通过 | 3 metadata rows valid |
| v1.0-full | role_skills_manifest_count | error | 通过 | manifest=54, csv=54 |
| v1.0-full | role_skills_unique | error | 通过 | role_skill_id: 54/54 unique |
| v1.0-full | role_skills_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | role_skills_metadata_values | error | 通过 | 54 metadata rows valid |
| v1.0-full | users_manifest_count | error | 通过 | manifest=500, csv=500 |
| v1.0-full | users_unique | error | 通过 | user_id: 500/500 unique |
| v1.0-full | users_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | users_metadata_values | error | 通过 | 500 metadata rows valid |
| v1.0-full | user_skill_evidence_manifest_count | error | 通过 | manifest=30000, csv=30000 |
| v1.0-full | user_skill_evidence_unique | error | 通过 | evidence_id: 30000/30000 unique |
| v1.0-full | user_skill_evidence_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | user_skill_evidence_metadata_values | error | 通过 | 30000 metadata rows valid |
| v1.0-full | user_skill_scores_manifest_count | error | 通过 | manifest=30000, csv=30000 |
| v1.0-full | user_skill_scores_unique | error | 通过 | user_skill_score_id: 30000/30000 unique |
| v1.0-full | user_skill_scores_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | user_skill_scores_metadata_values | error | 通过 | 30000 metadata rows valid |
| v1.0-full | jobs_manifest_count | error | 通过 | manifest=1500, csv=1500 |
| v1.0-full | jobs_unique | error | 通过 | job_id: 1500/1500 unique |
| v1.0-full | jobs_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | jobs_metadata_values | error | 通过 | 1500 metadata rows valid |
| v1.0-full | job_skills_manifest_count | error | 通过 | manifest=22491, csv=22491 |
| v1.0-full | job_skills_unique | error | 通过 | job_skill_id: 22491/22491 unique |
| v1.0-full | job_skills_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | job_skills_metadata_values | error | 通过 | 22491 metadata rows valid |
| v1.0-full | learning_resources_manifest_count | error | 通过 | manifest=600, csv=600 |
| v1.0-full | learning_resources_unique | error | 通过 | resource_id: 600/600 unique |
| v1.0-full | learning_resources_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | learning_resources_metadata_values | error | 通过 | 600 metadata rows valid |
| v1.0-full | resource_skills_manifest_count | error | 通过 | manifest=1222, csv=1222 |
| v1.0-full | resource_skills_unique | error | 通过 | resource_skill_id: 1222/1222 unique |
| v1.0-full | resource_skills_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | resource_skills_metadata_values | error | 通过 | 1222 metadata rows valid |
| v1.0-full | growth_events_manifest_count | error | 通过 | manifest=20000, csv=20000 |
| v1.0-full | growth_events_unique | error | 通过 | event_id: 20000/20000 unique |
| v1.0-full | growth_events_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | growth_events_metadata_values | error | 通过 | 20000 metadata rows valid |
| v1.0-full | trend_snapshots_manifest_count | error | 通过 | manifest=720, csv=720 |
| v1.0-full | trend_snapshots_unique | error | 通过 | trend_id: 720/720 unique |
| v1.0-full | trend_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | trend_snapshots_metadata_values | error | 通过 | 720 metadata rows valid |
| v1.0-full | scenario_cases_manifest_count | error | 通过 | manifest=150, csv=150 |
| v1.0-full | scenario_cases_unique | error | 通过 | scenario_id: 150/150 unique |
| v1.0-full | scenario_cases_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | scenario_cases_metadata_values | error | 通过 | 150 metadata rows valid |
| v1.0-full | golden_profile_snapshots_manifest_count | error | 通过 | manifest=768, csv=768 |
| v1.0-full | golden_profile_snapshots_unique | error | 通过 | snapshot_id: 768/768 unique |
| v1.0-full | golden_profile_snapshots_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | golden_profile_snapshots_metadata_values | error | 通过 | 768 metadata rows valid |
| v1.0-full | career_paths_manifest_count | error | 通过 | manifest=24, csv=24 |
| v1.0-full | career_paths_unique | error | 通过 | path_id: 24/24 unique |
| v1.0-full | career_paths_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | career_paths_metadata_values | error | 通过 | 24 metadata rows valid |
| v1.0-full | career_milestones_manifest_count | error | 通过 | manifest=120, csv=120 |
| v1.0-full | career_milestones_unique | error | 通过 | milestone_id: 120/120 unique |
| v1.0-full | career_milestones_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | career_milestones_metadata_values | error | 通过 | 120 metadata rows valid |
| v1.0-full | golden_expected_results_manifest_count | error | 通过 | manifest=12, csv=12 |
| v1.0-full | golden_expected_results_unique | error | 通过 | expected_result_id: 12/12 unique |
| v1.0-full | golden_expected_results_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | golden_expected_results_metadata_values | error | 通过 | 12 metadata rows valid |
| v1.0-full | knowledge_cards_manifest_count | error | 通过 | manifest=1200, csv=1200 |
| v1.0-full | knowledge_cards_unique | error | 通过 | knowledge_card_id: 1200/1200 unique |
| v1.0-full | knowledge_cards_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | knowledge_cards_metadata_values | error | 通过 | 1200 metadata rows valid |
| v1.0-full | retrieval_eval_manifest_count | error | 通过 | manifest=200, csv=200 |
| v1.0-full | retrieval_eval_unique | error | 通过 | retrieval_case_id: 200/200 unique |
| v1.0-full | retrieval_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | retrieval_eval_metadata_values | error | 通过 | 200 metadata rows valid |
| v1.0-full | matching_eval_manifest_count | error | 通过 | manifest=300, csv=300 |
| v1.0-full | matching_eval_unique | error | 通过 | match_case_id: 300/300 unique |
| v1.0-full | matching_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | matching_eval_metadata_values | error | 通过 | 300 metadata rows valid |
| v1.0-full | path_eval_manifest_count | error | 通过 | manifest=60, csv=60 |
| v1.0-full | path_eval_unique | error | 通过 | path_case_id: 60/60 unique |
| v1.0-full | path_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | path_eval_metadata_values | error | 通过 | 60 metadata rows valid |
| v1.0-full | dialogue_eval_manifest_count | error | 通过 | manifest=150, csv=150 |
| v1.0-full | dialogue_eval_unique | error | 通过 | dialogue_case_id: 150/150 unique |
| v1.0-full | dialogue_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | dialogue_eval_metadata_values | error | 通过 | 150 metadata rows valid |
| v1.0-full | fairness_eval_manifest_count | error | 通过 | manifest=100, csv=100 |
| v1.0-full | fairness_eval_unique | error | 通过 | fairness_pair_id: 100/100 unique |
| v1.0-full | fairness_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | fairness_eval_metadata_values | error | 通过 | 100 metadata rows valid |
| v1.0-full | privacy_security_eval_manifest_count | error | 通过 | manifest=100, csv=100 |
| v1.0-full | privacy_security_eval_unique | error | 通过 | security_case_id: 100/100 unique |
| v1.0-full | privacy_security_eval_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | privacy_security_eval_metadata_values | error | 通过 | 100 metadata rows valid |
| v1.0-full | source_registry_manifest_count | error | 通过 | manifest=8, csv=8 |
| v1.0-full | source_registry_unique | error | 通过 | source_id: 8/8 unique |
| v1.0-full | source_registry_common_headers | error | 通过 | all common metadata fields present |
| v1.0-full | source_registry_metadata_values | error | 通过 | 8 metadata rows valid |
| v1.0-full | users_expected_count | error | 通过 | expected=500, actual=500 |
| v1.0-full | jobs_expected_count | error | 通过 | expected=1500, actual=1500 |
| v1.0-full | learning_resources_expected_count | error | 通过 | expected=600, actual=600 |
| v1.0-full | growth_events_expected_count | error | 通过 | expected=20000, actual=20000 |
| v1.0-full | scenario_cases_expected_count | error | 通过 | expected=150, actual=150 |
| v1.0-full | trend_snapshots_expected_count | error | 通过 | expected=720, actual=720 |
| v1.0-full | user_stage_balance | error | 通过 | student=250, newcomer=250 |
| v1.0-full | resource_mix | error | 通过 | {"verified_course_metadata":22,"public_catalog_topic_card":98,"synthetic_project":300,"synthetic_assessment":120,"synthetic_guide":60} |
| v1.0-full | trend_coverage | error | 通过 | 60 skills × 12 months |
| v1.0-full | user_skill_scores_user_fk | error | 通过 | 30000 references valid |
| v1.0-full | user_skill_scores_skill_fk | error | 通过 | 30000 references valid |
| v1.0-full | user_skill_evidence_user_fk | error | 通过 | 30000 references valid |
| v1.0-full | user_skill_evidence_skill_fk | error | 通过 | 30000 references valid |
| v1.0-full | jobs_role_fk | error | 通过 | 1500 references valid |
| v1.0-full | job_skills_job_fk | error | 通过 | 22491 references valid |
| v1.0-full | job_skills_skill_fk | error | 通过 | 22491 references valid |
| v1.0-full | resource_skills_resource_fk | error | 通过 | 1222 references valid |
| v1.0-full | resource_skills_skill_fk | error | 通过 | 1222 references valid |
| v1.0-full | growth_events_user_fk | error | 通过 | 20000 references valid |
| v1.0-full | growth_events_skill_fk | error | 通过 | 20000 references valid |
| v1.0-full | growth_events_job_fk | error | 通过 | 20000 references valid |
| v1.0-full | growth_events_resource_fk | error | 通过 | 20000 references valid |
| v1.0-full | golden_snapshots_user_fk | error | 通过 | 768 references valid |
| v1.0-full | career_paths_user_fk | error | 通过 | 24 references valid |
| v1.0-full | career_milestones_path_fk | error | 通过 | 120 references valid |
| v1.0-full | role_weights | error | 通过 | {"ROLE-AI-ALG":1,"ROLE-AI-APP":1,"ROLE-DATA":1} |
| v1.0-full | job_weights | error | 通过 | 1500 job weight sums checked |
| v1.0-full | resource_weights | error | 通过 | 600 resource weight sums checked |
| v1.0-full | score_range | error | 通过 | 30000 scores within 0-100 |
| v1.0-full | user_split_counts | error | 通过 | {"golden":12,"dev":388,"test":100} |
| v1.0-full | job_split_counts | error | 通过 | {"dev":1200,"test":300} |
| v1.0-full | job_level_mix_ROLE-AI-ALG | error | 通过 | {"campus":167,"entry":167,"junior":166} |
| v1.0-full | job_level_mix_ROLE-AI-APP | error | 通过 | {"campus":167,"entry":167,"junior":166} |
| v1.0-full | job_level_mix_ROLE-DATA | error | 通过 | {"campus":167,"entry":167,"junior":166} |
| v1.0-full | events_per_user | error | 通过 | 500 users × 40 events |
| v1.0-full | matching_eval_test_split | error | 通过 | 300 held-out rows |
| v1.0-full | path_eval_test_split | error | 通过 | 60 held-out rows |
| v1.0-full | dialogue_eval_test_split | error | 通过 | 150 held-out rows |
| v1.0-full | fairness_eval_test_split | error | 通过 | 100 held-out rows |
| v1.0-full | privacy_security_eval_test_split | error | 通过 | 100 held-out rows |
| v1.0-full | retrieval_eval_test_split | error | 通过 | 200 held-out rows |
| v1.0-full | matching_eval_inputs | error | 通过 | 300 matching inputs self-contained |
| v1.0-full | path_eval_inputs | error | 通过 | 60 path inputs self-contained |
| v1.0-full | fairness_pairs | error | 通过 | 100 counterfactual pairs have zero expected delta |
| v1.0-full | source_registry_fk | error | 通过 | all source_ids resolve |
| global | verified_primary_resource_minimum | error | 通过 | 22 official course/course-series pages verified |
| global | verified_resource_fields | error | 通过 | verified resources use official URLs and metadata-only scope |
| global | topic_card_labeling | error | 通过 | 98 derived topic cards are not labeled as official courses |
| global | market_claim_boundaries | error | 通过 | jobs, salaries and trends remain explicitly simulated |
| global | onet_attribution | error | 通过 | O*NET version, attribution license and modification notice present |
| global | golden_case_counts | error | 通过 | 12 golden users, two paths each, eight 8-dimension snapshots each |
| global | golden_g009_rank | error | 通过 | USER-G009 target AI application role ranks first |
| global | golden_target_top_two | error | 通过 | all golden target roles rank in top two |
| global | golden_closed_loop | error | 通过 | 12 golden users contain ordered learning→project→recalculation→adjustment chain |
| global | no_pii_patterns | error | 通过 | no phone, ID, email or long account-number patterns found |
| global | golden_manual_review_template | error | 通过 | 12 review rows prepared |
| global | golden_manual_signoff | warning | 待完成 | 0/12 signed; team signoff is required before competition freeze |

自动检查通过不等于完成人工签字或真实用户测试。比赛冻结前须填写黄金案例复核表，并开展真实用户测试。
