### <font style="color:rgb(28, 30, 32);">功能描述</font>
<font style="color:rgba(0, 1, 9, 0.88);"></font>

### <font style="color:rgb(28, 30, 32);">参数说明</font>
#### <font style="color:rgba(0, 1, 9, 0.88);">输入</font>
| **<font style="color:rgba(0, 1, 9, 0.88);">参数名</font>** | **<font style="color:rgba(0, 1, 9, 0.88);">参数说明</font>** |
| --- | --- |
| <font style="color:rgba(0, 1, 9, 0.88);">headers</font> | <font style="color:rgba(0, 1, 9, 0.88);">object · 请求头</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">jsonBody</font> | <font style="color:rgba(0, 1, 9, 0.88);">object · 请求体</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">n</font> | + <font style="color:rgba(0, 1, 9, 0.88);">integer · 生成数量</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">size</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · 尺寸</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">model</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · 模型名称</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">prompt</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · 提示词</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">quality</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · 质量</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">output_format</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · output_format</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">output_compression</font> | + <font style="color:rgba(0, 1, 9, 0.88);">integer · output_compression</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">urlVariables</font> | <font style="color:rgba(0, 1, 9, 0.88);">object · url参数</font> |




```json
{
  "headers": {},
  "urlVariables": {},
  "jsonBody": {
    "size": "1024x1024",
    "output_format": "png",
    "output_compression": "100",
    "model": "gpt-image-1-0415-global",
    "prompt": "画一只小猫",
    "n": "1",
    "quality": "low"
  }
}
```

#### <font style="color:rgba(0, 1, 9, 0.88);">输出result</font>
| **<font style="color:rgba(0, 1, 9, 0.88);">参数名</font>** | **<font style="color:rgba(0, 1, 9, 0.88);">参数说明</font>** |
| --- | --- |
| <font style="color:rgba(0, 1, 9, 0.88);">body</font> | <font style="color:rgba(0, 1, 9, 0.88);">object · 响应体</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">code</font> | <font style="color:rgba(0, 1, 9, 0.88);">integer · 响应码</font> |



