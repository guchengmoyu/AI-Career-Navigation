# A02 API 接口文档

## 一、接口规范总览

### 1.1 架构说明

本系统的 API 接口分为两层：

| 层次 | 说明 | 访问方式 |
|------|------|---------|
| **百宝箱平台层** | 智能体对话、知识库检索、工作流编排 | 百宝箱平台原生能力，无需自定义 API |
| **MCP 工具层** | 核心业务计算逻辑 | 通过 MCP 协议暴露，供百宝箱工作流调用 |
| **自定义前端 API** | 前端可视化页面数据接口 | RESTful API，前端直接调用 |

### 1.2 基础信息

| 项目 | 说明 |
|------|------|
| MCP 工具基础路径 | 通过百宝箱 MCP 协议对接 |
| 自定义前端 API 基础路径 | `/api/v1` |
| 协议 | HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | MCP 工具：百宝箱平台鉴权；前端 API：Bearer Token (JWT) |

### 1.3 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 1.4 通用错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-----------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证 / Token 过期 |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |
| 1001 | 400 | 手机号格式错误 |
| 1002 | 400 | 验证码错误 |
| 1003 | 400 | 手机号已注册 |
| 2001 | 400 | 画像数据不完整 |
| 2002 | 500 | 大模型调用失败 |
| 3001 | 400 | 目标职位不存在 |
| 3002 | 500 | 路径生成失败 |
| 4001 | 400 | 场景不存在 |
| 4002 | 500 | 场景模拟引擎错误 |

---

## 二、MCP 协议工具定义

### 2.1 概述

MCP（Model Context Protocol）工具是百宝箱平台调用自定义业务逻辑的标准方式。以下工具通过 MCP 协议注册到百宝箱插件模块中，供工作流节点调用。

### 2.2 职业画像相关工具

#### 2.2.1 calculate_career_profile — 计算职业画像

```json
{
  "name": "calculate_career_profile",
  "description": "根据用户问卷数据计算多维度能力评分，生成职业画像",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"},
      "questionnaire": {
        "type": "object",
        "properties": {
          "education": {
            "type": "object",
            "properties": {
              "level": {"type": "string", "description": "学历"},
              "major": {"type": "string", "description": "专业"},
              "school": {"type": "string", "description": "学校"}
            }
          },
          "skills": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {"type": "string"},
                "self_score": {"type": "number"}
              }
            }
          },
          "interests": {"type": "array", "items": {"type": "string"}},
          "values": {"type": "array", "items": {"type": "string"}},
          "experience": {"type": "array"}
        },
        "required": ["education", "skills"]
      }
    },
    "required": ["user_id", "questionnaire"]
  }
}
```

**返回值**：
```json
{
  "profile_id": 5001,
  "overall_score": 62.5,
  "dimension_scores": {
    "professional_skill": 75,
    "soft_skill": 60,
    "leadership": 45,
    "innovation": 70,
    "learning_ability": 80
  },
  "strengths": ["学习能力强", "逻辑思维好", "编程基础扎实"],
  "weaknesses": ["项目经验不足", "沟通表达待提升"],
  "recommended_directions": [
    {"position": "AI 工程师", "match_score": 82},
    {"position": "数据分析师", "match_score": 78}
  ]
}
```

#### 2.2.2 get_career_profile — 获取用户画像

```json
{
  "name": "get_career_profile",
  "description": "获取用户当前职业画像数据",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"}
    },
    "required": ["user_id"]
  }
}
```

### 2.3 学习路径相关工具

#### 2.3.1 generate_learning_path — 生成学习路径

```json
{
  "name": "generate_learning_path",
  "description": "基于用户画像和目标职位，生成个性化 3-5 年学习路径",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"},
      "target_position": {"type": "string", "description": "目标职位"},
      "target_industry": {"type": "string", "description": "目标行业"},
      "target_time_years": {"type": "integer", "description": "目标年限(1-5)"},
      "weekly_hours": {"type": "integer", "description": "每周学习时长(小时)"},
      "priority": {"type": "string", "enum": ["speed", "depth", "balanced"], "description": "优先级偏好"}
    },
    "required": ["user_id", "target_position"]
  }
}
```

