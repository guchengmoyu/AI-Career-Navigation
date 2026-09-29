本文介绍如何在 **我的—插件** 页面，基于已有的 API 创建自定义插件。

创建插件后，必须**调试通过**并**发布**插件才可被应用使用。 

:::info
+ 在空间下创建的插件，仅能在空间中的应用中调用。
+ 插件发布新版本后，使用该插件的应用，会自动同步最新版本。 

:::

## 新建插件
在 **我的 **中点击 **插件**，点击 **新建插件：**

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747029760372-1b2ebd80-5381-4f59-a5fb-5b0a5c51d306.png" width="1440" title="" crop="0,0,1,1" id="ue868c411" class="ne-image">



选择 **基于已有服务创建**，即 <font style="color:rgb(100, 102, 101);">将已开发或公开的 API 作为工具</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751640030601-d3178c89-8d1a-402a-9c78-cc8bb6b5669a.png" width="650" title="" crop="0,0,1,1" id="u820c7e51" class="ne-image">

## 填写插件信息
+ 基础信息：

| **配置项** | **说明** |
| --- | --- |
| 插件名称  | 自定义插件的名称，用于标识当前插件。输入清晰易理解的名称，便于用户使用 |
| 插件描述  | 插件的描述信息，清晰描述**主要功能**和**使用场景**，此信息将展示给用户并引导使用 |
| 插件图标  | 可使用默认图标/上传本地图片/根据描述和名称 AI 生成图标 |
| 插件工具创建方式  | 选择**基于已有服务创建** |
| 插件服务的 URL正式环境  | 插件的正式环境访问地址或相关资源的链接。例如：https://www.example.com/api<br/>用户端体验智能体应用时，会使用正式环境域名调用插件服务，建议设置生产环境的服务域名 |
| 插件服务的 URL测试环境  | 插件的测试环境访问地址或相关资源的链接。例如：https://www.example-test.com/api<br/>插件调试或工作流应用调试时，可以选择使用测试环境域名进行调试，如不配置，平台会默认使用正式环境访问地址 |
| Header 列表  | HTTP 请求头参数列表。根据 API 自身的参数配置要求来填写。  |


+ 鉴权方式：

| **配置项** | **说明** |
| --- | --- |
| 不需要授权 | 无需授权 |
| API Key | 允许自定义 HTTP 认证方式，可根据需要设置请求头、查询参数等传递认证信息。适用于标准认证方式以外的场景，满足灵活、自定义的认证需求。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **参数名**：API服务用于识别认证信息的名称，例如查询参数`?api_key=abc123 `中，`api_key` 就是参数名。<br/>+ **参数值**：用于身份验证的实际凭证，例如URL查询参数`?api_key=abc123 `中，`abc123` 就是参数值。 |
| Basic Auth | 一种基础的 HTTP 认证方式，需要在请求头中提供用户名和密码的组合（经 Base64 编码）。适用于需要简单身份验证的场景，例如内部系统或基本保护的接口。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **用户名（Username）**：由 API 服务提供商分配，用于标识请求方的身份。<br/>+ **密码（Password）**：与用户名对应的密码或密钥，用于验证身份的真实性。<br/>```plain 用户名：user_001 密码：pass123 系统生成 → Authorization: Basic dXNlcl8wMDE6cGFzczEyMw== ```  |
| Bearer Token | 通过令牌（Token）进行认证，通常将令牌放在请求头的Authorization 字段中（格式为 ： Bearer {token} ）适用于 API 密钥或访问令牌类的认证。<br/>+ 传输方式：将认证信息附加到请求中传递给服务器的位置<br/>    - **Header（请求头）**：将认证信息放入 HTTP 请求头中传递，例如： `Authorization: Bearer token`<br/>    - **Query（查询参数）**：将认证信息作为 URL 的查询参数传递，例如： `https://openapi.platform.com/v1/users?key=value`<br/>+ **参数名**：固定为 Authorization，不支持修改。<br/>+ **参数值**：用于身份验证的实际凭证，例如：Bearer 您的实际令牌。_注意__<font style="color:rgb(15, 17, 21);">Bearer 和令牌之间有一个空格。</font>_ |
| OAuth2 Client Credentials | 基于 OAuth 2.0 协议的客户端凭证模式，适用于服务端间认证，无需用户参与。通过客户端 ID 和客户端密钥获取访问令牌。<br/>+ 客户端ID：API服务商分配的应用程序标识。<br/>+ 客户端密钥：与客户端ID配对的密钥。<br/>+ 授权地址：获取令牌的API端点地址，例如：`https://api.example.com/oauth/token`。<br/>+ 范围：定义API访问权限范围，留空则使用默认权限，示例：`read write admin`。<br/>+ 令牌交换方式：选择获取访问令牌时，客户端凭据在Header或Body或Query中提交。 |




