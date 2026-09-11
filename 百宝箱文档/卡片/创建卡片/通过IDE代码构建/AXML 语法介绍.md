AXML 是小程序框架设计的一套标签语言，结合基础组件、事件系统，可以构建出小程序页面的结构。本文将介绍如何使用 AXML 语法进行数据绑定、条件渲染以及列表渲染。

## 前置说明
+ `Paul DSL`中AXML数据绑定、条件渲染、列表渲染的使用方式，遵循`Cube 2.0`规范。
+ `Paul DSL`中AXML不支持小程序规范中提供的模板、引用、引用SJS能力。

## 数据绑定
AXML 中的动态数据与对应的 `Page` 中 `data` 内容绑定。

### 简单绑定
数据绑定使用 [Mustache](https://github.com/mustache/mustache.github.com) 语法将变量用两对大括号 `{{}}` 封装，可在多种语法场景下使用。



```html
<view> {{ message }} </view>
```



```javascript
Page({
  data: {
    message: 'Hello alipay!',
  },
});
```

### 组件属性
组件属性需使用双引号 `""` 封装。

```html
<view id="item-{{id}}"> </view>
```



```javascript
Page({
  data: {
    id: 0,
  },
});
```

### 控制属性
控制属性需使用双引号 `""` 封装。

```html
<view a:if="{{condition}}"> </view>
```

```javascript
Page({
  data: {
    condition: true,
  },
});
```

### 关键字
关键字需使用双引号封装 `""`。

```html
<view hidden="{{true}}"> </view>
```

### 运算
可用两对大括号 `{{}}` 封装简单的运算。支持如下几种方式。

#### 三元运算
```html
<view hidden="{{flag ? true : false}}"> Hidden </view>
```

#### 算数运算
```html
<view> {{a + b}} + {{c}} + d </view>
```



```javascript
Page({
  data: {
    a: 1,
    b: 2,
    c: 3,
  },
});
```



页面输出： `3 + 3 + d`

### 逻辑判断
```html
<view a:if="{{length > 5}}"> </view>
```

### 字符串运算
```html
<view>{{"hello" + name}}</view>
```



```javascript
Page({
  data: {
    name: 'alipay',
  },
});
```

### 数据路径运算
```html
<view>{{object.key}} {{array[0]}}</view>
```



```javascript
Page({
  data: {
    object: {
      key: 'Hello ',
    },
    array: ['alipay'],
  },
});
```

组合

可在 Mustache 语法内直接进行组合，构成新的对象或者数组。

### 数组
```html
<view a:for="{{[zero, 1, 2, 3, 4]}}"> {{item}} </view>
```



```javascript
Page({
  data: {
    zero: 0,
  },
});
```



最终组合成数组 `[0, 1, 2, 3, 4]`。

### 对象
```html
<template is="objectCombine" data="{{foo: a, bar: b}}"></template>
```



```javascript
Page({
  data: {
    a: 1,
    b: 2,
  },
});
```



最终组合成的对象是 `{foo: 1, bar: 2}`。也可用解构运算符 `...` 来将一个对象展开：

```html
<template is="objectCombine" data="{{...obj1, ...obj2, e: 5}}"></template>
```



```javascript
Page({
  data: {
    obj1: {
      a: 1,
      b: 2,
    },
    obj2: {
      c: 3,
      d: 4,
    },
  },
});
```

最终组合成的对象是 `{a: 1, b: 2, c: 3, d: 4, e: 5}`。如果对象 key 和 value 相同，也可以间接地表达。

```html
<template is="objectCombine" data="{{foo, bar}}"></template>
```



```javascript
Page({
  data: {
    foo: 'my-foo',
    bar: 'my-bar',
  },
});
```

最终组合成的对象是 `{foo: 'my-foo', bar:'my-bar'}`。 

**注意：**上面的方式可以随意组合，但是变量名相同时，后边的变量会覆盖前面的变量，例如：

```html
<template is="objectCombine" data="{{...obj1, ...obj2, a, c: 6}}"></template>
```



```javascript
Page({
  data: {
    obj1: {
      a: 1,
      b: 2,
    },
    obj2: {
      b: 3,
      c: 4,
    },
    a: 5,
  },
});
```

最终组合成的对象是 `{a: 5, b: 3, c: 6}`。

## 条件渲染
### a:if
在框架中，使用 `a:if="{{condition}}"` 来判断是否需要渲染该代码块。

```html
<view a:if="{{condition}}"> True </view>
```

也可以使用 `a:elif` 和 `a:else` 添加一个 **else** 块。

```html
<view a:if="{{length > 5}}"> 1 </view>
<view a:elif="{{length > 2}}"> 2 </view>
<view a:else> 3 </view>
```

### 对比 a:if 与 hidden
+ `a:if` 中的模板可能包含数据绑定，所以当 `a:if` 的条件值切换时，框架有局部渲染的过程，用于确保条件块在切换时销毁或重新渲染。此外， `a:if` 在初始渲染条件为 false 时，不触发任何渲染动作，当条件第一次变成 true 时才开始局部渲染。
+ `hidden` 控制显示与隐藏，组件始终会被渲染。

一般来说，`a:if` 有更高的切换消耗而 `hidden` 有更高的初始渲染消耗。因此，在需要频繁切换的情景下，用 `hidden` 更好。如果在运行时条件改变不多则 `a:if` 较好。

## 列表渲染
### <font style="color:rgb(38, 38, 38);">a:for</font>
:::color4
注意事项：`Paul DSL`中AXML a:for 不支持嵌套渲染

:::

<font style="color:rgb(38, 38, 38);">在组件上使用</font>`<font style="color:rgb(38, 38, 38);">a:for</font>`<font style="color:rgb(38, 38, 38);">属性可以绑定一个数组，即可使用数组中各项的数据重复渲染该组件。数组当前项的下标变量名默认为 index，数组当前项的变量名默认为 item。</font>

```javascript
<!-- axml部分 -->
  <view a:for="{{array}}"> {{index}}: {{item.message}} </view>

  <!-- script部分 -->
  Component({
    data: {
      array: [
        {
          message: 'foo',
        },
        {
          message: 'bar',
        },
      ],
    },
  });
```

<font style="color:rgb(38, 38, 38);">使用</font>`<font style="color:rgb(38, 38, 38);">a:for-item</font>`<font style="color:rgb(38, 38, 38);">可以指定数组当前元素的变量名。使用</font>`<font style="color:rgb(38, 38, 38);">a:for-index</font>`<font style="color:rgb(38, 38, 38);">可以指定数组当前下标的变量名。</font>

```html
<view a:for="{{array}}" a:for-index="idx" a:for-item="itemName">
  {{idx}}: {{itemName.message}}
</view>
```

### a:key
:::color4
注意事项：`Paul DSL`中`a:key`不支持保留关键字`*this`

:::

如果列表项位置会动态改变或者有新项目添加到列表中，同时希望列表项保持特征和状态（例如 `<input/>` 中的输入内容，`<switch/>` 的选中状态），需要使用 `a:key` 来指定列表项的唯一标识。 `a:key` 仅支持字符串形式：代表列表项某个属性，属性值需要是列表中唯一的字符串或数字，例如 ID，并且不能动态改变。

```html
<view class="container">
  <view a:for="{{list}}" a:key="{{item}}">
    <view onTap="bringToFront" data-value="{{item}}">
      {{item}}: click to bring to front
    </view>
  </view>
</view>
```

### key
`key` 是比 `a:key` 更通用的写法，里面可以填充任意表达式和字符串

```html
<view class="container">
  <view a:for="{{list}}" key="{{item}}">
    <view onTap="bringToFront" data-value="{{item}}">
      {{item}}: click to bring to front
    </view>
  </view>
</view>
```
