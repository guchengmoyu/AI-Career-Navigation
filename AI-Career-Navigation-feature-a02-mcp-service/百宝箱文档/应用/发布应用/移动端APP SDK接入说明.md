本文将为您介绍如何通过移动端APP SDK 实现将智能体集成到自有 App 中。

## 前提条件
在通过本文进行接入前请先认真阅读并同意《[百宝箱移动端 App SDK 隐私说明](https://alipaytbox.yuque.com/sxs0ba/huntb8/space_device_permission_list)》。

## 操作步骤
### 一、启用移动端 SDK 服务
1. 在应用发布配置页，选择 SDK 服务并点击移动端App SDK 右侧的**启用**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1770695485160-c6f3cd11-609e-4ba9-96f5-11c2ecbf2a71.png" width="848.8" title="" crop="0,0,1,1" id="u1a5af636" class="ne-image">
2. 在移动端 AppSDK 配置面板中，完成相关配置，并点击**确定**。<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1775642766142-b00330ba-f263-4556-b6cc-fdadfee54943.png" width="643.2" title="" crop="0,0,1,1" id="udd23035c" class="ne-image">

其中，各配置项说明如下。

| 配置项 | 必填 | 说明 |
| --- | --- | --- |
| 自有 App 名称 | 是 | 自定义智能体所关联的 App 名称，建议与实际名称保持一致。 |
| 是否进行用户身份校验 | 是 | 指用户在通过宿主小程序使用智能体能力时，是否需要进行登录验证。<br/>+ **默认为是**：即<font style="color:rgb(6, 10, 38);">接入登录认证（推荐），若您的智能体涉及用户敏感信息或个性化服务，强烈建议接入登录认证。未接入认证可能导致安全风险：例如，用户 A 获取到用户 B 的链接参数后，可直接以用户 B 的身份访问智能体并进行交互，造成越权访问，泄露用户隐私或业务数据。</font> |
| 用户身份校验对接开发 | 否 | <font style="color:rgb(6, 10, 38);">仅当“是否进行用户身份校验”为是时必填，登录认证开发相关的详细说明可参见：</font>[用户身份认证插件开发指南](https://alipaytbox.yuque.com/sxs0ba/huntb8/qt7b0r4iaydeqf8h)<font style="color:rgb(6, 10, 38);">，完成插件开发后，在添加插件中，选择对应的插件。</font> |
| 添加插件 | 否 | <font style="color:rgb(6, 10, 38);">仅当“是否进行用户身份校验”为是时必填，可参考</font>[用户身份验证插件开发指南](https://alipaytbox.yuque.com/sxs0ba/huntb8/qt7b0r4iaydeqf8h)完成相关插件的搭建并在此处进行选择。 |
| 渠道英文名称 | 否 | <font style="color:rgb(6, 10, 38);">仅当“是否进行用户身份校验”为是时必填，自定义渠道名称，支持字母、数字、下划线，且需保证其在应用维度内的唯一性。</font> |
| 勾选同意百宝箱 SDK 的授权协议 | 是 | <font style="color:rgb(6, 10, 38);">在正式启用（点击确定）前，需明确并同意下述协议内容。</font><br/>+ 开发者同意遵守所有相关法律法规<br/>+ 不得将服务用于任何非法或不当的场景<br/>+ 开发者需确保服务的使用符合百宝箱平台的政策和规定 |


### 二、接入 SDK
#### 在 Android 端引入
##### 步骤 1：环境准备
请确保开发环境满足以下最低版本要求：

+ Android Studio 4.2+
+ Gradle 7.0+

##### 步骤 2：引入 SDK
本 SDK 采用本地依赖方式接入，接入方式如下：

1. **导入 ARR 文件**。将获取的 SDK 压缩包解压，将其中的 .aar 文件复制到宿主工程的 app/libs/ 目录下。若该目录不存在，请手动创建。

```groovy
YourProject/
    └── app/
    └── libs/
    └── TBoxChat_release_dc5b542.aar
└── TBoxFramework_release_dc5b542.aar
```

2. **添加声明依赖**。<font style="color:rgb(6, 10, 38);">在应用模块的 </font>`<font style="color:rgb(6, 10, 38);">build.gradle</font>`<font style="color:rgb(6, 10, 38);"> (Module: app) 文件中，添加 SDK 本地依赖及必要的传递性依赖：</font>

```groovy
dependencies {
    // 1. 引入 libs 目录下的 SDK AAR 文件
    implementation fileTree(dir: file('libs'), include: ['*.aar'])

    // 2. 引入 SDK 必需的传递性依赖
    implementation("androidx.webkit:webkit:1.6.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("wang.harlon.quickjs:wrapper-android:3.2.0")
    implementation("com.google.code.gson:gson:2.10")
    implementation("com.github.bumptech.glide:glide:4.15.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
```

##### 步骤 3：声明权限。
请在 `AndroidManifest.xml`<font style="color:rgb(6, 10, 38);">中声明以下权限，以确保语音、定位及网络功能正常运行：</font>

```xml
<!-- 网络访问权限 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 录音权限：用于语音转文字等功能 -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- 定位权限：用于涉及地理位置的 Agent 工作流 -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

##### 步骤 4：发起调用
1. **初始化**。请在用户同意隐私政策后，调用以下初始化方法。注意需传入企业版标识 `TBoxProduct.ENTERPRISE`。

```xml
// 建议在 Application 的 onCreate 中调用
TBox.init(application, TBoxProduct.ENTERPRISE)
```

2. **启动对话页**。调用 TBox.startChatActivity 即可打开指定 Agent 的对话界面。需传入通过登录认证体系获取的 code 和 channel，登录认证接入方式详细说明可参见：[OAuth身份认证介绍](https://alipaytbox.yuque.com/sxs0ba/huntb8/qt7b0r4iaydeqf8h)。

```kotlin
TBox.startChatActivity(
    activityContext,
    LaunchConfig(
        // agentId: 在「应用制作与发布」流程中获取的应用 ID
        agentId = "202508APQcJh03157691",
        // code: 通过登录认证机制获取的授权码
        code = authCode,
        // channel: 登录认证的渠道标识
        channel = "mychannel"
    ),
    // intentModifier: 可选 Lambda，用于定制 Intent 实例
    intentModifier = { it } 
)
```

#### 在 iOS 端引入
1. **依赖集成**。将提供的`<font style="color:rgb(6, 10, 38);">TBoxWebKit.xcframework</font>`<font style="color:rgb(6, 10, 38);"> 直接拖入 Xcode 工程或通过 Swift Package Manager / CocoaPods 集成。</font><img src="https://cdn.nlark.com/yuque/0/2025/png/26013006/1760606244902-2208c9d3-6955-4d3f-ae43-c63f1990b478.png" width="1964" title="" crop="0,0,1,1" id="yN5MC" class="ne-image">
2. **声明权限**。请在 `Info.plist`中增加一下字段以声明隐私权限：
    - <font style="color:rgb(6, 10, 38);">语音权限</font>
        * <font style="color:rgb(6, 10, 38);">字段：</font>`<font style="color:rgb(6, 10, 38);">NSMicrophoneUsageDescription</font>`
        * <font style="color:rgb(6, 10, 38);">用途：用于语音转文字等语音交互功能。</font>
    - <font style="color:rgb(6, 10, 38);">定位权限</font>
        * <font style="color:rgb(6, 10, 38);">字段：</font>`<font style="color:rgb(6, 10, 38);">NSLocationAlwaysUsageDescription</font>`
        * <font style="color:rgb(6, 10, 38);">字段：</font>`<font style="color:rgb(6, 10, 38);">NSLocationWhenInUseUsageDescription</font>`
        * <font style="color:rgb(6, 10, 38);">字段：</font>`<font style="color:rgb(6, 10, 38);">NSLocationUsageDescription</font>`
        * <font style="color:rgb(6, 10, 38);">用途：用于涉及地理位置的 Agent 工作流。</font>
3. **功能调用**。通过 `TBoxWebSDK` 类生成对话页面控制器。必须传入 `Agent ID` 并指明版本类型（企业版或社区版）。若需监听内部生命周期，可实现 `TBoxServiceDelegate` 协议。方法签名如下：

```objectivec
@interface TBoxWebSDK : NSObject

/// 生成智能体对话页面
/// - Parameters:
///   - bizType: 智能体来源，TBoxBizTypeCommunity 表示社区版，TBoxBizTypeInc 表示企业版
///   - bizInfo: 智能体的入参，TBoxConfigTypeAgentID 必传。bizType 为 TBoxBizTypeInc 时，TBoxConfigTypeChannel 和 TBoxConfigTypeCode 也需要传
///   - serviceDelegate: 外部注入的方法
+ (UIViewController<TBoxServiceProvider> *)tboxServiceWithBizType:(TBoxBizType)bizType bizInfo:(NSDictionary<TBoxConfigType, NSString *> *)bizInfo serviceDelegate:(id<TBoxServiceDelegate> _Nullable)serviceDelegate;

@end
```

调用示例如下：

```swift
let vc = TBoxWebSDK.tboxService(with: .inc, bizInfo: [
    .agentID : "202509APC3jR04113442",
    .channel : "myChannel",
    .code : authCode,
], serviceDelegate: nil)

navigationController?.pushViewController(vc, animated: true)
```

其中，code 和 channel，登录认证接入方式详细说明可参见：[OAuth身份认证介绍](https://alipaytbox.yuque.com/sxs0ba/huntb8/qt7b0r4iaydeqf8h)。
