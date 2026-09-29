想必开发者们已经通过 AI 卡片生成功能，生成了理想的卡片样式，但静态展示远远不够？别急——现在，只需一句话就能为卡片配置**点击事件**，让你的卡片实现真正的“即开即用”！

## 原理简介
AI 生成卡片的点击实现有两个重要的环节：

1. AI 理解用户通过自然语言的需求描述内容，遵循其中的指令生成 `window.tboxBridge`函数；
2. 各端容器正确注册并成功调用 `window.tboxBridge`函数下相关方法。

## 现已支持
| 能力 | 事件 | 说明 |
| --- | --- | --- |
| 发送 Query | `window.tboxBridge.sendQuery` | 点击后自动向智能体提交预设的问题 |
| 打开链接 | `window.tboxBridge.openScheme` | 一键跳转至网页、落地页或帮助中心。在支付宝小程序中使用时，支持半屏打开。 |
| 填充输入框 | `window.tboxBridge.fillInput` | 引导用户填写信息并提交（如反馈、备注等） |
| 拨打电话 | `window.tboxBridge.makePhoneCall` | 直接触发设备拨号功能。<br/>+ PC 端（Mac）：调用 FaceTime 实现通话。<br/>+ 移动端：调用手机拨号键盘。 |
| 启动地图导航 | `window.tboxBridge.openLocation` | 点击即唤起导航应用，前往指定地点。 |


## 实现方式
### 💬 发送 Query
+ **提示词参考：**`增加一个“查看详情”按钮，点击事件换成发送“查看详情”消息`。
+ **生成代码：**

```html
 // 添加按钮点击事件
      var detailButton = document.getElementById('detailButton');
      if (detailButton) {
        detailButton.addEventListener('click', function() {
          if (window.tboxBridge && window.tboxBridge.sendQuery) {
            window.tboxBridge.sendQuery({
              question_content: '我想了解${shopName}的详情信息'
            });
          }
        });
      }
```

+ **效果展示：**

<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767950626760-cdec4f19-c5c6-443d-bb55-c2b54e67ffaf.png?x-oss-process=image%2Fcrop%2Cx_14%2Cy_12%2Cw_399%2Ch_848" width="399" title="" crop="0.0339,0.012,1,0.8609" id="ua501e74a" class="ne-image">

### 📱 拨打电话
+ **提示词参考：**`增加一个打电话的按钮，放在查看详情的右边，电话号码默认010-123456`。
+ **生成代码：**

```html
// 添加打电话按钮点击事件
      var callButton = document.getElementById('callButton');
      if (callButton) {
        callButton.addEventListener('click', function() {
          if (window.tboxBridge && window.tboxBridge.makePhoneCall) {
            window.tboxBridge.makePhoneCall({
              number: getParam('phoneNumber')
            });
          }
        });
      }
```

+ **效果展示：**
    - PC 端<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767951239956-6a1e2737-1426-45d7-9dcb-ea511df51d54.png" width="1689" title="" crop="0,0,1,1" id="uad0d668e" class="ne-image">
    - 移动端

<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767951253393-ba900e33-3838-4d58-a674-94bf298091eb.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_287%2Cw_592%2Ch_993" width="399" title="" crop="0,0.2241,1,1" id="xuiLk" class="ne-image">

### 🔗 打开链接
#### 渲染方式 1：直接跳转
+ **提示词参考：**`<font style="color:rgb(10, 10, 10);">增加“店铺链接”按钮，支持点击跳转链接</font>`
+ **生成代码：**

```html
   <a class="route-card__shop-link" href="${shop.detailUrl}" target="_blank">查看详情</a>
```

+ **效果展示：**<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767951457077-baada666-e786-45bd-badc-e049ba80181d.png?x-oss-process=image%2Fcrop%2Cx_59%2Cy_22%2Cw_1690%2Ch_862" width="1690" title="" crop="0.0335,0.0237,1,0.9526" id="u00d45203" class="ne-image">

#### 渲染方式 2：半屏打开
+ **提示词参考：**`<font style="color:rgb(10, 10, 10);">店铺的链接，需要支持支付宝半屏打开的点击事件</font>`<font style="color:rgb(10, 10, 10);">。</font>
+ **生成代码：**

```javascript
document.querySelectorAll('[data-action="openScheme"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (window.tboxBridge && typeof window.tboxBridge.openScheme === 'function') {
            window.tboxBridge.openScheme({
                scheme: url,
                halfscreenHeight: 80
            });
        } else {
            console.warn('tboxBridge.openScheme is not available');
        }
    });
});
```

### 🌏 地图导航
+ **提示词参考：**`<font style="color:rgb(10, 10, 10);">增加店铺的导航按钮，放在每个店铺内容的右边</font>`。
+ **生成代码：**

```html
// 添加导航按钮点击事件
      var navButton = document.getElementById('navButton');
      if (navButton) {
        navButton.addEventListener('click', function() {
          if (window.tboxBridge && window.tboxBridge.openLocation) {
            window.tboxBridge.openLocation({
              latitude: getParam('latitude'),
              longitude: getParam('longitude'),
              name: getParam('scenicName'),
              address: getParam('address')
            });
          }
        });
      }
```

+ **效果展示：**
    - PC 端：<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767952740245-8d4f4805-4f2c-47d4-999d-d9f66d08c759.png" width="2552" title="" crop="0,0,1,1" id="u6a504175" class="ne-image">
    - 移动端：

[此处为语雀卡片，点击链接查看](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_ai_onclick#DPy6K)

### ✍️ 输入框填充
+ **提示词参考：**`增加一个需要用户输入备注信息的输入框，放在卡片的底部`。
+ **生成代码：**

```html
 // 添加备注输入框事件处理
      var remarkInput = document.getElementById('remarkInput');
      if (remarkInput) {
        remarkInput.addEventListener('change', function() {
          // 这里可以处理备注信息的保存逻辑
          console.log('备注信息:', remarkInput.value);
        });
      }
```

+ **效果展示：**

<img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1767953306537-bd6f1f31-fdb9-4b45-9625-77301e7dbd2f.png" width="394" title="" crop="0,0,1,1" id="u38fa3952" class="ne-image">

## 总结
在使用 AI 卡片的事件能力时，需要在提示词中明确指出：

+ **所需事件**，如“打开链接”等；
+ **事件位置**，如“卡片底部”，“查看详情按钮”等；
+ **必要参数**，如“配置兜底电话号码 010-123456”，“配置跳转链接”等；

通过以上标准化配置，可高效构建兼具信息展示与多通道交互能力的智能服务卡片，适用于客服、导购、本地生活等场景。
