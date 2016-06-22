# Slider 对象实例的成员列表

## 实例化阶段

`Slider` 对象实例化之后，对象实例将会保存一些基础信息，为接下来的初始化提供数据依据。

### 1. `oSlide.ele`

类型：*jQuery*

外围容器的 jQuery 实例。


### 2. `oSlide.lists`

类型：*jQuery*

轮播图列表的 jQuery 实例。


### 3. `oSlide.parent`

类型：*jQuery*

轮播图列表所处容器的 jQuery 实例。


### 4. `oSlide.valid`

类型：*boolean*

是否构成有效的轮播图切换条件。


### 5. `oSlide.cansee`

类型：*number*

轮播图容器中可以看到的轮播图数量（行数或者列数）。


### 6. `oSlide.pages`

类型：*number*

轮播图切换共有多少页。


### 7. `oSlide.old`

类型：*number*

轮播图当前所处分页的索引号。


### 8. `oSlide.cfg`

类型：*Object*

`Slider` 默认的配置选项与实例化时传递进来的配置参数进行合并后的结果。

关于 `Slider` 默认的配置选项，大家可以参见：[#1](https://github.com/springlong/jquery-slide/issues/1)。

为了减少轮播图效果的内存占用，并不是所有的默认选项都会被合并到 `oSlide.cfg` 中。每次的合并操作都是将 `Slider.config` 对象与配置参数进行合并，而该对象的值如下所示（那些用于内部操作，或者默认值为 0 或 false 的参数将被注释）：

```js
Slider.config = {
    trigger: "mouseenter",
    tagClass: "current",
    btnClass: "disabled",
    duration: 400,
    interval: 5000,
    cur: 0,
    scrollLen: 0,
    // hoverDelay: 0,
    // keepTags: false,
    // btnDisable: false,
    // auto: false,
    // lazyload: false,
    // beLock: false,
    // imgAttr: 'data-slide-img',
    // lists: '.j_slideLists',
    // tags: '.j_slideTags',
    // posCur: '.j_slideCur',
    // posPages: '.j_slidePages',
    // btnPrev: '.j_slidePrev',
    // btnNext: '.j_slideNext'
};
```

### 8. `oSlide.callback`

类型：*Function | undefined*

`Slider` 实例化时传递进来的回调函数。

该函数将在每次图片轮播时被触发，用于完成相关的附加操作和行为扩展。


## 初始化阶段

如果在实例化阶段，`oSlide.valid` 的值为 `false`，那么将不会响应初始化阶段的函数绑定。

只有当 `oSlide.valid` 的值为 `true` 时，才有可能新增后面的这些对象成员。


### 1. `oSlide.tags`

类型：*jQuery | undefined*

分页标签列表的 jQuery 实例（仅当存在分页标签时有效）。


### 2. `oSlide.btnPrev`

类型：*jQuery | undefined*

上一页切换按钮的 jQuery 实例（仅当存在切换按钮时有效）。


### 3. `oSlide.btnNext`

类型：*jQuery | undefined*

下一页切换按钮的 jQuery 实例（仅当存在切换按钮时有效）。


### 4. `oSlide.posCur`

类型：*jQuery | undefined*

显示当前页码的容器的 jQuery 实例（仅当存在页码容器时有效）。


### 5. `oSlide.process`

类型：*Function*

初始化时绑定的处理函数，用于负责图片轮播时行为表现的代码处理。

如果执行 `oSlide.init` 初始化时，没有传递回调函数，那么该处理函数经默认为 `jQuery.noop`。


## 功能函数

### 1. `oSlide.init( function(cur, old, action){} )`

执行对 `oSlide` 对象的初始化操作——即完成对当前图片轮播的函数绑定，该函数将全权负责图片轮播时的行为表现的代码处理。

```js
oSlide.init(function(cur, old, action){
	console.log('该回调函数用于负责图片轮播时的行为表现');
});
```

相关参数如下：

1. `cur`：当前需要切换到的分页；
2. `old`：目前所处的分页；
3. `action`：动作标识，`'prev'`-按钮触发前一页，`'next'`-按钮触发后一页，`'must'`-强制执行，`undefined`-标签触发；
4. `this`：指向 `oSlide` 对象本身。


### 2. `oSlide.done()`

标识切换动作的完成！

在 `oSlide.done` 的函数处理中，主要进行下面的两项操作：

1. 自动切换时，负责启动下一轮切换；
2. 当启用了切换时的锁定状态（`cfg.beLock`），将执行解锁处理。


### 3. `oSlide.lock()`

将 `config.beLock` 配置选项设置为 `true`，用于当处于轮播的运动状态时，将当前轮播置为锁定状态（按钮点击将不会触发切换，但分页标签可以）。

`config.beLock` 参数可以用于常规的大部分切换效果中，但是部分特殊的切换处理将无法达到目标需求。

因此，我们提供了 `oSlide.lock()` 这一功能函数，用于在回调函数中，或者初始化的绑定函数中，进行手动锁定。

通过 `oSlide.lock()` 进行锁定后，按钮点击、分页标签都将无法响应切换操作，直到 `oSlide.unlock()` 被执行。 

查看使用场景：

1. [回调函数-标签项的滑动处理](http://www.fedlife.cn/demo/jquery/jquery-slide/callback-tag-slide.html)
2. [效果定制-实现内容项的动画效果](http://www.fedlife.cn/demo/jquery/jquery-slide/custom-cont-flash.html)


### 4. `oSlide.unlock()`

该函数用于解锁由 `oSlide.lock()` 导致的锁定状态。

执行该函数后，将一并执行 `oSlide.done()` 操作。


