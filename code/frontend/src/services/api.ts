/**
 * API 服务层
 *
 * 当前使用 mock 数据，后续接入 MCP 工具 API 后替换为真实请求。
 * MCP 工具通过百宝箱平台调用，前端直接请求 MCP 服务的 REST 接口。
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1'

// 通用请求封装
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ========== 职业画像 ==========

export interface DimensionScores {
  professional_skill: number
  soft_skill: number
  leadership: number
  innovation: number
  learning_ability: number
}

export interface CareerProfile {
  profile_id: number
  overall_score: number
  dimension_scores: DimensionScores
  strengths: string[]
  weaknesses: string[]
  recommended_directions: { position: string; match_score: number }[]
}

export const profileApi = {
  /** 计算职业画像 — 对应 MCP 工具 calculate_career_profile */
  calculate: (userId: string, questionnaire: Record<string, unknown>) =>
    request<CareerProfile>('/profile/calculate', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, questionnaire }),
    }),

  /** 获取用户画像 — 对应 MCP 工具 get_career_profile */
  get: (userId: string) =>
    request<CareerProfile>(`/profile/${userId}`),
}

// ========== 学习路径 ==========

export interface LearningPath {
  path_id: number
  title: string
  gap_analysis: {
    critical_gaps: { skill: string; current: number; target: number; gap: number }[]
    minor_gaps: { skill: string; current: number; target: number; gap: number }[]
  }
  phases: {
    phase_order: number
    title: string
    duration: number
    milestones: string[]
    tasks: {
      task_order: number
      title: string
      task_type: string
      difficulty: string
      estimated_hours: number
      platform: string
    }[]
  }[]
}

export const pathApi = {
  /** 生成学习路径 — 对应 MCP 工具 generate_learning_path */
  generate: (params: {
    user_id: string
    target_position: string
    target_industry?: string
    target_time_years?: number
    weekly_hours?: number
    priority?: 'speed' | 'depth' | 'balanced'
  }) =>
    request<LearningPath>('/path/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
}

// ========== 场景模拟 ==========

export interface Scenario {
  scenario_id: string
  scenario_type: string
  difficulty: string
  estimated_duration: number
  title: string
  initial_prompt: string
}

export interface ScenarioEvaluation {
  scenario_id: string
  overall_score: number
  dimensions: Record<string, { score: number; feedback: string }>
  highlights: string[]
  improvement_suggestions: string[]
}

export const scenarioApi = {
  /** 获取场景列表 */
  list: (params?: { scenario_type?: string; difficulty?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<Scenario[]>(`/scenario?${query}`)
  },

  /** 开始场景模拟 — 对应 MCP 工具 startScenario */
  start: (scenarioId: string, userId: string) =>
    request<{ session_id: string; initial_prompt: string }>('/scenario/start', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId, user_id: userId }),
    }),

  /** 评估场景表现 — 对应 MCP 工具 evaluateScenario */
  evaluate: (sessionId: string) =>
    request<ScenarioEvaluation>('/scenario/evaluate', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
}

// ========== 进度管理 ==========

export interface GrowthEvent {
  event_id: string
  event_type: string
  points_earned: number
  occurred_at: string
  payload: Record<string, unknown>
}

export const progressApi = {
  /** 获取成长事件列表 — 对应 MCP 工具 getGrowthEvents */
  getEvents: (userId: string, limit = 20) =>
    request<GrowthEvent[]>(`/progress/${userId}/events?limit=${limit}`),
}
