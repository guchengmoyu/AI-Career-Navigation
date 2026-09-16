import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { GeneratedPath, GrowthEvent, OverlayState, PathTask, ScenarioSession } from "./types.js";

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

  constructor(private readonly filePath = process.env.A02_PROGRESS_FILE || join(tmpdir(), "a02-career-mcp", "progress-overlay.json")) {}

  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      this.state = { ...structuredClone(EMPTY), ...JSON.parse(await readFile(this.filePath, "utf8")) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") this.persistenceMode = "memory_fallback";
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
    await this.persist();
  }

  async saveSession(session: ScenarioSession): Promise<void> {
    this.state.sessions[session.session_id] = session;
    await this.persist();
  }

  async activatePath(userId: string, path: GeneratedPath): Promise<void> {
    this.state.active_paths[userId] = path;
    await this.persist();
  }

  async updateTask(taskId: string, status: PathTask["status"]): Promise<void> {
    this.state.task_updates[taskId] = { status, updated_at: new Date().toISOString() };
    await this.persist();
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
