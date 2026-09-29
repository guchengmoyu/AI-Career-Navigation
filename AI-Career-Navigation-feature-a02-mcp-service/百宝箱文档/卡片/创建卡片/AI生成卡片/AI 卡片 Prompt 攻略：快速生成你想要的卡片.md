你是不是也遇到过这些问题？

> “为什么别人用 AI 卡片能做出高颜值、高转化的设计，而我写的提示词却总是得不到理想结果？”
>
> “明明描述得很清楚了，AI 为什么还是‘听不懂’？”
>

别担心！这并不是你的问题——而是你还没掌握写好 Prompt 的“正确姿势”。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762235268973-306bd5cf-27c1-4f58-a07e-18bd4e1e420a.png" width="1388" title="" crop="0,0,1,1" id="u5f095284" class="ne-image">

本文将手把手教你如何在百宝箱 - AI生成卡片功能中，通过精准的提示词（Prompt），高效生成符合业务需求的卡片。

:::info
**💡**** 说明：**

本文聚焦于「卡片生成」这一特定场景。虽然大模型通用的 Prompt 技巧也适用，但不同产物（如代码、图片、视频）有细微差异。我们只讲最实用的卡片技巧！

:::

## ✅ 技巧 1：按「卡片结构」写 Prompt
当你第一次进入 AI 卡片页面时，面对的是一个空白输入框。这时候，越结构化、越具体的描述，越容易一次生成理想卡片。

建议按以下 4 个维度组织你的 Prompt：

| 维度	 | 描述示例 |
| --- | --- |
| 1. 卡片用途 | “帮我生成一张景点介绍的卡片” |
| 2. 卡片内容	 | “包含顶部标题、中间景点大图、下方文字描述、底部‘了解详情’按钮” |
| 3. 卡片布局 | “标题在顶部，图片居中，描述在图片下方，按钮固定在底部” |
| 4. 视觉细节 | “标题加粗，按钮使用支付宝蓝色” |


### 实战案例
#### 案例 1：生成景点介绍卡片
```latex
帮我生成一张景点介绍的卡片。
卡片包含：顶部标题、中间景点大图、下方景点描述、底部“了解详情”按钮。
布局：标题在最上方，图片居中，描述紧接图片下方，按钮固定在底部。
样式：标题加粗，按钮使用支付宝蓝色。
```

生成效果如下图。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762235898768-b176fb6e-cabd-4ec7-b5b9-198980027cc1.png" width="440" title="" crop="0,0,1,1" id="u20764e9c" class="ne-image">

#### 案例 2：生成验证码输入卡片
```latex
帮我生成一张手机验证码输入的卡片。
包含：顶部标题、手机号输入框、验证码输入框 + “获取验证码”按钮、底部“确认”按钮。
布局从上到下依次排列。
确认按钮使用支付宝蓝色。
```

生成效果如下图。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762235961414-2c441219-18f3-4f15-b2cf-dd5bd5617d2d.png" width="440" title="" crop="0,0,1,1" id="ue63fbc7f" class="ne-image">

:::info
💡** 小提示：**这样写，AI 能清晰理解你的结构意图，大幅提高首稿的命中率！

:::



## ✅ 技巧 2：用<font style="color:rgb(17, 17, 51);">「明确指令」迭代修改</font>
<font style="color:rgb(17, 17, 51);">很少有人能一次生成完美卡片。</font>**<font style="color:rgb(17, 17, 51);">多轮对话是常态，关键在于“怎么改”</font>**<font style="color:rgb(17, 17, 51);">。</font>

❌ **<font style="color:rgb(17, 17, 51);">错误示范（模糊）：</font>**

+ <font style="color:rgb(17, 17, 51);">“这个不好看，改一下”</font>
+ <font style="color:rgb(17, 17, 51);">“颜色太暗了，亮一点”</font>

✅ **正确做法：**指出具体元素+明确修改动作

| 修改类型 | 推荐表达方式 |
| --- | --- |
| <font style="color:rgb(17, 17, 51);">背景颜色</font> | <font style="color:rgb(17, 17, 51);">“把卡片整体背景改成浅蓝色（#E6F7FF）”</font> |
| <font style="color:rgb(17, 17, 51);">元素尺寸</font> | <font style="color:rgb(17, 17, 51);">“按钮宽度改为和卡片等宽”</font> |
| <font style="color:rgb(17, 17, 51);">位置调整</font> | <font style="color:rgb(17, 17, 51);">“将标签移到卡片右下角”</font> |
| <font style="color:rgb(17, 17, 51);">数据类型</font> | <font style="color:rgb(17, 17, 51);">“把图片字段改为固定图片（常量），不要作为变量”</font> |


### 修改实战案例
#### 案例 1 优化
```latex
把底部的“了解详情”按钮缩短一些，并移动到卡片右下角。
```

