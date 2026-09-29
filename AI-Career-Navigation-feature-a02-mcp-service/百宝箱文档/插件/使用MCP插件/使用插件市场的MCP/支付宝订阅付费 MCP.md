# 产品简介
<font style="color:#000000;">接入订阅付费MCP，让您的智能体具备支付宝收费能力，支持按次/按时长计费，无需自建支付系统。本文将指导您在</font>**<font style="color:#000000;"> </font>**[百宝箱](https://b.tbox.cn)**<font style="color:#000000;"> </font>**<font style="color:#000000;">平台完成全流程接入。</font>

<font style="color:#000000;">支付宝 AI 订阅付费解决方案，以 MCP 组件形式向百宝箱开放集成。商户创建订阅套餐、设定价格，用户在智能体内完成支付，全流程闭环。</font>

## 效果展示
![画板](https://cdn.nlark.com/yuque/0/2026/jpeg/29282973/1781230487589-7e8aa5ca-99ff-472e-a002-50314bdfe96c.jpeg)

## 接入全景图
![画板](https://cdn.nlark.com/yuque/0/2026/jpeg/29282973/1781194207836-0c594aef-8a6d-4fbb-a55b-2495b68c1f15.jpeg)

![画板](https://cdn.nlark.com/yuque/0/2026/jpeg/29282973/1781194164211-07c0e47a-335b-4d7d-b75e-042402aac0d4.jpeg)

# 能力概览
本 MCP 提供 3 个工具，覆盖「查询 → 下单 → 计次」完整链路：

| 工具名称 | 功能说明 | 输入参数 | 输出 |
| --- | --- | --- | --- |
| `query-alipay-subscription-status` | 查询用户是否为有效会员，返回有效期、剩余次数等 | `uuid` 客户账户<br/>`plan_id` 订阅计划 ID | 订阅状态及套餐信息 |
| `initialize-alipay-subscription-order` | 发起订阅付费，返回购买链接和定价配置 | `uuid` 客户账户<br/>`plan_id` 订阅计划 ID<br/>`agent_name` 智能体名称 | 购买链接、可订购套餐明细 |
| `times-alipay-subscription-consume` | 记录按次付费会员的使用次数消耗 | `uuid` 客户账户<br/>`plan_id` 订阅计划 ID<br/>`use_times` 消耗次数<br/>`<font style="color:rgba(0, 0, 0, 0.8);">out_request_no</font>`请求号 | 计次是否成功 |


# 快速接入
## 准入条件
支持的账号类型：**支付宝企业账号**、**个体工商户**、**支付宝个人账号**。

## 前提条件
在使用本服务前，请先在 [支付宝开放平台](https://open.alipay.com/) 完成 **第三方应用或网页/移动应用** 的接入，详见：[接入准备](https://opendocs.alipay.com/solution/0i40x9)。

接入完成后，您需要准备以下参数用于百宝箱部署配置：

| 参数名 | 必填 | 说明 |
| --- | --- | --- |
| `AP_APP_ID` | 是 | 开发者在支付宝开放平台申请的应用 ID（APPID）。<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781094207768-8b106cab-203c-4421-a98a-2757c3c28222.png" width="2880" title="null" crop="0,0,1,1" id="jrz75" class="ne-image"> |
| `AP_APP_KEY` | 是 | 由支付宝开放平台密钥工具生成的应用私钥。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1748500228832-2d8dd3c6-489c-4fd0-8eba-e47c47932ca8.png?x-oss-process=image%2Fformat%2Cwebp" width="772" title="null" crop="0,0,1,1" id="jIGjl" class="ne-image"> |
| `X_TOOLS_DEFAULT_VAL` | 是 | 百宝箱接入固定值（无需修改）：<br/>`eyJxdWVyeS1hbGlwYXktc3Vic2NyaXB0aW9uLXN0YXR1cyI6eyJjaGFubmVsIjoiVEJPWCJ9LCJpbml0aWFsaXplLWFsaXBheS1zdWJzY3JpcHRpb24tb3JkZXIiOnsiY2hhbm5lbCI6IlRCT1gifSwidGltZXMtYWxpcGF5LXN1YnNjcmlwdGlvbi1jb25zdW1lIjp7ImNoYW5uZWwiOiJUQk9YIn19` |


## 部署 MCP
### 平台代部署
百宝箱支持基于支付宝小程序云的一键部署，免去环境搭建和逻辑配置。

**第 1 步：进入插件详情页**

访问 [支付宝订阅付费 MCP](https://b.tbox.cn/inc/plugin-market/plugin-detail/20260414oX3d08085879?pageFrom=fromPluginCard)，点击右侧 **一键部署**。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781093083515-f77fbc3a-dde9-4553-9f25-4d3e7d7233b8.png" width="1511" title="null" crop="0,0,1,1" id="FQDvI" class="ne-image">

**第 2 步：填写配置参数**

在新建插件面板中，填写 `AP_APP_ID`、`AP_APP_KEY`、`X_TOOLS_DEFAULT_VAL` 三个参数，点击 **确认**。各参数值获取方式及说明请参见：[前提条件](https://yuque.antfin.com/baiyou.gyh/tkraie/fxcc2f7mqhr8u44p#v8r2N)。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781093120910-b073c991-245d-4d5d-b940-03ae456a08e5.png" width="1089" title="null" crop="0,0,1,1" id="wWblq" class="ne-image">

**第 3 步：调试并发布**

系统自动完成部署后，依次点击工具列表中各工具的 **调试**，确认通过后点击右上角 **发布**。发布成功即可将该 MCP 添加到智能体中使用。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193979439-9a86495b-24fd-437a-a947-0d6e1e8f78c6.png" width="1440" title="" crop="0,0,1,1" id="uf501a96b" class="ne-image">

**其他方式：**

平台代部署方式也支持在插件列表，选择「百宝箱一键部署MCP」后，填写部署服务配置，env参数配置详见[前提条件](#mjKY9)。

```json
{
  "mcpServers": {
    "alipay-mcp": {
      "command": "npx",
      "args": ["-y", "@alipay/open-mcp-server"],
      "env": {
        "AP_APP_ID": "20xxxxx672653",
        "AP_APP_KEY": "MIIEvxxxxx......",
        "X_TOOLS_DEFAULT_VAL": "eyJxdWVyeS1hbGlwYXktc3Vic2NyaXB0aW9uLXN0YXR1cyI6eyJjaGFubmVsIjoiVEJPWCJ9LCJpbml0aWFsaXplLWFsaXBheS1zdWJzY3JpcHRpb24tb3JkZXIiOnsiY2hhbm5lbCI6IlRCT1gifSwidGltZXMtYWxpcGF5LXN1YnNjcmlwdGlvbi1jb25zdW1lIjp7ImNoYW5uZWwiOiJUQk9YIn19"
      }
    }
  }
}
```

### 自部署 MCP 
若已在其他客户端完成支付宝 MCP Server 部署，并获取到 MCP URL，可在创建插件时选择「自部署MCP」，填写对应 URL 即可接入使用。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781082976843-1a023b8d-0597-4f60-b55e-560f6a1fdbc2.png" width="725" title="" crop="0,0,1,1" id="u396c0ba7" class="ne-image">

# 搭建案例
<font style="color:#000000;">以下案例展示如何使用 3 个 MCP 工具编排一个完整的订阅付费流程。具体流程编排请根据您的实际业务场景调整。</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193978755-76a26977-a752-495b-856d-842bd3ea7858.png" width="1439" title="" crop="0,0,1,1" id="ue1ca3810" class="ne-image">

**第 1 步：调用 **`**query-alipay-subscription-status**`**判断用户是否已订阅付费计划。**

+ 通过「插件」调用查询会员状态，传入用户 ID 和订阅计划 ID；
+ 通过「参数提取」节点提取插件返回会员状态；
+ 通过「分支」分流不同状态用户访问服务。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193978984-cd9eae3e-97c4-49e1-a7b6-885670a316ba.png" width="1440" title="" crop="0,0,1,1" id="uc85eb193" class="ne-image">

**第 2 步：未订阅 — 通过**`**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">initialize-alipay-subscription-order</font>**`**提供用户订阅付费服务。**

+ 通过「插件」发起付费订阅服务，传入智能体名称、用户 ID 和订阅计划 ID；
+ 通过「参数提取」节点提取插件返回付费订阅链接；
+ 通过「插件」获取知识付费服务，**<font style="color:#000000;">此处为您自己的业务服务节点（如知识付费、内容推荐等），请根据实际场景替换。</font>**

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193978862-9044786d-5795-4bf6-88a6-18596c84a87f.png" width="1432" title="" crop="0,0,1,1" id="u12ced6f1" class="ne-image">

效果：进行服务推荐，判断当前用户未订阅，发起订阅付费。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193978200-2e226835-a16b-46e5-be1b-3ad1d7e2f418.png" width="341.5" title="" crop="0,0,1,1" id="u3fcd8f41" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193979479-f9299c23-93da-4fc0-ba76-821008c91a94.png" width="325.5" title="" crop="0,0,1,1" id="u62587995" class="ne-image">

**第 3 步：已订阅，提供服务并调用**`**times-alipay-subscription-consume**`**记录消耗。**

+ 通过「插件」获取知识付费服务；
+ 通过「代码」生成下面服务的随机数；
+ 通过「插件」记录会员消耗次数。

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193980203-9b409d12-7c22-45cd-bc5c-d5f55a57cc5a.png" width="1422" title="" crop="0,0,1,1" id="u522b2715" class="ne-image">

# 注意事项
1. **密钥安全**：支付宝提供受限密钥方案，实现智能体与非 Agent 业务系统的安全隔离。请在开放平台申请智能化场景受限密钥（流程见 [接入准备](https://opendocs.alipay.com/solution/repo-03verb?pathHash=2aa6aa17)），并妥善保管私钥。
2. **安全防范**：本文示例经过简化，生产环境中请合理使用 Agent 服务，注意防范 prompt injection 等风险。
3. **工具权限**：MCP 工具默认均允许调用，建议根据使用场景仅开放必要工具。
4. **充分测试**：Agent 行为具有非确定性，请进行充分测试以确保服务可靠性和安全性。
5. **沙箱调试**：本服务支持沙箱环境，建议先通过沙箱进行调试，降低测试成本。

# 常见问题
## 费率
| 收费模式 | 费率 |
| --- | --- |
| 单笔费率 | 0.6%～1% |


当前产品在服务过程中会产生服务费，按单笔订单金额对应费率收费。支持的支付工具包括余额、银行卡（储蓄卡和信用卡）、花呗、花呗分期等，各行业费率不同，具体可查看 [支付宝标准服务费](https://b.alipay.com/page/product-mall/product-detail/I1080300001000060370/ALL?)。

**费率计算规则**：单笔订单交易服务费金额四舍五入，保留小数点后 2 位。计算示例：

| 交易金额（元） | 费率 | 应付服务费（元） | 实付服务费（元） | 到账金额（元） |
| --- | --- | --- | --- | --- |
| 1618 | 0.6% | 9.708 | 9.71 | 1608.29 |
| 1617 | 0.6% | 9.702 | 9.70 | 1607.30 |


> 解决方案实际计费以开通时签约的基础产品费率为准，可进入 **商家平台 > 账号中心 > 签约管理** 查看产品签约费率详情。
>

## 部署 MCP 服务进度卡在 80%
<font style="color:#000000;">若部署进度停留在 80% 不再推进，请依次排查：</font>

1. **<font style="color:#000000;">检查开放平台接入是否完成</font>**<font style="color:#000000;">：确认已在支付宝开放平台完成应用创建、上线及商家平台产品签约，签约状态为"已生效"。</font>
2. **<font style="color:#000000;">检查受限密钥工具授权</font>**<font style="color:#000000;">：进入 开放平台 > 应用详情 > 开发设置 > 受限密钥，确认以下 3个工具已勾选：</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1781193981257-b5547b38-81de-4d6a-a69a-03d99044ec45.png" width="1440" title="" crop="0,0,1,1" id="ubd8fe6b3" class="ne-image">

---

<font style="color:#000000;">若您在使用过程中有任何疑问，欢迎扫码加入百宝箱AI支付支持群。</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/29282973/1782300626713-3a17061c-91ec-49a2-8d66-dda2a29d98a5.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_108%2Cw_712%2Ch_668" width="356" title="" crop="0,0.1392,1,1" id="u88fb43c3" class="ne-image">
