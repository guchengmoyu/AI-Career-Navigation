# 产品简介
接入支付宝支付 MCP，让你的智能体具备支付宝收单支付能力。目前支持在移动端及网页端场景下，为智能体提供**支付服务**、**支付查询**、**退款**及**退款查询**等功能。<font style="color:#000000;">本文将指导您在</font>**<font style="color:#000000;"> </font>**[百宝箱](https://b.tbox.cn)**<font style="color:#000000;"> </font>**<font style="color:#000000;">平台完成全流程接入。</font>

支付宝 AI 支付解决方案，以 MCP 组件形式向百宝箱开放集成。作为国内首家支持 MCP 协议的支付机构，商户创建订单、设定金额，用户在智能体内完成支付，全流程闭环。

说明：

+ 接入智能体个人收款业务，请前往 [智易收](https://opendocs.alipay.com/solution/0ilmhr?pathHash=9ffb2d89) 接入文档。

## 效果展示
**手机支付：**

![画板](https://intranetproxy.alipay.com/skylark/lark/0/2026/jpeg/169256446/1782298783096-c28aaaca-0a76-49c9-84a3-c92430939d42.jpeg)

**网页支付：**

| 智能体推荐服务，用户选购商品 | 点击立即支付，返回网页支付链接 | 进入网页支付，扫码完成付款 | 完成支付 |
| --- | --- | --- | --- |
| <img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299565995-cd2a85dd-86cc-4334-8937-0f2cc67aafe7.png" width="1000" title="" crop="0,0,1,1" id="u365c0337" class="ne-image"> | <img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299565801-98f31196-a4fa-46a9-9b5c-634f191d5b5d.png" width="969.5" title="" crop="0,0,1,1" id="u1c6a00eb" class="ne-image"> | <img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299565365-d6f41dd5-c2db-42b5-9e7a-6033bf4ec68c.png" width="755.5" title="" crop="0,0,1,1" id="u7beb8bad" class="ne-image"> | <img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299565828-e2671334-d543-425d-b1b2-cc1589510fe2.png" width="1067" title="" crop="0,0,1,1" id="u5d7d11e6" class="ne-image"> |


## 接入全景图
![画板](https://intranetproxy.alipay.com/skylark/lark/0/2026/jpeg/169256446/1782284005508-7ebd06a9-0f41-4b44-9b2a-30bd183f80cd.jpeg)

# 能力概览
本 MCP 提供 6 个工具，覆盖「下单 → 查询 → 退款」完整链路：

| 工具名称 | 功能说明 | 输入参数 | 输出 |
| --- | --- | --- | --- |
| `create-mobile-alipay-payment` | 创建手机网站支付订单，返回支付链接，适用于移动端场景 | `outTradeNo` 商户订单号   `totalAmount` 支付金额（元）   `orderTitle` 订单标题 | 支付链接的 Markdown 文本 |
| `create-web-page-alipay-payment` | 创建电脑网站支付订单，返回支付二维码，适用于桌面端场景 | `outTradeNo` 商户订单号   `totalAmount` 支付金额（元）   `orderTitle` 订单标题 | 支付链接的 Markdown 文本 |
| `create-alipay-payment-agent` | 个人开发者准入，创建个人收款订单，返回支付链接和二维码 | `outTradeNo` 商户订单号   `totalAmount` 支付金额（元）   `agentName` 智能体名称 | 移动端支付链接、支付二维码 |
| `query-alipay-payment` | 查询支付宝订单，返回交易状态和金额 | `outTradeNo` 商户订单号 | 交易状态、交易金额、支付宝交易号 |
| `refund-alipay-payment` | 对交易发起退款 | `outTradeNo` 商户订单号   `refundAmount` 退款金额（元）   `outRequestNo` 退款请求号   `refundReason` 退款原因（可选） | 支付宝交易号、退款结果 |
| `query-alipay-refund` | 查询退款状态和退款金额 | `outRequestNo` 退款请求号   `outTradeNo` 商户订单号 | 支付宝交易号、退款金额、退款状态 |


# 快速接入
## 准入条件
支持以下两种接入方式：

| 接入方式 | 适用对象 | 支付工具 |
| --- | --- | --- |
| **商户收单** | 支付宝企业账号、个体工商户 | `create-mobile-alipay-payment`（手机网站支付）   `create-web-page-alipay-payment`（电脑网站支付） |
| **智易收（个人收款）** | 支付宝个人账号 | `create-alipay-payment-agent`（智能体个人收款单） |


## 前提条件
在使用本服务前，请先在 [支付宝开放平台](https://open.alipay.com/) 完成 **第三方应用或网页/移动应用** 的接入，详见：[接入准备](https://opendocs.alipay.com/open/0h3he5?pathHash=87d45bc4)。

接入完成后，您需要准备以下参数用于百宝箱部署配置：

| 参数名 | 必填 | 说明 |
| --- | --- | --- |
| `AP_APP_ID` | 是 | 开发者在支付宝开放平台申请的应用 ID（APPID）。<br/>示例值：2021xxxxxxxx8009<br/><img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781094207768-8b106cab-203c-4421-a98a-2757c3c28222.png" width="2880" title="null" crop="0,0,1,1" id="XDgu7" class="ne-image"> |
| `AP_APP_KEY` | 是 | 由支付宝开放平台密钥工具生成的受限密钥对的私钥。<br/>示例值：MIIEvw.....kO71sA==<br/><img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1748500228832-2d8dd3c6-489c-4fd0-8eba-e47c47932ca8.png?x-oss-process=image%2Fformat%2Cwebp" width="772" title="null" crop="0,0,1,1" id="wKSpZ" class="ne-image"> |
| `AP_PUB_KEY` | 是 | 用于验证支付宝服务端数据签名的支付宝公钥，在支付宝开放平台获取。<br/>示例值：MIIBIjA......AQAB<br/><img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1748500023937-e91644f0-f8d0-409c-a6b8-b98f683eb544.png" width="987" title="null" crop="0,0,1,1" id="ZJ4dD" class="ne-image"> |


## 部署 MCP
### 平台代部署
**第 1 步：进入插件详情页**

访问 [支付宝支付 MCP Server](https://b.tbox.cn/inc/plugin-market/plugin-detail/20250413Ntmp04396666?pageFrom=fromPluginCard)，点击右侧 **一键部署**。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299565541-983213cc-b493-448e-870f-15bf2fd6b616.png" width="721" title="" crop="0,0,1,1" id="u8e3126f4" class="ne-image">

**第 2 步：填写配置参数**

在新建插件面板中，填写 `AP_APP_ID`、`AP_APP_KEY`、`AP_PUB_KEY` 三个参数，点击 **确认**。各参数值获取方式及说明请参见：[前提条件](#HpJ4p)。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781082769743-52bc8ac1-5257-44ca-9c31-85ff95150dfd.png" width="1227" title="null" crop="0,0,1,1" id="cehkw" class="ne-image">

**其他方式：**

平台代部署方式也支持在插件列表，选择「百宝箱一键部署MCP」后，填写部署服务配置，env参数配置详见：

```json
{
  "mcpServers": {
    "mcp-server-alipay": {
      "command": "npx",
      "args": [
        "-y",
        "@alipay/mcp-server-alipay"
      ],
      "env": {
        "AP_APP_ID": "2021xxxxxxxx8009",
        "AP_APP_KEY": "MIIEvw.....kO71sA==",
        "AP_PUB_KEY": "MIIBIjA......AQAB"
      }
    }
  }
}
```

**第 3 步：调试并发布**

系统自动完成部署后，依次点击工具列表中各工具的 **调试**，确认通过后点击右上角 **发布**。发布成功即可将该 MCP 添加到智能体中使用。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781082876621-ee6241fc-b68e-460d-8f73-8ca9abf506e5.png" width="1510" title="null" crop="0,0,1,1" id="q2HWP" class="ne-image">

### 自部署 MCP
若已在其他客户端完成支付宝 MCP Server 部署，并获取到 MCP URL，可在创建插件时选择「自部署MCP」，填写对应 URL 即可接入使用。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299567118-ac2fd3eb-d08b-40bd-a754-7c3c824684cb.png" width="725" title="" crop="0,0,1,1" id="u69e26e84" class="ne-image">

# 搭建案例
<font style="color:#000000;">以下案例展示如何使用支付 MCP 创建一笔网页支付订单。具体流程编排请根据您的实际业务场景调整。</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299566919-3fbcb46e-2c71-4a8a-8e4d-52872a1187cb.png" width="1434" title="" crop="0,0,1,1" id="ue0d5ca2c" class="ne-image">

**第 1 步：调用插件获取服务信息**

+ 通过「插件」获取付费服务，**<font style="color:#000000;">此处为您自己的业务服务节点（如知识付费、内容推荐等），请根据实际场景替换。</font>**

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299567075-ea21f1a1-6f87-42af-9187-0a8bb69029ca.png" width="1331" title="" crop="0,0,1,1" id="u485474ba" class="ne-image">

**第 2 步：调用支付MCP服务发起支付**

+ 通过「代码」获取用户query中的订单名称和支付金额，并生成唯一的订单号；
+ 通过「分支」判断消费端，如果是移动端，则通过`create-mobile-alipay-payment`工具创建一笔手机支付订单；如果是Web端，则通过`create-web-page-alipay-payment`工具创建一笔网页支付订单。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299567360-3a9a9baf-cf67-4733-9b9d-54c9fca743de.png" width="1430" title="" crop="0,0,1,1" id="ue59bbc50" class="ne-image">

智能体发起支付效果：[效果展示](#OCDPT)。同时支持通过支付 MCP 查询订单、发起退款、查询退款，助力智能体实现完整的交易闭环。

# 注意事项
1. 为了对密钥的安全有效管理，支付宝提供了受限密钥方案, 以实现智能体与非 Agent 研发业务系统的安全隔离。开发者需要在支付宝开放平台申请智能化场景受限密钥，具体流程见 [接入准备](https://opendocs.alipay.com/open/0h3he5?pathHash=87d45bc4)，请妥善保管你的私钥。
2. 商户订单号作为支付系统中商户交易的唯一标识，开发者需要确保其有效性（例如从真实的商户订单系统中获取），并在支付流程中正确传递。
3. 本文档提供的例子经过简化，在生产场景中，您需要合理使用 Agent 服务，防范 prompt injection 等风险。
4. MCP 工具支持配置使用，默认均允许调用，建议您根据使用场景仅开放必要工具供 Agent 调用，详见快速开始章节 AP_SELECT_TOOLS 说明。
5. 由于 Agent 的行为是非确定性的，我们建议您进行充分的测试，以确保服务的可靠性和安全性。
6. 本服务支持沙箱环境，建议先通过沙箱进行调试，可降低您的测试成本。
7. **更多信息**：可参见 [@alipay/mcp-server-alipay](https://www.npmjs.com/package/@alipay/mcp-server-alipay)。

# 常见问题
## 部署 MCP 服务进度卡在 80%
若部署进度停留在 80% 不再推进，请依次排查：

1. **检查开放平台接入是否完成**：确认已在支付宝开放平台完成应用创建、上线，并在商家平台开通 **手机网站支付** 或 **电脑网站支付** 产品，签约状态为"已生效"。
2. **检查受限密钥工具授权**：进入 开放平台 > 应用详情 > 开发设置 > 受限密钥，确认以下 6 个工具已勾选：

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782299567351-5a8272d6-12f6-4a2d-8814-bd97b85df734.png" width="720" title="" crop="0,0,1,1" id="u0a104ff9" class="ne-image">

---

<font style="color:#000000;">若您在使用过程中有任何疑问，欢迎扫码加入百宝箱AI支付支持群。</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782300626713-3a17061c-91ec-49a2-8d66-dda2a29d98a5.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_108%2Cw_712%2Ch_668" width="356" title="" crop="0,0.1392,1,1" id="u88fb43c3" class="ne-image">
