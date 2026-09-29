## MCP 介绍
通过 Time MCP，大模型能够获取当前时间以及时区等信息，并使用 IANA 时区名称进行时区转换。

## 功能特性
+ 通过传入的时区名称，自动获取特定时区或系统时区的当前时间。
+ 通过传入的源时区信息与目标时区信息，完成不同时区间的时间转换。

## 如何使用
官方已预部署该 MCP，**可直接添加到智能体使用**。

更多使用技巧请见 👉**  **[**百宝箱 MCP 使用指南**](https://alipaytbox.yuque.com/org-wiki-knowledgepie-mvkzao/huntb8/ze4r30n3msubshyq)

## 使用案例
通过智能体查询指定时区的时间或进行时区转换。

### 提示词示例
```markdown
分析用户输入的信息，并根据意图，调用 Time MCP 插件中适合的工具，
完成系统时间获取或时区转换等需求。
```

### 效果展示
用户分别输入 `东京当前时间`以及 `如果东京时间为2025年5月20日17点，那北京几点？`，智能体在调用 TimeMCP 插件后的效果如下。

<img src="https://cdn.nlark.com/yuque/0/2025/png/1397496/1750408083088-5a94eaaf-ac47-472b-9718-277be57db4e7.png" width="500" title="" crop="0,0,1,1" id="ud0fbd19d" class="ne-image">