**返回值**：
```json
{
  "path_id": 3001,
  "title": "AI 工程师成长路径（3 年规划）",
  "gap_analysis": {
    "critical_gaps": [
      {"skill": "深度学习", "current": 0, "target": 80, "gap": 80}
    ],
    "minor_gaps": [
      {"skill": "Python", "current": 75, "target": 90, "gap": 15}
    ]
  },
  "phases": [
    {
      "phase_order": 1,
      "title": "基础能力建设",
      "duration": 12,
      "milestones": ["完成 Python 进阶", "掌握线性代数基础"],
      "tasks": [
        {
          "task_order": 1,
          "title": "Python 编程进阶",
          "task_type": "course",
          "difficulty": "medium",
          "estimated_hours": 40,
          "platform": "Coursera"
        }
      ]
    }
  ]
}
```

#### 2.3.2 get_learning_path — 获取学习路径

```json
{
  "name": "get_learning_path",
  "description": "获取用户当前学习路径",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"}
    },
    "required": ["user_id"]
  }
}
```

#### 2.3.3 update_task_status — 更新任务状态

```json
{
  "name": "update_task_status",
  "description": "更新学习任务的状态和进度",
  "inputSchema": {
    "type": "object",
    "properties": {
      "task_id": {"type": "string", "description": "任务ID"},
      "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "skipped"]},
      "progress": {"type": "number", "description": "进度百分比(0-100)"},
      "user_feedback": {"type": "string", "description": "用户反馈"},
      "score": {"type": "number", "description": "完成评分"}
    },
    "required": ["task_id", "status"]
  }
}
```

#### 2.3.4 get_learning_progress — 获取学习进度

```json
{
  "name": "get_learning_progress",
  "description": "获取用户学习进度统计数据",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"}
    },
    "required": ["user_id"]
  }
}
```

**返回值**：
```json
{
  "total_hours": 120,
  "this_week_hours": 8,
  "streak_days": 15,
  "completed_tasks": 15,
  "total_tasks": 40,
  "current_phase_progress": 45.0,
  "weekly_trend": [
    {"week": "2025-W01", "hours": 5},
    {"week": "2025-W02", "hours": 8}
  ],
  "monthly_heatmap": {
    "2025-01-01": 120,
    "2025-01-02": 90
  }
}
```

### 2.4 场景模拟相关工具

#### 2.4.1 start_scenario_session — 开始场景模拟

```json
{
  "name": "start_scenario_session",
  "description": "创建新的场景模拟会话，初始化场景配置和角色设定",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"},
      "scenario_type": {
        "type": "string",
        "enum": ["remote_collab", "ai_office", "cross_role", "report", "interview"],
        "description": "场景类型"
      },
      "difficulty": {
        "type": "string",
        "enum": ["easy", "medium", "hard"],
        "description": "难度等级"
      }
    },
    "required": ["user_id", "scenario_type"]
  }
}
```

**返回值**：
```json
{
  "session_id": 7001,
  "scenario_type": "remote_collab",
  "ai_role": "后端工程师",
  "context": "你是一名前端开发工程师，需要在远程技术评审会议上，向后端同事提出一个新的用户画像 API 接口需求。",
  "first_message": "你好，我看了一下你的需求文档，有几个问题想确认一下。",
  "evaluation_dimensions": [
    {"key": "communication", "name": "沟通清晰度", "weight": 0.25},
    {"key": "technical", "name": "技术表达", "weight": 0.25},
    {"key": "requirement", "name": "需求完整性", "weight": 0.25},
    {"key": "collaboration", "name": "协作态度", "weight": 0.25}
  ]
}
```

#### 2.4.2 evaluate_scenario — 评估场景表现

```json
{
  "name": "evaluate_scenario",
  "description": "场景训练结束后，评估用户表现并生成评估报告",
  "inputSchema": {
    "type": "object",
    "properties": {
      "session_id": {"type": "string", "description": "场景会话ID"}
    },
    "required": ["session_id"]
  }
}
```

**返回值**：
```json
{
  "session_id": 7001,
  "overall_score": 77.5,
  "dimensions": {
    "communication": {"score": 80, "comment": "表达清晰，逻辑连贯"},
    "technical": {"score": 70, "comment": "技术方案合理，但部分数据缺乏支撑"},
    "requirement": {"score": 75, "comment": "需求描述较完整"},
    "collaboration": {"score": 85, "comment": "态度积极，善于倾听"}
  },
  "strengths": ["开场明确需求背景", "面对质疑保持冷静"],
  "improvements": ["建议附带性能测试数据", "主动询问对方技术顾虑"]
}
```