填写完成后，点击**确认**，即代表插件创建完成，接着开始进行工具的创建。

:::info
**插件和工具的关系**：插件是一个工具集，可包含多个工具，每个工具是一个 API 服务/云函数。

如：高德插件中包含高德路线查询、天气查询等工具

:::

## 创建工具
在已创建的插件详情页，点击 **新建工具** 进行工具创建。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030416644-009a27bd-531f-4dc0-a2d2-631c29884f7a.png" width="1440" title="" crop="0,0,1,1" id="u5117c181" class="ne-image">

### 编辑工具详情
编辑工具的详情信息，包括以下几步：

① 填写工具的基础信息

② 配置输入参数

③ 配置输出参数

④ 调试工具

#### 填写工具的基础信息
<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030464308-ad3d5093-ff6a-4dd5-b262-fcd049ca4b64.png" width="1440" title="" crop="0,0,1,1" id="u6e666c6c" class="ne-image">

| **配置项** | **说明** |
| --- | --- |
| 工具名称  | 用于标识当前工具的中文名称。此名称会直接向用户展示，需要使其清晰易理解。 |
| 工具描述  | 工具的描述信息。请尽量仔细描述工具的使用场景和主要功能，大模型会根据描述判断是否调用该工具，同时描述将展示给用户，需要使其准确、易于理解。 |
| 工具路径  | 输入 API 路径，如果 API 没有路径，直接填写 / 作为路径。  |
| 请求方式 | 选择 API 的请求方式：<br/>+ GET 方法<br/>+ POST 方法 |




#### 配置输入参数
:::info
如果 API 没有输入参数，则直接单击**下一步**。

:::

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030505005-6b0fd8de-fd4f-4176-8cab-e133b87d46cb.png" width="1440" title="" crop="0,0,1,1" id="u1a6bd5c3" class="ne-image">

| **配置项** | **说明** |
| --- | --- |
| 参数名称  | 参数名称，支持字母、数字或下划线。  |
| 参数描述  | 参数描述。准确的参数描述可以帮助用户和大模型理解当前参数的作用。  |
| 参数类型  | 参数的数据类型：<br/>+ String<br/>+ lnteger<br/>+ Number<br/>+ Boolean |
| 传入方法  | 参数传入方法：<br/>+ Body：请求参数 <br/>+ Query：查询参数 <br/>+ Path：路径参数<br/>+ Header：请求头参数 |
| 参数取值枚举 | 当参数为有限的枚举参数时，可在此处罗列取值数据集合；<br/>表达格式示例：A,B,C |
| 是否必填  | 参数是否必填：<br/>+ 开，表示当前参数为必填参数；若模型未从用户目前的输入中获取到该必填参数，可能会发起反问，向用户收集该参数信息 <br/>+ 关，表示当前参数为选填参数 |


#### 配置隐藏参数（按需）
如需引用工作流上下文参数，可参考文档新增隐藏参数的配置

