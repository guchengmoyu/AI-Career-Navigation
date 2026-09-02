# AI 职业导航与终身学习伙伴系统

面向未来工作的 AI 职业导航系统 - 数字马力杯参赛作品

## 项目结构

```
code/
├── backend/              # 后端服务
│   ├── app.py           # Flask 主应用
│   └── requirements.txt # Python 依赖
├── frontend/            # 前端页面
│   ├── index.html       # 主页面
│   ├── css/
│   │   └── style.css    # 样式文件
│   ├── js/
│   │   └── main.js      # 交互逻辑
│   └── assets/          # 静态资源
└── README.md            # 项目说明
```

## 快速开始

### 1. 安装后端依赖

```bash
cd code/backend
pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
cd code/backend
python app.py
```

服务将在 http://localhost:5000 启动

### 3. 访问页面

浏览器打开 http://localhost:5000 即可查看系统页面

## 技术栈

- **后端**: Python Flask
- **前端**: HTML5 + CSS3 + JavaScript
- **平台**: 蚂蚁百宝箱企业版

## 开发说明

当前为基础框架版本，后续将逐步添加：
- 动态职业画像构建
- 个性化学习路径生成
- 职场场景模拟训练
- 成长轨迹可视化
- 第三方平台对接
- 多端发布支持
