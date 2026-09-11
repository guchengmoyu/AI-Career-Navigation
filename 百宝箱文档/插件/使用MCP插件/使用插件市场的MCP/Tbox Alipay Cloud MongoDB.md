# 1、工具介绍
**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">Tbox Alipay Cloud MongoDB的MCP插件，</font>**<font style="color:rgba(0, 0, 0, 0.88);">是为了</font><font style="color:rgba(0, 0, 0, 0.65);">支持智能体中，进行数据增删改查，满足智能体中数据存储的需要的MCP工具。</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533416812-a1861f85-b939-412d-af76-7db2e28050ed.png" width="1022" title="" crop="0,0,1,1" id="u00555977" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533416832-4e9b0a6c-4787-406d-acb5-ad1b05888171.png" width="1250" title="" crop="0,0,1,1" id="zALmd" class="ne-image">



## <font style="color:rgba(0, 0, 0, 0.65);">功能说明</font>
+ <font style="color:rgba(0, 0, 0, 0.88);">增加数据：</font>**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">insert_document</font>**

操作Mongodb数据库，将document插入到支付宝小程序云的MongoDB数据库集合中。 Args: document (dict): 要插入的文档数据 app_id (str): 应用ID，用于生成数据库集合名称 user (str): 用户标识，将被添加到文档中作为mcp_user字段 Returns: str: 操作结果 Raises: ValueError: 当user为空或document已包含mcp_user字段时抛出异常

+ <font style="color:rgba(0, 0, 0, 0.88);">查询数据：</font>**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">query_documents</font>**

操作Mongodb数据库查询数据，可根据传入query_data进行条件查询，查询前可使用query_data_field查看数据结构。支持按条件查询和按用户标识查询，query_data支持MongoDB的查询语法，可参考MongoDB的find方法的传参，如{"name":"test"}。 app_id: 应用ID，用于生成数据库集合名称，不可为空。 user: 用户标识，将被添加到查询条件中，不可为空。 Returns: str: 查询结果

+ <font style="color:rgba(0, 0, 0, 0.88);">删除数据：</font>**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">delete_document</font>**

操作Mongodb数据库，根据doc_id从指定应用的小程序云数据库集合中删除对应的文档。 Args: doc_id (str): 要删除的文档ID app_id (str): 应用ID，用于确定数据库集合名称 user (str): 用户标识，将被添加到文档中作为mcp_user字段 Returns: str: 操作结果

+ <font style="color:rgba(0, 0, 0, 0.88);">修改数据：</font>**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">update_document</font>**

操作Mongodb数据库，根据文档ID更新小程序云数据库集合中的指定文档 Args: doc_id (str): 要更新的文档ID document (dict): 更新后的文档数据 app_id (str): 应用ID，用于生成数据库集合名称 user (str): 用户标识，将被添加到文档中作为mcp_user字段 Returns: str: 操作结果 Raises: ValueError: 当user为空或document已包含mcp_user字段时抛出异常

+ <font style="color:rgba(0, 0, 0, 0.88);">查询数据结构：</font>**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">query_data_field</font>**

操作Mongodb数据库查询数据，返回最近10条数据和数据的key，在查询前可调用本方法获取数据的key方便些查询语句。 Args: app_id: 应用ID，用于生成数据库集合名称，不可为空。 user: 用户标识，将被添加到查询条件中，不可为空。 Returns: 前10条数据和数据的key

# 2、使用案例
在工作流中，搜索tbox即可，即可找到**<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(248, 248, 248);">Tbox Alipay Cloud MongoDB的MCP插件，</font>**<font style="color:rgba(0, 0, 0, 0.88);">然后添加对应需要的工具：</font>

<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533416932-963f8e00-d449-4618-866e-66cb53b35701.png" width="1462" title="" crop="0,0,1,1" id="u080820f0" class="ne-image">

## 增加数据
<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533416919-33528227-24ef-43da-bd1f-807191ef3b42.png" width="1250" title="" crop="0,0,1,1" id="ucc291d58" class="ne-image">



##  查询数据
<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533416983-5a42a1cc-f8f7-49fa-99d4-b2f3956c61d1.png" width="1277" title="" crop="0,0,1,1" id="u8e88ef85" class="ne-image">



## 删除数据
<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533418369-4ac75c59-1147-47d0-abce-c7b3abb87d9b.png" width="1465" title="" crop="0,0,1,1" id="u63822c12" class="ne-image">



## 修改数据
<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533418920-41effd6b-bd3b-4fdd-b65b-c2b853ab6236.png" width="1460" title="" crop="0,0,1,1" id="xFZ3Z" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2025/png/25463640/1765533419085-4f511b6d-9799-45b5-b670-6a3032300362.png" width="1467" title="" crop="0,0,1,1" id="ufc30b794" class="ne-image">












