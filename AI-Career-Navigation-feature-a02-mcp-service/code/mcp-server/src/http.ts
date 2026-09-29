import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";

/**
 * MCP StreamableHTTP 传输入口（自部署接入百宝箱用）。
 *
 * 与 stdio（cli.ts）暴露的是**同一套** createMcpServer()：
 * 同一个 CareerService、同一份种子数据、同一个 MySQL(ai_career_nav_v12) 落库。
 * 因此对话侧经此端点的读写与本地 REST / React 前端同源 —— 这是"本地 MySQL
 * 为唯一写基线"的实现：云上 npx 沙箱写分叉问题由本入口替代解决。
 *
 * 安全：
 * - 建议设置 MCP_AUTH_TOKEN，平台插件用 Bearer 头携带；
 * - 本端点通过隧道暴露公网，务必设置 token 再开隧道。
 */

type Session = {
  // initialize 完成前 transport 尚未赋值，onsessioninitialized 时补齐
  transport?: StreamableHTTPServerTransport;
};

const sessions = new Map<string, Session>();

function authorized(request: Request): boolean {
  const token = process.env.MCP_AUTH_TOKEN;
  if (!token) return true;
  const header = request.headers.authorization;
  return header === `Bearer ${token}`;
}

function jsonRpcError(response: Response, status: number, code: number, message: string): void {
  response.status(status).json({ jsonrpc: "2.0", error: { code, message }, id: null });
}

export function createMcpHttpApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  const handle = async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!authorized(request)) {
        jsonRpcError(response, 401, -32001, "Unauthorized");
        return;
      }
      const sessionId = request.headers["mcp-session-id"] as string | undefined;

      if (request.method === "GET" || request.method === "DELETE") {
        const session = sessionId ? sessions.get(sessionId) : undefined;
        if (!session?.transport) {
          jsonRpcError(response, 404, -32001, "Session not found");
          return;
        }
        await session.transport.handleRequest(request, response);
        return;
      }

      // POST
      const body = request.body as { method?: string } | undefined;
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (!session?.transport) {
          jsonRpcError(response, 404, -32001, "Session not found");
          return;
        }
        await session.transport.handleRequest(request, response, request.body);
        return;
      }

      // 无会话：仅允许 initialize（其余按协议要求拒绝）
      if (body?.method !== "initialize") {
        jsonRpcError(response, 400, -32000, "Bad Request: No valid session ID provided");
        return;
      }

      const session: Session = {};
      let transport!: StreamableHTTPServerTransport;
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          session.transport = transport;
          sessions.set(id, session);
        },
        onsessionclosed: (id) => {
          sessions.delete(id);
        },
      });

      const server = await createMcpServer();
      transport.onclose = () => {
        void server.close();
      };
      await server.connect(transport);
      await transport.handleRequest(request, response, request.body);
    } catch (error) {
      next(error);
    }
  };

  app.post("/mcp", handle);
  app.get("/mcp", handle);
  app.delete("/mcp", handle);

  app.use((_request: Request, response: Response) => {
    jsonRpcError(response, 404, -32600, "Not found: use POST /mcp");
  });
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    console.error("[a02-mcp-http]", error);
    if (!response.headersSent) jsonRpcError(response, 500, -32603, "Internal error");
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.MCP_HTTP_PORT || 3001);
  const app = createMcpHttpApp();
  app.listen(port, () => {
    console.log(`a02 MCP StreamableHTTP listening on http://localhost:${port}/mcp`);
  });
}
