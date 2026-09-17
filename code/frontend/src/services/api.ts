const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1'
export const DEMO_USER_ID = import.meta.env.VITE_DEMO_USER_ID || 'USER-G001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error?.message || `API Error: ${res.status} ${res.statusText}`)
  return json.data ?? json
}

export interface DimensionResult {
  dimension_id: string
  name: string
  score: number
  evidence_count: number
  confidence: number
  top_skills: { skill_id: string; name: string; score: number }[]
}

export interface CareerProfile {
  user_id: string
  persona_code: string
  overall_score: number
  dimensions: DimensionResult[]
  strengths: string[]
  improvement_priorities: string[]
  role_matches: { role_id: string; name: string; match_score: number; rank: number }[]
  disclaimer: string
}

export const profileApi = {
  calculate: (userId: string) => request<CareerProfile>('/profile/calculate', {
    method: 'POST', body: JSON.stringify({ user_id: userId }),
  }),
  get: (userId: string) => request<CareerProfile>(`/profile/${userId}`),
}

export interface PathTask {
  task_id: string
  title: string
  task_type: string
  difficulty: string
  estimated_hours: number
  skill_id: string
  resource_id: string | null
  provider: string | null
  resource_url: string | null
  status: string
}

export interface GeneratedPath {
  path_id: string
  branch_type: 'fast_gap' | 'project_driven'
  title: string
  horizon_years: number
  weekly_hours: number
  total_estimated_hours: number
  phases: { phase_order: number; title: string; duration_months: number; milestones: string[]; tasks: PathTask[] }[]
}

export interface LearningPathResult {
  /* 回显实际生效的目标岗位。服务端确实返回该字段
     （service.generateCareerPath 的 `target_role_id: role.role_id`），
     此前类型里漏声明了，导致前端无法回读"当前目标岗位是谁"。 */
  target_role_id: string
  target_role_name: string
  gap_analysis: {
    critical_gaps: { skill_id: string; skill_name: string; current_score: number; required_score: number; gap: number; priority_score: number }[]
    minor_gaps: { skill_id: string; skill_name: string; current_score: number; required_score: number; gap: number; priority_score: number }[]
  }
  branches: GeneratedPath[]
  disclaimer: string
}

/** 「调整目标」可用的岗位选项。
 *  后端**没有岗位列表接口**（`/role`、`/roles`、`/role/list` 实测均 404），
 *  数据集里一共只有这 3 个岗位（roles count = 3）。
 *  唯一的替代来源是 `profile.role_matches`，但它是按匹配分排序后 slice 的，
 *  实测只返回 3 条中的 2 条（`ROLE-AI-APP` 会漏掉），用它做选项会让用户选不到全部岗位，
 *  故此处显式维护；后端补上岗位列表接口后应改为动态获取。 */
export const PATH_ROLE_OPTIONS = [
  { role_id: 'ROLE-AI-ALG', name: 'AI算法工程师' },
  { role_id: 'ROLE-AI-APP', name: 'AI应用开发工程师' },
  { role_id: 'ROLE-DATA', name: '数据分析师' },
]

export const pathApi = {
  generate: (params: { user_id: string; target_role_id: string; horizon_years?: number; weekly_hours?: number; priority?: 'speed' | 'depth' | 'balanced' }) =>
    request<LearningPathResult>('/path/generate', { method: 'POST', body: JSON.stringify(params) }),
}

export interface Scenario {
  scenario_id: string
  module_id: string
  module_name: string
  difficulty: string
  target_role_id: string
  title: string
  context: string
  initial_prompt: string
  privacy_focus: string
}

/** 场景评估的**五个**维度。
 *  ⚠️ 这五个 key 与画像的 8 个 DIM-01..08 是**两套完全不同的体系** ——
 *  同名不同源，绝不能拿去喂 RadarChart（那个组件假定 8 个维度且 max 均为 100）。
 *  每个维度的满分也不一致（25/20/20/20/15），画图前必须按 max_score 归一化，
 *  否则「反思 15/15」会看起来比「任务完成 25/25」小一圈。
 *  来源：`service.ts` 的返回对象字面量（唯一权威，无类型导出）。 */
export const EVALUATION_DIMENSIONS = [
  { key: 'task_completion', label: '任务完成', maxScore: 25 },
  { key: 'clarification', label: '需求澄清', maxScore: 20 },
  { key: 'evidence_and_privacy', label: '证据与隐私', maxScore: 20 },
  { key: 'collaboration', label: '协作沟通', maxScore: 20 },
  { key: 'reflection', label: '反思复盘', maxScore: 15 },
] as const

export type EvaluationDimensionKey = (typeof EVALUATION_DIMENSIONS)[number]['key']

export interface ScenarioEvaluation {
  scenario_id: string
  overall_score: number
  dimensions: Record<string, { score: number; max_score: number }>
  highlights: string[]
  improvement_suggestions: string[]
  red_flag_hits: string[]
  update_applied: boolean
  /* ↓ 以下字段服务端**一直在返回**，此前类型里全部漏声明（实测 `evaluate` 的响应
       共 26 个字段）。评估报告页要用，故一并补上。 */
  /** 命中的预期行为（`highlights` 就是它的前 3 条加「已覆盖：」前缀） */
  matched_expected_actions: string[]
  /** 未覆盖的预期行为 —— 「改进建议」的主要来源 */
  missing_expected_actions: string[]
  /** 红旗行为扣分，`Math.min(30, 命中数 × 10)` */
  penalty: number
  /** 用户回答的前 300 字回显 */
  evidence_excerpt: string
  /** 仅**建议**的画像增量，并未落库（见 update_applied 恒为 false） */
  proposed_profile_updates: { dimension_id: string; suggested_delta: number; reason: string }[]
  /** 评分口径说明，用于向用户解释分数怎么来的 */
  evaluation_rule: string
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

export interface GrowthEvent {
  event_id: string
  event_type: string
  event_time: string
  score_delta: number
  points_earned?: number
  detail: string
  status: string
}

export interface ProgressSummary {
  total_learning_hours: number
  completed_tasks: number
  streak_days: number
  points_earned: number
  recent_events: GrowthEvent[]
  active_path: null | { path_id: string; title: string; completed_tasks: number; total_tasks: number; progress_percent: number }
  persistence_mode: string
  disclaimer: string
}

export const progressApi = {
  getEvents: (userId: string, limit = 20) => request<{ events: GrowthEvent[] }>(`/progress/${userId}/events?limit=${limit}`),
  getSummary: (userId: string) => request<ProgressSummary>(`/progress/${userId}/summary`),
}
