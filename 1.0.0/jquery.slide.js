/**
 * @file        slide切换组件
 * @version     1.0.0
 * @author      龙泉 <yangtuan2009@126.com>
 */
(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD module
        define(['jquery'], factory);
    }
    else if(typeof module !== "undefined" && module.exports) {
        // Node/CommonJS
        // Seajs build
        factory(require('jquery'));
    }
    else {
        // 浏览器全局模式
        factory(jQuery);
    }

})(function ($) {

(function(window, undefined){


/**
 * slide切换组件
 * @param  {Object}  config             配置参数（基本参数请参见 Slider.config，这里注释所列的参数说明为当前函数所扩展的参数 ）
 * @param  {string}  [config.easing]    进行动画效果时的缓动算法，默认为"swing"
 * @param  {string}  [config.effect]    切换方式，默认无效果，"none"-无效果，"fade"-淡入淡出，"fadeIn"-仅淡入效果，scrollx"-垂直滚动，"scrolly"-水平滚动
 * @param  {boolean} [config.seamless]  是否为无缝结构（默认为：false）
 * @param  {boolean} [config.allowBlank] 非无缝结构下，是否允许最后一组的留白（默认为：false）
 * @param  {boolean} [config.doResize]  是否在窗口大小变更的情况下调整内容项的宽度（默认为：false，仅使用于scrollx效果，当幻灯片宽度与文档视图宽度一致时默认开启）
 * @param  {Function} callback 每次执行切换操作时所触发的回调函数
 * @return {jQuery}            原jQuery对象
 */
$.fn.slide = function(config, callback)
{
    config = $.extend({ easing: "swing", effect: "none" }, config);

    return this.each(function(i, ele){

        var oSlide = new Slider(ele, config, callback);

        if(oSlide.valid) {

            oSlide.cfg.effect.indexOf("scroll") >= 0 ? doSlide(oSlide) : doSwitch(oSlide);
        }

        // window.console && console.info(oSlide);
    });
};


/**
 * 处理$.fn.slide组件的滑动效果 ( scrollx scrolly )
 * @param  {Object} oSlide Slide对象的实例
 * @return {undefined}
 */
function doSlide(oSlide)
{
    // 获取实例对象的相关属性
    var $lists = oSlide.lists,
        $parent = oSlide.parent,
        cansee = oSlide.cansee,
        cfg = oSlide.cfg,
        seamless = cfg.seamless,
        scrollLen = cfg.scrollLen,
        pages;

    // 无缝结构时，slide组件的切换页数将会有所变更
    pages = oSlide.pages = seamless ? Math.ceil($lists.length / scrollLen) : oSlide.pages;

    // 计算所需的基本长度
    var isScrollx = cfg.effect === "scrollx",
        scrollBase = isScrollx ? $lists.outerWidth(true) : $lists.outerHeight(true),  // 单个切换单元的宽度或高度
        scrollValue = scrollBase * scrollLen,  // 单次滚动所需移动的距离
        scrollLeave = (cansee - scrollLen) * scrollBase, // 单次滚动后当前可视区域所剩下的距离
        remainder = ($lists.length % scrollLen),
        unitLeft = remainder === 0 ? 0 : scrollLen - remainder, // 最后一组切换单元还差几个列表项才构成完整的切换队列
        unitLeftValue = scrollBase * unitLeft,
        scrollMax = scrollValue * (pages - 1) - (cfg.allowBlank ? 0 : unitLeftValue),  // 最后一页切换所构成的最大运动值
        seamlessDistance = 0;  // 无缝结构：附加的距离长度

    // 重置切换所需的基本结构
    (function(){

        if(seamless){

            var $clonePrefix, $cloneAfter, attr, amount = $lists.length;

            if(unitLeft !== 0){
                attr = isScrollx ? "marginRight" : "marginBottom";
                $lists.last().css(attr, function(i, value){
                    return parseInt(value) + unitLeftValue;
                });
            }

            $clonePrefix = $lists.slice(-cansee + unitLeft).clone(true);
            $clonePrefix.attr("data-clone", function(i){ return amount - ($clonePrefix.length - i); });
            $cloneAfter = $lists.slice(0, cansee).clone(true);
            $cloneAfter.attr("data-clone", function(i){ return i; });
            $lists = $parent.prepend($clonePrefix).append($cloneAfter).children();

            seamlessDistance = scrollBase * cansee;
            scrollMax = scrollValue * (pages - 1) + seamlessDistance;
        }

        $parent.css("position") === "static" && $parent.css("position", "relative");

        if(isScrollx){

            var listW = $lists.width();
            $lists.css({"float": "left", "width": listW });
            $parent.css("width", scrollBase * $lists.length + (seamless ? unitLeftValue * 2 : 0));

            // 单屏显示的内容项在自适应宽度的情况下，当浏览器调整窗口尺寸时需要重新调整宽度
            if(cansee === 1 && (cfg.doResize || listW === $(window).width())){

                $(window).resize(function(){
                    scrollValue = scrollBase = $parent.parent().width();
                    scrollMax = scrollValue * (pages - 1);
                    if(seamless){
                        seamlessDistance = scrollBase * cansee;
                        scrollMax += seamlessDistance;
                    }
                    $lists.css("width", scrollBase);
                    $parent.css("width", scrollBase * $lists.length);
                    oSlide.process(oSlide.old, oSlide.old, "must");  // 对幻灯片的位置进行重置
                });
            }
        }
    })();

    // 指定回调处理函数
    oSlide.init(function(cur, old, action){

        var scrollDistance, data,
            duration = action === "must" ? 0 : cfg.duration;

        // 针对无缝结构的特殊处理
        if(seamless){

            var direct = isScrollx ? "left" : "top";
            if(cur === 0 && old === pages - 1 && action === "next"){

                $parent.css(direct, -scrollLeave); //最后到第一个
            }
            else if(cur === pages - 1 && old === 0 && action === "prev"){

                $parent.css(direct, -scrollMax - seamlessDistance + (cansee - scrollLen) * scrollBase); //第一个到最后
            }
        }

        // 执行效果选择
        scrollDistance = cur === pages - 1 ? scrollMax : scrollValue * cur + seamlessDistance;
        data = isScrollx ? {left: -scrollDistance} : {top: -scrollDistance};
        $parent.stop().animate(data, duration, cfg.easing, function(){ oSlide.done() });
    });
}


/**
 * 处理 $.fn.slide 组件的其它效果（fade fadeIn none）
 * @param  {Object} oSlide Slide对象的实例
 * @return {undefined}
 */
function doSwitch(oSlide)
{
    var $lists = oSlide.lists,
        cfg = oSlide.cfg,
        effect = cfg.effect,
        easing = cfg.easing,
        scrollLen = cfg.scrollLen,
        done = function(){ oSlide.done() };

    // 淡入淡出
    if(effect === "fade"){

        oSlide.parent.css("position") === "static" && oSlide.parent.css("position", "relative");
        $lists.css("position") !== "absolute" && $lists.css({position: "absolute", left: 0, top: 0});
        $lists.hide().eq(oSlide.cur).show();

        oSlide.init(function(cur, old, action){

            var duration = action === "must" ? 0 : cfg.duration;
            $lists.eq(old).stop(true, true).css('z-index', 1).fadeOut(duration, easing, done);
            $lists.eq(cur).css('z-index', 0).show();
        });
    }
    // 淡入效果
    else if(effect === "fadeIn"){

        oSlide.init(function(cur, old, action){

            $lists.hide().slice(scrollLen * cur, scrollLen * (cur + 1)).fadeIn(action === "must" ? 0 : cfg.duration, easing, done);
        });
    }
    // 无效果切换
    else{

        cfg.duration = 0;  // 重置duration配置为0

        oSlide.init(function(cur){

            $lists.hide().slice(scrollLen * cur, scrollLen * (cur + 1)).show();
            done();
        });
    }
}

/**
 * Slide切换处理
 * @param  {DOM|jQuery|string} ele      外围容器的对象表示（DOM对象、jQuery对象、jQuery选择器）
 *
 * @param  {Object}  config             配置参数（将布尔型参数以及部分特殊参数的原始值以undefined的形式存在）
 *
 * @param  {jQuery}  [config.lists]     轮播图列表所处容器的 selector，默认值：".j_slideLists"
 * @param  {jQuery}  [config.tags]      分页标签所处容器的 selector，默认值：".j_slideTags"
 * @param  {jQuery}  [config.posCur]    显示当前页码的容器的 selector，默认值：".j_slideCur"
 * @param  {jQuery}  [config.posPages]  显示总页数的容器的 selector，默认值：".j_slidePages"
 * @param  {jQuery}  [config.btnPrev]   上一页按钮的 selector，默认值：".j_slidePrev"
 * @param  {jQuery}  [config.btnNext]   下一页按钮的 selector，默认值：".j_slideNext"
 *
 * @param  {string}  [config.trigger]   分页标签的触发事件，默认值："mouseenter"（鼠标滑入切换）
 * @param  {string}  [config.tagClass]  标签项选中时附加的类名状态，默认值："current"
 * @param  {string}  [config.btnClass]  按钮被禁用时附加的类名状态，默认值："disabled"
 * @param  {number}  [config.duration]  切换效果的持续时间，默认值：400（毫秒）
 * @param  {number}  [config.interval]  自动切换时的时间间隔，默认值：5000（毫秒）
 * @param  {number}  [config.hoverDelay] 鼠标悬浮切换时，分页标签的响应延迟时间，默认值：0（毫秒）
 *
 * @param  {number}  [config.cur]       默认显示的内容项的索引，默认值：0
 * @param  {number}  [config.scrollLen] 每次切换将滚动的单位长度，默认值：0，表示可视区域的所有列（横向）或所有行（纵向）。
 *
 * @param  {boolean} [config.keepTags]  是否保留分页标签的原始内容，默认值：false（分页标签项将由程序自动生成）
 * @param  {boolean} [config.btnDisable] 是否设置在首页时禁用上一页按钮切换，在尾页时禁用下一页按钮切换，默认值：false
 * @param  {boolean} [config.auto]      是否执行自动切换，默认值：false
 * @param  {boolean} [config.lazyload]  是否启用图片的懒加载功能，默认值：false
 * @param  {boolean} [config.beLock]    当处于轮播的运动状态时，是否将当前轮播置为锁定状态（按钮点击将不会触发切换，但分页标签可以），默认值：false
 *
 * @param  {string}  [config.imgAttr]   启用图片的懒加载时，用于表示真实url的自定义属性，默认值："data-slide-img"
 *
 * @param  {Function} callback          在每次执行切换操作之前所触发的回调函数——function(cur, old){}，cur参数表示当前需要显示的索引项，old参数表示前一个显示的索引项，action表示执行的相关动作（must , prev , next），this指向对象本身
 *
 * @return {Object}
 */
function Slider(ele, config, callback)
{
    if(typeof config === "function"){
        callback = config;
        config = undefined;
    }
    this.ele = $(ele);
    this.cfg = $.extend({}, Slider.config, config);
    typeof callback  === "function" && (this.callback = callback);
    this.valid = true;
    this.predefine();
}
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
Slider.prototype = {

    // 预定义
    predefine: function()
    {
        var that = this,
            cfg = that.cfg,
            $parent = that.ele.find(cfg.lists || ".j_slideLists"),
            $wrap = $parent.parent(),
            $lists = $parent.children(),
            amount = $lists.length,
            scrollLen = cfg.scrollLen,
            cansee, cols, rows, pages;

        // 计算可视内容项的情况
        cols = Math.round($wrap.width() / $lists.outerWidth(true)) || 1;
        rows = Math.round($wrap.height() / $lists.outerHeight(true)) || 1;
        cansee = cols * rows;
        scrollLen = cfg.scrollLen ? scrollLen : cansee;
        pages = Math.ceil((amount - (cansee - scrollLen)) / scrollLen);

        // 只有当切换页数大于1才做切换处理
        if(pages < 2 || amount <= cansee){
            that.valid = false;
            that.init();
            return;
        }

        // 参数重置
        if("ontouchstart" in window){
            cfg.trigger = "click";
        }
        cfg.cur = cfg.cur >= pages ? pages - 1 : (cfg.cur || 0);
        cfg.scrollLen = scrollLen;

        // 附加公共成员
        that.lists = $lists;        // 内容列表
        that.parent = $parent;      // 内容列表的父级容器
        that.pages = pages;         // 可切换的总页数
        that.cansee = cansee;       // 可视切换内容的行数或列数
        that.old = cfg.cur;         // 保存当前已有显示内容的索引值
    },

    // 初始化
    // 参数process：绑定负责Slide切换的处理函数——function(cur, old, action){}，cur参数表示当前需要显示的索引项，old参数表示已有显示的索引项，action表示执行的相关动作（must , prev , next），this指向对象本身
    init: function(process)
    {
        var that = this,
            cfg = that.cfg,
            $ele = that.ele,
            $tags = $ele.find(cfg.tags || ".j_slideTags"),
            $posCur = $ele.find(cfg.posCur || ".j_slideCur"),
            $posPages = $ele.find(cfg.posPages || ".j_slidePages"),
            $btnPrev = $ele.find(cfg.btnPrev || ".j_slidePrev"),
            $btnNext = $ele.find(cfg.btnNext || ".j_slideNext"),
            imgAttr;

        if(that.valid){

            if($tags.length){
                that.tags = $tags;
                that.bindTags();
            }

            if($btnPrev.length){
                that.btnPrev = $btnPrev;
                that.btnNext = $btnNext;
                that.bindBtns();
            }else{
                cfg.btnDisable = false;
            }

            if($posCur.length){
                that.posCur = $posCur;
                $posPages.html(that.pages);
            }

            cfg.auto && that.bindAuto();
            that.bindTouch();
            that.process = typeof process  === "function" ? process : $.noop;
            that.show(cfg.cur, "must");

            $tags.add($posCur.parent()).add($btnPrev.parent()).show();

        }else{

            $tags.add($posCur.parent()).add($btnPrev.parent()).remove();

            if(cfg.lazyload) {

                imgAttr = cfg.imgAttr || "data-slide-img";

                that.doLoadImg($('[' + imgAttr + ']'), imgAttr);
            }
        }
    },

    // 重置标签项
    rewriteTags: function()
    {
        var that = this,
            cfg = that.cfg,
            pages = that.pages,
            $tags = that.tags;

        !cfg.keepTags && (function(){

            var str = "",
                i = 0,
                tagName = $tags[0].nodeName.toLowerCase() === "ul" ? "<li>" : "<span>",
                tagNameEnd = tagName.replace("<", "</");

            for(; i < pages; ){
                str += tagName + (++i) + tagNameEnd;
            }
            $tags.html(str);
        })();

        that.tags = $tags.children().removeClass(cfg.tagClass).each(function(i, ele){
            $(ele).data("i", i);
        });
    },

    // 绑定标签操作
    bindTags: function()
    {
        var that = this,
            cfg = that.cfg,
            trigger = cfg.trigger,
            ismousehover = trigger === "mouseenter" || trigger === "mouseover",
            stopDelay, $tags, func;

        // 重置标签项
        that.rewriteTags();
        $tags = that.tags;

        // 绑定标签项的事件处理
        if(ismousehover && cfg.hoverDelay){

            func = function(){
                var $ele = $(this);
                clearTimeout(stopDelay);
                stopDelay = setTimeout(function(){
                    that.show($ele.data("i"));
                }, cfg.hoverDelay);
            };

            $tags.on("mouseleave", function(){
                clearTimeout(stopDelay);
            });

        }else{

            func = function(){
                that.show($(this).data("i"));
            };
        }
        $tags.on(trigger, func);

        // 单击事件触发的情况下，标签项的链接首次不会被访问
        !ismousehover && $tags.has("a").on("click", "a", function(e){
            if(!$(this).parent().hasClass(cfg.tagClass)){
                e.preventDefault();
            }
        });
    },

    // 绑定按钮操作
    bindBtns: function()
    {
        var that = this,
            old = that.old,
            cfg = that.cfg,
            btnClass = cfg.btnClass,
            btnDisable = cfg.btnDisable,
            $btnPrev = that.btnPrev,
            $btnNext = that.btnNext;

        //绑定前后按钮的事件处理
        $btnPrev.on("click", function(){
            (!btnDisable || !$(this).hasClass(btnClass)) && that.prev();
            return false;
        });
        $btnNext.on("click", function(){
            (!btnDisable || !$(this).hasClass(btnClass)) && that.next();
            return false;
        });
        if(btnDisable){
            if(old === 0){
                $btnPrev.addClass(btnClass);
            }else if(old === that.pages - 1){
                $btnNext.addClass(btnClass);
            }
        }
    },

    // 绑定自动切换处理
    bindAuto: function()
    {
        var that = this;

        // 自动切换时，鼠标悬浮在标题或者内容的上方时将暂停切换操作
        // 当鼠标移出后，恢复自动切换
        that.ele.on({
            "mouseenter": function(){
                that.pause();
            },
            "mouseleave": function(){
                that.play();
            }
        });
    },

    // 切换至上一页
    prev: function()
    {
        var cur = this.old - 1;
        cur = cur < 0 ? this.pages - 1 : cur;
        this.show(cur, "prev");
    },

    // 切换至下一页
    next: function()
    {
        var cur = this.old + 1;
        cur = cur >= this.pages ? 0 : cur;
        this.show(cur, "next");
    },

    // 切换到指定位置
    // cur：接下来需要显示的索引项
    // action：相关动作的标识，"must"-强制执行, "prev"-上一页，"next"-下一页，undefined-标签项切换
    show: function(cur, action)
    {
        var that = this,
            old = that.old,
            cfg = that.cfg,
            btnClass = cfg.btnClass,
            tagClass = cfg.tagClass;

        if(old === cur && action !== "must" || that.isLocked) return;

        if(cfg.beLock && action !== undefined){
            that.isLocked = true;
        }

        if(cfg.btnDisable){
            that.btnPrev.toggleClass(btnClass, cur === 0);
            that.btnNext.toggleClass(btnClass, cur === that.pages - 1);
        }

        that.tags && that.tags.eq(old).removeClass(tagClass).end().eq(cur).addClass(tagClass);
        that.posCur && that.posCur.html(cur + 1);

        cfg.lazyload && that.loadImg(cur);
        that.callback && that.callback.call(that, cur, old, action);
        that.process.call(that, cur, old, action);
        that.old = cur;
    },

    // 在每次切换完成后执行
    done: function()
    {
        var that = this,
            cfg = that.cfg;

        if(cfg.beLock){
            that.isLocked = false;
        }

        if(cfg.auto){
            that.tStartAuto = $.now();
            that.auto();
        }
    },

    // 置为锁定状态，不响应其他切换事件的触发
    lock: function()
    {
        this.isLocked = true;
    },

    // 解除锁定状态
    unlock: function()
    {
        this.isLocked = false;
        this.done();
    },

    // 暂停自动
    pause: function()
    {
        this.isPaused = true;
    },

    // 恢复自动
    play: function()
    {
        this.isPaused = false;
        !this.isLocked && this.auto(true);
    },

    // 开启自动
    auto: function(byPlay)
    {
        var that = this,
            interval = that.cfg.interval;

        clearTimeout(that.stopDoAuto);
        if(!that.isPaused){

            // 如果暂停自动切换持续时间较长，当恢复自动切换时，应减少延时触发的时间
            if(byPlay && that.tStartAuto !== undefined){
                interval = interval - ($.now() - that.tStartAuto);
            }

            that.stopDoAuto = setTimeout(function(){
                !that.isPaused && that.next();
            }, interval);
        }
    },

    // 图片懒加载处理
    loadImg: function(index)
    {
        var that = this, cfg = that.cfg;

        if(that.hasClone === undefined){
            that.hasClone = that.lists.first().prev().length > 0;
            that.imgLoaded = " ";
        }
        if(that.imgLoaded.indexOf(" " + index + " ") >= 0) return;
        that.imgLoaded += index + " ";

        var attr = cfg.imgAttr || "data-slide-img",
            selector = "[" + attr + "]",
            start = index * cfg.scrollLen,
            end = start + that.cansee,
            $clone = that.hasClone ? that.parent.children(getCloneSelector(start, end)) : undefined,
            $operator = that.lists.slice(start, end).add($clone).find(selector);

        that.doLoadImg($operator, attr);

        if($.trim(that.imgLoaded).split(" ").length === that.pages){
            delete that.hasClone;
            delete that.imgLoaded;
            cfg.lazyload = false;
        }
    },

    // 执行图片加载
    doLoadImg: function($operator, attr)
    {
        $operator.each(function(index, ele){
            var src = ele.getAttribute(attr);
            ele.tagName.toLowerCase() === "img" ? ele.setAttribute("src", src) : ele.style.backgroundImage = "url(" + src + ")";
            ele.removeAttribute(attr);
        });
    },

    //绑定触屏事件
    bindTouch: function()
    {
        if(!("ontouchstart" in window)) return;

        var that = this,
            $ele = that.ele,
            ele = $ele[0],
            width = Math.floor($ele.width() / 4),
            moveX = 0,
            startX;

        width = width > 80 ? 80 : width;

        ele.addEventListener("touchstart", function(e){
            startX = e.pageX;
        });

        ele.addEventListener("touchmove", function(e){
            moveX = e.pageX - startX;
            (Math.abs(moveX) > 20) && e.preventDefault();
        });

        ele.addEventListener("touchend", function(e){

            if(Math.abs(moveX) > width){
                moveX > 0 ? that.prev() : that.next();
            }
        });
    }
};
window.Slider = Slider;

/**
 * 图片懒加载处理中用于处理获取当前切换项的拷贝元素
 * @param  {number} start 起始索引值
 * @param  {number} end   结束索引值
 * @return {string}       用于查找拷贝元素所对应的选择器字符串
 */
function getCloneSelector(start, end)
{
    var selector = '';
    for(var i = start; i < end; i++){
        selector += ',[data-clone="' + i + '"]';
    }
    return selector.substring(1);
}

})(window);

});