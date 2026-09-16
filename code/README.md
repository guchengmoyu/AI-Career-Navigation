# AI 职业导航与终身学习伙伴系统

面向未来工作的 AI 职业导航系统 - 数字马力杯参赛作品

## 当前可运行结构（A02 MCP 版）

```
code/
├── mcp-server/           # Node.js 22 + MCP SDK 1.22.0
│   ├── src/              # 四工具、REST 适配层和数据库导入器
│   ├── data/             # v0.5-core 精简运行数据及 SHA-256
│   └── db/               # MySQL 8.0 schema 1.2.0
├── frontend/             # React + Vite 展示前端
└── backend/              # 旧版 Flask 原型，仅保留参考
└── README.md            # 项目说明
```

## 快速开始

### 1. 启动 MCP/REST 服务

```bash
cd code/mcp-server
npm ci
npm run check
npm run start:rest
```

REST 服务默认监听 `http://localhost:3000`。stdio MCP 启动命令为：

```bash
npm start
```

### 2. 启动 React 前端

```bash
cd code/frontend
npm ci
npm run dev
```

浏览器访问 `http://localhost:5173`。开发代理会把 `/api` 转发到 REST 服务。

## 技术栈

- **MCP/REST**：Node.js 22、TypeScript、MCP SDK 1.22.0、Express
- **前端**：React、TypeScript、Vite、ECharts
- **可选数据库**：MySQL 8.0（第一版默认使用只读数据 + 临时覆盖层）
- **部署目标**：蚂蚁百宝箱 `npx` MCP

## 四个 MCP 工具

- `calculate_career_profile`：8 维画像及岗位匹配解释
- `generate_career_path`：快速补差、项目驱动双路线
- `evaluate_scenario`：场景列表、开始及五维评估
- `manage_progress`：进度汇总、事件、任务及路线激活

详细运行、参数和百宝箱部署说明见 [`mcp-server/README.md`](mcp-server/README.md)。当前仅处理模拟用户；容器写入是演示级临时状态。
