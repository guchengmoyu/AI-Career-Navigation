/* ─────────────────────────────────────────────────────────────────────────
   P1 · HTTP 客户端层（重写）

   只有本文件允许引用 `import.meta.env` 与 fetch —— 它属于**容器侧**
   （src/App.tsx），P2 打 UMD 时不会被打进任何页面卡片包。

   与旧版的差异：
   - 类型与纯常量全部移到 ./types.ts（页面只能 import types.ts）；
   - 删除死代码 profileApi.calculate、progressApi.getEvents（全仓无调用方）。
   ───────────────────────────────────────────────────────────────────────── */

import type {
  ActivatePathResult,
  CareerProfile,
  LearningPathResult,
  ProgressSummary,
  Scenario,
  ScenarioEvaluation,
  TaskStatus,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1'
export const DEMO_USER_ID = import.meta.env.VITE_DEMO_USER_ID || 'USER-G001'

/* 带元信息的请求：除数据外还把服务端的降级标记 `fallback` 带回来。
   背景：后端在数据库异常时**不返回 5xx**，而是 200 + MOCK 兜底
   （`{"data": {...}, "fallback": true}`，其中 dimensions 是空数组）。
   只取 `json.data` 的话，「这不是真数据」的信号就被丢掉了，页面会把 MOCK
   当真数据渲染 → 画像页读 `sorted[0].name` 直接崩（顶层错误边界整页报错）。
   因此 profile 必须走这个版本，把 fallback 透传给容器。 */
async function requestWithMeta<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T; fallback: boolean }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error?.message || `API Error: ${res.status} ${res.statusText}`)
  return { data: (json.data ?? json) as T, fallback: json.fallback === true }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  return (await requestWithMeta<T>(path, options)).data
}

/** 写操作的幂等键。
 *  服务端把它当"同一请求"的凭据：同 key 重放会直接返回上次结果并带 `idempotent_replay: true`，
 *  不会重复计分/重复推进度。
 *  ⚠️ 实测（09-17）服务端**不传 key 也会返回 200**（内部有兜底），
 *  但前端**必须始终带上** —— 否则用户点"重试"时会把同一个事件算两次。
 *  生成规则：调用方语义前缀 + 时间戳 + 随机段，保证"同一次用户操作重试沿用同一个 key"，
 *  而"两次不同的操作"拿到不同 key。 */
export function makeIdempotencyKey(scope: string): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${scope}-${Date.now()}-${rand}`
}

export const profileApi = {
  /** 走 requestWithMeta：必须拿到 `fallback`，容器据此提示"当前是降级 MOCK 数据"。 */
  get: (userId: string) => requestWithMeta<CareerProfile>(`/profile/${userId}`),
}

export const pathApi = {
  generate: (params: { user_id: string; target_role_id: string; horizon_years?: number; weekly_hours?: number; priority?: 'speed' | 'depth' | 'balanced' }) =>
    request<LearningPathResult>('/path/generate', { method: 'POST', body: JSON.stringify(params) }),
}

export const scenarioApi = {
  list: (userId = DEMO_USER_ID) => request<{ scenarios: Scenario[] }>(`/scenario?user_id=${userId}`),
  start: (scenarioId: string, userId: string) => request<{ session_id: string; scenario: Scenario }>('/scenario/start', {
    method: 'POST', body: JSON.stringify({ scenario_id: scenarioId, user_id: userId }),
  }),
  evaluate: (sessionId: string, userId: string, responseText: string) => request<ScenarioEvaluation>('/scenario/evaluate', {
    method: 'POST', body: JSON.stringify({ session_id: sessionId, user_id: userId, response_text: responseText }),
  }),
}

export const progressApi = {
  getSummary: (userId: string) => request<ProgressSummary>(`/progress/${userId}/summary`),

  /** 把某条路径设为"当前生效路径"。
   *  这是 `update_task` 的**前置条件** —— 未激活就更新任务会得到
   *  `404 TASK_NOT_FOUND`（"未在激活路径中找到任务…"），实测已验证。
   *  `idempotency_key` 必须由调用方提供：同一次点击的重试要沿用同一个 key。 */
  activatePath: (userId: string, pathId: string, idempotencyKey: string) =>
    request<ActivatePathResult>('/progress/path/activate', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, path_id: pathId, idempotency_key: idempotencyKey }),
    }),

  /** 更新任务状态。⚠️ 路由是 **PATCH**（不是 POST），taskId 走 URL 路径。 */
  updateTask: (userId: string, taskId: string, status: TaskStatus, idempotencyKey: string) =>
    request<{ task_id: string; status: string; updated_at: string }>(
      `/progress/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ user_id: userId, status, idempotency_key: idempotencyKey }),
      },
    ),
}
