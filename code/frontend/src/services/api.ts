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
  target_role_name: string
  gap_analysis: {
    critical_gaps: { skill_id: string; skill_name: string; current_score: number; required_score: number; gap: number; priority_score: number }[]
    minor_gaps: { skill_id: string; skill_name: string; current_score: number; required_score: number; gap: number; priority_score: number }[]
  }
  branches: GeneratedPath[]
  disclaimer: string
}

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

export interface ScenarioEvaluation {
  scenario_id: string
  overall_score: number
  dimensions: Record<string, { score: number; max_score: number }>
  highlights: string[]
  improvement_suggestions: string[]
  red_flag_hits: string[]
  update_applied: boolean
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
