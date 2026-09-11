## 插件介绍
:::tips
提供智能合成图片海报功能

:::

## 渠道支持
:::tips
支付宝小程序插件、支付宝小程序H5服务、自有APP

:::

## C端使用流程
<img src="https://cdn.nlark.com/yuque/0/2026/png/52106240/1767672148940-85c91a07-3257-4ba8-b193-588ecbcc183d.png" width="2018.5" title="" crop="0,0,1,1" id="u6b074499" class="ne-image">

## 插件配置流程
#### 意图prompt
```plain
 ai合图
    - 描述：当用户需要对人像照片进行合图处理“我要合图”、“AI合图”、“AIGC”，意图为 ai合图，参数为AI合图
     - 参数: 
         - 图像美化类型 (string):   “AI合图”。
```

#### 插件引文档
[插件市场概述](https://alipaytbox.yuque.com/sxs0ba/huntb8/gy5d5okxcdorfk7t)

#### 插件参数配置
| 配置 | 参数说明 |
| --- | --- |
| <br/><img src="https://cdn.nlark.com/yuque/0/2025/png/52106240/1766396648488-845fbf50-04ea-4920-b53c-62e25ddab669.png" width="189.5" title="" crop="0,0,1,1" id="uc906356a" class="ne-image"><br/>[{"btnName":"生成记录","btnType":"h5","jumpUrl":"[https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync"},{"btnName":"](https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync"},{"btnName":")分享","showType":"primary","btnType":"share","jumpUrl":"alipays://platformapi/startapp?appId=20002117&target=agent&agentId=jiangxiaoyu&query=江心屿活动打卡"}]<br/><br/>["1e8b317f144a8e39a36bd9e51e3aa6da","c315690f6169e43a3f633e875f31a104"] | + 玩法介绍：活动介绍文案，文本格式<br/>+ 合图模板：格式<br/>"1e8b317f144a8e39a36bd9e51e3aa6da","c315690f6169e43a3f633e875f31a104"，MD5参数取值见：<font style="color:#DF2A3F;">预置图片素材。</font><br/>+ 合图选择配置：<br/>    - 上传图片按钮：<br/>        * 按钮名称：文本格式，默认：上传图片<br/>        * 按钮类型：上传图片<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：空<br/>    - 生成记录按钮：<br/>        * 按钮名称：文本格式，支持自定义<br/>        * 按钮类型：生产记录<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：[https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync](https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync)<br/>+ 合图结果配置：<br/>    - 分享按钮：（仅限支付宝端可用）<br/>        * 按钮名称：文本格式，默认：分享<br/>        * 按钮类型：分享<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：空<br/>    - 生成记录按钮：<br/>        * 按钮名称：文本格式，支持自定义<br/>        * 按钮类型：生成记录<br/>        * 按钮颜色：支持自定义浅色、深色按钮形式<br/>        * 链接地址：[https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=synchttps://render.alipay.com/](https://render.alipay.com/p/c/180020570000115506/index.html?caprMode=sync)<br/>需要配置请联系平台 |


#### 预置图片素材
:::tips
定制合图图片，请联系百宝箱运营官方

:::

** 将模版对应的md5值拼接成list替换到 ****<font style="color:#DF2A3F;">合图模版</font>**

如："f556d4b36a831860b4351185c068589b","516065e07412eb0245b39a1bc4d9c878","990055ff69edb9b292b088947960e9b7","66d37ea9812091c12eda6da871927925"

| 名字 | 合图模板url | md5 |
| --- | --- | --- |
| 合图图片1 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*zwvOQ6uA3IYAAAAAR2AAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*zwvOQ6uA3IYAAAAAR2AAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">897d3b92666bb3d763c56b830094f597</font> |
| 合图图片2 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*7PpMTLgUKRcAAAAARiAAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*7PpMTLgUKRcAAAAARiAAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">dff0f1319314a8ef25482af0fc52ac35</font> |
| 合图图片3 | [https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*8HBBR4STCOUAAAAAT7AAAAgAel-hAQ/original](https://mdn.alipayobjects.com/huamei_nzq4hr/afts/img/A*8HBBR4STCOUAAAAAT7AAAAgAel-hAQ/original) | <font style="color:rgb(77, 77, 77);">b422a9de59d2917bf226de83c14fec2f</font> |


## 体验码
<img src="https://cdn.nlark.com/yuque/0/2025/png/26013006/1761098183854-1eb6cef0-6d03-451c-bd11-8e6244851447.png" width="332" title="" crop="0,0,1,1" id="CyoE2" class="ne-image">


