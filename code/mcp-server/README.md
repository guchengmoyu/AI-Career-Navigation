# A02 Career Navigation MCP

`a02-career-navigation-mcp` is the competition demo service for the A02 AI career navigation project. One MCP server exposes exactly four tools:

| Tool | Purpose | Writes state |
|---|---|---|
| `calculate_career_profile` | Calculate an explainable eight-dimension profile and three role matches | No |
| `generate_career_path` | Generate fast-gap and project-driven routes | No |
| `evaluate_scenario` | List, start and evaluate workplace simulations | Session overlay only |
| `manage_progress` | Query or record progress, activate paths and update tasks | Overlay only |

All users, jobs, scores, events and trends are synthetic. Outputs include `schema_version`, `calculation_version`, `trace_id`, `data_split`, `is_synthetic` and a visible disclaimer. The service does not accept names, phone numbers, resumes or other real personal information.

## Local verification

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run check
```

Start the MCP stdio server:

```bash
npm run build
node dist/cli.js
```

Start the local REST adapter used by the React UI:

```bash
npm run start:rest
```

The health endpoint is `http://localhost:3000/api/health`. The Vite frontend proxies `/api` to this port.

## Tool examples

```json
{"name":"calculate_career_profile","arguments":{"user_id":"USER-G001"}}
```

```json
{"name":"generate_career_path","arguments":{"user_id":"USER-G001","target_role_id":"ROLE-AI-ALG","horizon_years":3,"weekly_hours":12,"priority":"balanced"}}
```

```json
{"name":"evaluate_scenario","arguments":{"action":"start","user_id":"USER-G001","scenario_id":"SCN-REMOTE-01"}}
```

```json
{"name":"manage_progress","arguments":{"action":"record_event","user_id":"USER-G001","idempotency_key":"demo-sql-20260915","event_type":"skill_practice","detail":"完成SQL技能练习","skill_id":"SKILL-009","duration_minutes":30,"score_delta":2}}
```

Write operations require an `idempotency_key`. A repeated key returns the original result and does not create a duplicate event.

## TBox one-click deployment

After the package is published and synchronized to `npmmirror.com`, create a plugin in TBox, select **连接 MCP 服务**, and use:

```text
npx -y a02-career-navigation-mcp@0.1.0
```

Debug all four tools before publishing the plugin. The hosted stdio process uses a temporary local overlay; `persistence_mode` therefore contains `ephemeral`. It must not be presented as durable user storage.

## Runtime data

- Contract: `1.2.0`
- Dataset: `v0.5-core`
- Dataset commit: `9b6a75cdf847132a461a59cb520f90b2e466bb33`
- Generator seed: `20260905`
- Core demo: 100 users, 300 jobs, 200 resources, 60 scenarios
- Hidden evaluation users: 100 records, available only with `A02_ENABLE_TEST_DATA=true`

`data/runtime-data.sha256` verifies the packed runtime bundle. The current SHA-256 is `3fcb6ed19a81f910352dac62adcf71d3c2003c74f2f17b3ee5ce81aa3f9dad46`. `npm run build:data` rebuilds it only when the validated dataset repository is available through `A02_DATASET_ROOT` or the documented sibling directory. Reference entities and nested relations retain the complete provenance fields from schema `1.2.0`.

## Optional MySQL import

The repository-root `ai_career_nav.sql` is a legacy snapshot and is not used by this service. It contains mismatched user/profile associations and conflates scenario templates with sessions.

Use a new MySQL 8 database ending in `_v12`, set the variables in `.env.example`, then run:

```bash
npm run build
npm run db:import
```

The importer applies `db/schema_v1_2.sql` without dropping tables and upserts the validated bundle by stable string IDs. It imports 100 core users, 6,000 skill rows, 24 golden reference paths, 60 scenario templates and 4,000 growth events. It does not import test users.

## Boundaries

- This is a competition simulation, not employment, salary or market advice.
- `role_adjacent_skill` knowledge cards never participate in matching scores.
- Scenario evaluation proposes profile deltas but never applies them automatically.
- Golden cases remain `pending_team_signoff` until the team completes the manual review record.
