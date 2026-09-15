import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createMcpServer } from "../src/server.js";
import { CareerService } from "../src/service.js";
import { OverlayStore } from "../src/store.js";

describe("MCP contract", () => {
  it("lists exactly the four A02 tools and invokes the profile tool", async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const service = new CareerService(new OverlayStore(join(tmpdir(), "a02-career-mcp-protocol-tests", `${randomUUID()}.json`)));
    const server = await createMcpServer(service);
    const client = new Client({ name: "a02-test-client", version: "0.1.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const listed = await client.listTools();
    expect(listed.tools.map((tool) => tool.name).sort()).toEqual([
      "calculate_career_profile",
      "evaluate_scenario",
      "generate_career_path",
      "manage_progress",
    ]);
    const result = await client.callTool({ name: "calculate_career_profile", arguments: { user_id: "USER-G001" } });
    expect(result.isError).not.toBe(true);
    expect((result.structuredContent as { dimensions: unknown[] }).dimensions).toHaveLength(8);

    const path = await client.callTool({ name: "generate_career_path", arguments: { user_id: "USER-G001", target_role_id: "ROLE-AI-ALG", horizon_years: 3, weekly_hours: 10 } });
    expect(path.isError).not.toBe(true);
    expect((path.structuredContent as { branches: unknown[] }).branches).toHaveLength(2);

    const started = await client.callTool({ name: "evaluate_scenario", arguments: { action: "start", user_id: "USER-G001", scenario_id: "SCN-REMOTE-01" } });
    const sessionId = (started.structuredContent as { session_id: string }).session_id;
    const evaluated = await client.callTool({ name: "evaluate_scenario", arguments: { action: "submit_and_evaluate", user_id: "USER-G001", session_id: sessionId, response_text: "确认目标和截止时间，记录负责人并同步，核验来源、保护隐私，最后复盘改进。" } });
    expect(evaluated.isError).not.toBe(true);
    expect((evaluated.structuredContent as { overall_score: number }).overall_score).toBeGreaterThanOrEqual(80);

    const progressArguments = { action: "record_event", user_id: "USER-G001", idempotency_key: "mcp-protocol-0001", event_type: "skill_practice", detail: "完成协议联调练习", skill_id: "SKILL-009", duration_minutes: 30, score_delta: 2 };
    const recorded = await client.callTool({ name: "manage_progress", arguments: progressArguments });
    const replayed = await client.callTool({ name: "manage_progress", arguments: progressArguments });
    expect(recorded.isError).not.toBe(true);
    expect((replayed.structuredContent as { idempotent_replay: boolean }).idempotent_replay).toBe(true);

    const invalidUser = await client.callTool({ name: "calculate_career_profile", arguments: { user_id: "USER-G999" } });
    const missingScenario = await client.callTool({ name: "evaluate_scenario", arguments: { action: "start", user_id: "USER-G001" } });
    const missingIdempotency = await client.callTool({ name: "manage_progress", arguments: { action: "record_event", user_id: "USER-G001", event_type: "skill_practice", detail: "缺少幂等键" } });
    expect(invalidUser.isError).toBe(true);
    expect(missingScenario.isError).toBe(true);
    expect(missingIdempotency.isError).toBe(true);
    await client.close();
    await server.close();
  });
});
