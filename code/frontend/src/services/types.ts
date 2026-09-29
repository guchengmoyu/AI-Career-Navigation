/* ─────────────────────────────────────────────────────────────────────────
   P1 · 纯类型与纯常量层（新增）

   本文件**不含任何 fetch / import.meta.env / 业务副作用** ——
   页面组件（src/pages/*）只允许从这里 import 类型与常量，
   这是 P2 UMD 打包的前提：页面产物一旦引用 services/api.ts，
   就会把环境变量依赖（import.meta.env）和 HTTP 客户端整个打进卡片包。

   数据流向（P1 改造后）：
     宿主/容器（App.tsx）——fetch——> services/api.ts ——props——> pages/*
   页面 = 纯受控组件；写操作通过 onXxx 回调 prop 回到容器。
   ───────────────────────────────────────────────────────────────────────── */

/* ── 职业画像 ─────────────────────────────────────────────────────────── */

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

/* ── 学习路径 ─────────────────────────────────────────────────────────── */

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

/** 服务端 `update_task` 入参里的状态枚举。
 *  实测（09-17）三态均可写入，且**不是单向状态机** ——
 *  completed 之后仍可改回 in_progress（换 idempotency_key 即可）。
 *  未知值（如 "doing"）会被 zod 拦成 400，故前端只暴露这三个。 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

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

/* 「调整目标」的默认参数。
   保持与首次加载完全一致，这样用户打开弹窗但不改动岗位时，
   重新生成得到的路径与当前展示的一模一样 —— 不会出现"点了确定结果变了却又说不上哪里变了"。
   ⚠️ horizon_years / weekly_hours / priority 三个参数**后端当前不生效**
      （实测：horizon 传 1/3/5 阶段数恒为 3；weekly_hours 传 6/12/40 总时长恒为 45/125；
      priority 传 speed/depth/balanced 结果完全相同），
      因此弹窗里**不暴露这三个字段**，否则用户调完毫无变化，
      反而制造新的"点了没反应"。 */
export const DEFAULT_ROLE_ID = 'ROLE-AI-ALG'
export const DEFAULT_HORIZON_YEARS = 3
export const DEFAULT_WEEKLY_HOURS = 12
export const DEFAULT_PRIORITY = 'balanced' as const

/* ── 场景训练 ─────────────────────────────────────────────────────────── */

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

/* ── 成长进度 ─────────────────────────────────────────────────────────── */

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
  active_path: ActivePath | null
  persistence_mode: string
  disclaimer: string
}

/** 已激活路径的精简视图（`summary.active_path`）。
 *  ⚠️ 里程碑没有完成状态字段，所以这里只有任务粒度的计数。 */
export interface ActivePath {
  path_id: string
  title: string
  completed_tasks: number
  total_tasks: number
  progress_percent: number
}

/** `activate_path` 的返回：服务端回吐**整条已激活路径**（`active_path` 就是完整的 branch 结构，
 *  含每个 task 的最新 `status`）。
 *  → 这正是我们需要的"权威回读"：激活后不用自己猜哪些任务是完成的，
 *    直接用返回值覆盖本地列表即可，不会和真实进度漂移。 */
export interface ActivatePathResult {
  user_id: string
  action: string
  active_path: GeneratedPath & { target_role_id?: string; target_role_name?: string }
  persistence_mode: string
  disclaimer: string
}
