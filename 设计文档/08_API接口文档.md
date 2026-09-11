# A02 API 接口文档

## 一、接口规范总览

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/api/v1` |
| 协议 | HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (JWT) |

### 1.2 通用请求头

| Header | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 是（登录接口除外） | `Bearer {token}` |
| `Content-Type` | 是 | `application/json` |
| `Accept` | 否 | `application/json` |
| `X-Request-Id` | 否 | 请求追踪 ID |

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
| 403 | 403 | 无权限 |
| 404 | 404 | 资源不存在 |
| 429 | 429 | 请求过于频繁 |
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

### 1.5 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `page_size` | int | 20 | 每页数量（最大 100） |

**分页响应**：
```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

---

## 二、用户模块接口

### 2.1 用户注册

```
POST /api/v1/auth/register
```

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

### 2.2 用户登录

```
POST /api/v1/auth/login
```

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "Abc123456"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "user_id": 10001,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 604800,
    "user": {
      "id": 10001,
      "nickname": "小林",
      "avatar_url": "https://...",
      "ai_style": "partner",
      "has_profile": false
    }
  }
}
```

### 2.3 获取用户信息

```
GET /api/v1/user/profile
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "id": 10001,
    "nickname": "小林",
    "avatar_url": "https://...",
    "phone_masked": "138****8000",
    "ai_style": "partner",
    "profile": {
      "gender": "male",
      "birth_year": 2003,
      "city": "杭州",
      "education": "bachelor",
      "major": "计算机科学",
      "school": "某 985 高校",
      "work_years": 0,
      "current_position": null,
      "target_position": "AI 工程师",
      "target_time_years": 3,
      "weekly_hours": 15
    }
  }
}
```

### 2.4 更新用户信息

```
PUT /api/v1/user/profile
```

**请求体**：
```json
{
  "nickname": "小林同学",
  "ai_style": "mentor",
  "profile": {
    "city": "上海",
    "target_position": "数据分析师",
    "weekly_hours": 20
  }
}
```

**响应**：
```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 2.5 更新用户技能

```
PUT /api/v1/user/skills
```

**请求体**：
```json
{
  "skills": [
    {"skill_name": "Python", "skill_category": "technical", "score": 75},
    {"skill_name": "Java", "skill_category": "technical", "score": 50},
    {"skill_name": "沟通表达", "skill_category": "soft", "score": 55},
    {"skill_name": "逻辑思维", "skill_category": "soft", "score": 80}
  ]
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "updated_count": 4,
    "profile_refreshed": true
  }
}
```

---

## 三、职业画像模块接口

### 3.1 提交问卷生成画像

```
POST /api/v1/profile/generate
```

