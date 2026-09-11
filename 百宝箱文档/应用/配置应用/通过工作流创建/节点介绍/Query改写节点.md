Query 改写（又称“多轮改写”）能力，旨在通过对用户当前提问结合历史对话上下文进行语义增强与结构补全，生成语义完整、指代明确、意图清晰的重写查询。从而提升下游任务的准确性与鲁棒性，确保系统能够在多轮交互过程中事中精准理解用户的真实意图。

### 添加 Query 改写节点
1. 开发者访问[我的应用](https://b.tbox.cn/inc/my)。
2. 在应用列表中，找到并进入目标工作流应用。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762930322318-1a5ff5b3-2cec-4fca-a5c4-2c9a8ceb8404.png" width="1532" title="" crop="0,0,1,1" id="vOUGm" class="ne-image">
3. 在工作流编排面板中，点击下方工具栏中的添加节点 > **Query 改写**。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1767075245159-d757400f-8858-4c62-8c3c-c2eb80df0922.png" width="1531.2" title="" crop="0,0,1,1" id="u3c8fa260" class="ne-image">
4. 根据自身诉求，完成节点间的串联。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1767075346213-954164d8-0a67-4962-a7a8-00808e5787da.png" width="1534.4" title="" crop="0,0,1,1" id="u153e1623" class="ne-image">

### 配置 Query 改写节点
1. 在流程配置面板中，找到并点击 **Query 改写**节点，唤起配置面板。
2. 在配置面板中，完成参考历史会话类型的配置即可。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1767075492281-370d9471-e019-4e76-92ac-2f1495e45127.png" width="1532.8" title="" crop="0,0,1,1" id="lZq8J" class="ne-image">

其中，支持选择的历史对话类型包括：

    - **<font style="color:rgb(38, 38, 38);">近几轮对话原文：</font>**<font style="color:rgb(38, 38, 38);">默认选取近几轮用户与智能体对话的原文内容进行 query 改写。 原文对话轮次配置说明可参见：</font>[开始节点携带历史对话轮数](https://alipaytbox.yuque.com/sxs0ba/huntb8/node_base#H01v5)<font style="color:rgb(38, 38, 38);">。</font>
    - **<font style="color:rgb(38, 38, 38);">历史会话摘要：</font>**<font style="color:rgb(38, 38, 38);">选取通过历史会话摘要能力处理的结果作为改写对象。在使用前，需要在配置中开启历史会话摘要能力。历史会话摘要配置的详细说明请参见：</font>[配置历史会话摘要](https://alipaytbox.yuque.com/sxs0ba/huntb8/workflow_setting_style#nEqAA)<font style="color:rgb(38, 38, 38);">。</font>
