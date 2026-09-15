import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createRestApp } from "../src/rest.js";
import { CareerService } from "../src/service.js";
import { OverlayStore } from "../src/store.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const service = new CareerService(new OverlayStore(join(tmpdir(), "a02-career-mcp-rest-tests", `${randomUUID()}.json`)));
  const app = await createRestApp(service);
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("REST adapter", () => {
  it("serves health and the same eight-dimension profile", async () => {
    const health = await fetch(`${baseUrl}/api/health`).then((response) => response.json()) as { status: string; schema_version: string };
    expect(health).toMatchObject({ status: "ok", schema_version: "1.2.0" });

    const profile = await fetch(`${baseUrl}/api/v1/profile/USER-G001`).then((response) => response.json()) as { data: { dimensions: unknown[]; trace_id: string } };
    expect(profile.data.dimensions).toHaveLength(8);
    expect(profile.data.trace_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("returns a structured 404 for an invalid user", async () => {
    const response = await fetch(`${baseUrl}/api/v1/profile/USER-NOT-FOUND`);
    const body = await response.json() as { error: { code: string } };
    expect(response.status).toBe(404);
    expect(body.error.code).toBe("USER_NOT_FOUND");
  });
});