**请求体**：
```json
{
  "questionnaire": {
    "education": {
      "level": "bachelor",
      "major": "计算机科学",
      "school": "某 985 高校",
      "gpa": 3.4
    },
    "skills": [
      {"name": "Python", "self_score": 75},
      {"name": "Java", "self_score": 50},
      {"name": "机器学习", "self_score": 30}
    ],
    "interests": ["AI", "数据分析", "后端开发"],
    "work_style": "collaborative",
    "values": ["growth", "creativity", "stability"],
    "experience": [
      {
        "type": "project",
        "title": "校内 AI 项目",
        "description": "基于 YOLO 的目标检测系统",
        "duration_months": 4
      }
    ]
  }
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
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
    "weaknesses": ["项目经验不足", "沟通表达待提升", "AI 专业知识较浅"],
    "recommended_directions": [
      {
        "position": "AI 工程师",
        "match_score": 82,
        "reason": "编程基础扎实，学习能力强，对 AI 有兴趣"
      },
      {
        "position": "数据分析师",
        "match_score": 78,
        "reason": "逻辑思维好，具备数据分析基础"
      },
      {
        "position": "后端开发工程师",
        "match_score": 75,
        "reason": "编程基础扎实，Java 有基础"
      }
    ],
    "ai_analysis": "综合分析您的教育背景、技能水平和兴趣偏好...",
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

### 3.2 获取当前画像

```
GET /api/v1/profile/current
```

**响应**：同 3.1 响应结构

### 3.3 获取画像历史版本

```
GET /api/v1/profile/history?page=1&page_size=10
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "profile_id": 5001,
        "version": 2,
        "overall_score": 65.0,
        "created_at": "2025-02-01T10:00:00Z",
        "trigger": "task_complete"
      },
      {
        "profile_id": 5000,
        "version": 1,
        "overall_score": 62.5,
        "created_at": "2025-01-01T10:00:00Z",
        "trigger": "initial"
      }
    ],
    "total": 2
  }
}
```

### 3.4 获取能力趋势数据

```
GET /api/v1/profile/trend?months=6
```

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

---

## 四、职业路径规划模块接口

### 4.1 生成学习路径

```
POST /api/v1/path/generate
```

**请求体**：
```json
{
  "target_position": "AI 工程师",
  "target_industry": "人工智能",
  "target_time_years": 3,
  "weekly_hours": 15,
  "priority": "balanced"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "path_id": 3001,
    "title": "AI 工程师成长路径（3 年规划）",
    "target_position": "AI 工程师",
    "total_duration": 36,
    "summary": "本路径基于您当前的能力画像，为您制定了从基础到求职的三阶段成长方案...",
    "gap_analysis": {
      "critical_gaps": [
        {"skill": "深度学习", "current": 0, "target": 80, "gap": 80},
        {"skill": "PyTorch", "current": 0, "target": 75, "gap": 75}
      ],
      "minor_gaps": [
        {"skill": "Python", "current": 75, "target": 90, "gap": 15}
      ],
      "ready_skills": [
        {"skill": "逻辑思维", "current": 80, "target": 70}
      ]
    },
    "phases": [
      {
        "phase_order": 1,
        "title": "基础能力建设",
        "duration": 12,
        "description": "夯实编程与数学基础，入门机器学习",
        "milestones": ["完成 Python 进阶", "掌握线性代数基础", "完成 ML 入门课程"],
        "tasks": [
          {
            "task_order": 1,
            "title": "Python 编程进阶",
            "task_type": "course",
            "difficulty": "medium",
            "estimated_hours": 40,
            "platform": "Coursera",
            "resource_url": "https://...",
            "status": "pending"
          }
        ]
      },
      {
        "phase_order": 2,
        "title": "专业方向深入",
        "duration": 15,
        "description": "深入学习深度学习框架与方向技术",
        "milestones": ["掌握 PyTorch", "完成 NLP/CV 项目", "阅读 5 篇论文"],
        "tasks": []
      },
      {
        "phase_order": 3,
        "title": "求职准备",
        "duration": 9,
        "description": "刷题、模拟面试、简历优化",
        "milestones": ["LeetCode 200+", "通过 3 次模拟面试", "获得实习/工作 Offer"],
        "tasks": []
      }
    ],
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

### 4.2 获取当前路径

```
GET /api/v1/path/current
```

**响应**：同 4.1 响应中 `data` 部分

### 4.3 获取路径详情

```
GET /api/v1/path/{path_id}
```

### 4.4 更新路径目标

```
PUT /api/v1/path/{path_id}/target
```

**请求体**：
```json
{
  "target_position": "数据科学家",
  "target_time_years": 4,
  "weekly_hours": 20
}
```

**响应**：重新生成路径，返回新路径数据

### 4.5 调整任务

```
PUT /api/v1/path/tasks/{task_id}
```

**请求体**：
```json
{
  "status": "completed",
  "progress": 100,
  "user_feedback": "课程质量不错，学到了很多",
  "score": 85
}
```

### 4.6 获取路径进度

```
GET /api/v1/path/{path_id}/progress
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "path_id": 3001,
    "overall_progress": 25.5,
    "current_phase": {
      "phase_order": 1,
      "title": "基础能力建设",
      "progress": 45.0
    },
    "completed_tasks": 8,
    "total_tasks": 35,
    "total_learning_hours": 52,
    "milestones_reached": 2,
    "milestones_total": 9,
    "days_active": 45
  }
}
```

---

## 五、场景模拟训练模块接口

### 5.1 获取场景列表

```
GET /api/v1/scenarios?page=1&page_size=20
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "scenario_type": "remote_collab",
        "name": "远程协作 - 技术方案讨论",
        "description": "模拟在远程会议中与后端同事讨论技术方案",
        "difficulty": "medium",
        "duration_min": 15,
        "target_skills": ["沟通能力", "技术表达", "协作效率"],
        "ai_roles": ["后端工程师", "产品经理"],
        "completed_count": 0
      },
      {
        "scenario_type": "ai_office",
        "name": "AI 辅助办公 - 数据分析报告",
        "description": "使用 AI 工具完成数据分析报告撰写",
        "difficulty": "easy",
        "duration_min": 10,
        "target_skills": ["AI 工具使用", "数据分析", "报告撰写"],
        "ai_roles": ["AI 助手"],
        "completed_count": 0
      },
      {
        "scenario_type": "cross_role",
        "name": "跨岗位沟通 - 需求评审",
        "description": "模拟向非技术人员解释技术方案",
        "difficulty": "hard",
        "duration_min": 20,
        "target_skills": ["跨领域沟通", "需求理解", "非技术表达"],
        "ai_roles": ["产品经理", "市场经理"],
        "completed_count": 0
      }
    ],
    "total": 5
  }
}
```

### 5.2 开始场景模拟

```
POST /api/v1/scenarios/start
```

**请求体**：
```json
{
  "scenario_type": "remote_collab",
  "difficulty": "medium"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "session_id": 7001,
    "scenario_type": "remote_collab",
    "ai_role": "后端工程师",
    "context": "你是一名前端开发工程师，需要在远程技术评审会议上，向后端同事提出一个新的用户画像 API 接口需求。后端同事对这个需求持保留态度...",
    "first_message": "你好，我看了一下你的需求文档，有几个问题想确认一下。这个新的接口和现有的用户信息接口有什么区别？为什么不直接扩展现有接口？",
    "evaluation_dimensions": [
      {"key": "communication", "name": "沟通清晰度", "weight": 0.25},
      {"key": "technical", "name": "技术表达", "weight": 0.25},
      {"key": "requirement", "name": "需求完整性", "weight": 0.25},
      {"key": "collaboration", "name": "协作态度", "weight": 0.25}
    ]
  }
}
```

### 5.3 发送场景消息

```
POST /api/v1/scenarios/{session_id}/message
```

**请求体**：
```json
{
  "content": "这个接口和现有的用户信息接口的主要区别在于数据维度不同。现有接口只返回基础信息，而新接口需要整合能力评估、兴趣偏好和市场匹配数据。扩展现有接口会导致接口响应时间过长，影响现有功能的性能。"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "message_id": 8001,
    "round": 2,
    "ai_response": "我理解你的考虑，但是分开两个接口也会带来数据一致性的问题。你有没有考虑过用异步聚合的方式来处理？另外，这个接口的调用频率大概是多少？我们需要评估一下对系统性能的影响。",
    "is_finished": false
  }
}
```

### 5.4 结束场景模拟并获取评估

```
POST /api/v1/scenarios/{session_id}/finish
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "session_id": 7001,
    "total_rounds": 6,
    "duration_seconds": 480,
    "evaluation": {
      "overall_score": 77.5,
      "dimensions": {
        "communication": {
          "score": 80,
          "comment": "表达清晰，逻辑连贯，能够有条理地阐述技术方案"
        },
        "technical": {
          "score": 70,
          "comment": "技术方案合理，但部分性能数据缺乏具体支撑"
        },
        "requirement": {
          "score": 75,
          "comment": "需求描述较完整，但未考虑到错误处理和边界情况"
        },
        "collaboration": {
          "score": 85,
          "comment": "态度积极，善于倾听，能够接受合理建议"
        }
      },
      "strengths": [
        "开场就明确了需求背景，节省了沟通时间",
        "面对质疑时保持冷静，给出了合理解释"
      ],
      "improvements": [
        "建议在提出需求时附带性能测试数据",
        "可以主动询问对方的技术顾虑"
      ],
      "recommended_resources": [
        {"title": "技术沟通的艺术", "type": "book", "url": "..."}
      ]
    }
  }
}
```

### 5.5 获取历史模拟记录

```
GET /api/v1/scenarios/history?page=1&page_size=10
```

---

## 六、AI 对话模块接口

### 6.1 发送对话消息

```
POST /api/v1/chat/message
```

**请求体**：
```json
{
  "conversation_id": "conv_abc123",
  "content": "我想了解一下 AI 工程师这个职业的发展前景",
  "ai_role": "mentor"
}
```

**响应（流式）**：
```json
{
  "code": 200,
  "data": {
    "message_id": 9001,
    "conversation_id": "conv_abc123",
    "role": "assistant",
    "content": "AI 工程师是当前最具发展潜力的职业之一。根据行业数据...",
    "ai_role": "mentor",
    "token_count": 350,
    "response_time_ms": 2500
  }
}
```

### 6.2 获取对话历史

```
GET /api/v1/chat/history?conversation_id=conv_abc123&page=1&page_size=20
```

### 6.3 获取对话列表

```
GET /api/v1/chat/conversations?page=1&page_size=10
```

### 6.4 创建新对话

```
POST /api/v1/chat/conversations
```

**请求体**：
```json
{
  "ai_role": "partner",
  "topic": "职业规划咨询"
}
```

---

## 七、学习管理模块接口

### 7.1 获取学习任务列表

```
GET /api/v1/learning/tasks?status=pending&page=1&page_size=20
```

### 7.2 更新任务状态

```
PUT /api/v1/learning/tasks/{task_id}
```

### 7.3 获取学习进度

```
GET /api/v1/learning/progress
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "total_hours": 120,
    "this_week_hours": 8,
    "streak_days": 15,
    "completed_tasks": 15,
    "total_tasks": 40,
    "current_phase_progress": 45.0,
    "weekly_trend": [
      {"week": "2025-W01", "hours": 5},
      {"week": "2025-W02", "hours": 8},
      {"week": "2025-W03", "hours": 12}
    ],
    "monthly_heatmap": {
      "2025-01-01": 120,
      "2025-01-02": 90,
      "2025-01-03": 0
    }
  }
}
```

### 7.4 记录学习时间

```
POST /api/v1/learning/record
```

**请求体**：
```json
{
  "task_id": 4001,
  "title": "Python 进阶 - 第 3 章",
  "duration_min": 45,
  "notes": "学习了装饰器和上下文管理器",
  "record_date": "2025-01-15"
}
```

### 7.5 获取学习资源推荐

```
GET /api/v1/learning/resources?task_id=4001
```

---

## 八、可视化面板模块接口

### 8.1 获取成长总览

```
GET /api/v1/dashboard/overview
```

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
      {"type": "task_complete", "title": "完成 Python 进阶", "time": "2025-01-15T10:00:00Z"},
      {"type": "scenario", "title": "远程协作场景", "time": "2025-01-14T15:00:00Z"}
    ],
    "upcoming_tasks": [
      {"title": "线性代数基础", "due_date": "2025-01-22", "type": "course"}
    ],
    "ai_reminder": "你已经连续学习 15 天了！接下来建议开始学习线性代数基础。"
  }
}
```

### 8.2 获取能力变化趋势

```
GET /api/v1/dashboard/skill-trend?months=6
```

### 8.3 获取学习统计

```
GET /api/v1/dashboard/learning-stats?range=month
```

---

## 九、系统管理接口

### 9.1 知识库管理

```
GET    /api/v1/admin/knowledge/jobs          # 获取职业数据列表
POST   /api/v1/admin/knowledge/jobs          # 添加职业数据
PUT    /api/v1/admin/knowledge/jobs/{id}     # 更新职业数据
DELETE /api/v1/admin/knowledge/jobs/{id}     # 删除职业数据

