#jQuery Easing

针对jQuery的缓动算法插件

##需求

jQuery自身提供 `linear` 和 `swing` 两种缓动算法：

1. `linear`：整个动画过程中保持恒速运动。
2. `swing`：随着动画的开始变得更加快一些，然后再慢下来。

jQuery使用 `swing` 作为默认的缓动处理，如果你需要更多的动画表现形式，那么 `jquery-seasing` 插件将是你的一位好帮手。

##介绍

jQuery Easing插件为jQuery提供了10种缓动行为，而每种缓动行为又分为三个缓动方式，共计30个缓动算法可供选择使用。

###缓动行为

1. **Quad**: 二次方的缓动(t^2)
2. **Cubic**: 三次方的缓动(t^3)
3. **Quart**: 四次方的缓动(t^4)
4. **Quint**：五次方的缓动(t^5)
5. **Sine**: 正弧曲线的缓动(sin(t))
6. **Expo**: 指数曲线的缓动(2^t)
7. **Circ**: 圆形曲线的缓动(sqrt(1-t^2)
8. **Elastic**: 指数衰减的正弧曲线缓动
9. **Back**: 超过范围的三次方缓动
10. **Bounce**: 指数衰减的反弹缓动

###缓动方式

1. **easeIn**: 从0开始加速的缓动
2. **easeOut**: 减速到0的缓动
3. **easeInOut**: 前半段从0开始加速，后半段减速到0的缓动


##使用

使用jQuery Easing提供的缓动算法，只需要传递缓动行为与缓动方式的组合名称给缓动参数即可。

例如：

```JS

//二次方(t^2)从0开始加速的缓动
$("#box").animate({width: 300}, 1000, "easeOutQuad");

```

##参考

1. Tween算法的Javascript实现：[http://www.cnblogs.com/cloudgamer/archive/2009/01/06/tween.html](http://www.cnblogs.com/cloudgamer/archive/2009/01/06/tween.html)
2. easing缓动官方提供：[http://www.robertpenner.com/easing/](http://www.robertpenner.com/easing/)
3. easing官方动画演示：[http://www.robertpenner.com/easing/easing_demo.html](http://www.robertpenner.com/easing/easing_demo.html)