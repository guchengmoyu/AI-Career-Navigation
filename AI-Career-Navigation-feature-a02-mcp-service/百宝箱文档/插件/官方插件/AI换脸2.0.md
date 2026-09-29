## 插件介绍
:::tips
提供智能替换模版图片中的人脸功能

:::

## 渠道支持
:::tips
支付宝小程序插件、支付宝小程序H5服务、自有APP

:::

## C端使用流程
<img src="https://cdn.nlark.com/yuque/0/2025/png/26013006/1766376086093-31dab918-bcc4-4526-bda8-4829f3b6533c.png" width="972.5" title="" crop="0,0,1,1" id="uf12a6b56" class="ne-image">

## 插件配置流程
#### 意图prompt
```plain
 ai换脸
    - 描述：当用户需要对人像照片进行换脸处理“我要换脸”、“AI换脸”、“AIGC”，意图为 ai换脸，参数为AI换脸
     - 参数: 
         - 图像美化类型 (string):   “AI换脸”   。
```

#### 插件引文档
[插件市场概述](https://alipaytbox.yuque.com/sxs0ba/huntb8/gy5d5okxcdorfk7t)

#### 插件参数配置
| 配置 | 参数说明 |
| --- | --- |
| <img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763990593063-2ef3878e-e287-4741-b3a8-f1dbc9f80d32.png" width="527" title="" crop="0,0,1,1" id="MZz5d" class="ne-image"> | + 玩法介绍：活动介绍文案，文本格式<br/>+ 换脸模板：格式<br/>"f556d4b36a831860b4351185c068589b","516065e07412eb0245b39a1bc4d9c878","990055ff69edb9b292b088947960e9b7","66d37ea9812091c12eda6da871927925"，MD5参数取值见：<font style="color:#DF2A3F;">预置图片素材。</font><br/>+ 换脸选择配置：<br/>    - 上传图片按钮：<br/>        * 按钮名称：文本格式，默认：上传图片<br/>        * 按钮类型：上传图片<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：空<br/>    - 生成记录按钮：<br/>        * 按钮名称：文本格式，支持自定义<br/>        * 按钮类型：生产记录<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：[https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync](https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync)<br/>+ 换脸结果配置：<br/>    - 分享按钮：（仅限支付宝端可用）<br/>        * 按钮名称：文本格式，默认：分享<br/>        * 按钮类型：分享<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：空<br/>    - 生成记录按钮：<br/>        * 按钮名称：文本格式，支持自定义<br/>        * 按钮类型：生成记录<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：[https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=synchttps://render.alipay.com/](https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync) |


#### 预置图片素材
:::tips
定制换脸图片，请联系百宝箱运营官方

:::

** 将模版对应的md5值拼接成list替换到 ****<font style="color:#DF2A3F;">换脸模版</font>**

如："f556d4b36a831860b4351185c068589b","516065e07412eb0245b39a1bc4d9c878","990055ff69edb9b292b088947960e9b7","66d37ea9812091c12eda6da871927925"

| 名字 | 换脸模板url | md5 |
| --- | --- | --- |
| 换脸图片1 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*zwvOQ6uA3IYAAAAAR2AAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*zwvOQ6uA3IYAAAAAR2AAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">897d3b92666bb3d763c56b830094f597</font> |
| 换脸图片2 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*7PpMTLgUKRcAAAAARiAAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*7PpMTLgUKRcAAAAARiAAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">dff0f1319314a8ef25482af0fc52ac35</font> |
| 换脸图片3 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*8HBBR4STCOUAAAAAT7AAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*8HBBR4STCOUAAAAAT7AAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">b422a9de59d2917bf226de83c14fec2f</font> |