GET    /api/v1/admin/knowledge/skills        # 获取技能数据列表
POST   /api/v1/admin/knowledge/skills        # 添加技能数据
```

### 9.2 场景配置管理

```
GET    /api/v1/admin/scenarios               # 获取场景配置列表
PUT    /api/v1/admin/scenarios/{type}        # 更新场景配置
```

### 9.3 数据统计

```
GET /api/v1/admin/stats/users               # 用户统计
GET /api/v1/admin/stats/usage               # 使用统计
```

---

## 十、MCP 协议对接接口

### 10.1 MCP 工具定义

```json
{
  "tools": [
    {
      "name": "get_career_profile",
      "description": "获取用户职业画像",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string", "description": "用户ID"}
        },
        "required": ["user_id"]
      }
    },
    {
      "name": "generate_learning_path",
      "description": "生成个性化学习路径",
      "inputSchema": {
        "type": "object",
        "properties": {
          "target_position": {"type": "string", "description": "目标职位"},
          "time_years": {"type": "integer", "description": "目标年限"}
        },
        "required": ["target_position"]
      }
    },
    {
      "name": "start_scenario",
      "description": "开始职场场景模拟",
      "inputSchema": {
        "type": "object",
        "properties": {
          "scenario_type": {"type": "string", "enum": ["remote_collab", "ai_office", "cross_role"]},
          "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]}
        },
        "required": ["scenario_type"]
      }
    },
    {
      "name": "get_learning_progress",
      "description": "获取学习进度",
      "inputSchema": {
        "type": "object",
        "properties": {}
      }
    }
  ]
}
```
