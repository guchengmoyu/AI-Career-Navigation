## 功能背景
在智能体业务流程中，安全可信的用户身份非常重要，用户身份如果可以篡改和伪造，会给智能体业务带来较高的风险，因此在百宝箱的客户端容器时，需要接入身份认证，来保障业务安全。

## 适用场景
+ **（推荐）接入登录认证**：如您的智能体业务涉及用户敏感信息，需要按照相关指引接入用户登录认证，强烈推荐使用该方式，如果不接入登录认证会存在用户越权风险，比如用户A拿到用户B的链接参数直接访问，就可以以用户B的身份在智能体内进行问答，即用户越权访问。
+ 免身份认证：如您的智能体业务不涉及用户敏感信息或者仅限业务演示场景，业务方在**<font style="color:#DF2A3F;">明确知晓上述安全风险</font>**的情况下，可不接入登录认证。

## 方案介绍
![画板](https://cdn.nlark.com/yuque/0/2025/jpeg/49692699/1766025806049-64b670b7-b89e-4a41-8019-acef7809cb44.jpeg)

通过上图，总结下来，需要服务端开发者：

1. 提供生成用户 Code 的接口，提供给 APP 的客户端调用获取。
2. 提供 Code 认证接口，提供给百宝箱平台做用户身份的认证。
3. 将 Code 认证接口，注册到百宝箱插件。
4. 应用发布上架时，关联该插件。

## 操作步骤
### 步骤 1：开发生成 JWT 认证的代码
:::info
**说明**：

+ 该接口可由APP前端和APP后端自行约定接口调用方式和参数协议，只要APP前端可以拿到可认证的code即可。
+ 下面是以JWT Token方式，编写JAVA示例代码

:::

#### 引入maven依赖包
```xml
<dependency>
  <groupId>com.auth0</groupId>
  <artifactId>java-jwt</artifactId>
  <version>3.16.0</version>
</dependency>
```

#### <font style="color:rgba(0, 0, 0, 0.88);">JWT工具类</font>
```java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;

@Component
public class JwtUtil {

    // 秘钥-随机字符串，可自行定义
    private final String JWT_SIGN = "tayywep567812635sahaq";

    // Token过期时间-单位秒
    private final long EXPIRATION_TIME = 3600;

    /**
     * 生成JWT Token
     */
    public String generateToken(String userId) {
        Algorithm algorithm = Algorithm.HMAC256(JWT_SIGN);
            String token = JWT.create()
                    .withIssuer(userId)
                    .withExpiresAt(new Date(System.currentTimeMillis() + DEFAULT_EXPIRE * 1000L))
                    .sign(algorithm);
            return token;
    }

    /**
     * 从Token中获取用户ID
     */
    public String getUserIdFromToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(JWT_SIGN);
            JWTVerifier verifier = JWT.require(algorithm).build();
            // 解码和验证Token
            DecodedJWT jwt = verifier.verify(token);
            // 获取并验证声明
            return jwt.getIssuer();
    }

    /**
     * 校验token的合法性
     */
    public boolean validateToken(String token){
        try {
            getUserIdFromToken(token);
            return true;
        }catch (Exception e){
            //解析异常的处理
            return false;
        }
    }
}
```

#### 编写HTTP接口
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 生成JWT Token的接口-提供给APP前端调用
     * @param userId 用户ID
     * @return 包含Token的响应
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> generateToken(HttpServletRequest request) {
        try {
            // 从登录态获取用户ID，需要替换成当前应用系统的用户管理服务
            Optional<String> userIdOpt = sessionManager.getCurrentUserId(request);
            if (!userIdOpt.isPresent()) {
                throw new IllegalStateException("User not logged in");
            }
            String userId = userIdOpt.get();
            String token = jwtUtil.generateToken(userId);
            Map<String, Object> response = new HashMap<>();
            //将token返回给前端
            response.put("token", token);
            response.put("message", "Token generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate token");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * 验证JWT Token并返回用户信息的接口--提供给百宝箱平台调用
     * @param code JWT Token
     * @return 用户信息或错误信息
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestParam String code,
                                                           @RequestParam String channel) {
        try {
            if (jwtUtil.validateToken(code)) {
                String userId = jwtUtil.getUserIdFromToken(code);
                //根据userId查询用户信息，需要替换成当前应用系统的用户管理服务
                UserInfo userInfo = sessionManager.getCurrentUserId(userId);
                Map<String, Object> userInfo = new HashMap<>();
                //用户ID-必须返回
                userInfo.put("uid", userId);
                //过期时间-必须返回
                userInfo.put("expiredAt", expiredAt);
                //昵称-非必须
                userInfo.put("nickName", "小王");
                //头像链接-非必须
                userInfo.put("avatar", "http://xxx.jpg");
                //手机号-必须
                userInfo.put("mobileNo", userInfo.getMobileNo());
                //扩展信息-非必须，比如 会员积分、账户等级 等信息
                userInfo.put("extInfo", userInfo.getExtInfo());
                
                //组装响应结果
                Map<String, Object> response = new HashMap<>();
                response.put("code", 200);
                response.put("msg", "成功");
                response.put("success", true);
                response.put("data", userInfo);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 500);
                errorResponse.put("msg", "认证失败");
                errorResponse.put("success", false);
                return ResponseEntity.ok(errorResponse);
            }
        } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 500);
                errorResponse.put("msg", "认证异常");
                errorResponse.put("success", false);
                return ResponseEntity.ok(errorResponse);
        }
    }
}
```

### 步骤 2：开发code认证服务-提供给百宝箱调用
> 该接口可由APP后端严格按照下面输入和输出参数协议提供
>

参考上面 [编写HTTP接口](#CiYvV) 中AuthController类的verifyToken的接口实现，将改HTTP接口信息注册到百宝箱插件。

#### 创建认证插件
在[百宝箱平台](https://b.tbox.cn/inc/plugin)创建一个插件，可选择云 IDE 或者已有 API 两种方式创建。若：

+ 认证服务在您自己的后台系统中已经开发完成，可通过[基于已有服务创建插件](https://alipaytbox.yuque.com/sxs0ba/huntb8/wqnceq3h8ktg3q69)
+ 认证服务不在自己的后台系统中，也可通过[百宝箱IDE创建插件](https://alipaytbox.yuque.com/sxs0ba/huntb8/xh9iz5i64t9yo68a)，在线编写代码，完成插件的开发。

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1760687130264-83c167c6-2209-4890-85d0-52826aa0b302.png" width="438" title="" crop="0,0,1,1" id="u44663769" class="ne-image">

其中：

    - 服务URL、Header参数、接口鉴权配置 按实际业务系统配置即可
    - 接口的输入输出参数字段和类型需按照下面要求填写

##### 请求参数（务必按这个契约定义接口）
| **参数名** | **字段类型** | **描述** |
| --- | --- | --- |
| code | String | 登录认证码<br/>建议基于用户ID+秘钥+时间戳，生成JWTToken，<br/>Token有效时间建议1min，打开H5后页面百宝箱会调用认证接口获取用户信息，建立session，后续的对话服务中就不需要jwttoken了 |
| channel | String | 业务场景码，用于区分同一个智能体在不同的场景下，路由不同的登录认证服务<br/>如深圳地铁场景：<br/>STAPP_TEST是测试环境的登录认证<br/>STAPP_PROD是生产环境的登录认证 |


参考百宝箱如下输入配置

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1758782331055-31c307e8-33ce-4ae7-9575-f33c36dc9bba.png" width="1284" title="" crop="0,0,1,1" id="u2cd91824" class="ne-image">

##### 响应参数（务必按这个契约定义接口）
| **参数名** | **字段类型** | **描述** |
| --- | --- | --- |
| code | Long | 响应码，200代表响应成功 |
| msg | String | 响应信息 |
| data | Object | 用户登录认证信息 |
| success | Boolean | 是否成功 |


##### 用户登录认证信息
| **参数名** | **是否必须** | **字段类型** | **描述** |
| --- | --- | --- | --- |
| uid | 是 | String | 用户ID |
| expiredAt | 是 | Long | 过期时间戳，**<font style="color:#DF2A3F;">精确到毫秒</font>**，如：1766112873544 |
| nickName | 否 | String | 昵称 |
| avatar | 否 | String | 头像 |
| mobileNo | 否 | String | 手机号 |
| extInfo | 否 | Map<String,Object> | 扩展信息，如会员、账户等信息<br/>可在对话工作流中消费该参数 |


参考百宝箱如下输出配置

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1758783327997-4cba3260-d9ec-4369-8794-c9a4cdadf22b.png" width="1350" title="" crop="0,0,1,1" id="uec636b82" class="ne-image">

#### 智能体应用关联认证插件
在需要认证的百宝箱应用发布页 > 选择需要上架的渠道 > 选择上面发布好的用户认证插件，上架即可生效

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1764836967116-d45cf0b5-5a54-43dc-a830-f8fc878128f3.png" width="1180" title="" crop="0,0,1,1" id="ud82d9624" class="ne-image">

## 常见问题
### Q1：APP客户端如何接入
上述认证插件开发完成，并绑定到应用上架信息中，上架提交成功后，可在页面查看访问链接。

客户端即可使用该链接接入，其中链接参数中的code参数需要调用APP服务端[生成认证code接口](#OVEBA)获取，成功获取后，将code值拼接到链接的code参数中，即可完成接入

<img src="https://cdn.nlark.com/yuque/0/2025/png/49692699/1764842202716-b306589f-7ed4-4010-828f-9c7376a5d249.png" width="936" title="" crop="0,0,1,1" id="ue5c24904" class="ne-image">
