## <font style="color:rgb(0, 0, 0);">MCP简介</font>
<font style="color:rgb(46, 48, 51);">MCP（Model Context Protocol，模型上下文协议） 是专为大语言模型（LLM）应用设计的开放协议，旨在实现 LLM 与外部工具和数据源的无缝集成。它通过统一的接口规范，将原本分散的 API 工具集成简化为"即插即用"模式，解决传统 API 工具中存在的多协议适配、高开发成本等问题。如需了解更多，请参见 </font>[<font style="color:rgb(0, 164, 255);background-color:rgba(51, 119, 255, 0.3);">MCP 官方文档</font>](https://docs.anthropic.com/en/docs/mcp)<font style="color:rgb(46, 48, 51);">。</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1764213946200-a755b502-7ab9-4c51-b39c-4df613e048ec.png" width="439" title="" crop="0,0,1,1" id="u47efe9c6" class="ne-image">

当前百宝箱提供两类 MCP Server：

| 官方 MCP | 社区 MCP |
| --- | --- |
| **官方预部署的 MCP Servers**<br/>用户开箱即用，可直接在智能体中添加使用 | **从社区收录推荐的 MCP Servers，官方未预部署**<br/>用户使用时可在百宝箱新建 MCP 插件 - 免费一键部署，也可以直接填入自己已部署的 SSE URL |




对于**社区 MCP**，百宝箱现已支持两种方式将社区 MCP 创建为直接可用的智能体插件

+ **方式 1：百宝箱一键部署**。通过支付宝小程序云一键部署，2 分钟部署一个自己的 MCP⚡️
+ **方式 2**：**用户自部署填入配置信息使用**。用户可以百宝箱填写自部署的 <font style="color:rgba(0, 0, 0, 0.88);">MCP服务EndPoint URL</font>



## <font style="color:rgba(0, 0, 0, 0.88);">百宝箱一键部署社区 MCP</font>
通过支付宝小程序云提供代部署能力，百宝箱已经支持一键部署 MCP Server，免去复杂摸索和环境安装，填写部署命令即可一键部署！

:::success
<font style="color:rgba(0, 0, 0, 0.88);">适用的 MCP 安装命令：</font>`<font style="color:rgba(0, 0, 0, 0.88);">npx</font>`<font style="color:rgba(0, 0, 0, 0.88);"> </font>

:::

### 从插件市场一键部署
+ 在 **百宝箱插件市场 — 社区 MCP** 中找到想要使用的 MCP：

<img src="https://cdn.nlark.com/yuque/0/2025/gif/103125/1747390828108-8840df44-0b35-4beb-96bf-054b40e7bf33.gif?x-oss-process=image%2Fcrop%2Cx_0%2Cy_0%2Cw_2066%2Ch_1237" width="1033" title="" crop="0,0,1,0.9717" id="ub11ad0e0" class="ne-image">



+ 点击 **一键部署**，即会在新页签打开 MCP 创建页面，百宝箱会为你**自动填入 MCP 的头像、名称、描述、部署命令**

某些部署命令中可能需要你填写个人的 token、apikey 等个性化信息，你需要将部署命令中的个性化信息替换为自己的信息；另一些部署命令无需额外填写个性化信息

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390831335-c0b4c638-a986-43c8-a783-75fd127dd012.png" width="1376" title="" crop="0,0,1,1" id="u3c8afea7" class="ne-image">

举例：在 mastergo 的[页面](https://mastergo.com/files/account?tab=security)上，获取 mastergo 的个人访问令牌后，在 **MCP 服务配置 **中填入

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390830513-b152a30a-95e5-4c9e-9217-b5155c45e66a.png" width="1127" title="" crop="0,0,1,1" id="ue38f7d32" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390830773-df749fa7-7510-4b03-a416-1e0caa4a4109.png" width="316" title="" crop="0,0,1,1" id="u2196f7a6" class="ne-image">





+ 点击 **确认**，即开始自动部署

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390830886-098b223f-8b13-447c-b4be-96e63d10d73e.png" width="1371" title="" crop="0,0,1,1" id="uccb6d7d3" class="ne-image">



+ 部署成功后，所有工具会处于`未调试`状态，将各个工具**均调试通过**后，即可发布 MCP 插件

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390832833-e87737fa-a353-4852-8153-67346533aa6d.png" width="1377" title="未调试状态" crop="0,0,1,1" id="uf64493da" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390832833-b2e4a176-7104-431a-a8e9-ab250511f306.png" width="1374" title="调试通过，点击发布" crop="0,0,1,1" id="u6c80789b" class="ne-image">

然后即可去[使用 MCP 插件](https://alipaytbox.yuque.com/sxs0ba/doc/createmcp#kwTwD) ✈️

## 托管本地MCP服务（<font style="color:rgb(24, 24, 24);">stdio</font>）
| **部署方式** | **是否支持** | **描述** |
| --- | --- | --- |
| **npx** | - [x] 支持 | <font style="color:rgb(24, 24, 24);">启动使用 Node.js 开发的 MCP 服务</font> |
| **<font style="color:rgb(24, 24, 24);">uvx</font>** | - [x] 支持 | <font style="color:rgb(24, 24, 24);">启动使用 Python 开发的 MCP 服务</font> |


在百宝箱一键部署 MCP 时，除了使用百宝箱社区 MCP 现成的部署配置之外，也可以自行寻找想要使用的 MCP 的部署命令。

例如在对应 **MCP 服务的 Github Readme 页面**，或者在 [https://mcpservers.cn/](https://mcpservers.cn/)、[https://mcp.so/](https://mcp.so/)等** MCP 社区网站**寻找适合的 MCP 及** npx 部署命令**，选择**百宝箱一键部署**的方式，自行填入部署命令，也可以在百宝箱一键部署并使用。

+ 在互联网获取所需 MCP 的 npx 部署命令

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390834262-df3ec3f4-509e-4067-9d0f-9466ce0fb24e.png" width="1206" title="" crop="0,0,1,1" id="Ymb5p" class="ne-image">

### 使用前提须知
+ 仅支持`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">npx</font>`部署
+ 云部署使用的<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">NodeJs</font>版本=<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">22.21.0</font>，高于此版本的npm包暂不支持
+ 云部署使用的npm公共仓库是 ：[https://npmmirror.com/](https://npmmirror.com/)，需确保相关包及版本已经在<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">npmmirror</font>上同步，如未同步，请手动同步

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1763980523153-e18b08dc-01c6-4632-a5f1-b448fc6f1d89.png" width="498" title="" crop="0,0,1,1" id="u39725757" class="ne-image">

+ npm包的依赖和执行bin文件需要开发者在**<font style="color:rgba(0, 0, 0, 0.8);">package.json中</font>**明确定义，详细见[https://deepgram.com/learn/npx-script](https://deepgram.com/learn/npx-script)  

```json
{
  "name": "xxx-mcp",
  "version": "1.0.5",
  "description": "MCP服务描述",
  "main": "xxx-mcp.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0",
    "xxx包":"版本号"
  },
  "bin": "./bin.js"//启动文件
}
```

+ 本地验证npm包，可通过npx -y 包名及版本号验证，确认运行成功。

```java
npx -y @wodesq0601/gaokaomath_analysis@1.0.2
```



### 如何创建
+ 在百宝箱插件页面，新建插件，选择创建方式为 **连接 MCP 服务**

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1765436719072-46ef52d7-cab8-451f-a016-148c4e5b540b.png" width="1304" title="" crop="0,0,1,1" id="ufbf30a04" class="ne-image">



+ **填入获取到的 MCP 部署命令配置**，填写基础信息，点击 **确认** 开始部署，后续同前文步骤

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390835909-e1b92289-f86e-4617-bf4f-3dd0a0a7ebba.png" width="1529" title="" crop="0,0,1,1" id="u47f876ba" class="ne-image">

## 创建远程MCP服务（sse/<font style="color:rgb(46, 48, 51);">streamableHttp</font>）
**接入类型：**支持接入 sse 和 streamableHttp 协议类型的插件。

| **协议** | **是否支持** | **描述** |
| :---: | --- | --- |
| **sse** | - [x] 支持 | <font style="color:rgb(46, 48, 51);">一种基于 HTTP 协议的单向实时通信机制。客户端通过建立一次持久的 HTTP 连接，服务器即可持续不断地向客户端推送事件数据，常用于实时消息、状态更新等场景</font> |
| **<font style="color:rgb(46, 48, 51);">streamableHttp</font>** | - [x] 支持 | <font style="color:rgb(46, 48, 51);">一种在 HTTP 协议之上实现的流式传输机制，常用于 AI 模型输出逐步生成内容（如大语言模型的流式响应）。它不是全新的协议，而是对 HTTP 长连接与分块传输能力的灵活利用，以便在推理过程中逐步向客户端返回数据</font> |


若您有已部署好的 MCP 服务，亦可选择 MCP 创建方式为「自部署 MCP」，填写已部署的服务URL<font style="color:rgba(0, 0, 0, 0.9);">，以及对应的连接协议（SSE或者Streamable HTTP）即可拉取 MCP 服务，在百宝箱应用编排时使用。</font>

+ 在百宝箱插件页面，新建插件，选择创建方式为 **创建MCP 服务，**选择 MCP 创建方式为**自部署 MCP** ，填写基础信息，点击 **确认** 开始部署，后续同前文步骤，完成调试并发布。即可去[使用 MCP 插件](https://alipaytbox.yuque.com/sxs0ba/doc/createmcp#kwTwD) ✈️

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1764297411141-6dfa7cdc-65a0-44c7-a23e-3720cd356c00.png" width="1289" title="" crop="0,0,1,1" id="ub9814698" class="ne-image">

**<font style="color:rgb(46, 48, 51);">Header列表</font>**

<font style="color:rgb(46, 48, 51);">发送给MCPServer的HTTP请求头，可以在这里补充认证信息或自定义字段。</font>

**配置鉴权方式**

| **配置项** | **说明** |
| --- | --- |
| 不需要授权 | 无需授权 |
| API Key | 允许自定义 HTTP 认证方式，可根据需要设置请求头、查询参数等传递认证信息。适用于标准认证方式以外的场景，满足灵活、自定义的认证需求。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **参数名**：API服务用于识别认证信息的名称，例如查询参数`?api_key=abc123 `中，`api_key` 就是参数名。<br/>+ **参数值**：用于身份验证的实际凭证，例如URL查询参数`?api_key=abc123 `中，`abc123` 就是参数值。 |
| Basic Auth | 一种基础的 HTTP 认证方式，需要在请求头中提供用户名和密码的组合（经 Base64 编码）。适用于需要简单身份验证的场景，例如内部系统或基本保护的接口。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **用户名（Username）**：由 API 服务提供商分配，用于标识请求方的身份。<br/>+ **密码（Password）**：与用户名对应的密码或密钥，用于验证身份的真实性。<br/>```plain 用户名：user_001 密码：pass123 系统生成 → Authorization: Basic dXNlcl8wMDE6cGFzczEyMw== ```  |
| Bearer Token | 通过令牌（Token）进行认证，通常将令牌放在请求头的Authorization 字段中（格式为 ： Bearer {token} ）适用于 API 密钥或访问令牌类的认证。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **参数名**：固定为 Authorization，不支持修改。<br/>+ **参数值**：用于身份验证的实际凭证，例如：Bearer 您的实际令牌。_注意__<font style="color:rgb(15, 17, 21);">Bearer 和令牌之间有一个空格。</font>_ |
| OAuth2 Client Credentials | 基于 OAuth 2.0 协议的客户端凭证模式，适用于服务端间认证，无需用户参与。通过客户端 ID 和客户端密钥获取访问令牌。<br/>+ 客户端ID：API服务商分配的应用程序标识。<br/>+ 客户端密钥：与客户端ID配对的密钥。<br/>+ 授权地址：获取令牌的API端点地址，例如：`https://api.example.com/oauth/token`。<br/>+ 范围：定义API访问权限范围，留空则使用默认权限，示例：`read write admin`。<br/>+ 令牌交换方式：选择获取访问令牌时，客户端凭据在Header或Body或Query中提交。 |


## 智能体使用MCP
### 在简单构建的应用中使用（推荐）
+ 在「知识与技能」中 **添加插件**

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390836169-7691ffe1-ecf3-4442-afde-5d9b604886be.png" width="1039" title="" crop="0,0,1,1" id="u8351afdc" class="ne-image">



+ 在「我的插件」找到刚才创建的 MCP，添加使用即可

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390835800-cc2a3bd0-29ed-468b-9297-f418935a9adc.png" width="883" title="" crop="0,0,1,1" id="uf47030dc" class="ne-image">



Tips：现已支持将 MCP 的多个工具 **一键添加****⚡****️**

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390836332-ce49b902-02d7-44a5-9261-6a201097801f.png" width="908" title="" crop="0,0,1,1" id="u82cbf962" class="ne-image">



### 在工作流中使用
#### 大模型节点（推荐）
+ 添加「文本大模型」节点，在该节点** 添加技能**

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390837497-3d2ab543-1c79-40b4-a3be-28ff0bffeb62.png" width="966" title="" crop="0,0,1,1" id="u27c7f085" class="ne-image">



+ 在添加技能弹窗中，类别选择「我的插件」，在其中找到刚才创建的 MCP，即可添加使用✅

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390838372-61155c5b-f577-4b3a-b91c-1a2561f3a089.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_6%2Cw_2000%2Ch_1394" width="1000" title="" crop="0,0.0043,0.997,1" id="eEeLh" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390837993-9954dbdf-f541-4015-bc55-a3428c9e9b97.png" width="388" title="" crop="0,0,1,1" id="uc64cfd4d" class="ne-image">



#### 插件节点
拖入插件节点，在添加插件的弹窗中，选择「我的插件」，选择刚才已经部署的 MCP

<img src="https://cdn.nlark.com/yuque/0/2025/png/103125/1747390839088-927ae7c1-cd61-45b1-a4b9-1156f97a76ce.png" width="1207" title="" crop="0,0,1,1" id="u62bf1863" class="ne-image">



## **<font style="color:rgb(24, 24, 24);">通过MCP Inspector调试MCP服务</font>**
<font style="color:rgb(24, 24, 24);">MCP Inspector</font><font style="color:rgb(24, 24, 24);">是</font><font style="color:rgb(24, 24, 24);">MCP</font><font style="color:rgb(24, 24, 24);">社区提供的调试工具，可用于</font><font style="color:rgb(24, 24, 24);">MCP</font><font style="color:rgb(24, 24, 24);">服务全流程的调试。</font>

1. 安装Node.js环境
2. <font style="color:rgb(24, 24, 24);">执行MCP Inspector安装命令：</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">npx @modelcontextprotocol/inspector node build/index.js</font>`<font style="color:rgb(24, 24, 24);"></font>
3. <font style="color:rgb(24, 24, 24);">访问MCP Inspector界面，例如通过浏览器登录以下地址：</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">http://127.0.0.1:6274</font>`<font style="color:rgb(24, 24, 24);"></font>

     <img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1763970691680-8962dac3-79ef-42f0-867e-a75a4565ec15.png" width="314.5" title="" crop="0,0,1,1" id="ua7e5460f" class="ne-image">

4. <font style="color:rgb(24, 24, 24);">配置连接信息</font>
    1. <font style="color:rgb(24, 24, 24);">选择传输类型：</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Transport Type</font>`<font style="color:rgb(24, 24, 24);">选择对应服务的通信协议</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">SSE或</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Streamable HTTP</font><font style="color:rgb(24, 24, 24);"></font>
    2. <font style="color:rgb(24, 24, 24);">输入</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">URL</font>`<font style="color:rgb(24, 24, 24);">地址</font>
    3. <font style="color:rgb(24, 24, 24);">（可选）若配置了消费者认证，单击</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Authentication</font>`<font style="color:rgb(24, 24, 24);">安装展开授权配置，并填写消费者身份对应的Token。以下图的凭证配置为例，</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Header Name</font>`<font style="color:rgb(24, 24, 24);">为 </font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Authorization</font>`<font style="color:rgb(24, 24, 24);">不需要修改，在</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Bearer Token</font>`<font style="color:rgb(24, 24, 24);">中填入 </font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">HereIsToken</font>`<font style="color:rgb(24, 24, 24);">。</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1763970711917-e94b01d5-c47d-4cfe-9de3-1b12d428c102.png" width="317" title="" crop="0,0,1,1" id="u2c1ae9cb" class="ne-image">

5. <font style="color:rgb(24, 24, 24);">单击</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Connect</font>`<font style="color:rgb(24, 24, 24);">进行连接，连接成功后可以看到中间出现</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">List Tools</font>`<font style="color:rgb(24, 24, 24);">按钮，单击</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">List Tools</font>`<font style="color:rgb(24, 24, 24);">获取</font><font style="color:rgb(24, 24, 24);">MCP</font><font style="color:rgb(24, 24, 24);">服务的所有工具。</font>
6. <font style="color:rgb(24, 24, 24);">（可选）若要调试具体的工具，点击工具名称，在右侧填写必要的参数，并单击</font>`<font style="color:rgb(24, 24, 24);background-color:rgba(0, 0, 0, 0.04);">Run Tool</font>`<font style="color:rgb(24, 24, 24);">进行工具调用调试。</font>

<font style="color:rgb(24, 24, 24);">  
</font>

## 常见问题
#### 创建云部署的MCP失败，怎么排查？
百宝箱云部署失败可先自看下[使用前须知](#fWpTJ)，检查npm包是否运行正常

#### 创建自部署的MCP，获取工具失败，怎么排查？
百宝箱MCP Client版本使用的是mcp1.21.0，如出现异常，大部分是因为MCP服务端报错导致的，建议优先通过[MCP Inspector调试](#Kt17b)

<font style="color:rgb(2, 8, 23);"></font>