[创建插件支持隐藏参数配置](https://alipaytbox.yuque.com/sxs0ba/huntb8/gilnazv50018bcua)

#### 配置输出参数
<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030815869-9e69241c-7edb-4e9c-9616-f0861aeb135f.png" width="1440" title="" crop="0,0,1,1" id="uc46d03fc" class="ne-image">

| **配置项** | **说明** |
| --- | --- |
| 参数名称  | 参数名称，支持字母、数字或下划线。  |
| 参数描述  | 参数描述。准确的参数描述可以帮助用户和大模型理解当前参数的作用。  |
| 参数类型  | 参数的数据类型：<br/>+ String<br/>+ lnteger<br/>+ Number<br/>+ Boolean<br/>+ Array<br/>+ Object |


输出参数配置完成后，点击**下一步**，开始工具调试。

### 业务参数
<font style="color:rgba(0, 0, 0, 0.88);">业务参数是指除插件必需的技术入参外，针对特定业务场景所设置的额外输入参数。开发者定义插件使用者填写业务参数的方式，即自定义表单，详见 </font>[插件自定义业务参数](https://alipaytbox.yuque.com/sxs0ba/huntb8/fncazlykziwet73g)

<img src="https://cdn.nlark.com/yuque/0/2025/png/29282973/1753751977962-8e9b7a85-9972-4e76-a199-4eb11827597c.png" width="2880" title="" crop="0,0,1,1" id="uf48aa87b" class="ne-image">

### 调试工具
在此界面，填写输入参数，并单击**运行**。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030901225-6a79c539-54f9-474b-a5c0-e57a09f87915.png" width="1440" title="" crop="0,0,1,1" id="pWWyc" class="ne-image">

状态说明：

+ 【未调试】：新创建的工具，默认状态为【未调试】；修改过的工具，调试状态也会变成【未调试】；
+ 【调试通过】：接口正常运行，即为调试通过；
+ 【调试失败】：接口运行异常，即为调试失败，调试失败时，需要您根据报错反馈自查原因进行修改，此时仍可保存工具，但是无法发布插件。

注意：工具调试时，可选择正式环境或者测试环境进行调用，如当前插件未配置测试环境，平台会默认选择正式环境地址调用

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751640273936-b1abce96-2313-42fb-a8f5-4c59205382dd.png" width="1195" title="" crop="0,0,1,1" id="u6e75a367" class="ne-image">



### 保存工具
运行通过之后，点击 **保存**，即可保存该工具。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747030945456-6b986c0c-4cb3-44ff-b9a7-f51042de5e04.png" width="1440" title="" crop="0,0,1,1" id="uf9974dd0" class="ne-image">

### 绑定卡片(按需)
工具支持绑定前端卡片，可工具输出结果与卡片参数进行绑定，在工作流中可以引用绑定的卡片在对话中返回

如果工具不需要输出卡片，可忽略这一步。

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751641069704-691f630c-fe09-49b5-a6fd-de0ae9b7c060.png" width="1337" title="" crop="0,0,1,1" id="u379a3214" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751641260555-bdd6e04d-0dfc-43e4-8a9e-1da6eb2aa4cf.png" width="732" title="" crop="0,0,1,1" id="u0f971d90" class="ne-image">

## 发布插件
:::info
插件下所有工具都完成调试后，可以提交插件发布，插件发布后，应用工作流才可以使用该插件。

:::

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747031092495-e18b68ee-022b-4ff2-acd4-a28b16e09d1d.png" width="1440" title="" crop="0,0,1,1" id="u0b83ff34" class="ne-image">

插件发布后，插件状态会更新为“已发布”。已发布的插件，可以被空间内智能体应用添加使用：

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747031185679-b44ecbb2-fe3e-4b27-b9f3-1b31f3ea19f3.png" width="1440" title="" crop="0,0,1,1" id="u6b78d70e" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747031211189-445fa1e5-61af-47d6-b00d-5bff1ed06354.png" width="1440" title="" crop="0,0,1,1" id="ua36bf9b3" class="ne-image">

## 工作流调试验证
在工作流中引用已经发布的插件，打开工具调试

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751640598544-2fb1e8f2-bd5a-4f31-a30b-f248fa349fba.png" width="647" title="" crop="0,0,1,1" id="sgnrH" class="ne-image">

编辑运行参数，选择对应环境（可选择不同环境进行调试，当测试环境URL未配置时，平台会默认使用正式环境域名调用），点击确定即可发起提问进行调试验证

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1751640708684-347d409f-2d64-4838-81c5-07a82c305248.png" width="646" title="" crop="0,0,1,1" id="iwVHj" class="ne-image">
































