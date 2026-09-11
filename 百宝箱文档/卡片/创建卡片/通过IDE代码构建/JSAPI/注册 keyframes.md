卡片引擎支持动画属性，其动画描述 DSL 类似于 [Web CSS 动画](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations)，但由于历史原因，目前需要在 JS 里调用 API 而不能直接在 style 标签里用 CSS 编写动画。

# Transition
| **属性** | **值类型** | **默认值** | **可选值** | **写法** | 备注 |
| --- | :---: | --- | --- | --- | --- |
| <font style="color:#262626;">transition-property</font> | <font style="color:#262626;">string</font> | 空 | background-color， opacity， transform， all | <font style="color:rgb(163, 0, 8);">transition-property</font><font style="color:#262626;">: all;</font> |  |
| | | | | <font style="color:rgb(163, 0, 8);">transition-property</font><font style="color:#262626;">: background-color, opacity;</font> | |
| | | | | <font style="color:#262626;">transition-property: background-color, opacity, transform;</font> | |
| <font style="color:#262626;">transition-duration</font> | number | 0 |  | <font style="color:rgb(163, 0, 8);">transition-duration</font><font style="color:#262626;">: 200ms;</font> |  |
| <font style="color:#262626;">transition-delay</font> | number | 0 |  | <font style="color:rgb(163, 0, 8);">transition-delay</font><font style="color:#262626;">: 200ms;</font> |  |
| | | | | |  |
| <font style="color:black;">transition-timing-function</font> | string | ease | ease,  ease-in, ease-out, ease-in-out, linear, ~~cubic-bezier(x1,y1,x2,y2)~~ | <font style="color:rgb(163, 0, 8);">transition-timing-function</font><font style="color:#262626;">: ease-in;</font> |  |
| | | | | <font style="color:rgb(163, 0, 8);">transition-timing-function</font><font style="color:#262626;">: cubic-bezier(0.3, 0.3, 0.9, 0.9);</font> | <font style="color:#E8323C;"> 目前这种写法有缺陷. 请先不要使用该方式</font> |
| <font style="color:black;">transition</font> | - | 空 | property name | duration<br/>property name | duration | delay<br/>property name | duration | timing function <br/>property name | duration | timing function | delay | <font style="color:rgb(163, 0, 8);">transition</font>: opacity 4s;  <br/><font style="color:rgb(163, 0, 8);">transition</font>: opacity 4s 1s; <br/><font style="color:rgb(163, 0, 8);">transition</font>: opacity 4s ease-in-out; <br/><font style="color:rgb(163, 0, 8);">transition</font>: opacity 4s ease-in-out 1s; <br/><font style="color:rgb(163, 0, 8);">transition</font>: all 0.5s ease-out; | 简写，除duration必须先于delay外，顺序无特定要求 |




**transition用法示例**

```plain
.panel {
    margin: 10px;
    top:10px;
    align-items: center;
    justify-content: center;
    transition-property: background-color;
    transition-duration: 0.3s;
    transition-delay: 0s;
    transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  }
```



