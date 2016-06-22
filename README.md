# jQuery Slide

基于jQuery的图片轮播插件（PC端）


## 前言

从工作起始到如今，关于图片轮播的代码实现至少更换了5种以上的代码组织结构，但结果一直不太理想。

去年无意中看到一款结合焦点图、幻灯片、Tab标签、图片滚动、无缝滚动于一体的 [SuperSlide](http://www.superslide2.com/) 效果插件，顿时让我感觉找到了出路。于是搬套 SuperSlide 的思路，自己重新整理后，完成了基于 jQuery 的 Slide 插件的首个版本，然后将其全面应用于之前所在公司的所有项目网站。

将焦点图、幻灯片、Tab标签、图片滚动、无缝滚动、手风琴等这些涉及滑动切换的效果全部整合到了一个插件中去实现，虽然减少了插件函数的数量，降低了学习成本，但是插件本身变得非常臃肿，不仅增加了函数调用后的内存占用，也使得相关切换效果未能达到极速状态。这种方式，仅适用于小型网站中用来提高工作效率，减轻初级前端人员的工作负担，并不适合大中型网站进行使用。

为了优化内存占用，提升切换效果的运行性能，我们有必要做减法处理，而不能一味地对插件本身做加法，使其不断的复杂、臃肿。

在参考了淘宝、京东、腾讯、360等相关网站的切换实现后，重新整理了思路，并在历经不断否定和自我折磨后完成了这款基于 jQuery 的 Slide 切换插件。


## 效果预览

在正式介绍这款插件的使用和相关组成前，建议大家点击下述链接体验下这款插件的使用情况：

1. [图片轮播-基础效果](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-base.html)
2. [图片轮播-进阶效果](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-up.html)
3. [图片轮播-横屏三列](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-cols.html)
4. [图片轮播-参数演示](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-params.html)
5. [图片滚动](http://www.fedlife.cn/demo/jquery/jquery-slide/pic-roll.html)
6. [图片懒加载](http://www.fedlife.cn/demo/jquery/jquery-slide/pic-lazyload.html)
7. [回调函数-进度条切换效果](http://www.fedlife.cn/demo/jquery/jquery-slide/callback-roading.html)
8. [回调函数-内容项的动画效果](http://www.fedlife.cn/demo/jquery/jquery-slide/callback-cont-flash.html)
9. [回调函数-标签项的滑动处理](http://www.fedlife.cn/demo/jquery/jquery-slide/callback-tag-slide.html)
10. [效果定制-实现内容列表的渐进式淡入效果](http://www.fedlife.cn/demo/jquery/jquery-slide/custom-progressive.html)
11. [效果定制-实现内容项的动画效果](http://www.fedlife.cn/demo/jquery/jquery-slide/custom-cont-flash.html)


## `new Slider()` 构造函数

`Slider` 构造函数，是这款图片轮播插件的核心内容。

该构造函数主要负责提供图片轮播所需的基本数据和对象，并执行必要的事件绑定和简单的逻辑处理。至于图片轮播以何种方式运动则通过回调函数来进行实现。利用这种方式，后期如要扩展新的切换效果，就不需要再重复地处理那些参数配置、事件绑定等基础工作，而只需关注切换行为如何表现即可，这将大大提高代码的复用和工作效率。

对于该构造函数，我们根据使用时的先后顺序，将其分为三个阶段。

### 1、实例化

在这个阶段，我们需要传递相关参数来完成 Slider 对象的实例化操作。例如：

```js
var oSlide = new Slider('#slideTest', { trigger: 'click', keepTags: true }, function(cur, old, action){
	console.log('图片轮播时将会触发的回调函数，用于完成相关的附加操作和行为扩展');
});
```

函数调用的参数描述如下：

```js
new Slider(selector[, config][, callback]);
```

参数说明：

1. `selector`：图片轮播所在容器的选择器字符串（将会通过该选择器所构成的jQuery对象向下查找其他相关元素）；
2. `config`：配置选项（详情请参见：[#1](https://github.com/springlong/jquery-slide/issues/1)）；
3. `callback`：每次执行切换处理之前被触发的回调函数，该函数的参数传递与 `oSlide.init` 的绑定函数相一致。

`config` 和 `callback` 参数均为可选，这意味着你可以保持默认的配置选项，将回调函数作为第二个参数进行使用。

在对象实例化的这个阶段，主要工作就是获取并保存接下来需要用到的一些基础信息。

例如：内容列表的jQuery对象（`oSlide.lists`）、自定义参数与默认参数的合并结果（`oSlide.cfg`）、当前切换共有多少页数（`oSlide.pages`）、是否属于有效切换（`oSlide.valid`）等，这些信息将直接为接下来的初始化提供数据依据。


### 2、初始化

在实例化阶段我们获取到了一些有价值的基础信息，而接下来我们需要执行 `oSlide` 对象的初始化方法来完成对当前图片轮播的函数绑定：

```js
oSlide.init(function(cur, old, action){
	console.log('该回调函数用于负责图片轮播时的行为表现');
});
```

上面语句中的回调函数，将全权负责图片轮播时的行为表现。相关参数如下：

1. `cur`：当前需要切换到的分页；
2. `old`：目前所处的分页；
3. `action`：动作标识，`'prev'`-按钮触发前一页，`'next'`-按钮触发后一页，`'must'`-强制执行，`undefined`-标签触发；
4. `this`：指向 `oSlide` 对象本身。

注意：应正确区分 `new Slider()` 和 `oSlide.init()` 执行时回调函数的作用和区别。

在初始化的这个阶段，除了绑定处理函数外。 `oSlide` 对象还将执行内部的一系列处理，主要包括：

1. 分页标签的事件绑定；
2. 分页按钮的事件绑定；
3. 页码和总页数的显示处理；
4. 自动切换时的一些必要处理（鼠标悬浮在容器上方时将暂停自动，鼠标移开后恢复自动）；
4. 首次强制执行； 
5. 将分页标签、分页按钮、分页显示等后期需要继续使用的元素的jQuery对象附加到 `oSlide` 对象中。
6. 无效切换时将移除不必要中的附加元素（分页按钮、分页标签等）

当完成初始化操作后，`oSlide` 对象的成员列表将发生变更，详情请参见：[#2](https://github.com/springlong/jquery-slide/issues/2)。


### 3、完成标识

由于 `oSlide` 对象是通过函数绑定的形式（第三方回调）来完成对图片轮播的行为处理，因此 `oSlide` 并不能知道每次的切换动作会在什么时候完成。所以我们提供了下面的函数接口来标识切换动作的完成：

```js
oSlide.done();  // 标识本轮切换动作已经完成
```

该函数调用通常放在初始化绑定的函数中，当完成 animate 动画后进行回调。不过需要注意的是，必须通过 `oSlide` 对象的方法调用的形式来执行，否则在 `done` 函数中 `this` 将无法指向 `oSlide` 对象。

在 `oSlide.done` 的函数处理中，主要进行下面的两项操作：

1. 自动切换时，负责启动下一轮切换；
2. 当启用了切换时的锁定状态（`cfg.beLock`），将执行解锁处理。


## `.slide()` 扩展函数

该函数是扩展到 `jQuery.fn` 对象中的新成员。用于提供无效果、淡入效果、淡入淡出效果、水平滑动、垂直滑动这五种基本的图片轮播效果。

该扩展函数依赖 `Slider` 对象来完成图片轮播片效果的基本处理，然后将切换时所需的行为表现的代码处理通过 `new Slider().init(process)` 的回调函数进行绑定。这样我们就可以专注于处理图片轮播时的行为表现，而不用去关注如何进行自动播放、分页按钮、分页标签等的操作处理。

`.slide()` 扩展函数其实就是给 `new Slider()` 操作套了一个外壳，而在这个壳的里面完成了负责行为表现的处理函数的绑定工作。因此该扩展函数的调用格式，与 `new Slider()` 的基本一致，只是将选择器字符串前置了而已：

```js
$('#slideTest').slide({ trigger: 'click', keepTags: true }, function(cur, old, action){
	// 切换动作开始前的回调函数
});
```

需要注意的是，执行 `.slide()` 函数调用后，返回的结果是 jQuery 对象实例的引用，而非 `Slider` 对象的实例。

与 `Slider` 对象实例化不同的是，在执行 `.slide()` 函数调用时，除了可以设置 `Slider` 对象的配置选项外，还增加了下面几个自定义的配置选项（默认值）：

```js
{
	easing： 'swing',	// 进行动画效果时的缓动算法
	effect: 'none', 	// 切换方式，"none"-无效果，"fade"-淡入淡出，"fadeIn"-仅淡入效果，scrollx"-垂直滚动，"scrolly"-水平滚动；
	seamless: false, 	// 是否为无缝结构
	allowBlank: false, 	// 非无缝结构下，是否允许最后一组的留白
	doResize: false,   	// 是否在窗口大小变更的情况下调整内容项的宽度（仅使用于scrollx效果，当轮播图宽度与文档视图宽度一致时默认开启）
}
```

**缓动算法（easing）**

jQuery 默认只提供了 `linear` 和 `swing` 两种缓动算法，为了获得更多的效果体验，建议大家配合使用 [jQuery Easing](https://github.com/springlong/jquery-easing) 插件来满足项目的多种需求。你可以点击 [这里](http://www.fedlife.cn/demo/jquery/jquery-easing/demo.html) 查看应用缓动算法插件之后的效果预览。

**无缝结构（seamless）**

设置该参数为 `true`，用来实现图片轮播首尾切换时无缝切换。具体效果请参见 图片轮播-基础效果 中的 [案例五](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-up.html#slide_5)。

**末尾允许留白（allowBlank）**

该参数用于在无缝结构下设置最后一页是否允许留白。具体效果请参见中的 图片轮播-基础效果 中案例一的[两个demo](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-up.html) 。

**窗口调整（doResize）**

该参数通常用于全屏的或者宽度自适应的图片轮播，用来当浏览器窗口的大小被调整时，重置每一页轮播图的宽度，并重新调整到正确的位置。具体效果请参见 图片轮播-基础效果 中的 [案例五](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-up.html#slide_5) 。

**参数演示**

为了让大家能够更好的预览 `.slide()` 扩展函数的配置选项，我们特别提供了 [图片轮播-参数演示](http://www.fedlife.cn/demo/jquery/jquery-slide/slide-params.html) 的预览页面。大家可以对不同的参数选择不同的值，来预览对应的表现效果。


## 使用说明

关于如何使用这款插件来帮助大家快速完成项目工作中的图片轮播需求，相信大家在效果预览环节已经多多少少有了自己的体会。

下面我仅对图片轮播的 HTML 结构做相关说明。

一个完整的图片轮播效果，应该包含下面四个组成部分：

1. 轮播图列表；
2. 分页按钮；
3. 分页标签；
4. 当前分页；

其中除了轮播图列表是必要的元素外，其他三个组成部分都可以根据实际情况来决定使用与否，这对程序的实现都不会产生影响。

下面我们来看下基本的代码结构：

```html
<div id="slideDemo">
	<!-- 轮播图列表 -->
    <div class="content">
        <ul class="j_slideLists">
            <li><a href="#"><img src="images/slide_1.jpg" alt="" /></a></li>
            <li><a href="#"><img src="images/slide_2.jpg" alt="" /></a></li>
            <li><a href="#"><img src="images/slide_3.jpg" alt="" /></a></li>
        </ul>
    </div>
	<!-- 分页标签 -->
    <div class="tag">
	    <ul class="j_slideTags">
            <li class="current">1</li>
            <li>2</li>
            <li>3</li>
        </ul>
    </div>
	<!-- 当前分页 -->
    <div class="pos">
        <span class="pos-cur j_slideCur">1</span>
		<span class="pos-line">/</span>
		<span class="pos-pages j_slidePages">3</span>
    </div>
	<!-- 分页按钮 -->
    <div class="btn">
        <a href="javascript:void(0);" target="_self" class="btnPrev j_slidePrev"></a>
        <a href="javascript:void(0);" target="_self" class="btnNext j_slideNext"></a>
    </div>
</div>
```

### 外围容器

即轮播图所有组件所在的外围容器（`#slideDemo`），属于完整性和布局上的硬性需要。

在 `Slider` 对象实例化之后，你可以通过 `oSlide.ele` 来表示该容器的 jQuery 实例。

在程序的内部实现上，我们将通过 `oSlide.ele.find()` 的形式来查找该元素下的其他组件。

为了提高图片轮播的体验，我们对自动播放做了如下处理：

1. 当鼠标悬浮到外围容器的上方时，将暂停自动播放的响应行为。可以使得用户能够全身心地投入到当前轮播图片的审美中。
2. 当鼠标滑出外围容器后，将恢复自动播放行为。
3. 在用户鼠标悬停在外围容器上方到滑出的这段时间，我们假设持续了 `x` 毫秒（动画完成后算起），而自动播放的延迟时间表示为 `y` 毫秒。如果悬停时间大于等于延迟时间，那么将立即切换至下一页，否则会在 `y - x` 所得值的毫秒之后做下一页切换。


### 轮播图列表

轮播图列表（`#slideDemo .j_slideLists > li`），是轮播图切换效果的核心，是不可或缺的组成部分。

如果轮播图列表不构成有效的切换条件（例如图片只有1张），那么在实例化阶段 `oSlide.valid` 的值将会被置为 `false`，并在初始化阶段，忽略 `oSlide.init` 的函数绑定，并移除分页标签、当前分页、分页按钮等不必要的非内容元素。

为了满足切换效果的各类需求，我们要求轮播图列表至少具备两层外围容器。例如上面示例的 `div.content` 和 `ul.j_slideLists`。如果少于两层，可能会导致无法按预期效果来完成切换。

另外，为了在程序中能够正确辨认轮播图列表，我们默认约定轮播图列表的父级元素中将包含 **`j_slideLists`** 的类名标识。

这些以 `j_slide*` 开头类名标识，主要用于元素查找，应避免参与 CSS 样式的书写行为，以确保这些标识的作用唯一性。

当然，你也可以在函数调用时，通过 `config.lists` 配置选项的值来指定其它的查询字符串。

在对 `Slider` 对象实例化后，你可以通过下面的两个成员来访问轮播图列表的相关元素（jQuery实例）：

1. `oSlide.parent`：轮播图列表的父级元素，即 `.j_slideLists` 元素；
2. `oSlide.lists`：轮播图列表本身，即 `.j_slideLists` 下的所有子节点；


### 分页标签

分页标签（`#slideDemo .j_slideTags > li`）可以快速的在多个轮播图之间进行快速切换。

在程序中，我们通过 **`j_slideTags`** 这一类名标识（你也可以通过 `config.tags` 配置选项来指定其它的查询字符串）来查找分页标签所在的父级容器，然后通过父级容器下的子节点来获得分页标签的 jQuery 实例。

在对 `Slider` 对象初始化后（前提必须是有效切换），我们可以通过 `oSlide.tags` 来访问分页标签的 jQuery 实例。

关于分页标签的组成，有如下两种情况：

1. 当设置 `config.keepTags` 配置选项的值为 `true` 时，分页标签就是默认状态下的那些子节点。
2. 当保持 `config.keepTags` 配置选项的值为默认的 `false` 时，分页标签将会根据父级元素的标签名称自动生成指定数目的分页标签（父级元素是 `ul` 标签式，分页标签采用 `li` 元素，否则采用 `span` 元素。

在轮播图切换的过程中，将会为当前分页的标签项添加 `current` 的类名标识，你可以使用该类名来设置标签选中时的样式状态。

另外，你可以通过 `config.tagClass` 配置选项来变更标签选中时类名标识。


### 当前分页

当前分页，用来标识当前所处的分页状态。由以下两个元素（jQuery 实例）搭配使用：

1. `oSlide.posCur`：显示当前页码的容器（`#slideDemo .j_slideCur`)。
2. `oSlide.posPages`：显示总页数的容器（`#slideDemo .j_slidePages`）。

上述的两个对象成员，仅在 `Slider` 对象初始化之后并且属于有效切换的条件下，才会存在。

你可以分别通过 `config.posCur` 和 `config.posPages` 这两个配置选项来指定其它的查询字符串来表示这两个元素的位置。

由于当前分页的相关元素，通常作为一个整体存在，所以务必给它们一个独立的父级容器。当属于无效切换时，我们将根据父级容器来移除它们。


### 分页按钮

分页按钮，用来进行上下分页的切换。由以下两个元素（jQuery 实例）组成：

1. `oSlide.btnPrev`：上一页的切换按钮（`#slideDemo .j_slidePrev`)。
2. `oSlide.btnNext`：下一页的切换按钮（`#slideDemo .j_slideNext`）。

上述的两个对象成员，仅在 `Slider` 对象初始化之后并且属于有效切换的条件下，才会存在。

你可以分别通过 `config.btnPrev` 和 `config.btnNext` 这两个配置选项来指定其它的查询字符串来表示这两个元素的位置。

由于这两个切换按钮，存在对应关系，所以务必给它们一个独立的父级容器。当属于无效切换时，我们将根据父级容器来移除它们。

**按钮禁用状态**

在设置 `config.btnDisable` 配置选项为 `true` 的情况下，如果当前分页为第一页，那么 `oSlide.btnPrev` 元素将被添加 `disabled` 类名标识，而如果当前分页为最后一页，那么 `oSlide.btnNext` 元素则被添加 `disabled` 类名标识。

在切换按钮处于 `disabled` 状态时，将无法响应点击行为。

你可以通过 `config.btnClass` 配置选项来指定其他的类名标识。


## 后期工作

1. 继续优化 `Slider` 构造函数以及 `.slide` 扩展函数的代码组织结构，使其更轻、更快！
2. 针对高级浏览器采用 CSS3 动画实现，以达到高级浏览器功能和性能的充分利用！
3. 提供基于 Zepto 的触屏实现，让该插件在移动端也能够尽情的展现价值！
4. 提供更多的演示案例，使该插件发挥更大、更广的应用价值！
