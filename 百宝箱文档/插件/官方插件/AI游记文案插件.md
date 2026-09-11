## 功能介绍
支持游客游玩后，一键生成游历文案功能，游客可以一键复制，分享到微信、小红书等平台。

支持query：游记生成、ai游记生成、ai游记、游记等

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987767029-1e42d1aa-db10-4e17-8e22-027612b6f3da.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_143%2Cw_1180%2Ch_2413" width="242.9943084716797" title="" crop="0,0.0559,1,1" id="u54666935" class="ne-image"><img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987766868-c849d922-dbf1-4729-b5d5-1d385705cb20.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_144%2Cw_1180%2Ch_2412" width="242.98863220214844" title="" crop="0,0.0563,1,1" id="uc143e3a5" class="ne-image"><img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987767614-8fa7870c-de3a-4868-b9f4-fcf207879d88.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_152%2Cw_1180%2Ch_2404" width="243.991455078125" title="" crop="0,0.0595,1,1" id="u53b7c3d1" class="ne-image">

## 接入步骤
### **<font style="color:rgb(38, 38, 38);">意图识别节点 - prompt中增加意图：</font>**
```plain
AI游记文案
  - 描述: 涉及到游记生成相关的提问，比如：游记生成、ai游记生成、ai游记、游记等。
  - 意图参数列表:
      - 文案风格 (string): 用户提问中提到的文案风格（如："口语化","幽默","简洁","正式","礼貌","伤感","高级感","治愈"）,多个使用逗号','分割开。
      - 文案字数 (string): 用户提问中提到的文案字数（如：100、200、300、400、500、1000、1500、2000、2500、3000）,多个使用逗号','分割开。
     - 是否携带表情 (string): 用户提问中提到的是否携带表情（如：是、否）,多个使用逗号','分割开。
```

### 统一输出平铺的参数节点- 确认参数
> 确认下图中四个参数是否存在，如果不存在需要增加四个参数，如下图。（**<font style="color:#DF2A3F;">顺序无要求</font>**）
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987766230-d166eb03-9388-4e91-82ce-43ce2c7e5531.png" width="443.6363540208046" title="" crop="0,0,1,1" id="u7fae4fae" class="ne-image">

### 意图识别路由分支节点-增加AI游记文案路由
<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987766413-8dc36613-4d7d-44c0-ab28-dc8ac6c870f1.png?x-oss-process=image%2Fcrop%2Cx_89%2Cy_0%2Cw_985%2Ch_1142" width="448.9942932128906" title="" crop="0.0723,0,0.8693,1" id="u95a58e09" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987767812-2e3ca399-5b5d-4fd4-9633-e429f54c9b4f.png?x-oss-process=image%2Fcrop%2Cx_14%2Cy_0%2Cw_495%2Ch_637" width="450" title="" crop="0.0277,0,0.9851,0.9634" id="ue454ed7f" class="ne-image">

### 引入AI游记文案插件
> 注：这里从插件市场搜索引用AI游记文案插件。
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987768275-b31f650f-2966-45b4-b05b-512510d35c05.png" width="637.1760864257812" title="" crop="0,0,1,1" id="u816cca05" class="ne-image">



> 拖到AI游记文案插件后，输入项中根据名称中的参数，**<font style="color:#DF2A3F;">引用“统一输出平铺的参数”中的对应值。</font>**
>
> + writingStyle - 文案风格（口语化,幽默,简洁,正式,礼貌,伤感,高级感,治愈）
> +  writingCount - 文案字数（100,200,300,400,500,1000,1500,2000,2500,3000）
> + carryEmoji - 是否携带表情（是/否）
> + intent_params - 意图参数
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987768361-4d2d333f-0768-417f-88c4-de87ad498c47.png" width="441.8181722420308" title="" crop="0,0,1,1" id="u83d16342" class="ne-image">

### 结束节点
> 拖入结束节点后
>
> a. 在文本消息中点击“添加输入项”，增加文本流。如图所示。
>
> b. 添加消消息。添加消息 -> 卡片消息 -> 插件卡片（AI游记文案）
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987769037-02928a55-7833-4dcd-994c-96123d157e1e.png" width="753.6363473017357" title="" crop="0,0,1,1" id="ub2306e6b" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987769468-e06ee69b-d2ab-49e7-9570-773f56540a87.png" width="506.36362538850034" title="" crop="0,0,1,1" id="u59d55592" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987769128-91a759b0-2678-4f6f-b2b4-e81b7f0e30cf.png" width="1033.6363412328992" title="" crop="0,0,1,1" id="ufa49e64a" class="ne-image">

## 业务参数
**<font style="color:#DF2A3F;">注意：一般情况只需调整基础参数即可，高级参数报错不变。</font>**

> 基础参数：
>
> 1、<font style="color:rgba(0, 0, 0, 0.88);">游玩路线景点推荐标签个数 - 游玩路线标签推荐景点最大数量</font>
>
> <font style="color:rgba(0, 0, 0, 0.88);">2、美食推荐标签个数 - 美食推荐标签最大推荐美食数量</font>
>
> <font style="color:rgba(0, 0, 0, 0.88);">3、酒店推荐标签个数 - 酒店推荐标签最大推荐酒店数量</font>
>



> 高级参数：
>
> 1、校验必填参数列表
>
> 2、限制必填字段个数
>
> <font style="color:rgba(0, 0, 0, 0.88);">3、标签收集卡预设回复文案</font>
>
> <font style="color:rgba(0, 0, 0, 0.88);">4、ai游记生成预设回复文案</font>
>
> <font style="color:rgba(0, 0, 0, 0.88);">5、收集卡片数据</font>
>

<img src="https://cdn.nlark.com/yuque/0/2025/png/58872523/1763987769829-fd3fb3e5-c46a-4a74-a90b-267078266a78.png" width="1529.9999668381438" title="" crop="0,0,1,1" id="uaf85e5e1" class="ne-image">



## Release Note
| 版本 | 功能描述 | 支持卡片 |
| --- | --- | --- |
| v1.0  0724 |  |  |







