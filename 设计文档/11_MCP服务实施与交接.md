# A02 MCP 服务实施与交接

## 当前结论

- MCP 实现位于 `code/mcp-server`，一个 Server 固定公开四个工具。
- React 的画像、路径、场景、进度和总览页已改为调用同一业务逻辑，不再使用页内 mock 数据。
- 数据唯一计算基线是 `ai-career-dataset@9b6a75c` 的契约 `1.2.0`。
- 百宝箱首发方式为 npm + npx 一键部署，不需要公网服务器。

## 联调方式

1. 在 `code/mcp-server` 执行 `npm install && npm run check && npm run start:rest`。
2. 在 `code/frontend` 执行 `npm install && npm run dev`。
3. 打开 `http://localhost:5173`，默认演示用户为 `USER-G001`。
4. 需切换黄金用户时修改 `VITE_DEMO_USER_ID`，不要把真实个人信息填入模拟服务。

## 旧 SQL 问题

`ai_career_nav.sql` 仅保留为过程记录，不允许直接用于 MCP 生产或演示计算。已确认的问题包括：

- `GOLD-001` 所在用户主表 ID 为 1，但其资料被错误关联到 `user_id=57`。
- 用户技能以文本名称关联，无稳定 `skill_id`。
- 只导入12条路径，没有导入黄金用户的12条备选路线。
- 60个场景模板被导入为进行中会话，而不是独立的场景表。
- 来源层级、模拟声明和契约版本在多张表中丢失。

新数据库使用 `code/mcp-server/db/schema_v1_2.sql`，默认要求新库名以 `_v12` 结尾，避免覆盖旧库。
新导入器会贯穿保存 `origin`、`source_ids`、`claim_level`、`verification_status`、`is_synthetic`、`is_market_fact`、`schema_version` 等来源字段；场景模板和会话分别建表，初始不会伪造场景会话。

## 队友需同步的契约

- 雷达图是8维，不是旧页面的5维。
- 匹配只使用 `ref_role_skills`，不使用 `role_adjacent_skill`。
- 岗位、薪资和趋势必须同时展示模拟声明。
- 场景评分的能力变化是建议值，必须通过进度工具显式写入。
- 写操作必须有 `idempotency_key`，撤回授权后禁止写入。
- 没有公网 MySQL 时，进度覆盖层是临时的，页面和视频都不得宣传为永久保存。

## 发布待办

- 注册并登录 npm，检查包名可用性。
- 发布 npm 前运行 `npm pack --dry-run`和 MCP Inspector。
- 等待 npmmirror 同步后，在百宝箱使用 `npx -y a02-career-navigation-mcp@0.1.0`。
- 四个工具逐个调试通过后再发布插件。
- 黄金用户仍为 `pending_team_signoff`，不能在 README、PR 或答辩材料中写成已签字冻结。
