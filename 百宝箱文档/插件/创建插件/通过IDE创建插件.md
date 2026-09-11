## 新建插件
在 **我的 **中点击 **插件**，点击 **新建插件：**

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033211487-dbc1c682-868b-4f03-93dd-39ad1ac684a4.png" width="1440" title="" crop="0,0,1,1" id="u90422c24" class="ne-image">

选择 **在百宝箱 IDE 中创建**，即 <font style="color:rgb(100, 102, 101);">使用百宝箱云端 IDE 快速开发工具</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033227582-8d1dfdd4-9262-44c5-9536-5de52ad0eec6.png" width="1440" title="" crop="0,0,1,1" id="uf2b4ad5b" class="ne-image">

:::info
可选择的 IDE 运行时语言：

+ Node.js
+ Python

:::



## 填写插件的基本信息
<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033257301-c6d46054-3263-4767-965b-6193facfc5a0.png" width="1440" title="" crop="0,0,1,1" id="u678e5063" class="ne-image">

| **配置项** | **说明** |
| --- | --- |
| 插件名称  | 自定义插件的名称，用于标识当前插件。输入清晰易理解的名称，便于用户使用 |
| 插件描述  | 插件的描述信息，清晰描述**主要功能**和**使用场景**，此信息将展示给用户并引导使用 |
| 插件图标  | 可使用默认图标/上传本地图片/根据描述和名称 AI 生成图标 |
| 插件工具创建方式  | 选择**在百宝箱 IDE 中创建** |
| IDE 运行时 | 当前支持** Node.js、Python** |


填写完成后，点击**确认**，即代表插件创建完成，接着开始进行工具的创建。

:::info
**插件和工具的关系**：插件是一个工具集，可包含多个工具，每个工具是一个 API 服务/云函数。

如：高德插件中包含高德路线查询、天气查询等工具

:::



## 创建工具
在已创建的插件详情页，点击 **新建工具** 进行工具创建。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033293645-dc8fe65f-a238-4c91-a77b-0f3d4e357fed.png" width="1440" title="" crop="0,0,1,1" id="uddfea838" class="ne-image">

### 配置元数据
#### 填写工具描述
输入工具的描述信息，请尽量仔细描述工具的主要功能和使用场景，该描述信息的作用是：

1. 展示给用户
2. 大语言模型会根据描述判断是否调用工具

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033692579-ff6041df-f9f5-404e-8d2f-de76cd9eda07.png" width="1440" title="" crop="0,0,1,1" id="u2432f3a3" class="ne-image">

#### 配置输入参数
<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033779200-19094323-164a-4cb0-b875-7f4c4452a22b.png" width="1440" title="" crop="0,0,1,1" id="ufac1d32a" class="ne-image">

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
<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747033841543-d42de4bc-8d70-461c-8851-223550c16e07.png" width="1440" title="" crop="0,0,1,1" id="ue98bb798" class="ne-image">

| **配置项** | **说明** |
| --- | --- |
| 参数名称  | 参数名称，支持字母、数字或下划线。  |
| 参数描述  | 参数描述。准确的参数描述可以帮助用户和大模型理解当前参数的作用。  |
| 参数类型  | 参数的数据类型：<br/>+ String<br/>+ lnteger<br/>+ Number<br/>+ Boolean<br/>+ Array<br/>+ Object |
| Jsonpath | 当类型为 Array、Object 时，当前还不支持使用 Array 和 Object 的树状结构表示，可用 jsonpath 来表示要取值的参数<br/>示例：<br/><font style="color:rgb(0, 0, 0);">{a: 1, b {.c: 2 }}</font>   <font style="color:rgb(0, 0, 0);">取 a 就是 $.a</font>   <font style="color:rgb(0, 0, 0);">取 c 就是 $.b.c</font> |


##### 自动更新输出参数
平台支持通过调试获取服务响应后，使用“自动更新”功能，将实时响应数据映射到输出结构中（请注意，此操作会执行全覆盖替换）。

点击“调试”，完成入参填写，点击“运行”，获取正确响应结果后，点击“自动更新输出参数”，并进行操作确认。

更新后，需为所有解析参数填写清晰的描述说明，最后点击“保存元数据”，提交保存。

<img src="https://cdn.nlark.com/yuque/0/2025/png/29282973/1765803297311-96a66895-df10-4789-afe3-c98d3ae1e779.png" width="1440" title="" crop="0,0,1,1" id="uc48fa975" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/29282973/1765803348944-5639912e-60ca-4dc2-897c-9a6bd0eb7cc7.png" width="1440" title="" crop="0,0,1,1" id="u0c95d499" class="ne-image">

### 在百宝箱 IDE 编码
打开 `main.py` 文件，在此处进行代码编写

同时，我们考虑搭建智能体的时候，需要写一些代码，来实现插件的开发过程，但是用户不熟悉python、JS代码的时候，会遇到问题。所以我们把这个AI编码助手的特性，增加到插件编码功能内，让用户可以直接把编码需求告诉AI，完成获取所需代码的诉求。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1755834723974-8961b8a5-b18b-4c90-91a3-211bc2d2d9bd.png" width="1270.5" title="" crop="0,0,1,1" id="ubd96ceb1" class="ne-image">

### 业务参数
<font style="color:rgba(0, 0, 0, 0.88);">业务参数是指除插件必需的技术入参外，针对特定业务场景所设置的额外输入参数。开发者定义插件使用者填写业务参数的方式，即自定义表单，详见 </font>[插件自定义业务参数](https://alipaytbox.yuque.com/sxs0ba/huntb8/fncazlykziwet73g)

<img src="https://cdn.nlark.com/yuque/0/2025/png/29282973/1753751909410-2e7123f0-eed4-4b61-9343-9cbef5b00977.png" width="2880" title="" crop="0,0,1,1" id="u68e134df" class="ne-image">

### 调试工具
点击调试，输入入参值，并单击**运行**。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747034209611-a895f1ff-f544-4590-aec2-10c97293dd2b.png" width="1440" title="" crop="0,0,1,1" id="u8eb021f6" class="ne-image">

状态说明：

+ 【未调试】：新创建的工具，默认状态为【未调试】；修改过的工具，调试状态也会变成【未调试】；
+ 【调试通过】：接口正常运行，即为调试通过；
+ 【调试失败】：接口运行异常，即为调试失败，调试失败时，需要您根据报错反馈自查原因进行修改，此时仍可保存工具，但是无法发布插件。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747034225900-667a621d-739d-4737-a6fb-8e8188964172.png" width="1440" title="" crop="0,0,1,1" id="u52505036" class="ne-image">



### 保存工具
运行通过之后，点击 **保存**，即可保存该工具。

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747034252116-0c23f3c2-2e01-4be2-933d-01caa003ffb7.png" width="1440" title="" crop="0,0,1,1" id="u2d3603df" class="ne-image">

## 发布插件
:::info
当工具的状态均为【调试通过】时，即可发布该插件。

:::

在插件详情页，点击**发布**，即可发布该插件并在 **我的插件** 中使用：

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747034277234-d8cc6815-7f4a-473d-a77d-5e55e8c55af2.png" width="1440" title="" crop="0,0,1,1" id="Wymd6" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/25829648/1747035388723-747761a2-65bf-4065-a414-66547ccc29f7.png" width="1440" title="" crop="0,0,1,1" id="ue9acd6c4" class="ne-image">


