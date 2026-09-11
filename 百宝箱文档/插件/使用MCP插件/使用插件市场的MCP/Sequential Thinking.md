## MCP 介绍
Sequential Thinking 是一个提供通过结构化思维过程进行动态和反思性问题解决的 MCP Server。适用于多种需要深度思考与逐步推理的场景。可以实现复杂问题的分步拆解与解决，并在过程中不断地加深自身理解，从而完善问题的解法，最终为用户生成经过验证的解决方案。

## 功能特性
+ <font style="color:rgb(31, 35, 40);">将复杂问题分解为可管理的步骤；</font>
+ <font style="color:rgb(31, 35, 40);">随着理解的加深，修改和完善想法；</font>
+ <font style="color:rgb(31, 35, 40);">分支出其他推理路径；</font>
+ <font style="color:rgb(31, 35, 40);">动态调整想法总数；</font>
+ <font style="color:rgb(31, 35, 40);">生成并验证解决方案假设。</font>

## 如何使用
官方已预部署该 MCP，**可直接添加到智能体使用**。

更多使用技巧请见 👉**  **[**百宝箱 MCP 使用指南**](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/huntb8/ze4r30n3msubshyq)

## 使用案例
让智能体调用 Sequential Thinking 处理问题。

### 提示词示例
```markdown
根据用户输入的内容，调用Sequential Thinking插件帮助用户解决问题。
```

### 效果展示
用户输入`中国各省和自治区（含台湾）的省会城市之间球面距离最远的两个城市是哪两个？球面距离通过两个城市的经纬度数据计算获得。请按照城市的维度由高到低输出城市名，用英文逗号隔开。`，智能体调用 Sequential Thinking 插件的效果如下。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1750412482682-c1741d2a-1d3e-457e-a4df-968a4b1fcecc.png" width="507.2" title="" crop="0,0,1,1" id="rs9DZ" class="ne-image">

通过运行分析我们可以看到，Sequential Thinking 在这个过程中执行了以下任务。

| **<font style="color:rgb(44, 44, 54);">步骤</font>** | **<font style="color:rgb(44, 44, 54);">当前任务</font>** | **<font style="color:rgb(44, 44, 54);">下一步计划</font>** | **<font style="color:rgb(44, 44, 54);">主要功能</font>** |
| --- | --- | --- | --- |
| <font style="color:rgb(44, 44, 54);">1</font> | <font style="color:rgb(44, 44, 54);">收集中国各省级行政区的省会/首府经纬度数据</font> | <font style="color:rgb(44, 44, 54);">准备计算球面距离</font> | <font style="color:rgb(44, 44, 54);">数据准备</font> |
| <font style="color:rgb(44, 44, 54);">2</font> | <font style="color:rgb(44, 44, 54);">计算所有城市之间的球面距离</font> | <font style="color:rgb(44, 44, 54);">找出距离最远的城市对</font> | <font style="color:rgb(44, 44, 54);">数学建模与计算</font> |
| <font style="color:rgb(44, 44, 54);">3</font> | <font style="color:rgb(44, 44, 54);">分析距离数据，找出最大值对应的城市组合</font> | <font style="color:rgb(44, 44, 54);">（任务完成）</font> | <font style="color:rgb(44, 44, 54);">结果输出</font> |



