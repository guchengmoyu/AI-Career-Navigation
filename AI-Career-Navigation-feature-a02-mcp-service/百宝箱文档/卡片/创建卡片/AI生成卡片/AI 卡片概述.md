**卡片**是智能体应用中消息交互的核心载体。开发者可通过灵活编排输入框、图片、按钮、容器等可视化组件，自定义消息的呈现样式，从而显著提升用户交互体验。

## 功能简介
为降低卡片开发门槛、提升智能体应用的构建效率，百宝箱全新推出** AI 卡片**功能。该功能以自然语言描述为基础，融合智能设计、交互逻辑构建与多端自适应能力，支持“AI 自动生成 + 人工精修”的高效协同创作模式。在大幅减少开发成本的同时，也为开发者提供细粒度的定制能力，确保卡片既能高效产出，又可精准满足业务需求。

## 功能特性
### 语言驱动，极简输入
**能力说明**

+ 用户通过一句自然语言的描述（如“生成一个热门景点介绍卡片”），即可触发 AI 自动生成对应的卡片初稿。
+ 无需掌握代码或复杂配置，可大幅降低卡片的构建门槛。

**操作指引**

1. 开发者访问** AI 生成卡片页面**。
2. 在输入框输入卡片需求描述，点击发送图标，系统将立即执行对应的生成任务，并将结果返回。

更多生成技巧可参见：[如何快速生成你想要的卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_prompt_guide)。

### 遵循平台级 UI 规范
**能力说明**

基于语义理解，自动匹配合理布局、配色、字体等样式，遵循平台级 UI 设计规范。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766570970932-37fecfd8-75af-4496-91fb-d5ed8dc6a97b.png" width="337.3999938964844" title="" crop="0,0,1,1" id="uc212c6ce" class="ne-image">

非规范样式

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766571022279-ef4a8d47-e542-4cf7-94d1-5bad5b4d993c.png" width="669.6" title="" crop="0,0,1,1" id="uf4d75753" class="ne-image">

规范样式

### 自动生成配套文档
自动识别并生成卡片所含变量的说明文档，为后续数据绑定奠定基础。

**操作指引**

在卡片使用的配置面板，会自动透出卡片设计的变量**使用说明**文档链接，点击可查看具体的变量说明。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766565352105-a1ad1323-e90e-4771-be1b-ee086e334877.png" width="1020.8" title="" crop="0,0,1,1" id="u2eece65d" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564304957-b5ad35f4-e201-4ed4-86bb-d6d29b49f00e.png" width="2042" title="" crop="0,0,1,1" id="ub6af44cd" class="ne-image">

### 使用卡片支持预览
**能力说明**

除了在生成卡片过程中支持实时预览外，百宝箱还支持在卡片引用及变量配置过程中，预览卡片样式，实现所见即所得。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766571480992-421d3f03-ab7a-45d7-b846-d04bd927b32b.png" width="1021.6" title="" crop="0,0,1,1" id="u9afb1b77" class="ne-image">

### 支持生成卡片的点击事件
**能力说明**

生成的卡片不再是静态图片，而是支持点击跳转、按钮响应等点击事件的动态卡片。当前已经支持的点击事件包括**消息回复**、**拨打电话**、**打开链接**、**半屏弹窗**、**地图导航**以及**填充输入框**，效果如下所示。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564087826-1d28b3a5-c31e-4fd8-b6c7-2c93244e7599.png" width="414.4" title="" crop="0,0,1,1" id="u343050bd" class="ne-image">

消息回复

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564057909-87d34d19-bff0-4e8a-8812-01b1997e0f41.png" width="411.2" title="" crop="0,0,1,1" id="u63592943" class="ne-image">

拨打电话

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564132639-c42be053-e157-4c55-abc0-e1a1fd85a608.png" width="413.6" title="" crop="0,0,1,1" id="u9436f628" class="ne-image">

打开链接

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564170740-98c9a982-7361-4c28-ba2c-7d0a33693b6b.png" width="413" title="" crop="0,0,1,1" id="ued68d0ad" class="ne-image">

输入填充

### 多端分发，生态兼容
**能力说明**

一次创作可发布至支付宝小程序、H5 页面以及后续将会推出的微信小程序等多个平台或终端，系统自动适配各端卡片规范，避免重复开发。 

**操作指引**

+ [使用 AI 生成 H5 卡片。](https://alipaytbox.yuque.com/sxs0ba/huntb8/best_practices_generate_cards_with_ai)
+ [使用 AI 生成支付宝小程序卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/gqkp178zl3zod2hg)。

### 代码级与 UI 级的灵活调优
**能力说明**

支持对 AI 生成的卡片进行精细化调整，并提供历史版本回溯能力，确保卡片可配置以、可追溯。

**操作指引**

+ **局部修改（UI 级）：**在卡片预览界面，点击**局部修改 **> 选中卡片内**组件元素** > 输入修改需求 > 点击发送图标 > 完成调整。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766564579256-89fae5c2-3fd8-449c-b1f9-ba8fb9328e6d.png" width="1532.8" title="" crop="0,0,1,1" id="jYmXl" class="ne-image">
+ **代码导入（代码级）：**在卡片预览界面，点击右上角的代码导入，可将本地代码导入至百宝箱，实现代码级调整。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766571947706-5131b803-587e-4e92-8805-6471efe2f063.png" width="1529.6" title="" crop="0,0,1,1" id="uc86426ff" class="ne-image">

### 历史回溯，版本可控
提供卡片生成历史的版本回溯能力，确保卡片可配置、可追溯，降低误操作风险，提升开发效率。

**操作指引**

在卡片预览界面，点击右上角的 <img src="https://cdn.nlark.com/yuque/0/2026/svg/1397496/1767841253952-0300bdec-c4de-42f7-8434-7c3a324aa2d7.svg" width="16" title="" crop="0,0,1,1" id="ub0bb71d7" class="ne-image">，可查看当前卡片的生成记录。点击目标记录项中的**回退**，可进行版本回退，<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767841531878-ff9d39f9-c0c2-4454-ba7a-059510373bfe.png" width="1531.2" title="" crop="0,0,1,1" id="u82af7836" class="ne-image">

## 如何使用
+ [使用 AI 生成 H5 卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/best_practices_generate_cards_with_ai)
+ [使用 AI 生成支付宝/微信小程序卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/gqkp178zl3zod2hg)

## 联系我们
若您在使用 AI 生成卡片能力的过程中，遇见任何问题或有任何意见与建议，都可以使用钉钉扫描下方二维码，进入官方群聊与我们取得联系。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762237697835-e42092f5-2651-4495-ba79-e02f419ee1fd.png?x-oss-process=image%2Fcrop%2Cx_34%2Cy_246%2Cw_525%2Ch_566" width="250" title="" crop="0.0574,0.1922,0.9443,0.6344" id="UrJ6g" class="ne-image">


