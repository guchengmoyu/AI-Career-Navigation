import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuntimeData } from "./types.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const candidates = [
  join(HERE, "../data/runtime-data.json"),
  join(HERE, "../../data/runtime-data.json"),
];

let loaded: RuntimeData | undefined;

export function getRuntimeData(): RuntimeData {
  if (loaded) return loaded;
  const path = candidates.find((candidate) => existsSync(candidate));
  if (!path) throw new Error("runtime-data.json not found; run npm run build:data");
  loaded = JSON.parse(readFileSync(path, "utf8")) as RuntimeData;
  return loaded;
}

export function resetRuntimeDataForTests(): void {
  loaded = undefined;
}
