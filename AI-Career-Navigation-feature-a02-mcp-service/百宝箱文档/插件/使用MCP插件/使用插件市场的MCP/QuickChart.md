## MCP 介绍
QuickChart 是基于 QuickChart.io 实现图表生成的 MCP，支持根据图表诉求生成对应的图表内容，并以 URL 的形式进行返回，同时支持下载到本地。适用于用户使用智能体创建各种数据图表的可视化场景。

## 功能特性
+ **<font style="color:rgb(36, 41, 47);">支持多种类型：</font>**<font style="color:rgb(36, 41, 47);">条形图、折线图、饼图、环图、雷达图、极坐标区域图、散点图、气泡图、径向仪表图、速度计图。</font>
+ **<font style="color:rgb(36, 41, 47);">支持下载：</font>**<font style="color:rgb(36, 41, 47);">可生成上述类型图表的 URL 地址，并支持将图表下载到本地（部分大模型会将返回的图片地址直接渲染成图片）。</font>
+ **<font style="color:rgb(36, 41, 47);">个性化定制：</font>**<font style="color:rgb(36, 41, 47);">支持进行图表配置，包括标签、数据集和颜色。</font>

## <font style="color:rgb(36, 41, 47);">如何使用</font>
官方已预部署该 MCP，**可直接添加到智能体使用**。

更多使用技巧请见 👉**  **[**百宝箱 MCP 使用指南**](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/huntb8/ze4r30n3msubshyq)

## 使用案例
让智能体通过调用 QuickChart 生成符合用户需求的可视化图表。

### 提示词示例
```markdown
你是一个智能可视化图表生成助手，能够根据用户输入的需求和信息，调用QuickChart插件，生成对应的可视化图片，并返回结果链接。
```

### 效果展示
用户提问 `假设浙江省在4月~6月的降雨量分别是50毫米、65毫米、75毫米，使用折线图为我展示对应的数据，要求以月份为横坐标以毫米数为纵坐标`，大模型在调用QuickChart 插件后生成的效果如下。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1750643738576-39876e70-ee89-4462-8906-9e1c7832edbc.png" width="506.4" title="" crop="0,0,1,1" id="uac462ab4" class="ne-image">