优化后生成效果如下图。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762236103617-560e9371-752a-408f-8cd7-e471d05fb4ac.png" width="440" title="" crop="0,0,1,1" id="u2cced8fa" class="ne-image">

#### 案例 2 优化
```latex
把卡片的背景颜色换成蓝色，并且文案和按钮颜色适配一下
```

优化后生成效果如下图。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762236213338-399cf6ed-1c56-4cd4-809e-317d762becb9.png" width="440" title="" crop="0,0,1,1" id="udcb0ea76" class="ne-image">

:::info
💬 **小提示：**AI 是一位“专业但不会猜心思”的数字同事。你越明确，它越高效！

:::



## ✅ 技巧 3：善用<font style="color:rgb(17, 17, 51);">「局部修改」功能</font>
<font style="color:rgb(17, 17, 51);">对于细微调整（比如只改一个按钮或一段文字），推荐使用 </font>**<font style="color:rgb(17, 17, 51);">「局部修改」</font>**<font style="color:rgb(17, 17, 51);"> 功能，精准又省力！</font>

1. <font style="color:rgb(17, 17, 51);">点击卡片右上角 </font>**<font style="color:rgb(17, 17, 51);">【局部修改】</font>**<font style="color:rgb(17, 17, 51);"> 按钮；</font>
2. <font style="color:rgb(17, 17, 51);">在卡片上</font><font style="color:rgb(17, 17, 51);"> </font>**<font style="color:rgb(17, 17, 51);">点击你想修改的具体区域</font>**<font style="color:rgb(17, 17, 51);">（如按钮、标题、图片等）；</font>
3. <font style="color:rgb(17, 17, 51);">在弹出的输入框中，</font>**<font style="color:rgb(17, 17, 51);">直接输入修改指令</font>**<font style="color:rgb(17, 17, 51);">（参考第二步的写法）；</font>
4. <font style="color:rgb(17, 17, 51);">AI 会仅针对该区域进行优化，保留其他内容不变。</font>

:::info
📹 **小提示：**点击下方视频可查看局部修改操作演示。

:::

[此处为语雀卡片，点击链接查看](https://alipaytbox.yuque.com/sxs0ba/huntb8/card_prompt_guide#X0HQg)



## ❌ 避坑指南：这些说法 AI 真的“听不懂”！
<font style="color:rgb(17, 17, 51);">以下是一些常见但低效的表达，请尽量避免：</font>

| <font style="color:rgb(17, 17, 51);">模糊表达</font> | <font style="color:rgb(17, 17, 51);">问题</font> | <font style="color:rgb(17, 17, 51);">推荐改法</font> |
| --- | --- | --- |
| <font style="color:rgb(17, 17, 51);">“卡片太丑了，改好看点”</font> | <font style="color:rgb(17, 17, 51);">主观、无执行标准</font> | <font style="color:rgb(17, 17, 51);">“文字未对齐，请改为居中对齐”</font> |
| <font style="color:rgb(17, 17, 51);">“颜色太难看了，亮一点”</font> | <font style="color:rgb(17, 17, 51);">不明确具体元素和目标色</font> | <font style="color:rgb(17, 17, 51);">“背景色太深，请改为浅灰色”</font> |
| <font style="color:rgb(17, 17, 51);">“按钮不要这个颜色”</font> | <font style="color:rgb(17, 17, 51);">缺少替代方案</font> | <font style="color:rgb(17, 17, 51);">“按钮颜色请改为支付宝蓝色”</font> |


:::info
🤖 **小提示：**把 AI 当作一位认真但不会读心的设计师——你给指令，它来执行。清晰 = 高效！

:::



## ☀️ 总结：写好 Prompt 的黄金法则
+ **结构先行：**用途 + 内容 + 布局 + 样式；
+ **修改具体：**指明元素 + 明确动作 + 可选参数；
+ **善用工具：**局部修改 = 精准微调的利器；
+ **拒绝模糊：**主观评价 → 客观指令。

只要掌握这几点，你也能像高手一样，轻松生成高颜值、高可用的 AI 卡片！



---

☄️ **小彩蛋：**本文封面海报也是使用 AI 生成的！

```latex
生成一张产品功能宣传海报，采用第一人称视角发问形式。
画面包含一个人物头像正在用电脑制作卡片。
配文：“如何写好 prompt，能生成一张我想要的卡片？”
```

快去试试吧！你的下一张爆款卡片，可能就差一个好 Prompt 😉



## 🙋‍♂️ 联系我们
若您在使用 AI 生成卡片能力的过程中，遇见任何问题或有任何意见与建议，都可以使用钉钉扫描下方二维码，进入官方群聊与我们取得联系。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1762237697835-e42092f5-2651-4495-ba79-e02f419ee1fd.png?x-oss-process=image%2Fcrop%2Cx_37%2Cy_248%2Cw_519%2Ch_582" width="260" title="" crop="0.0625,0.1938,0.9392,0.6484" id="u71695a22" class="ne-image">