# Transform
| **属性** | **值类型** | **默认值** | **可选值** | 备注 |
| --- | --- | :---: | --- | --- |
| <font style="color:#262626;">transform</font> | <font style="color:#262626;">string</font> |  | <font style="color:rgba(0, 0, 0, 0.65);">translateX({<length/percentage>})</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|translateY({<length/percentage>})</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|translateZ({<length>})</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|translate({<length/percentage>} {<length/percentage>})</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|translate3D({<length>},</font><font style="color:rgba(0, 0, 0, 0.65);">{<length>},</font><font style="color:rgba(0, 0, 0, 0.65);">{<length>}</font><font style="color:rgba(0, 0, 0, 0.65);">)</font><br/><font style="color:rgba(0, 0, 0, 0.65);"> {<length/percentage>})</font><font style="color:rgba(0, 0, 0, 0.65);"> </font><br/><font style="color:rgba(0, 0, 0, 0.65);">|scaleX(<number>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|scaleY(<number>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|scale(<number>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|rotate(<angle/degree>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|rotateX(<angle/degree>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|rotateY(<angle/degree>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|rotateZ(<angle/degree>)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|rotate3D(<angle/degree>, </font><font style="color:rgba(0, 0, 0, 0.65);"><number>, </font><font style="color:rgba(0, 0, 0, 0.65);"><number>,</font><font style="color:rgba(0, 0, 0, 0.65);"><number></font><font style="color:rgba(0, 0, 0, 0.65);">)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|transform-origin (center)</font><br/><font style="color:rgba(0, 0, 0, 0.65);">|matrix(n,n,n,n,n,n)</font> | translateX({<length/percentage>}) : X 轴方向平移，支持长度单位或百分比。<br/>translateY({<length/percentage>}) : Y 轴方向平移，支持长度单位或百分比。<br/>translate({<length/percentage>} {<length/percentage>}) : X 轴和 Y 轴方向同时平移，translateX + translateY 简写。<br/>scaleX(<number>) : X 轴方向缩放，值为数值，表示缩放比例，不支持百分比。<br/>scaleY(<number>) : Y 轴方向缩放，值为数值，表示缩放比例，不支持百分比。<br/>scale(<number>) : X 轴和 Y 轴方向同时缩放，scaleX + scaleY 简写。<br/>rotate(<degree>) : 将元素围绕一个定点（由 transform-origin 属性指定）旋转而不变形的转换。指定的角度定义了旋转的量度。若角度为正，则顺时针方向旋转，否则逆时针方向旋转。<br/>transform-origin :设置一个元素变形的原点，只支持center 。<br/>matrix:2D转换矩阵<br/>translateZ/rotateZ仅在transform-style值为preserve-3d时生效，translateZ不支持percent写法。 |
| transform-origin | string | center | left、right、top、bottom、center、数值（支持单值和双值两种写法） |  |
| transform-style | string | flat | preserve-3d, flat |  |
| perspective | length | none | none | <length> | 须为正值，负值/0与none效果一致 |
| perspective-origin | string | center | <font style="color:#404040;">left、right、top、bottom、center、数值（支持单值和双值两种写法）</font> |  |


**Transform用法示例**

```css
.transform {
    align-items: center;
    transform: translate(150px, 200px) rotate(20deg);
    transform-origin: 0 -250px;
    border-color:red;
    border-width:2px;
  }
```

****

**3D动画示例**

完整demo：[Cube3DAnimation.zip]()

```css
.div {
    width: 300px;
    height: 300px;
    transform-style: preserve-3d;
    transform: rotateX(45deg) rotateZ(30deg) translateZ(-50px);
    perspective: 600px;
}
```

**<font style="color:#FA8C16;">3D动画约束</font>**

1. <font style="color:#FA8C16;">动画嵌套限制2层（即父节点和子节点同时有动画），若父节点、子节点、孙子节点同时有3d动画，则最终效果可能会受限。</font>
2. <font style="color:#FA8C16;">安卓：受平台限制，View不能分割，View只能显示全部或被遮盖全部。如下图所示：</font>  

 <img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1774925475671-e8ddbc3c-6aa2-4993-a3f4-16d0ea8a1b05.png" width="95" title="" crop="0,0,1,1" id="xzDQx" class="ne-image">                                           <img src="https://cdn.nlark.com/yuque/0/2026/png/1397496/1774925475718-38e9762c-04f1-417e-9924-471fa03c475b.png" width="87" title="" crop="0,0,1,1" id="xwAqv" class="ne-image">

         Android 效果， 一个face2完全压盖face1                       CSS、iOS可以达到的效果

# Animation
| **属性** | **值类型** | **默认值** | **可选值** | **写法** | 备注 |
| --- | :---: | :---: | --- | --- | --- |
| <font style="color:#262626;">animation-name</font> | <font style="color:#262626;">string</font> |  |  | <font style="color:rgb(163, 0, 8);">animation-name</font><font style="color:#262626;">: demo;</font> |  |
| <font style="color:#262626;">animation-duration</font> | number | 0 |  | <font style="color:rgb(163, 0, 8);">animation-duration</font><font style="color:#262626;">: 100ms;</font> |  |
| <font style="color:#262626;">animation-delay</font> | number | 0 |  | <font style="color:rgb(163, 0, 8);">animation-delay</font><font style="color:#262626;">: 200ms;</font> |  |
| <font style="color:#262626;">animation-timing-function</font> | string | ease | ease,  ease-in, ease-out, ease-in-out, linear, cubic-bezier(x1,y1,x2,y2) | <font style="color:rgb(163, 0, 8);">animation-timing-function</font><font style="color:#262626;">: ease-in;</font> |  |
| | | | | <font style="color:rgb(163, 0, 8);">animation-timing-function</font><font style="color:#262626;">: cubic-bezier(0.3, 0.3, 0.9, 0.9);</font> |  |
| <font style="color:#262626;">animation-iteration-count</font> | number |  | 数值<br/>infinite（等价于9999） | <font style="color:rgb(163, 0, 8);">animation-iteration-count</font><font style="color:#262626;">: infinite;</font> |  |
| | | | | <font style="color:rgb(163, 0, 8);">animation-iteration-count</font><font style="color:#262626;">: 10;</font> |  |
| <font style="color:#262626;">animation-direction</font> | enum | normal | normal, alternate | <font style="color:rgb(163, 0, 8);">animation-direction</font><font style="color:#262626;">: alternate;</font> |  |
| <font style="color:#262626;">animation-fill-mode</font> | enum | none | forwards, backwards, both,none | <font style="color:rgb(163, 0, 8);">animation-fill-mode</font><font style="color:#262626;">: backwards;</font> |  |
| animation-play-state | enum | running | running, paused |  |  |
| <font style="color:rgb(0, 0, 0);">animation</font> | - | 空 | animation name | duration <br/>animation name | duration | timing-function<br/>animation name | duration | timing-function | delay <br/>animation name | duration | timing-function | delay | iteration-count<br/>animation name | duration | timing-function | delay | iteration-count | direction | fill-mode; | <font style="color:rgb(163, 0, 8);">animation</font><font style="color:rgb(109, 109, 109);">:</font> 3s ease-in 1s 2 reverse both paused slidein<font style="color:rgb(109, 109, 109);">;</font><br/><font style="color:rgb(163, 0, 8);">animation</font><font style="color:rgb(109, 109, 109);">:</font> 3s linear 1s slidein<font style="color:rgb(109, 109, 109);">;</font> <br/><font style="color:rgb(163, 0, 8);">animation</font><font style="color:rgb(109, 109, 109);">:</font> 3s slidein<font style="color:rgb(109, 109, 109);">;</font> | 简写，<br/>1. duration必须先于delay<br/>2. 如果 fill-mode 使用了 backwards 或者 forwards，则必须指明 duration 和 delay<br/>3. name 不建议以 s/ms 结尾，此时为 ub |


**animation用法示例**

```plain
.moving-node01 {
  width: 200rpx;
  height: 100rpx;
  background-color: red;
  margin-top: 50rpx;
  animation-name: moving-horizontal;
  animation-duration: 5000ms;
  animation-delay: 2000ms;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-fill-mode: forwards;
}
```

# <font style="color:#000000;">Keyframes 动画</font>
```plain
<template>
  <div class="root">
    <div class="line">
      <div class="subline"></div>
    </div>
  </div>
</template>

<script>
	  const animation = requireModule("animation"); //获取module
    const keyframes = {
        'moving-horizontal': {
            "transform": [
                {
                    "p":0,
                    "v":"translateX(-200px)"
                },
                {
                    "p":0.5,
                    "v":"translateX(-100px)"
                },
                {
                    "p": 1.0,
                    "v": "translateX(0px)"
                }
            ]
        }
    };
    animation.loadKeyframes(keyframes); //加载module
		export default {};
</script>


<style>
    .root {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .line{
        width:200px;
        height:10px;
        overflow: hidden;    
        background-color:gray;
    }
    .subline{
        transform:translate(-200px,0px);
        width:200px;
        height:10px;
        background-color:red; 
        
        animation-name: moving-horizontal;
        animation-duration: 2000ms;
        animation-delay: 000ms;
        animation-timing-function: linear;
    }
</style>
```

## 动画结束回调
<font style="color:#F5222D;">10.2.30开始支持</font>

| **事件名** | **描述** | **值类型** | **写法** | 备注 |
| --- | --- | :---: | --- | --- |
| on-animationEnd | 动画回调 | <font style="color:#262626;">function</font> | <div @on-animationEnd="onAnimationEnd()"></div> | 该方法的参数为 object。key 为 "status", value 为 "finish" 或者 "interrupt", 分别表示动画执行成功，动画被中断。 |


节点定义事件@on-animationEnd， 动画结束后会回调相应方法传入参数 {"status":"finish/interrupt"}，finish表示动画正常执行结束，cancel表示中断或取消。

```vue
<template>
  <div class="root">
    <div class="anim_node" @on-animationEnd="onAnimationEnd()"></div>
  </div>
</template>

 <script>
   ...
  methods: {
    onAnimationEnd(param){
      if(param.status == "finish") {
         console.log("动画执行完成");
      } else if (param.status == "interrupt") {
         console.log("动画中断或取消");
      }
    },
  },
};
</script>

<style>
  ...
</style>

```

# <font style="color:#CF1322;">注意：</font>
+ **<font style="color:#F5222D;">10.1.99 版本支持</font>**
+ **<font style="color:#F5222D;">根节点不支持动画</font>**
+ <font style="color:#F5222D;">实体组件和外接组件不支持动画（input，slider等）</font>
+ <font style="color:#F5222D;">很多人关心的skew动画不支持，效果实现可用matrix代替</font>
+ <font style="color:#F5222D;">keyframe动画过程中，提交css动画无效（原因待查）</font>
+ <font style="color:#F5222D;">iOS平台在移动过程中不支持手势，结束后才能响应（10.7.6 版本支持）</font>
