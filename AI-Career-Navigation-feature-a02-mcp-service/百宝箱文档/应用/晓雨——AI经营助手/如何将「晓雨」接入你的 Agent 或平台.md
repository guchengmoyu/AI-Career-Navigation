

您可根据您的角色或者需求，参考以下两种场景，来进行调用令牌的申请。

+ 您作为商家，想查看自己的经营数据，有自己的SaaS平台或者Agent，想要将「晓雨」接入您自身的 Agent 或平台中，则建议参考**<font style="color:#000000;">场景一：自调用。</font>**
+ 您作为服务商，想代商家调用查看商家的经营数据，有自己的SaaS平台或者Agent，想要将「晓雨」接入您自身的 Agent 或平台中来给商家提供服务，则建议参考**<font style="color:#000000;">场景二：代调用。</font>**

# 场景一：自调用
基于您的企业支付宝账号所绑定的商家经营账户，自动获取您在支付宝平台的经营数据，并进行数据分析。

## 步骤一：完成账号登录与申请
1. 访问[支付宝 AI 开放平台](https://open.alipay.com/ai/ai-resource-center/welcome)，并使用**【企业支付宝】**进行登录，登录完成后点击首页的【立即申请】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783496772675-62d826c5-b8a4-4007-8895-cc7807352d7e.png" width="2560" title="" crop="0,0,1,1" id="ub471c370" class="ne-image">

2. 完成基础信息的填写后，可点击提交，我们会在3-5工作日内审核完成，<font style="color:rgb(0, 0, 0);">审批通过后会给您填写的【联系手机号】发短信告知，请及时关注。</font>

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783496863351-1313ffe7-a216-46fe-a33c-3365a6680d82.png" width="2560" title="" crop="0,0,1,1" id="u66731910" class="ne-image">

## 步骤二：完成「晓雨」智能体的订阅
3. 完成账号登录后，点击左侧的【市场】tab，在【AI资源市场】的【资源订阅】下直接去搜索「**晓雨**」。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783496228499-492969ed-9766-47ba-8719-1c9bf3996440.png" width="2560" title="" crop="0,0,1,1" id="uf37fdf40" class="ne-image">

4. 搜索结果页面如下，点击打开详情。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783496267401-b0351cc3-aa59-4fe5-b5f5-bc73653af345.png" width="2560" title="" crop="0,0,1,1" id="ud8eb4f3b" class="ne-image">

5. 详情界面有关于「**晓雨**」能力的相关介绍，可进行查看。点击【立即订阅】按钮来完成订阅。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783496322895-5c857af2-89e0-4218-bf0d-735b61e01194.png" width="2560" title="" crop="0,0,1,1" id="u88b4643d" class="ne-image">

## 步骤三：获取URL+API Key
6. 订阅成功后，界面如下，可直接点击【去使用】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783500032874-f07de5a0-0850-4721-b162-083e5f9aa776.png" width="2560" title="" crop="0,0,1,1" id="u1901ccf9" class="ne-image">

7. 点击【去使用】后会跳转至【我的智能体-我订阅的】，点击【查看详情】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783500603275-8719021c-1879-4c8f-b381-9a6ae33ba1df.png" width="2560" title="" crop="0,0,1,1" id="u0ff5ce96" class="ne-image">

8. 在【查看详情】界面即可获取外部调用的【URL】以及【API key】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783500438095-0c682dfe-4b3e-452f-9077-b80b8c6fe8dd.png" width="2560" title="" crop="0,0,1,1" id="u33cae374" class="ne-image">

PS：**<font style="color:#000000;">API Key</font>** 的配置流程可参考以下文档。

[小程序文档 - 支付宝文档中心](https://opendocs.alipay.com/ai/0jb1nj?pathHash=085f5514)

# 场景二：代调用
基于您所选定的、并且经第三方已授权给您的企业支付宝账户，代为获取该账户在支付宝平台的经营数据，并进行数据分析。

## 步骤一：完成服务商身份注册
1. 访问[支付宝开放平台](https://open.alipay.com)，并使用**【企业支付宝】**进行登录，若不是**<font style="color:#000000;">服务商身份</font>**，则根据页面引导完成服务商身份的认证，若已是服务商身份，则忽略可进行下一步。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783501208979-b9e967d0-e970-42f7-bfa4-91e3d801221a.png" width="2560" title="" crop="0,0,1,1" id="u99f32729" class="ne-image">

PS：完成【服务商认证】所需要的信息材料可见如下文档：

[小程序文档 - 支付宝文档中心](https://opendocs.alipay.com/common/02khjv?pathHash=b2bddc6a)

2. 完成服务商身份认证后，点击右上角的【控制台】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783504628502-6b7c9718-fe2f-48b7-ae1a-4308652aa03a.png" width="2560" title="" crop="0,0,1,1" id="ubd1f0ea9" class="ne-image">

## 步骤二：创建第三方应用
3. 选择【第三方应用】，若已有处于【已上线】状态的第三方应用，则可以直接使用。若没有，则需要新建一个三方应用，并推进流程至上线。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783504955156-9d4adb2f-f66f-4a4d-b384-945952235990.png" width="2560" title="" crop="0,0,1,1" id="uebb97f1f" class="ne-image">

PS：第三方应用的开发流程可参考如下文档：

[小程序文档 - 支付宝文档中心](https://opendocs.alipay.com/isv)

## 步骤三：向管理员申请白名单
4. 选择处于【已上线】状态的第三方应用，点击复制，可获取【appid】，点击头像可获取【2088id】。
5. 扫描下方二维码，进入官方钉钉群聊，向管理员提出【晓雨代调用白名单申请】，并提供【appid】以及**服务商**的以及**代调用的商家**的【2088id】。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783505780533-d79d8a24-a7ed-4f9a-8f27-401ba803cf03.png" width="2560" title="" crop="0,0,1,1" id="ub2afb69d" class="ne-image">

## 步骤四：受邀商家签约
6. 官方完成白名单处理后，商家的支付宝会收到对应的【代调用授权邀请】，需要商家确认授权。
+ 商家可在手机端的【支付宝APP】中进行处理。
+ 商家可在PC端登陆[支付宝开放平台](https://open.alipay.com/)，在待办任务中进行处理。

## 步骤五：获取代调用token
7. 商家完成授权后，进入第三方应用的详情，在【商家授权】的列表中服务商可获取代调用token。

<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1783506844501-555c79b3-4875-4896-b50b-72ed24863b79.png" width="2560" title="" crop="0,0,1,1" id="ue4e97089" class="ne-image">

# 联系我们
若您在使用百宝箱的过程中有任何意见与建议，都可以通过下述方式与我们取得联系，让百宝箱与您一起智构行业未来！

+ 业务咨询热线（8:00-24:00）：4007585858。
+ 服务邮箱：tbox@service.alipay.com。
+ 官方钉钉群聊，请扫描下方二维码：

<img src="https://mdn.alipayobjects.com/huamei_b00jk5/afts/img/A*crkBQprewG0AAAAAQWAAAAgAegitAQ/original" width="218" title="" crop="0,0,1,1" id="JWwM0" class="ne-image">
