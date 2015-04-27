# Slider 构造函数的配置选项

## 查询字符串

类型：`string`

1. `config.lists`：轮播图列表所处容器的 selector，默认值：`".j_slideLists"` ；
2. `config.tags`：分页标签所处容器的 selector，默认值：`".j_slideTags"` ；
3. `config.posCur`：显示当前页码的容器的 selector，默认值：`".j_slideCur"` ；
3. `config.posPages`：显示总页数的容器的 selector，默认值：`".j_slidePages"` ；
4. `config.btnPrev`：上一页按钮的 selector，默认值：`".j_slidePrev"` ；
5. `config.btnNext`：下一页按钮的 selector，默认值：`".j_slideNext"` 。


## 基本选项

类型：`string`

1. `config.trigger`：分页标签的触发事件，默认值：`"mouseenter"`（鼠标滑入切换） ；
2. `config.tagClass`：标签项选中时附加的类名标识，默认值：`"current"` ；
3. `config.btnClass`：按钮被禁用时附加的类名标识，默认值：`"disabled"` 。

类型：`number`

1. `config.duration`：切换效果的持续时间，默认值：`400`（毫秒） ；
2. `config.interval`：自动切换时的时间间隔，默认值：`5000`（毫秒）；
3. `config.hoverDelay`：鼠标悬浮切换时，分页标签的响应延迟时间，默认值：`0`（毫秒）；


## 数值选项

类型：`number`

1. `config.cur`：默认显示的内容项的索引，默认值：`0` ；
2. `config.scrollLen`：每次切换将滚动的单位长度，默认值：`0`，表示可视区域的所有列（横向）或所有行（纵向）。


## 属性选项

类型：`string`

1. `config.imgAttr`：当启用图片的懒加载时，用于表示真实 url 的自定义属性，默认值：`"data-slide-img"`。


## 布尔选项

类型：`boolean`

1. `config.keepTags`：是否保留分页标签的原始内容，默认值：`false`（分页标签项将由程序自动生成）；
2. `config.btnDisable`：是否在首页和尾页时启用分页按钮的禁用状态，默认值：`false` ；
3. `config.auto`：是否执行自动切换，默认值：`false`；
4. `config.lazyload`：是否启用图片的懒加载功能，默认值：`false` ；
5. `config.beLock`：当处于轮播的运动状态时，是否将当前轮播置为锁定状态（按钮点击将不会触发切换，但分页标签可以），默认值：`false`；

