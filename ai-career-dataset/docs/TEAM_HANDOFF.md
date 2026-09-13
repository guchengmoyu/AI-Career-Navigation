# 团队交接说明

## 首选联调版本

开发初期使用 `data/v0.2-seed/json/`。字段稳定后切换到 `v0.5-core`，性能与答辩数据使用 `v1.0-full`。三个规模版本共享 `schema_version=1.2.0`，ID 前缀和字段完全一致。

## 模块依赖

| 模块 | 必要数据 | 首个可演示用户 |
|---|---|---|
| 动态画像与岗位匹配 | 用户、能力分数、岗位能力要求、岗位技能 | `USER-G001` |
| 职业路径与学习任务 | 用户约束、能力差距、学习资源、双分支路径 | `USER-G002` |
| AI对话与长期记忆 | 用户状态、成长事件、情绪评测、场景案例 | `USER-G007` |
| MCP资源中心 | 岗位、课程、技能映射、来源和授权字段 | 任意黄金用户 |

## 接口约定

- 所有主键均为字符串，不允许前端自行转成整数。
- 分数范围为 0–100；未知值为 `null`，不得当作 0。
- 日期时间使用 ISO 8601；仅日期使用 `YYYY-MM-DD`。
- `origin` 仅允许 `synthetic`、`public_metadata`、`derived`。
- `claim_level` 用于区分已核验官方元数据、公开来源派生记录和纯模拟记录。
- `data_split=test` 的用户和岗位只用于独立评测，不参与规则调参或演示挑选。
- 所有模拟记录均有 `is_synthetic=true`。
- 面向用户展示 `jobs` 或 `trend_snapshots` 时必须显示“演示数据”。

## 知识库 v1.2.0 兼容说明

- 完整包仍为 1,200 张知识卡和 200 条检索评测；所有既有 `knowledge_card_id`、`retrieval_case_id` 和 `expected_card_ids` 保持不变。
- 原有 180 张 `role_skill` 岗位卡拆分为 54 张 `role_skill` 与 126 张 `role_adjacent_skill`。前者必须存在于 `role_skills.csv` 并参与评分；后者是合成相邻能力扩展，明确不参与当前岗位匹配评分。
- 知识库同学原先报告的“126 张孤儿岗位卡”已通过类别和关系语义修复，不应删除这些卡。只使用技能等级卡的既有实验不受影响。
- 种子包和核心包改为按类别、技能及岗位分层选择，并优先包含其评测引用卡片；两个版本的检索引用悬空数现应为 0。
- 消费方若以前只接受 `category=role_skill`，应增加 `role_adjacent_skill` 展示分支，并禁止把相邻能力权重写入岗位匹配分数。

## 黄金案例冻结状态

- `templates/golden_manual_review_template.csv` 是生成器维护的空白模板。
- 人工记录仅写入 `reviews/golden_manual_review.csv`，生成器不会覆盖。
- 当前 12 条记录均为 `pending_team_signoff`，黄金案例尚未最终冻结，不得在答辩材料中声称已完成签字。

建议的模拟 MCP 工具：

1. `get_user_profile(user_id)`：读取用户、技能分数和最近事件。
2. `search_jobs(role_id, level, city, work_mode)`：查询模拟岗位。
3. `find_learning_resources(skill_id, difficulty, max_hours)`：查询课程与实践任务。
4. `get_scenario_cases(module, difficulty)`：获取职场训练案例。
5. `record_growth_event(user_id, event)`：新增事件并触发画像重算。

## 版本切换

程序只通过配置切换数据目录，不复制业务逻辑。例如将 `DATASET_VERSION` 从 `v0.2-seed` 改为 `v1.0-full`。若业务代码依赖 CSV 列序而不是字段名，必须先修正业务代码。
