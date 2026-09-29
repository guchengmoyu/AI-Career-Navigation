通过本方法可实现路由跳转到指定 URL。

### 参数
| **参数** | **类型** | **说明** | **备注** |
| --- | --- | --- | --- |
| `url` | `string` | 跳转的url | `10.2.23及以下版本`只支持 alipays前缀开头url<br/>`10.2.26之后版本`支持 http://, https:// 前缀开头url， **注意模版投放 低版本的 兼容性** |
| `data` |        `string` | jsonstring | 如果目标页是 cube单页，可以通过data传数据，（数据优先级js里data优先级高会覆盖传的data）`10.5.50支持` |
| `check` | `bool` | 检查异常情况 | `10.2.53`版本检查异常情况，如 cardinstance 已被销毁，跳转失败。<br/>默认为false |


### 示例代码
```javascript
ac.call(
  'openURL',
  {
    'url': 'alipays://platformapi/startApp?appId=20002077&url=gamora%3A%2F%2Fopen%3Fpid%3Dcardsdk_container_power%26bizCode%3DCPCardSDKTemplate%26option%3D%7B%22snapshot%22%3A%22true%22%2C%22launchMode%22%3A%22standard%22%7D%26src%3D%7B%22templateId%22%3A%22PlaygroundContainerDemo%22%2C%22version%22%3A%2269%22%2C%22fileId%22%3A%22A*ga_dSIKEyGsAAAAAAAAAAAAADrh1AQ%22%7D%26style%3D%7B%22type%22%3A%22full%22%2C%22backgroundColor%22%3A%22%23f0f0f0f0%22%2C%22contentBackgroundColor%22%3A%22%23ffffff%22%2C%22borderRadius%22%3A%228sip%22%2C%22heightRatio%22%3A%220.8%22%2C%22titleBarHidden%22%3A%22false%22%2C%22title%22%3A%22Card%20Playground%22%2C%22titleColor%22%3A%22%23000000%22%2C%22titleBarColor%22%3A%22%23ffffff%22%2C%22transparentTitle%22%3A%22false%22%2C%22titleFont%22%3A%2218sip%22%7D%26ext%3D%7B%7D',
    'check': true
  },
  function(res) {}
); 
```
