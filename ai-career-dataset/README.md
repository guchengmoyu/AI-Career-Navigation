# AI职业导航比赛模拟数据工程

本工程为 A02「面向未来工作的 AI 职业导航与终身学习伙伴系统」提供可重复生成的数据契约、分阶段数据包、黄金演示案例、知识库材料和独立评测集。

## 交付内容

- `data/v0.2-seed/`：供四个模块尽快联调的种子数据。
- `data/v0.5-core/`：供完整功能联调的中型数据。
- `data/v1.0-full/`：最终竞赛规模数据；分支中默认忽略，请从 GitHub Release 下载或运行生成器本地生成。
- `schemas/`：数据字典、JSON 契约和枚举说明。
- `docs/`：团队交接、数据卡、来源与真实用户测试模板。
- `outputs/quality-report/A02_模拟数据与质量报告_v1.0.xlsx`：面向团队和答辩的汇总工作簿。
- `reports/validation_report.json` 与 `reports/validation_report.md`：自动验收结果。

所有用户、企业、岗位、行为、薪资和趋势数值均为模拟数据。公开来源只用于职业技能分类、课程入口、趋势方向与合规规则的参考。界面展示模拟岗位或趋势时必须标注“演示数据”。

## 快速开始

使用 Node.js 18 或更高版本：

```powershell
npm run generate
npm run validate
npm run workbook
```

Git 分支只跟踪种子包与核心包。`npm run generate` 仍会在本地生成 `data/v1.0-full/`，但该目录已加入 `.gitignore`，避免把约 90 MB 的可重复生成文件写入 Git 历史。

生成汇总工作簿需要 `@oai/artifact-tool`。本仓库不复制该依赖，比赛团队可只使用已经生成的工作簿、CSV 和 JSON。

## 数据版本

| 版本 | 用户 | 岗位 | 学习资源 | 成长事件 | 场景案例 |
|---|---:|---:|---:|---:|---:|
| v0.2-seed | 12 | 60 | 60 | 360 | 15 |
| v0.5-core | 100 | 300 | 200 | 4,000 | 60 |
| v1.0-full | 500 | 1,500 | 600 | 20,000 | 150 |

三个版本共享同一 `schema_version=1.1.0`。字段含义发生不兼容变化时必须提升主版本，不能静默修改。

完整包中的 500 名用户划分为 12 名 `golden`、388 名 `dev` 和 100 名 `test`；学生和职场新人各 250 名。独立评测只使用 `test` 用户与测试岗位。

## 给各模块的入口

- 画像与匹配：`users.csv`、`user_skill_scores.csv`、`roles.csv`、`role_skills.csv`、`jobs.csv`、`job_skills.csv`。
- 路径与任务：`learning_resources.csv`、`resource_skills.csv`、`career_paths.csv`、`career_milestones.csv`、`growth_events.csv`。
- 对话与长期记忆：`users.json`、`growth_events.csv`、`dialogue_eval.csv`、`scenario_cases.csv`。
- MCP 与资源管理：`jobs.json`、`resources.json`、`source_registry.csv`、`privacy_security_eval.csv`。

## 重要限制

- 数据用于原型、评测和演示，不用于训练基础模型。
- `claim_level` 区分 `verified_primary`、`primary_derived` 和 `synthetic`；`data_split` 区分 `golden`、`dev` 和 `test`。
- `verified_course_metadata` 当前含 22 条已核验的智慧教育平台课程或课程专题页，只保存必要元数据和链接。
- `public_catalog_topic_card` 当前含 98 条团队派生主题卡，明确不对应官方课程。
- `trend_snapshots.csv` 是模拟推演，不代表真实市场统计或投资、就业承诺。
- `user_test_feedback_template.csv` 是空白模板。真实用户测试结果必须由知情同意的测试者产生，严禁伪造。
- `golden_manual_review_template.csv` 必须由团队成员签字后才能将数据标记为最终冻结版本。
