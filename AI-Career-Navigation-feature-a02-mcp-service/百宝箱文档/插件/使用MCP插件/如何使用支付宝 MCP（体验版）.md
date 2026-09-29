视频版讲解如下👇，如果喜欢文字版教程，可以直接跳过视频教程😊

[bilibili](https://player.bilibili.com/player.html?bvid=BV1XjoWYBEHe&autoplay=0)

# 使用须知
:::tips
+ 为了对密钥的安全有效管理，请妥善保管你的私钥，您可在本地部署 MCP Server 时进行配置，请勿将私钥托管给三方平台。
+ 我们建议您为 AI 智能体研发申请独立的开放平台应用，以实现智能体与非 Agent 研发业务系统的安全隔离。
+ 商户订单号作为支付系统中商户交易的唯一标识，开发者需要确保其有效性（例如从真实的商户订单系统中获取），并在支付流程中正确传递。
+ 本文档提供的例子经过简化，在生产场景中，您需要合理使用 Agent 服务，防范 prompt injection 等风险。
+ 本服务工具支持配置使用，默认均允许调用，建议您根据使用场景仅开放必要工具供 Agent 调用，详见快速开始章节 AP_SELECT_TOOLS 说明。
+ 由于 Agent 的行为是非确定性的，我们建议您进行充分的测试，以确保服务的可靠性和安全性。
+ 本服务支持沙箱环境，建议先通过沙箱进行调试，可降低您的测试成本。

:::

:::color2
<font style="color:rgb(0, 0, 0);">📌</font><font style="color:rgb(0, 0, 0);"> 提示：支付宝 MCP 服务（体验版）仅用于在百宝箱内测试体验，您所支付的款项会在次日自动退款至原账户。</font>

:::

# 使用指南
# 在「简单构建」中体验支付宝 MCP 
## 新建应用
点击「新建应用」，应用类型选择「对话型」应用，构建方式选择「简单构建」 ，并填写应用名称、应用功能介绍等。

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744639550765-f3b39060-3b45-439b-9002-bcb150e871e2.png" width="1650" title="" crop="0,0,1,1" id="u289020d4" class="ne-image">



## 添加支付宝 MCP 插件
1. 在 **知识&技能 **板块找到**「插件」**，点击右上角的 `+` 添加插件

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744641336068-aca94780-36d8-4e11-83d9-5313b9ea0d21.png" width="1680" title="" crop="0,0,1,1" id="u4e557793" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744641305743-11811216-3bc5-4228-97b0-4d62f6fae94c.png" width="856" title="" crop="0,0,1,1" id="u3f3acee7" class="ne-image">

2. 在插件商店中添加支付宝 MCP Server（体验版）：
+ 在弹窗的插件商店中，切换到 **MCP插件 **专区
+ 找到 **<font style="color:#2F8EF4;">支付宝 MCP Server (体验版)</font>**，点击展开后，可查看具体的工具列表
+ 点击右侧的 **添加 **按钮即可完成插件配置

:::color1
注意：「支付宝 MCP Server(体验版)」仅用于测试体验，绑定的账户为测试商户账号，所有支付订单都会付款至测试账号，无法转到创作者个人，且无法进行提现操作，请不要用于真实生产场景使用。

:::



## 配置调用插件的角色与指令
<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744641662333-18e8b6d2-ae21-4e46-9955-ccccfeb561f8.png" width="1680" title="" crop="0,0,1,1" id="u015f8a4f" class="ne-image">

在使用 **<font style="color:#2F8EF4;">支付宝 MCP Server (体验版) </font>**时，「角色与指令」内容**请重点参考如下实例**：

```markdown
# 角色
你是一个才华横溢的诗人，以创作诗歌为主。你能够根据用户给定的主题进行诗歌创作，并提供收费服务。你可以为用户提供一次免费的作诗服务，然后后续每次作诗前，都需要收费 0.01 元后才进行作诗。

## 技能
### 技能1：主題創作
1. 理解用户给定的主题，结合中国古典韵律和意境进行创作。
2. 创作的诗歌需符合基本的审美，内容要与主题相契合，具有一定的文学价值。

### 技能 2：用户交互
1.使用亲切温柔的语气与用户交流，解释清楚收费机制。
2. 在用户同意充值后，迅速生成支付链接，并指导用户完成付款。

### 技能3：充値与退款管理
1. 首先询问用户当前在手机端支付还是在网页端支付，
- 如果选择手机端支付，调用 <|plugin_start|>create-mobile-alipay-payment<|plugin_end|>  创建订单并获取支付链接，并提示用户完成充值后回复一句“我已付款”
- 如果选择网页端支付，调用<|plugin_start|>create-web-page-alipay-payment<|plugin_end|>创建订单并获取支付链接，并提示用户完成充值后回复一句“我已付款”
2. 用户回复“我已付款”后，调用 <|plugin_start|>query-alipay-payment<|plugin_end|> 查询订单状态，确保用户充值成功后，才进行诗歌创作，同时你需要告知用户本次充值订单的金额、商户订单号和支付宝交易号。
3. 用户申请退款时，你需要调用<|plugin_start|>refund-alipay-payment<|plugin_end|>工具，应该退回剩余金额，也就是用户充值总金额减去已经消耗的总金额，退款完成后需告知用户你本次申请退款的商户订单号、退款请求号和支付宝交易号
4. 用户查询退款信息时，你需要调用<|plugin_start|>query-alipay-refund<|plugin_end|>工具，使用发起退款时的 outOrderNo 和 outRequestNo 发起查询，注意参数对应

### 技能 4：订单生成
1.根据情境以及随机的 12 位数字或字母生成唯一的订单号。
2.设定订单金额在 0.01 元，并按照情境生成相应的订单标题。

## 限制
- 仅在用户完成充值后才提供创作服务。
- 首次作诗服务免费，后续每次创作扣除 0.01 元。
- 必须始终保持亲切温柔的交流语气，确保用户良好的服务体验
```

## 添加支付卡片，让移动端支付体验更佳
支付链接有时候会很长，模型可能将链接处理成看起来不可点击的展示效果，而非易于识别的超链接，此时推荐绑定官方卡片搭配使用：

+ 在`**创建手机支付**`的支付宝 MCP 插件工具上 hover 点击`**配置卡片**`按钮

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744790715768-0b96b16c-c268-436c-a4f4-cdff3fc6005e.png" width="934" title="" crop="0,0,1,1" id="d0zRw" class="ne-image">

+ 切换到「**官方卡片」**，选择「**<font style="color:#117CEE;">支付卡片</font>**」
+ 配置「**关联的工具输出参数**」，选择`result`，点击`确定`保存配置

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744790715717-37a03864-7306-4618-9907-a676f2c08166.png" width="1456" title="" crop="0,0,1,1" id="bfsW8" class="ne-image">

✅ 即可在小程序上的对话中调试，在手机支付时，展示支付卡片

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744792044518-3a7274bf-0c1b-4074-9dce-be5162902626.png" width="197.5" title="" crop="0,0,1,1" id="ufd397e28" class="ne-image">

:::color1
即将支持 PC 端支付卡片

:::

## 🔥常见问题
### ❶ 如何区分 PC 支付链接/手机支付链接？
在提示词中引导大模型：<font style="color:rgb(0, 0, 0);">创建订单前，先询问用户要在哪里支付，并根据支付的端，创建订单并获取支付链接。</font>

:::tips
eg：创建订单前，先询问用户要在哪里支付，如果用户选择手机端，则调用<|plugin_start|>create-mobile-alipay-payment<|plugin_end|>（创建手机支付）创建订单并获取支付链接，提供给用户；如果用户选择网页端，调用 <|plugin_start|>create-web-page-alipay-payment<|plugin_end|>创建订单并获取网页支付链接，提供给用户。

:::



# 在「工作流」中体验支付宝 MCP
## 新建工作流应用
点击「新建应用」，应用类型选择「对话型」应用，构建方式选择「工作流」 ，并填写应用名称、应用功能介绍等。

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744639550815-fd178b6c-36dd-4f98-b667-1809cce230ba.png" width="1425" title="" crop="0,0,1,1" id="u7acbbb2a" class="ne-image">



##  添加支付宝 MCP 插件节点使用
1. 在工作流中添加 **插件节点**：

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744639552267-bde56570-df45-40c9-9c48-406ea026f71a.png" width="1337" title="" crop="0,0,1,1" id="uccd53ca6" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744641788130-c77e4502-126e-444c-98e9-4064739a1ea7.png" width="1470" title="" crop="0,0,1,1" id="u9bd08243" class="ne-image">

2. 在插件商店中添加支付宝 MCP Server（体验版）：
+ 在弹窗的插件商店中，切换到 **MCP插件 **专区
+ 找到 **<font style="color:#2F8EF4;">支付宝 MCP Server (体验版)</font>**，点击展开后，可查看具体的工具列表
+ 点击右侧的 **添加 **按钮即可完成插件配置

:::color1
注意：**支付宝 MCP Server(体验版) **仅用于测试体验，绑定的账户为测试商户账号，所有支付订单都会付款至测试账号，无法转到创作者个人，且无法进行提现操作，请不要用于真实生产场景使用。

:::



## 🔥常见问题
### ❶ 如何区分 PC 支付链接/手机支付链接
打开`系统及环境信息`

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744792754986-c177071a-a46c-4164-908b-56327ba8b7f3.png" width="1459" title="" crop="0,0,1,1" id="u52b353e1" class="ne-image">

+ 在系统及环境信息中打开`运行环境`

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744792710171-0bace4c1-9619-4266-afc2-5e2151d7288b.png" width="1470" title="" crop="0,0,1,1" id="ud4e446d9" class="ne-image">

+ 添加分支节点⬇️，配置

:::color1
<font style="background-color:#2F8EF4;"> </font> 如果

   **<font style="color:#117CEE;background-color:#CEF5F7;">运行环境 </font>**`等于``固定`「Web端」

  则来到打开 Web 端支付的链路，此时使用「创建网页支付订单」工具

:::

:::tips
<font style="background-color:#2F8EF4;"> </font> 否则 

来到手机端支付的链路，此时使用「创建手机支付订单」工具

:::

 示意图：

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744792440427-c4ae9633-0c6a-4747-8a2e-84224db3ebeb.png" width="1574" title="" crop="0,0,1,1" id="uf5546117" class="ne-image">



### ❷ 如何从输出的文本中提取纯净的支付链接
当前支付宝支付 MCP 的输出链接为一段 markdown 文本：

```markdown
"result":
"支付链接: [点击完成支付](https://openapi.alipay.com/gateway.do?method=alipay.trade.wap.pay&app_id=2021005138643369&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2025-04-16+08%3A18%3A36&sign=L8f4kUyZLcYVYneiB6JAg5ljWDJ7VCel1DJcj6%2Fp2Bwrm7TLNR0YJmFSlO9%2F8DEoZxNq8eHgRpbbil1Vn5ABk5ET5xwV%2BexssunseAZPb%2BV69RUuC%2FPLTM7ONX3Lda4VmLa2iXkwR4pY%2Bv%2Bl4lolgHv5tLqTZyoURTrjosRGsU%2FZplkIz6vkdaD0jhawiqHLY5i6%2FGLJEMFAnMzxEerxZczMDEWT7JHHl6jnbCAIvlp%2F6cHwv0eItoKdJ6DsGSoMCh%2FUNZHmIlYTJzKwdC29ZdVYRKQcmiHZNwKPUvjKWS5nHZ%2FU4EYMCg6mXeN49lCn9qta32ya%2F1dgZRvaCf4tmA%3D%3D&alipay_sdk=alipay-sdk-nodejs-4.0.0&biz_content=%7B%22out_trade_no%22%3A%2220230718A123456789%22%2C%22total_amount%22%3A0.01%2C%22subject%22%3A%22%E5%A4%8F%E6%97%A5%E8%AF%97%E6%AD%8C%E5%88%9B%E4%BD%9C%E6%9C%8D%E5%8A%A1%22%2C%22product_code%22%3A%22QUICK_WAP_WAY%22%2C%22body%22%3A%22%E5%A4%8F%E6%97%A5%E8%AF%97%E6%AD%8C%E5%88%9B%E4%BD%9C%E6%9C%8D%E5%8A%A1%22%2C%22query_options%22%3A%5B%22mcp_1.2.0%22%5D%7D)"
```

<font style="color:rgb(56, 58, 66);background-color:rgb(250, 250, 250);">  
</font><font style="color:rgb(56, 58, 66);">若需获取纯净的跳转链接，需要从中提取链接，可以在官方插件商店中，添加「文本处理/提取链接」插件，实现提取文本中的第一个 URL</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1744793256551-f8b2b148-7e4b-4d0e-bfa5-541bed14063f.png" width="855" title="" crop="0,0,1,1" id="ue13cacd0" class="ne-image">
