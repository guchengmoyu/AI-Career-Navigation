import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CareerService, ServiceError, type PathInput, type ProgressInput, type ScenarioInput } from "./service.js";

function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  };
}

function toolFailure(error: unknown) {
  const known = error instanceof ServiceError;
  const payload = {
    error: {
      code: known ? error.code : "INTERNAL_ERROR",
      message: known ? error.message : "MCP工具执行失败",
    },
  };
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export async function createMcpServer(service = new CareerService()): Promise<McpServer> {
  await service.init();
  const server = new McpServer({ name: "a02-career-navigation-mcp", version: "0.1.0" });

  server.registerTool("calculate_career_profile", {
    title: "职业画像计算",
    description: "基于60项原子技能和证据衰减计算8维职业画像，并返回三个模拟岗位方向的可解释匹配分。只接受数据包中的匿名模拟用户ID。",
    inputSchema: {
      user_id: z.string().regex(/^USER-[GSN]\d{3}$/).describe("匿名模拟用户ID，例如 USER-G001"),
      as_of_date: z.string().datetime().optional().describe("可选ISO 8601计算时点"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (input) => {
    try { return toolResult(service.calculateCareerProfile(input)); }
    catch (error) { return toolFailure(error); }
  });

  server.registerTool("generate_career_path", {
    title: "职业路径生成",
    description: "根据用户与目标岗位的技能差距，生成快速补差和项目驱动两条可解释学习路线。生成不等于激活，需通过进度工具激活。",
    inputSchema: {
      user_id: z.string().regex(/^USER-[GSN]\d{3}$/),
      target_role_id: z.enum(["ROLE-AI-ALG", "ROLE-AI-APP", "ROLE-DATA"]),
      horizon_years: z.number().int().min(1).max(5).optional(),
      weekly_hours: z.number().int().min(1).max(40).optional(),
      priority: z.enum(["speed", "depth", "balanced"]).optional(),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (input) => {
    try { return toolResult(service.generateCareerPath(input as PathInput)); }
    catch (error) { return toolFailure(error); }
  });

  server.registerTool("evaluate_scenario", {
    title: "职场场景评估",
    description: "列出、启动或提交职场场景回复，根据预期行为、隐私要求和红旗行为进行可解释评分。",
    inputSchema: {
      action: z.enum(["list", "start", "submit_and_evaluate"]),
      user_id: z.string().regex(/^USER-[GSN]\d{3}$/).optional(),
      module_id: z.enum(["SCN-REMOTE", "SCN-AI-OFFICE", "SCN-CROSS-ROLE"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      scenario_id: z.string().optional(),
      session_id: z.string().optional(),
      response_text: z.string().max(5000).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input) => {
    try {
      if (input.action !== "list" && !input.user_id) throw new ServiceError("MISSING_USER_ID", "start和submit_and_evaluate必须提供user_id");
      if (input.action === "start" && !input.scenario_id) throw new ServiceError("MISSING_SCENARIO_ID", "start必须提供scenario_id");
      if (input.action === "submit_and_evaluate" && (!input.session_id || !input.response_text)) throw new ServiceError("MISSING_EVALUATION_INPUT", "submit_and_evaluate必须提供session_id和response_text");
      return toolResult(await service.evaluateScenario(input as ScenarioInput));
    } catch (error) { return toolFailure(error); }
  });

  server.registerTool("manage_progress", {
    title: "学习进度管理",
    description: "查询成长摘要与事件，或以幂等方式记录学习事件、激活路径和更新任务。无公网数据库时仅作为临时演示状态。",
    inputSchema: {
      action: z.enum(["summary", "list_events", "record_event", "update_task", "activate_path"]),
      user_id: z.string().regex(/^USER-[GSN]\d{3}$/),
      limit: z.number().int().min(1).max(100).optional(),
      idempotency_key: z.string().min(8).max(100).optional(),
      event_type: z.string().optional(),
      detail: z.string().max(500).optional(),
      occurred_at: z.string().datetime().optional(),
      duration_minutes: z.number().int().min(0).max(1440).optional(),
      skill_id: z.string().optional(),
      resource_id: z.string().optional(),
      score_delta: z.number().min(-20).max(20).optional(),
      sentiment: z.enum(["positive", "neutral", "frustrated", "disappointed"]).optional(),
      task_id: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
      path_id: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (input) => {
    try {
      if (["record_event", "update_task", "activate_path"].includes(input.action) && !input.idempotency_key) throw new ServiceError("MISSING_IDEMPOTENCY_KEY", "写操作必须提供idempotency_key");
      if (input.action === "record_event" && (!input.event_type || !input.detail)) throw new ServiceError("MISSING_EVENT_INPUT", "record_event必须提供event_type和detail");
      if (input.action === "update_task" && (!input.task_id || !input.status)) throw new ServiceError("MISSING_TASK_INPUT", "update_task必须提供task_id和status");
      if (input.action === "activate_path" && !input.path_id) throw new ServiceError("MISSING_PATH_ID", "activate_path必须提供path_id");
      return toolResult(await service.manageProgress(input as ProgressInput));
    } catch (error) { return toolFailure(error); }
  });

  return server;
}
