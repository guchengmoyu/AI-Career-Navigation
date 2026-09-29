本文将介绍如何通过百宝箱的 AI 卡片生成能力，生成能够在支付宝或微信小程序中使用的智能体交互卡片。

## 功能介绍
为满足日益增长的多端业务场景需求，百宝箱企业版对 AI 生成卡片能力进行升级，支持一键生成多端适配的智能体卡片。该功能在原有的 Web 端 H5 卡片的基础上，进一步扩展至支付宝及微信小程序端，确保卡片在不同平台均能保持一致的视觉效果与交互体验。

## 操作说明
点击下方链接可快速跳转至对应的操作说明：

+ [生成支付宝小程序卡片](#LnNc3)
+ [生成微信小程序卡片](#l2f2l)

## 生成支付宝小程序卡片
<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766132744628-b4264091-8b88-43a1-9153-86db904d2068.png" width="1069.6" title="" crop="0,0,1,1" id="u1c42ed42" class="ne-image">

1. [生成卡片：](#Mmiy3)根据自身需求，完成卡片生成。
2. [下载发布：](#Bb9nk)下载 AI 生成卡片代码，并将卡片发布到线上。
3. [注入代码：](#Zywxk)在本地使用支付宝 IDE，打开百宝箱卡片预置项目，并进行代码替换，实现宿主注入。
4. [配置代码：](#K0Iie)在 IDE 中分别修改卡片 ID、智能体 ID 以及小程序插件 ID，实现个性化绑定。
5. [发布代码：](#XxMTk)将代码发布到支付宝小程序迭代中，实现卡片在支付宝小程序中的使用。

下文将分别说明使用 AI 生成卡片并获取支付宝小程序代码，用户下载后，如何将其注入到宿主支付宝小程序代码中的操作。

### 步骤 1：生成卡片
1. 开发者访问百宝箱[卡片中心](https://b.tbox.cn/inc/card)。
2. 在卡片管理页，点击右上角的**新建卡片 > AI 生成 > 前往。**<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1765957584586-a659b68e-3115-40ae-890b-5880af19bc84.png" width="1532" title="" crop="0,0,1,1" id="iYU5g" class="ne-image">
3. 在对话框中输入卡片生成需求，并点击<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1765957630608-53389e9f-21ae-4477-809f-e2208ca2bd1d.png" width="16" title="" crop="0,0,1,1" id="RZMvk" class="ne-image"> 触发任务执行。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1765957689012-a6f3d58e-db71-4990-af49-91d8e1421754.png" width="1519.2" title="" crop="0,0,1,1" id="NnBhW" class="ne-image">

### 步骤 2：发布卡片
1. 完成卡片初步生成与后续调整后，可点击右上角的**发布**，进行卡片构建。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1765959507362-e4f6b6a9-af9d-4b9d-9758-1cd0f1e8666c.png" width="1536" title="" crop="0,0,1,1" id="L0dcO" class="ne-image">
2. 在弹出的卡片发布面板中，点击 AI 多端卡片 > 支付宝小程序卡片 > 生成代码。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766126686945-4320da4e-3edc-451e-94c9-a8fe0ab04668.png" width="731.2" title="" crop="0,0,1,1" id="u9dffaec8" class="ne-image">
3. 此时，系统将自动生成当前卡片对应的代码。

:::warning
**注意：**代码生成过程中，**请勿退出卡片编辑页面，否则会中断代码生成过程。**

:::

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766126759238-085175ca-e9b7-459c-ac7c-1e9bd758571b.png" width="732.8" title="" crop="0,0,1,1" id="uf9340204" class="ne-image">

4. 待代码生成成功后，点击发布面板 > 支付宝小程序卡片 > **下载代码**，再点击**确认发布**。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766127003545-e26dec5e-656a-41de-aa01-a96c67f6ff4a.png" width="736.8" title="" crop="0,0,1,1" id="u39cf81e4" class="ne-image">
5. 代码下载到本地后，文件如下所示。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766127745930-ffb35c2a-806c-4106-ae49-221f30e678f9.png" width="1176" title="" crop="0,0,1,1" id="u08766a9f" class="ne-image">

### 步骤 3：使用卡片
:::info
**说明：**

+ 在使用卡片之前，请先完成智能体应用的开发，并将其发布至支付宝小程序插件渠道，详细说明可参见：[发布至支付宝小程序](https://alipaytbox.yuque.com/sxs0ba/huntb8/owvlrv5wl4h6535q)。
+ 下述步骤需要开发者在支付宝小程序 IDE 中进行操作，您可[点击此处](https://opendocs.alipay.com/mini/ide/overview?pathHash=4da33275)进行下载。

:::

#### 卡片代码注入
1. 开发者启动自有项目。

:::info
**说明：**若无自有项目，或不知道如何操作，可选择下载百宝箱卡片代码模板[aicard_in_miniapp.zip](https://alipaytbox.yuque.com/attachments/yuque/0/2025/zip/1397496/1766131986564-4e55075f-e109-481c-9b00-3032e587f265.zip)，进行链路体验。

:::

2. 使用步骤二中下载的代码替换项目中 card 文件夹下对应的内容。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766127925443-5c0ab42c-8858-4cd0-bfad-13f6462ac986.png" width="1533.6" title="" crop="0,0,1,1" id="uea205d4d" class="ne-image">

#### 项目代码配置
1. 在`/components/host-card/index.axml`文件内，将 card_id 替换为由步骤 2 生成的卡片 ID。

:::info
**说明：**开发者可在 AI 卡片生成页面地址栏获取对应卡片的 card_id。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1771924461720-0f7bd876-9243-42dc-a566-b890b91e309d.png" width="666.4" title="" crop="0,0,1,1" id="ua56bcc5b" class="ne-image">

:::

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766128162804-121130bf-ee7e-4df6-a772-29b32e1b0c05.png" width="2940" title="" crop="0,0,1,1" id="VnqMa" class="ne-image">

2. 在 `/pages/index/index.js`文件中，将 agentId 替换为已经发布到支付宝小程序插件渠道的智能体 ID。

:::info
**说明：**开发者可在智能体应用编排页的地址栏中，获取对应的 AegntID。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1771924501987-35cbb1e4-842e-453a-93d0-e46697885371.png" width="670.4" title="" crop="0,0,1,1" id="u9955597c" class="ne-image">

:::

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766128701177-cf0ca27d-ebee-44f5-b5f7-5d82012975a2.png" width="2940" title="" crop="0,0,1,1" id="JQLFm" class="ne-image">

3. 在 `app.json`文件中将 `provider`替换为您所订阅的百宝箱智能体插件 ID，详细说明可参见：[插件订购与接入](https://alipaytbox.yuque.com/sxs0ba/huntb8/sxg7lzqywgxdw8i5#vxgYc)。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766128719460-4d25a069-2efd-4f7c-b0ef-d85bf25e0230.png" width="2940" title="" crop="0,0,1,1" id="lEdyR" class="ne-image">
4. 编译小程序代码，并预览编译效果。<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1766128770550-2003e179-aae5-45bc-9896-3941dd5b1c43.png" width="2922" title="" crop="0,0,1,1" id="u170c0caa" class="ne-image">
5. 待确认编译效果无误后，请将其上传并发布至支付宝开放平台，操作如下文所示。

#### 上传代码并发布版本
1. 在开发者工具中，点击右上角的**上传版本**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768896410761-e7260abd-2bd9-4b39-b7db-6f1d756f55ec.png" width="1532.8" title="" crop="0,0,1,1" id="uea2c6599" class="ne-image">
2. 当开发者工具提示您上传成功后，扫描提示框中的二维码或点击**进入小程序管理后台**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768897100273-4b9f321b-91a6-41de-adcb-4a84dfb60106.png" width="1200" title="" crop="0,0,1,1" id="u8584f527" class="ne-image">
3. 在支付宝开放平台，点击迭代详情页的进入审核，发起并完成审核与发布后即可对客户使用。相关操作的具体说明可参见：[一站式研发平台接入流程：审核与发布](https://opendocs.alipay.com/mini/0i2kxt?pathHash=f9b8f521#%E7%AC%AC%E4%B8%89%E6%AD%A5%EF%BC%9A%E5%AE%A1%E6%A0%B8)。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768897262946-a6cbf5a8-3500-43f8-bf51-eb42900c6502.png" width="1516.8" title="" crop="0,0,1,1" id="u681e49b2" class="ne-image">

## 生成微信小程序卡片
:::info
**前置说明：**

+ 在进行插件模板订阅以及小程序代码编排时，需要使用主体类型为**企业**的小程序账号进行操作。在执行相关操作前，请确保你已经拥有相关权限。若无，请参见：[微信小程序注册流程](https://kf.qq.com/faq/170109iQBJ3Q170109JbQfiu.html)，完成相关账号注册。
+ 在执行本操作前，请将智能体发布并上架至微信小程序。若无，请参见：[上架至微信小程序](https://alipaytbox.yuque.com/sxs0ba/huntb8/aepgf27ccnmswgbz)。
+ 在执行卡片代码代码注入前，请先完成卡片与已发布到微信小程序的智能体应用的绑定，若无，请参见：[使用卡片](https://alipaytbox.yuque.com/sxs0ba/huntb8/best_practices_generate_cards_with_ai#NadXy)完成相关配置。

:::

<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1769158481005-75897f25-8cad-4b2d-858e-81da9c096104.png" width="1024.8" title="" crop="0,0,1,1" id="u3d84b885" class="ne-image">

1. [创建卡片](#O3hmE)：通过自然语言描述，使用百宝箱 AI 卡片能力，生成卡片。
2. [发布卡片](#uc5bm)：将卡片发布至线上，供智能体调用，并在发布过程中生成并下载对应的卡片代码。
3. [订阅插件](#rI3ga)：订阅百宝箱官方提供的微信小程序插件模板，实现小程序项目的快速搭建。
4. [配置项目](#YvHgy)：在微信小程序开发者工具中，根据自身情况，修改模板项目中的配置文件，实现项目与插件模板的绑定。
5. [注入卡片](#H3WdD)：将步骤 2 中生成的卡片代码注入到小程序项目中，实现卡片渲染。
6. [调试上线](#n2Bnv)：通过开发者工具提供的真机测试能力，调试项目，无误后，将代码推送到线上，供用户使用。

### 步骤 1：创建卡片
1. 开发者访问[百宝箱卡片](https://b.tbox.cn/inc/card)。
2. 在卡片列表页，点击右上角的新建卡片 > AI 生成 > **前往**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768889441241-9322c3f5-f3af-47d8-a257-32f1fa3af83d.png" width="1531.2" title="" crop="0,0,1,1" id="u6f64e762" class="ne-image">
3. 在对话框中通过自然语言描述具体的业务诉求，点击<img src="https://cdn.nlark.com/yuque/0/2026/svg/1397496/1768891066640-444620e4-33aa-454e-84cf-38501b388591.svg" width="16" title="" crop="0,0,1,1" id="u3d1e2a6b" class="ne-image">。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768891099092-1ee538e7-5f26-4fd5-85a9-e778b9d1b870.png" width="1518.4" title="" crop="0,0,1,1" id="ufe9db676" class="ne-image">

### 步骤 2：发布卡片
待卡片生成结束后，需要开发者执行发布相关动作，生成并下载卡片对应的代码，并发布卡片，将其推进至可用状态。

1. 在卡片预览页，点击右上角的**发布**，唤起卡片发布面板。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768893306365-91c80b63-cdd6-49f2-8523-1715d6db7725.png" width="1535.2" title="" crop="0,0,1,1" id="u68afd7f9" class="ne-image">
2. 在发布面板，点击微信小程序卡片右侧的生成代码，并等待代码生成。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768893388882-23db2de4-46fb-42c9-8264-fcc075a1496a.png" width="734.4" title="" crop="0,0,1,1" id="uaf1e57d0" class="ne-image">

:::info
**说明：**代码生成需要一定的时间，请耐心等待。过程中，请勿关闭发布面板，以保证代码生成的完整性。

:::

3. 完成代码生成后，点击下载代码，将其保存到本地，以备后续在微信小程序中进行构建与渲染。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768893611796-69747d36-6919-49eb-9acc-84dcb7be665c.png" width="729.6" title="" crop="0,0,1,1" id="u29c72144" class="ne-image">

:::info
**说明：**该操作会将卡片代码以 【卡片名称 _wx_ 编码】.zip 的压缩包形式下载到您的本地。如		<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768893956038-023332bb-0bf3-4812-981e-7f876a6d6519.png" width="320" title="" crop="0,0,1,1" id="uc726eca7" class="ne-image">

:::

4. 待代码下载完成后，需点击发布面板中的确认发布，将卡片推进至可用（已发布）状态。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768893928715-12708703-c415-409f-b1cb-fbfc95fa6d27.png" width="732" title="" crop="0,0,1,1" id="ud66e7a26" class="ne-image">

### 步骤 3：使用卡片
#### 订阅插件
1. 使用主体为企业的小程序账号，登录[微信小程序管理后台](https://mp.weixin.qq.com/)。
2. 在小程序管理首页，点击左下角的个人中心 > **账号设置**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768975607696-e265d771-decc-411c-b8d4-1a05d570fc3c.png" width="1521.6" title="" crop="0,0,1,1" id="u17b9632a" class="ne-image">
3. 在账号设置页，点击第三方设置 > 插件管理 > **添加插件**。 <img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768975735402-500f332d-af82-4b44-ae31-6156740c86eb.png" width="1520.8" title="" crop="0,0,1,1" id="ub9ff756d" class="ne-image">
4. 在添加插件面板中，搜索 ID 为 `wx62abac5e2cdc7aab`的插件，并点击下方**添加**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768975857836-7d27b8eb-392a-49b0-afba-c35ddb5a2dd4.png" width="789.6" title="" crop="0,0,1,1" id="u0a57366e" class="ne-image">

#### 配置项目
1. 访问并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 使用步骤 3 相同的账号登录微信开发者工具。
3. 启用自有小程序。

:::info
**说明：**若你想快速体验代码注入流程，可以点击下载百宝箱官方小程序模板，并将其导入到微信开发者工具中。[agent-chat-h5-template-wx.zip](https://alipaytbox.yuque.com/attachments/yuque/0/2026/zip/1397496/1769158130165-3ee64202-4f7f-48bd-9caf-272981f60566.zip)，

:::

4. 在 `subpackage`目录下，新建一个名为 `exportToPlugin`的 js 文件，并添加如下内容，为插件提供宿主对象。

```javascript
module.exports = {
  getWXGlobalObject() {
    return wx;
  },
};
```

5. 在资源管理器中，找到 app.json 文件，并添加 `plugins`相关配置，示例代码如下。

```json
{
  "pages": [
    "省略...",
  ],
  "subpackages": [
    {
      "root": "subpackage",
      "pages": [
        "index/index"
      ],
      "plugins": {
        "chatPlugin": {
          "version": "1.1.18",
          "provider": "wx62abac5e2cdc7aab",
          "export": "exportToPlugin.js"
        }
      }
    }
  ]
}
```

:::info
**说明：**上述代码关键信息说明如下。

+ provider：指小程序订阅的插件 ID，需与[步骤 3 ](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_ai_wxminiprogram#rI3ga)中订阅的插件 ID 保持一致。
+ export：指为插件提供宿主对象的文件。

:::

6. 修改 `page > agent > index.js`文件中的 agentID，并将其替换为自有智能体应用的 ID。

:::info
**说明：**您可以通过下述方式获取智能体 ID。

+ 目标应用编排页，上方地址栏中的编码。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1771924558970-deaf759e-294a-489f-8d6a-4e8d81203a2d.png" width="670.4" title="" crop="0,0,1,1" id="ub24c7130" class="ne-image">
+ 应用发布页的 APPID。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768989342013-484dd76b-1916-4c15-8d27-bb4a014847ea.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_20%2Cw_1900%2Ch_312" width="1520" title="" crop="0,0.0603,1,1" id="ue513c65f" class="ne-image">

:::

此时，小程序的项目目录结构如下所示。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768978418799-4101aa97-da9b-4487-8272-970fdde490a6.png" width="1040.8" title="" crop="0,0,1,1" id="ua3565b9b" class="ne-image">

#### 注入卡片
1. 在项目的 `component`文件夹下，添加名为`index`的 js/json/wxml/wxss 四个文件，各文件中的代码内容与[步骤 2 ](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_ai_wxminiprogram#uc5bm)中下载的代码保持一致。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768983319366-2ba1e24c-2415-4631-98e7-798c4550878c.png" width="870.4" title="" crop="0,0,1,1" id="ud2c8619e" class="ne-image">
2. 修改 `<font style="color:rgb(38, 38, 38);">parent-host-comp/index.wxml</font>`<font style="color:rgb(38, 38, 38);">文件，添加下入内容。</font>

```xml
<view>
  <ai-card-demo
    wx:if="{{ cardData.card_id === '2025xxx0' }}" 
    // card_id:百宝箱AI卡片的唯一标识，可在卡片编辑器的地址栏中获取。
    cardData="{{cardData}}"
    />
</view>
```

3. 修改 `<font style="color:rgb(38, 38, 38);">parent-host-comp/index.json</font>`<font style="color:rgb(38, 38, 38);">文件，添加如下内容。</font>

```json
{
  "component": true,
  "usingComponents": {
    "ai-card-demo": "../ai-card-demo/index",
  }
}
```

4. 修改 `app.json`文件，添加如下内容。

```json
{
  "pages": ["pages/index/index"],
  "plugins": {
    "chatPlugin": {
      "version": "1.1.18",
      "provider": "wx62abac5e2cdc7aab",
      "export": "exportToPlugin.js",
      "genericsImplementation": {
        "chat-page": {
          "host-card": "components/parent-host-comp/index"
        }
      }
    }
  }
}

```

#### 调试上线
1. 在微信开发者工具中，点击右上角的真机调试，选择目标系统类型，并进行扫码体验运行效果，无误后即代表注入成功。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1768989710592-a451a113-66d3-4dfe-98af-a93606bd5d5e.png" width="1533.6" title="" crop="0,0,1,1" id="uaf9df692" class="ne-image">
2. 此时，点击真机调试右侧的上传，将代码推送到线上，并完成后续的迭代发布后，即可对客使用。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1769159187109-588de14a-5559-4746-80dd-7037e73e4e61.png" width="1537.6" title="" crop="0,0,1,1" id="ub507df7e" class="ne-image">

关于微信小程序代码发布的详细说明可参见：[微信小程序发布上线](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/release.html#%E5%8F%91%E5%B8%83%E4%B8%8A%E7%BA%BF)。

<font style="color:rgb(38, 38, 38);"></font>