#### 2.4.3 get_scenario_history — 获取场景历史

```json
{
  "name": "get_scenario_history",
  "description": "获取用户场景模拟训练历史记录",
  "inputSchema": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "用户ID"},
      "scenario_type": {"type": "string", "description": "场景类型筛选（可选）"},
      "page": {"type": "integer", "description": "页码", "default": 1},
      "page_size": {"type": "integer", "description": "每页数量", "default": 10}
    },
    "required": ["user_id"]
  }
}
```

---

## 三、自定义前端 API

以下 API 供自定义 React 前端页面直接调用，用于可视化面板等需要自定义展示的场景。

### 3.1 用户认证接口

#### POST /api/v1/auth/register

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "Abc123456",
  "verify_code": "123456"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "user_id": 10001,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 604800
  }
}
```

#### POST /api/v1/auth/login

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "Abc123456"
}
```

### 3.2 可视化面板接口

#### GET /api/v1/dashboard/overview

**响应**：
```json
{
  "code": 200,
  "data": {
    "profile_snapshot": {
      "overall_score": 65.0,
      "dimension_scores": {"professional_skill": 78, "soft_skill": 62}
    },
    "path_progress": {
      "title": "AI 工程师成长路径",
      "overall_progress": 25.5,
      "current_phase": "基础能力建设"
    },
    "learning_stats": {
      "total_hours": 120,
      "this_week_hours": 8,
      "streak_days": 15
    },
    "recent_activities": [
      {"type": "task_complete", "title": "完成 Python 进阶", "time": "2025-01-15T10:00:00Z"}
    ],
    "upcoming_tasks": [
      {"title": "线性代数基础", "due_date": "2025-01-22", "type": "course"}
    ],
    "ai_reminder": "你已经连续学习 15 天了！接下来建议开始学习线性代数基础。"
  }
}
```

#### GET /api/v1/dashboard/skill-trend?months=6

#### GET /api/v1/dashboard/learning-stats?range=month

### 3.3 画像趋势接口

#### GET /api/v1/profile/trend?months=6

**响应**：
```json
{
  "code": 200,
  "data": {
    "snapshots": [
      {
        "date": "2025-01-01",
        "overall_score": 62.5,
        "dimension_scores": {"professional_skill": 75, "soft_skill": 60}
      },
      {
        "date": "2025-02-01",
        "overall_score": 65.0,
        "dimension_scores": {"professional_skill": 78, "soft_skill": 62}
      }
    ]
  }
}
```

#### GET /api/v1/profile/history?page=1&page_size=10

---

## 四、百宝箱平台原生能力（无需自定义 API）

以下功能由百宝箱平台原生提供，无需开发自定义 API：

| 功能 | 平台能力 | 说明 |
|------|---------|------|
| AI 对话 | 百宝箱智能体 | 多轮对话、上下文管理、流式输出 |
| 意图识别 | 工作流意图识别节点 | 自动识别用户意图并路由 |
| 知识检索 | 工作流知识库节点 | 语义检索 + 重排序 |
| 多角色切换 | 智能体角色配置 | 导师/伙伴/教练角色切换 |
| 多端发布 | 百宝箱发布模块 | Web/H5/小程序一键发布 |
| 用户认证 | 百宝箱平台 | 用户登录与会话管理 |

---

## 五、MCP 协议对接说明

### 5.1 对接流程

```
1. 开发 MCP 工具服务（Node.js + Express）
2. 实现上述 MCP 工具定义的接口
3. 在百宝箱平台注册 MCP 插件
4. 在工作流中添加 MCP 插件节点
5. 配置节点输入输出参数映射
6. 调试与测试
```

### 5.2 认证方式

- 百宝箱平台通过 MCP 协议的内置鉴权机制访问工具服务
- 工具服务需验证请求来源的合法性
- 用户身份信息通过 MCP 协议的上下文参数传递

### 5.3 异常处理

| 异常类型 | 处理方式 |
|---------|---------|
| 参数校验失败 | 返回 400 错误码 + 具体错误信息 |
| 数据库连接失败 | 返回 500 错误码，工作流中配置异常分支 |
| 业务逻辑错误 | 返回业务错误码 + 用户友好提示 |
| 超时 | 工作流节点配置超时时间（默认 30 秒） |
