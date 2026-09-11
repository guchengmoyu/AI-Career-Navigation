卡片作为智能体应用中消息交互的核心载体，支持开发者通过灵活编排输入框、图片、按钮、容器等可视化组件，自定义消息的呈现样式，从而有效提升用户交互体验。

为进一步降低卡片编排的开发成本，提升智能体应用的构建效率，百宝箱正式推出**AI 生成卡片**功能。该能力基于自然语言理解，可智能生成符合场景需求的卡片布局与组件配置，显著简化开发流程。

本文将详细介绍如何使用 AI 生成卡片功能，帮助开发者快速构建高效、美观的交互界面。

## 操作流程
![画板](https://cdn.nlark.com/yuque/0/2025/jpeg/1397496/1766572193963-2ddc9bc4-d668-4d80-a3d1-a2c9a49b205c.jpeg)

1. [生成卡片](#nfQWe)：根据自身需求生成并完成卡片调整。
2. [发布卡片](#lSqOJ)：发布卡片，将其推进至可用状态。
3. [使用卡片](#NadXy)：在智能体应用中引用卡片并根据说明文档完成变量配置，使其更加符合业务诉求。

## 操作步骤
### 步骤 1：生成卡片
1. 开发者访问[百宝箱卡片](https://b.tbox.cn/inc/card)。
2. 在卡片页面，点击右上角的**新建卡片** > **AI 生成** > **前往**。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766567194427-31c33fd3-935b-473d-b939-b5cbae77cf8b.png" width="1525.6" title="" crop="0,0,1,1" id="ucac7e63b" class="ne-image">
3. 在 AI 卡片生成页面的对话框中，使用自然语言描述需求，并点击右下角的<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1760669843891-5f848cc4-0e68-4013-b535-f0b74db1baf8.png" width="16" title="" crop="0,0,1,1" id="mzJuu" class="ne-image">。例如：`生成服务介绍卡片，需求为顶部卡片的标题，展示卡片的名称；下面一个服务的宣传图（可以示例一个景点的介绍图片） ，图片下方一段文字描述，最后一个行动按钮，展示查看详情`。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766567453979-29adcc87-c72b-4d38-81c1-ecdf1e5c0a55.png" width="1517.6" title="" crop="0,0,1,1" id="u1de99fc8" class="ne-image">
4. 此时，百宝箱会自动调用符合需求所需能力的智能体，进行业务处理。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766567398689-27eb6b38-c3bf-4b45-be7f-c272c99e20cb.png" width="1530.4" title="" crop="0,0,1,1" id="u247c21e2" class="ne-image">
5. 在完成内容生成时，提供效果预览能力。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766567875406-101ce75b-47ac-40f5-b5a5-d2e48475b3f8.png" width="1534.4" title="" crop="0,0,1,1" id="u39d5f6ae" class="ne-image">

### 步骤 2：发布卡片
在 AI 卡片生成页右上角，点击**发布**，并在卡片发布对话框中点击**确认发布**。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766567956285-944ba8bf-7974-4ce1-81df-65223d70985f.png" width="1533.6" title="" crop="0,0,1,1" id="u6a9d75c1" class="ne-image">

### 步骤 3：使用卡片
1. 通过工作流创建一个应用。
2. 在工作流编排面板分别添加代码节点与卡片节点。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1760671802356-79f62fc7-4a8c-4e46-b15d-8b8bbc8c83f8.png" width="1964.8" title="" crop="0,0,1,1" id="zCJbF" class="ne-image">

**获取入参**

3. 在流程逻辑编辑页，点击代码节点卡片，将其入参配置为大模型节点的输出结果，并点击在 IDE 中编辑。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766647543179-762b8456-d911-41d2-883a-01d3cc67ace5.png" width="2044.8" title="" crop="0,0,1,1" id="u32a37ba4" class="ne-image">
4. 在代码 IDE 中，点击编码助手下方的**获取入参** > **发送**按钮，快速生成**获取卡片所需参数**的 Python 代码。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766647654212-9ac7f107-5fd6-4e49-a50c-2888e9df8d8b.png" width="2007.2" title="" crop="0,0,1,1" id="u10f92777" class="ne-image">
5. 将生成的代码复制到代码编辑区域后，点击右上角的测试，输入入参后，点击运行，可查看代码运行效果。同时，您还可以点击 JSON 结果下方的**同步到节点输出项**快速进行代码节点的输出参数配置。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766647952018-afbd605e-1f0d-4824-9d65-b0753f5bfbd8.png" width="2003.2" title="" crop="0,0,1,1" id="u325653c9" class="ne-image">

**配置卡片**

6. 在流程逻辑面板，点击结束节点卡片 > 添加卡片消息并在我的卡片分页下找到目标卡片并完成参数配置。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766648141026-88a2c1cd-e527-4bf8-9e58-eff71eac45da.png" width="2043.2" title="" crop="0,0,1,1" id="u81d0bdd6" class="ne-image">
7. 在进行参数配置时，可点击链接图标，快速选择由代码节点输出的各项参数。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766648249943-5d5be8a0-124e-4d79-a9d9-0d4269a60acb.png" width="2048" title="" crop="0,0,1,1" id="ud4c977a7" class="ne-image">

:::info
**说明：**

各卡片所需的参数不尽相同，可在进行参数配置时，点击**使用说明**快速查看对应的参数说明及示例等内容。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766648344414-1c3cb50f-b73d-4006-b86b-747f4aaaa820.png" width="1021.6" title="" crop="0,0,1,1" id="u9ac80086" class="ne-image">

说明文档效果如下。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766648392794-4c0b6852-f477-4608-a6f3-af0021542879.png" width="1013.6" title="" crop="0,0,1,1" id="u785094b1" class="ne-image">

:::

8. 调试工作流，使其更加符合您的业务预期。
9. 调试无误后，点击右上角的**发布**，将应用发布至 H5 渠道，详细说明可参见：[投放 H5](https://alipaytbox.yuque.com/sxs0ba/huntb8/ut1m2mkx9g8hwc0b#BafRR)。

## 相关阅读
+ [AI 生成卡片 Prompt 编写攻略：快速生成你想要的卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_prompt_guide)。
