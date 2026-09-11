<font style="color:rgba(0, 0, 0, 0.88);">适用于在独立的APP中快速集成智能体对话页面，接入</font>[客户端SDK](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/ob14bn/ufvyrvzc0k0embuc#SXB7L)<font style="color:rgba(0, 0, 0, 0.88);">来集成对话H5页</font>

# 操作步骤
## 上架至自有APP
1. 应用创建完成后，单击页面右上角“发布”。“确认发布”后，进入发布渠道页面。

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1756446243071-e313feff-f191-42c3-9020-46dae7778d53.png" width="1590.0000421206169" title="" crop="0,0,1,1" id="ub40c560d" class="ne-image">

2. 在发布渠道页面，“自有APP”下点击“上架”。

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1764580281667-f142c78c-f127-4eea-a3b9-ab7347945805.png" width="536.6666808834786" title="" crop="0,0,1,1" id="u20515389" class="ne-image">

3. 在“<font style="color:rgba(0, 0, 0, 0.88);">上架自有APP</font>”弹窗中，完成表单配置：

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1764580281659-06da968a-1ac2-46aa-87ef-49df28a968b0.png" width="862.2222450633114" title="" crop="0,0,1,1" id="u4bab93a4" class="ne-image">

| <font style="color:#FFFFFF;">参数名称</font> | <font style="color:#FFFFFF;">说明</font> |
| --- | --- |
| <font style="color:rgba(0, 0, 0, 0.88);">自有APP名称</font> | 请输入您自有APP的名称 |
| <font style="color:rgba(0, 0, 0, 0.88);">是否进行用户身份校验</font> | 指用户进入小程序后访问智能体应用，进行用户身份校验将保障用户身份信息在小程序和智能体应用中是一致的、安全的。仅支持选择“是”。 |
| <font style="color:rgba(0, 0, 0, 0.88);">用户身份校验对接开发</font> | 请参考 [指导手册](https://alipaytbox.yuque.com/sxs0ba/huntb8/qt7b0r4iaydeqf8h)，完成相关插件的开发。<br/>如“不”进行<font style="color:rgba(0, 0, 0, 0.88);">用户身份校验，无需进行操作该步骤。</font> |
| <font style="color:rgba(0, 0, 0, 0.88);">添加插件</font> | 将上一步开发的插件添加至表单。<br/>如“不”进行<font style="color:rgba(0, 0, 0, 0.88);">用户身份校验，无需进行操作该步骤。</font> |
| <font style="color:rgba(0, 0, 0, 0.88);">渠道英文名称</font> | 为渠道进行英文命名，<font style="color:rgb(31, 31, 31);">支持字母、数字、横线或下划线，该名称应用纬度唯一。</font><br/>如“不”进行<font style="color:rgba(0, 0, 0, 0.88);">用户身份校验，无需进行操作该步骤。</font> |
| <font style="color:rgba(0, 0, 0, 0.88);">接入客户端SDK</font> | <font style="color:rgba(0, 0, 0, 0.88);">可通过</font>[客户端SDK](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/ob14bn/ufvyrvzc0k0embuc#SXB7L)<font style="color:rgba(0, 0, 0, 0.88);">来调用当前智能体服务。</font><font style="color:rgba(0, 10, 26, 0.89);">在启用接入客户端 SDK之前，请仔细阅读授权协议并进行勾选授权。</font> |


完成表单配置后，点击“确定”提交表单。

4. 上架表单提交后，平台将自动发起智能体的上架，您可以通过客户端SDK调用智能体服务。

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1764580281797-665ea65c-92fb-4403-9a8b-5fdb3ae7a65a.png" width="535.5555697429331" title="" crop="0,0,1,1" id="u11a88aa3" class="ne-image">



## 下架至自有APP服务
点击“申请下架”，再次确认后，即可实现取消上架。

> <font style="color:#000000;">注意：</font>
>
> + <font style="color:#000000;">取消上架后，请在APP侧及时下架相关入口</font>
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1764580281668-b4e53a11-4793-48a1-84ec-1157bc3c534d.png" width="543.3333477267516" title="" crop="0,0,1,1" id="u0292ec3f" class="ne-image">





## 更新上架
当您创作了新的版本后，如需对新版本进行上架，无需下架线上版本，只需点击“更新上架”，即可实现对新版的上线。

<img src="https://cdn.nlark.com/yuque/0/2025/png/50703104/1764580281817-ae727079-3008-4273-b2e2-b85f301f9d09.png" width="533.8889030321149" title="" crop="0,0,1,1" id="u6d8937a3" class="ne-image">








