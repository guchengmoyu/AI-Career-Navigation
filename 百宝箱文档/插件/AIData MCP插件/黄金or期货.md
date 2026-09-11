### <font style="color:rgb(28, 30, 32);">功能描述</font>
<font style="color:rgba(0, 1, 9, 0.88);">支持黄金现货、黄金期货的价格查询服务，支持查询最新价、开盘价、最高价、最低价等价格信息。</font>

### <font style="color:rgb(28, 30, 32);">参数说明</font>
#### <font style="color:rgba(0, 1, 9, 0.88);">输入toolParams对象</font>
| **<font style="color:rgba(0, 1, 9, 0.88);">参数名</font>** | **<font style="color:rgba(0, 1, 9, 0.88);">参数说明</font>** |
| --- | --- |
| <font style="color:rgba(0, 1, 9, 0.88);">toolParams</font> | <font style="color:rgba(0, 1, 9, 0.88);">object</font> |
| + <font style="color:rgba(0, 1, 9, 0.88);">type</font> | + <font style="color:rgba(0, 1, 9, 0.88);">string · 1，查黄金，2 查期货</font> |




```json
{
  "toolParams": {
    "type": "1"
  }
}
```

#### <font style="color:rgba(0, 1, 9, 0.88);">输出result</font>
| **<font style="color:rgba(0, 1, 9, 0.88);">参数名</font>** | **<font style="color:rgba(0, 1, 9, 0.88);">参数说明</font>** |
| --- | --- |
| <font style="color:rgba(0, 1, 9, 0.88);">code</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 交易编码</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">date</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 日期 yyyy-mm-dd</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">name</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 贵金属名称</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">maxPri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 今日最高价</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">minPri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 今日最低价</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">startPri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 今日开盘价</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">turnover</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 成交额</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">latestPri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 最新价</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">yesEndPri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 昨日收盘价</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">increasePer</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 涨跌百分比</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">increasePri</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 涨跌额</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">update_time</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 更新时间 yyyy-mm-dd HH:mm:ss</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">weight_unit</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 重量单位（oz：盎司；kg：千克；g：克）</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">currency_unit</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 币种单位（CNY：人民币；HKD：港币；USD：美元）</font> |
| <font style="color:rgba(0, 1, 9, 0.88);">tradingVolume</font> | <font style="color:rgba(0, 1, 9, 0.88);">string · 成交量</font> |



