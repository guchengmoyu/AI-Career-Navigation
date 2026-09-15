import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { CareerService, ServiceError } from "./service.js";

export async function createRestApp(service = new CareerService()) {
  await service.init();
  const app = express();
  const allowed = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000").split(",");
  app.use(cors({ origin: allowed }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "a02-career-navigation-mcp", version: "0.1.0", schema_version: "1.2.0" }));
  app.post("/api/v1/profile/calculate", asyncHandler(async (request, response) => response.json({ data: service.calculateCareerProfile(request.body) })));
  app.get("/api/v1/profile/:userId", asyncHandler(async (request, response) => response.json({ data: service.calculateCareerProfile({ user_id: String(request.params.userId) }) })));
  app.post("/api/v1/path/generate", asyncHandler(async (request, response) => response.json({ data: service.generateCareerPath(request.body) })));
  app.get("/api/v1/scenario", asyncHandler(async (request, response) => response.json({ data: await service.evaluateScenario({ action: "list", user_id: request.query.user_id as string | undefined, module_id: request.query.module_id as string | undefined, difficulty: request.query.difficulty as string | undefined } as never) })));
  app.post("/api/v1/scenario/start", asyncHandler(async (request, response) => response.json({ data: await service.evaluateScenario({ action: "start", ...request.body }) })));
  app.post("/api/v1/scenario/evaluate", asyncHandler(async (request, response) => response.json({ data: await service.evaluateScenario({ action: "submit_and_evaluate", ...request.body }) })));
  app.get("/api/v1/progress/:userId/events", asyncHandler(async (request, response) => response.json({ data: await service.manageProgress({ action: "list_events", user_id: String(request.params.userId), limit: Number(request.query.limit || 20) }) })));
  app.get("/api/v1/progress/:userId/summary", asyncHandler(async (request, response) => response.json({ data: await service.manageProgress({ action: "summary", user_id: String(request.params.userId) }) })));
  app.post("/api/v1/progress/events", asyncHandler(async (request, response) => response.json({ data: await service.manageProgress({ action: "record_event", ...request.body }) })));
  app.post("/api/v1/progress/path/activate", asyncHandler(async (request, response) => response.json({ data: await service.manageProgress({ action: "activate_path", ...request.body }) })));
  app.patch("/api/v1/progress/tasks/:taskId", asyncHandler(async (request, response) => response.json({ data: await service.manageProgress({ action: "update_task", task_id: request.params.taskId, ...request.body }) })));

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const known = error instanceof ServiceError;
    response.status(known ? error.status : 500).json({ error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "服务执行失败" } });
  });
  return app;
}

function asyncHandler(handler: (request: Request, response: Response) => Promise<unknown>) {
  return (request: Request, response: Response, next: NextFunction) => { Promise.resolve(handler(request, response)).catch(next); };
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || 3000);
  const app = await createRestApp();
  app.listen(port, () => console.log(`A02 REST adapter listening on http://localhost:${port}`));
}
