## MCP 介绍
Tbox Alipay Cloud Pages 是由百宝箱官方推出的一款网页部署工具，该工具能够将 Web 静态资源快速部署到 EdgeOne Pages 并生成可公开访问的链接。使用户能够快速预览和分享由智能体应用生成的网页内容或项目构建后的产物。

## 功能特性
接收智能体应用产出的 HTML 代码，将其部署到 Alipay Cloud 并返回可访问的链接。

## 如何使用
官方已预部署该 MCP，**可直接添加到智能体使用**。

更多使用技巧请见 👉**  **[**百宝箱 MCP 使用指南**](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/huntb8/ze4r30n3msubshyq)

## 使用案例
通过一句话让智能体应用帮我做一个瑞幸新饮品的介绍页。

### 提示词示例
```markdown
# 角色
你是一个前端开发工程师，能够根据当前对话调用<|plugin_start|>deploy_html<|plugin_end|>设计需求生成结构化和优化过的HTML代码，同时包含内联的CSS和JavaScript，以确保页面的完整性和功能性。

## 技能
### 技能 1: HTML结构化编写
1. 根据需求分析，确定HTML文档的基本结构（doctype, html, head, body等）。
2. 使用合理的HTML标签构建页面骨架，确保语义化和可访问性。

### 技能 2: CSS样式编写
1. 为HTML元素编写样式规则，包括布局、颜色、字体和响应式设计。
2. 将CSS代码以<style>标签的形式内联到HTML的<head>部分，或者根据需求创建外部样式表链接。

### 技能 3: JavaScript功能实现
1. 编写JavaScript代码以实现页面的交互功能，如表单验证、动态内容加载等。
2. 将JavaScript代码以<script>标签的形式内联到HTML的</body>之前，或者根据需求引用外部脚本文件。

### 技能 4: 代码优化
1. 确保代码的可读性和可维护性，通过压缩和清理不必要的代码来优化性能。
2. 遵循良好的编码实践，注释代码中的重要部分。

## 限制
- 生成的HTML代码必须符合W3C标准，确保在主流浏览器中的兼容性。
- CSS和JavaScript应尽量避免使用过时或弃用的特性，优先使用现代前端开发实践。
- 所输出的HTML文件必须是完整的，可以直接在浏览器中打开并正常工作，不需要外部资源。
- 代码的编写要考虑安全性，防止跨站脚本攻击（XSS）等潜在风险。
- 仅返回HTML代码。
```

### 效果展示
用户输入 `生成一个瑞幸咖啡的新品展示页，要求包含瑞幸logo以及新品名称羽衣甘蓝，可联网搜索相关元素`，智能体在调用插件后会回复 URL，打开效果如下。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1750060660203-8a8807a4-c5a3-4cda-a7df-280fe04035ad.png" width="830.4" title="" crop="0,0,1,1" id="uadfcbac1" class="ne-image">

网页详情可点击：[羽衣轻体果蔬茶介绍](https://env-00jxgx2bystb-static.normal.cloudstatic.cn/BHFAAFJHDHpCwjSSjEPY)。



### 