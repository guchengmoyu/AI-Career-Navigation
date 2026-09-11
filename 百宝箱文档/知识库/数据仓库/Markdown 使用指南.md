<font style="color:rgba(23, 23, 23, 0.8);">本文将为您介绍在百宝箱中常用的 Markdown 语法，帮助您更快上手数据维护。</font>

## 添加图片
<font style="color:rgb(33, 37, 41);">要添加图片，请添加一个感叹号 ( </font>`<font style="color:rgb(33, 37, 41);">!</font>`<font style="color:rgb(33, 37, 41);">)，后跟用方括号括起来的替代文本，以及用圆括号括起来的图片资源路径或 URL。您还可以选择在路径或 URL 后添加用引号括起来的标题。</font>

:::success
+ **<font style="color:rgb(44, 62, 80);">插入图片Markdown语法代码</font>**<font style="color:rgb(44, 62, 80);">：</font>`<font style="color:rgb(71, 101, 130);background-color:rgba(27, 31, 35, 0.05);">![图片alt](图片链接 "图片title")</font>`<font style="color:rgb(44, 62, 80);">。</font>
+ **<font style="color:rgb(44, 62, 80);">对应的HTML代码</font>**<font style="color:rgb(44, 62, 80);">：</font>`<font style="color:rgb(71, 101, 130);background-color:rgba(27, 31, 35, 0.05);"><img src="图片链接" alt="图片alt" title="图片title"></font>`

:::

### 界面范例
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768206778718-685048c9-915e-4bbf-8ec6-1bf2c7906a43.png" width="2560" title="" crop="0,0,1,1" id="u5dbe626b" class="ne-image">

### 范例输入文本
```markdown
* **绍兴·安昌古镇：** 相对乌镇西塘游客较少，原生态的江南水乡，以酱鸭、腊肠和古朴的廊棚闻名，生活气息浓厚。
  ![](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZUA9PCQEvNakipvjIOLKzviHq-TnhOpelNA&s)
* **宁波·前童古镇：** ‘家家有雕梁，户户有活水’，保留着明清时期的完整格局，非常宁静，适合摄影和发呆。
  您可以选择一个，我可以进一步为您提供交通、住宿（如古镇内的精品民宿）和当地特色美食（如安昌的师爷馄饨）的详细攻略。”
  ![](https://vip-public.people.com.cn/photo/2023/5/21/b1accac9562a4e3c99638203010de995zHHH_m.jpg)
```

### 范例客户测效果
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768206931918-40f4a4ba-a809-4276-a291-67efca207e3d.png" width="399" title="" crop="0,0,1,1" id="u31c32bdf" class="ne-image">

## 添加视频
<font style="color:rgb(33, 37, 41);">添加视频，请使用以下语法方式。</font>

```markdown
<video id="唯一标识" object-fit="fill" src="https://xxxxxshili"></video>
```

**<font style="color:rgb(33, 37, 41);">解释说明</font>**<font style="color:rgb(33, 37, 41);">：</font>

+ **<video> 标签**：这是HTML5中用于嵌入视频的标签。
+ **id="唯一标识"**：为这个视频元素指定一个唯一的ID，以便通过CSS或JavaScript进行操作。注意，这里的“唯一标识”应该替换为实际的唯一标识符，比如一个具体的字符串（如"myVideo"）。
+ **object-fit="fill"**：这个属性用于指定视频内容如何适应视频容器。
+ **src**="https://xxxxxshili"：这是视频的源地址，请填写自己要链接的访问地址。

### 界面范例
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768356039554-99502b56-0ba8-424b-83f9-c597469b5e9b.png" width="2560" title="" crop="0,0,1,1" id="ud0eedc6e" class="ne-image">

### 范例输入文本
```markdown
好的，以下是十二生肖的介绍视频，请观看～
<video id="唯一标识" object-fit="fill" src="https://gw.alipayobjects.com/v/agt_content/afts/video/min6QIzZeZYAAAAAgEAAAAgAegs9AQFr/original"></video>
```

### 范例客户测效果
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768356265591-d8069119-89f4-4619-857b-809a350b170b.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_0%2Cw_399%2Ch_809" width="399" title="" crop="0,0,1,0.7712" id="udc82fa91" class="ne-image">

## 添加链接
<font style="color:rgb(33, 37, 41);">要创建链接，请将链接文本用方括号括起来（例如，</font>`<font style="color:rgb(33, 37, 41);">[Duck Duck Go]</font>`<font style="color:rgb(33, 37, 41);">），然后紧接着用圆括号将 URL 括起来（例如，</font>`<font style="color:rgb(33, 37, 41);">(https://duckduckgo.com)</font>`<font style="color:rgb(33, 37, 41);">）。</font>

:::success
+ **<font style="color:rgb(44, 62, 80);">超链接Markdown语法代码：</font>**`<font style="color:rgb(71, 101, 130);">[超链接显示名](超链接地址 "超链接title")</font>`
+ **<font style="color:rgb(44, 62, 80);">对应的HTML代码：</font>**`<font style="color:rgb(71, 101, 130);background-color:rgba(27, 31, 35, 0.05);"><a href="超链接地址" title="超链接title">超链接显示名</a></font>`

:::

### 界面范例
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768207570291-970d223f-cced-48ff-8503-cf1df864c7b0.png" width="2560" title="" crop="0,0,1,1" id="u881027e8" class="ne-image">

### 范例输入文本
```markdown
当然可以。以下是一个以唐文化和兵马俑为核心的3天西安精华行程建议：

* **第一天：** 上午参观**[陕西历史博物馆](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSP1a4UNyhPh06S-vo19-ZNXwlPgz45y1PjA&s)**（建议提前预约），下午游览**大雁塔**及北广场音乐喷泉，晚上在**大唐不夜城**体验盛唐夜景与演出。
* **第二天：** 全天探索**[秦始皇陵兵马俑](https://i3.sinaimg.cn/travel/2013/0927/U8159P704DT20130927104848.jpg)**（建议留足5小时，可搭配华清池）。晚上返回市区品尝泡馍、肉夹馍。
* **第三天：** 上午登上**[西安城墙](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ_ujDkW-9UBKf0S_qGXYDw20EUP9F5e-6mw&s)**骑行，下午在**碑林博物馆**欣赏书法石刻，傍晚在**回民街**购买伴手礼。
  温馨提示：我会根据您的出行日期，为您实时查询博物馆预约政策和天气情况。”
```

### 范例客户测效果
<img src="https://cdn.nlark.com/yuque/0/2026/png/55921448/1768207645571-50e3ab65-3783-4410-a2d9-6bd81c5fffa0.png" width="399" title="" crop="0,0,1,1" id="ubd8c9c47" class="ne-image">

## 相关阅读
+ 其他更多基本语法使用方法可参考：[Markdown 教程](https://markdown.com.cn/basic-syntax/links.html)。
+ 您也可以在 Markdown 编辑器中完成内容编辑后，直接复制进输入框。推荐的markdown在线编辑：[Arya- 在线Markdown 编辑器](https://markdown.lovejade.cn/)。
