import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { GeneratedPath, GrowthEvent, OverlayState, PathTask, ScenarioSession } from "./types.js";
import { dbEnabled, insertGrowthEvent, loadOverlayPaths, loadOverlaySessions, upsertActivePath, upsertPathTask, upsertScenarioSession } from "./db.js";

const EMPTY: OverlayState = {
  events: {},
  sessions: {},
  active_paths: {},
  task_updates: {},
  idempotency: {},
};

export class OverlayStore {
  private state: OverlayState = structuredClone(EMPTY);
  private loaded = false;
  private persistenceMode: "local_file" | "memory_fallback" = "local_file";
  private writeChain: Promise<void> = Promise.resolve();
  private lastRefreshAt = 0;

  constructor(private readonly filePath = process.env.A02_PROGRESS_FILE || join(tmpdir(), "a02-career-mcp", "progress-overlay.json")) {}

  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      this.state = { ...structuredClone(EMPTY), ...JSON.parse(await readFile(this.filePath, "utf8")) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.persistenceMode = "memory_fallback";
    }
    // 阶段1（DB 模式）：
    //  - events 的权威来源是 DB（用户 recent_events 在 init 时已从 DB 装载全部基础+历史事件），
    //    这里的 events 只保留“本进程新写入”的增量，因此必须清空文件里的旧增量，避免双计；
    //  - sessions 从 DB 恢复（跨进程/冷启动后仍能按 session_id 提交评估）；
    //  - active_paths / task_updates 从 DB 恢复（v2/0.2.1：对话侧 ↔ 前端侧跨进程共享）；
    //  - idempotency 维持本地文件（跨进程幂等需 mcp_idempotency 表，v2 范围外）。
    if (dbEnabled()) {
      try {
        this.state.events = {};
        this.state.sessions = await loadOverlaySessions();
        const paths = await loadOverlayPaths();
        this.state.active_paths = paths.activePaths;
        this.state.task_updates = paths.taskUpdates;
      } catch (error) {
        this.persistenceMode = "memory_fallback";
        console.error("[a02] overlay hydrate from MySQL failed:", (error as Error).message);
      }
    }
    this.loaded = true;
  }

  get mode(): "local_file" | "memory_fallback" {
    return this.persistenceMode;
  }

  getState(): OverlayState {
    return this.state;
  }

  getIdempotent(key: string): unknown | undefined {
    return this.state.idempotency[key];
  }

  async remember(key: string, value: unknown): Promise<void> {
    this.state.idempotency[key] = value;
    await this.persist();
  }

  async appendEvent(userId: string, event: GrowthEvent): Promise<void> {
    (this.state.events[userId] ||= []).push(event);
    if (dbEnabled()) {
      // DB 模式：写库 + 内存增量（本进程 read-back 可见），不再落文件
      await insertGrowthEvent(userId, event);
      return;
    }
    await this.persist();
  }

  async saveSession(session: ScenarioSession): Promise<void> {
    this.state.sessions[session.session_id] = session;
    if (dbEnabled()) {
      await upsertScenarioSession(session);
      return;
    }
    await this.persist();
  }

  async activatePath(userId: string, path: GeneratedPath): Promise<void> {
    this.state.active_paths[userId] = path;
    if (dbEnabled()) {
      try {
        await upsertActivePath(userId, path);
        return;
      } catch (error) {
        // 降级链：DB 写失败 → 保留内存状态（本进程可读）+ 落文件兜底，演示不中断
        console.error("[a02] active path persist to MySQL failed:", (error as Error).message);
      }
    }
    await this.persist();
  }

  async updateTask(
    taskId: string,
    status: PathTask["status"],
    context?: { pathId: string; phaseOrder: number; task: PathTask }
  ): Promise<void> {
    const updatedAt = new Date().toISOString();
    this.state.task_updates[taskId] = { status, updated_at: updatedAt };
    if (dbEnabled()) {
      if (context) {
        try {
          await upsertPathTask(context.pathId, context.phaseOrder, context.task, status, updatedAt);
          return;
        } catch (error) {
          console.error("[a02] task update persist to MySQL failed:", (error as Error).message);
        }
      }
    }
    await this.persist();
  }

  /**
   * v2 跨进程新鲜度：从 DB 重新装载激活路径 / 任务状态（DB 是 DB 模式的权威来源）。
   * 在 summary / update_task 前调用 —— 对话侧写入前端侧立即可见，反之亦然。
   * 300ms 微节流防止同一请求内重复查询；DB 不可用时静默保留内存值（演示不中断）。
   */
  async refreshFromDb(): Promise<void> {
    if (!dbEnabled()) return;
    const now = Date.now();
    if (now - this.lastRefreshAt < 300) return;
    this.lastRefreshAt = now;
    try {
      const paths = await loadOverlayPaths();
      this.state.active_paths = paths.activePaths;
      this.state.task_updates = paths.taskUpdates;
    } catch (error) {
      console.error("[a02] overlay refresh from MySQL failed:", (error as Error).message);
    }
  }

  private async persist(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      if (this.persistenceMode === "memory_fallback") return;
      try {
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(this.filePath, `${JSON.stringify(this.state, null, 2)}\n`, "utf8");
      } catch {
        this.persistenceMode = "memory_fallback";
      }
    });
    await this.writeChain;
  }
}
