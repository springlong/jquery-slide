/**
 * @file        slide切换组件
 * @version     0.1.0
 * @author      yangtuan <yangtuan2009@126.com>
 */
(function(window, $, undefined){

/**
 * slide切换组件
 * @param  {Object}  options    配置参数（具体可配置参数请参见 Slide.options ）
 * @return {jQuery}             原jQuery对象
 */
$.fn.slide = function(options)
{
    return this.each(function(i, ele){

        var oSlide = new Slide(ele, options, callback);
        if(!oSlide.valid) return;

        var $lists = oSlide.lists,
            $wrap = oSlide.wrap,
            $parent = oSlide.parent,
            cansee = oSlide.cansee,
            cur = oSlide.cur,
            pages = oSlide.pages,
            scrolls = oSlide.scrolls,
            scrollsSigle = oSlide.scrollsSigle,
            scrollBase = oSlide.scrollBase,
            scrollValue = oSlide.scrollValue,
            scrollMax = oSlide.scrollMax,
            scrollMaxBak = scrollMax,
            opt = oSlide.opt,
            effect = opt.effect,
            duration = opt.duration,
            easing = opt.easing,
            seamless = opt.seamless,
            doResize = opt.doResize,
            scrollLen = opt.scrollLen,
            seamlessDistance = 0,  //无缝结构附加的距离值
            seamlessLeft = 0, //无缝结构时用到：单屏滚动单位距离后所剩下的区域长度
            current;    //标注当前显示项的索引值

        window.console && console.info(oSlide);

        //重置切换所需的基本结构
        (function(){

            var listW, append = 0;

            if(seamless){

                var $clonePrefix = $lists.slice(-cansee).clone(true).attr("data-clone", true),
                    $cloneAfter = $lists.slice(0, cansee).clone(true).attr("data-clone", true);
                $lists = $parent.prepend($clonePrefix).append($cloneAfter).children();
                seamlessLeft = (scrollsSigle - scrollLen)*scrollBase,
                seamlessDistance = scrollsSigle * scrollBase;
                append = 2;
                scrollMax += seamlessDistance + seamlessLeft;
            }

            if("fade,scrollx,scrolly".indexOf(effect) >= 0){

                $parent.css("position") === "static" && $parent.css("position", "relative");
            }

            switch(effect)
            {
                case "fade":

                    $lists.css("position") !== "absolute" && $lists.css({position: "absolute", left: 0, top: 0}).hide().eq(cur).show();
                    break;

                case "scrollx":

                    listW = $lists.width();
                    $lists.css({ "float": "left", "width": listW });
                    $parent.css("width", scrollBase * scrolls + seamlessDistance*append);

                    //单屏显示的内容项在自适应宽度的情况下，当浏览器调整窗口尺寸时需要重新调整宽度
                    if(cansee === 1 && (doResize || listW === $(window).width())){

                        $(window).resize(function(){
                            scrollValue = scrollBase = $wrap.width();
                            scrollMax = scrollBase * (scrolls-1);
                            if(seamless){
                                seamlessDistance = scrollsSigle * scrollBase;
                                scrollMax = scrollBase * (scrolls + 1);
                            }
                            $lists.css("width", scrollBase);
                            $parent.css("width", scrollBase * scrolls + seamlessDistance*append);
                            callback(current, current, "must");
                        });
                    }
                    break;
            }
        })();

        function callback(cur, old, action)
        {
            var scrollDistance,
                duration = action === "must" ? 0 : duration;

            //针对无缝结构的特殊处理
            if(seamless)
            {
                var direct = effect === "scrollx" ? "left" : "top";
                if(cur === 0 && old === pages - 1 && action === "next"){

                    $parent.css(direct, -seamlessLeft); //最后到第一个
                }
                else if(cur === pages - 1 && old === 0 && action === "prev"){

                    $parent.css(direct, -scrollMaxBak - seamlessDistance*2); //第一个到最后
                }
            }

            //执行效果选择
            switch(effect)
            {
                //无效果
                case "none":
                    $lists.hide().slice(cansee * cur, cansee * (cur + 1)).show();
                    break;

                //淡入淡出
                case "fade":
                    $lists.eq(old).fadeOut(duration, easing);
                    $lists.eq(cur).fadeIn(duration, easing);
                    break;

                //仅淡入效果
                case "fadeIn":
                    $lists.hide().slice(cansee * cur, cansee * (cur + 1)).fadeIn(duration, easing);
                    break;

                //水平滚动
                case "scrollx":
                    scrollDistance = cur === pages - 1 ? scrollMax : scrollValue * cur + seamlessDistance;
                    $parent.stop().animate({left: -scrollDistance}, duration, easing);
                    break;

                //垂直滚动
                case "scrolly":
                    scrollDistance = cur === pages - 1 ? scrollMax : scrollValue * cur + seamlessDistance;
                    $parent.stop().animate({top: -scrollDistance}, duration, easing);
                    break;
            }

            //保存当前显示项的索引值，供其他需求使用
            current = cur; 
        }
    });
};

/**
 * Slide切换处理
 * @param  {DOM|jQuery|String} ele       外围容器的对象表示（DOM对象、jQuery对象、jQuery选择器）
 *
 * @param  {Object}  options             配置参数
 * @param  {jQuery}  options.lists       内容列表的查询selector，默认为："[data-slide=lists]"
 * @param  {jQuery}  options.tags        标签列表的查询selector，默认为："[data-slide=tags]"
 * @param  {jQuery}  [options.posCur]    显示当前页码的容器的查询selector，默认为："[data-slide=cur]"
 * @param  {jQuery}  [options.posPages]  显示总页数的容器的查询selector，默认为："[data-slide=pages]"
 * @param  {jQuery}  [options.btnPrev]   前一页按钮的查询selector，默认为："[data-slide=prev]"
 * @param  {jQuery}  [options.btnNext]   后一页按钮的查询selector，默认为："[data-slide=next]"
 *
 * @param  {String}  [options.trigger]   标签的触发方式，默认为“mouseenter”（鼠标滑入切换），也可设置为"click"（点击切换）
 * @param  {String}  [options.tagClass]  标签项选中时附加的类名状态，默认为"current"
 * @param  {String}  [options.btnClass]  按钮被禁用时附加的类名状态，默认为"disabled"
 * @param  {Number}  [options.duration]  具有切换效果时的效果持续时间，默认为400（单位：毫秒）
 * @param  {Number}  [options.interval]  自动切换时的时间间隔，默认为：5000（单位：毫秒）
 * @param  {Number}  [options.hoverDelay] 鼠标悬浮切换时的等待延时，默认不做延时处理
 * @param  {Number}  [options.cur]       默认显示的内容项索引，默认为：0
 * @param  {Boolean} [options.keepTags]  是否保留标签项的内容，默认为false
 * @param  {Boolean} [options.btnLock]   是否设置当按钮点击到最后一个时进入锁定状态不能点击，默认为false
 * @param  {Boolean} [options.auto]      是否执行自动切换（默认为：false）
 *
 * @param  {String}  [options.easing]    进行动画效果时的缓动算法，默认为"swing"
 * @param  {String}  [options.effect]    切换方式，默认无效果，"none"-无效果，"fade"-淡入淡出，"fadeIn"-仅淡入效果，scrollx"-垂直滚动，"scrolly"-水平滚动，”“-自定义效果
 * @param  {Number}  [options.scrollLen] 每次切换将滚动的单位长度（scrollx按一列计算，scrolly按一行计算），默认为可视区域的所有列或所有行
 * @param  {Boolean} [options.seamless]  是否为无缝结构（默认为：false）
 * @param  {Boolean} [options.lazyload]  是否启用图片懒加载功能，默认为false-不启用（无缝滚动效果不支持图片懒加载，同时也不建议将图片列表做成无缝滚动效果）
 * @param  {Boolean} [options.doResize]  是否在窗口大小变更的情况下调整内容项的宽度（仅使用于scrollx效果，当幻灯片宽度与文档视图宽度一致时默认开启）
 *
 * @param  {Function} [options.startFun]  即将执行切换之前触发的回调函数——function(cur, old){}，cur参数表示当前需要显示的索引项，old参数表示前一个显示的索引项，this指向对象本身
 * @param  {Function} [options.endFun]    切换执行完成之后触发的回调函数——function(cur, old){}，cur参数表示当前需要显示的索引项，old参数表示前一个显示的索引项，this指向对象本身
 *
 * @param  {Function} callback            触发切换操作时所需执行的回调函数——function(cur, old, action){}，cur参数表示当前需要显示的索引项，old参数表示已有显示的索引项，action表示执行的相关动作（must , prev , next），this指向对象本身
 * @return {Object}
 */
function Slide(ele, options, callback){
    this.ele = $(ele);
    this.opt = $.extend({}, Slide.options, options);
    this.callback = callback || $.noop;
    this.valid = true;
    this.init();
};
Slide.options = {

    //基本参数
    trigger: "mouseenter",
    tagClass: "current",
    btnClass: "disabled",
    duration: 400,
    interval: 5000,
    hoverDelay: 50,
    cur: 0,
    keepTags: false,
    btnLock: false,
    auto: false,

    //扩展参数
    easing: "swing",
    effect: "none",
    scrollLen: 0,
    seamless: false,
    lazyload: false,
    doResize: false,

    //对象参数
    lists: "[data-slide=list]",
    tags: "[data-slide=tag]",
    posCur: "[data-slide=cur]",
    posPages: "[data-slide=pages]",
    btnPrev: "[data-slide=prev]",
    btnNext: "[data-slide=next]"
};
Slide.prototype = {

    //初始化
    init: function(){

        var that = this,
            opt = that.opt,
            $ele = that.ele,
            $lists = $ele.find(opt.lists),
            $tags = $ele.find(opt.tags),
            $posCur = $ele.find(opt.posCur),
            $posPages = $ele.find(opt.posPages),
            $btnPrev = $ele.find(opt.btnPrev),
            $btnNext = $ele.find(opt.btnNext),
            canScroll = $lists.length === 1;

        //标签项和内容项既可以是在同一容器下的列表，也可以是分散的不连续状态
        $lists = canScroll ? $lists.children() : $lists;
        that.prepare($lists, canScroll);

        if(!that.valid){
            $tags.add($posCur.parent()).add($btnPrev.parent()).remove();
            return;
        }

        if($tags.length){
            that.tags = $tags;
            that.bindTags();
        }

        if($btnPrev.length){
            that.btnPrev = $btnPrev;
            that.btnNext = $btnNext;
            that.bindBtns();
        }else{
            opt.btnLock = false;
        }

        if($posCur.length){
            that.posCur = $posCur;
            $posPages.html(that.pages);
        }

        that.lists = $lists;
        opt.auto && that.bindAuto();

        //初始化执行一次
        //延时处理是为了让在初始化该对象之后的相关操作，能够优先于该操作，为相关需求的处理提供时间，保证切换效果的正确执行
        setTimeout(function(){
            that.show(opt.cur, "must");
        }, 0);
    },

    //准备工作
    prepare: function($lists, canScroll){

        var $contParent = $lists.parent(),
            $contWrap = $contParent.parent(),
            that = this,
            opt = that.opt,
            effect = opt.effect,
            scrollx = effect === "scrollx",
            isScroll = effect.indexOf("s") >= 0,
            scrollLen = opt.scrollLen,
            amount = $lists.length,
            scrolls = amount,
            pages = amount,
            cansee = 1,
            cols = 1, rows = 1, listW, listH, contW, contH, scrollsSigle = 1;

        //正确计算可视内容项的情况
        if(canScroll){
            listW = $lists.outerWidth(true);
            listH = $lists.outerHeight(true);
            contW = $contWrap.width();
            contH = $contWrap.height();
            cols = that.getDiv(contW, listW);
            rows = that.getDiv(contH, listH);
            cansee = rows * cols; //可视内容项的个数
            scrolls = that.getDiv(amount, scrollx ? rows : cols);  //总行数或总列数
            scrollsSigle = scrollx ? cols : rows; //单页中的行数或列数
            scrollLen = scrollLen === 0 ? scrollsSigle : (scrollLen > scrollsSigle ? scrollsSigle : scrollLen);
            pages = that.getDiv(scrolls - scrollsSigle, scrollLen) + 1;  //计算总页数这里   
        }

        console.info(rows + ":" + cols + ", scrolls:" + scrolls + ", pages:" + pages);

        //只有当切换页数大于1才做切换处理
        if(pages < 2){
            that.valid = false;
            return;
        }

        //参数重置
        if(effect === "none"){          //无效果切换时，设定切换持续时间为0
            opt.duration = 0;
        }
        if(!isScroll){                  //无缝结构仅针对滚动效果有效
            opt.seamless = false;
        }
        if(isScroll && !canScroll){     //无缝结构必须保证内容列表在同一父级容器下
            opt.seamless = false;
            opt.effect = "none";
        }
        opt.cur = opt.cur >= pages ? pages - 1 : opt.cur;
        opt.scrollLen = scrollLen;

        //无缝结构的页数需要做相应调整
        if(opt.seamless){
            pages = that.getDiv(scrolls, scrollLen);
        }

        //附加公共成员
        that.wrap = $contWrap;     //内容列表的外围容器
        that.parent = $contParent;//内容列表的父级容器
        that.pages = pages;      //可切换的总页数
        that.cansee = cansee;   //可视切换内容的个数
        that.old = opt.cur;    //保存当前已有显示内容的索引值

        //附加仅针对滚动效果有效的成员
        if(isScroll && canScroll){
            that.scrollNums = scrollLen * (scrollx ? rows : cols)         //每一次切换将带动多少个内容项
            that.scrollBase = scrollx ? listW : listH;                   //单个元素所需滚动的距离
            that.scrollValue = that.scrollBase * scrollLen;               //执行滚动时，每次移动的距离
            that.scrollMax = that.scrollBase * (scrolls - scrollsSigle); //执行滚动时，最大可供移动的距离
            that.scrollsSigle = scrollsSigle;                           //单页中的行数或列数
            that.scrolls = scrolls;                                    //总行数或总列数（scrollx时表示列数；scrolly时表示行数；）
        }
    },

    //重置标签项
    rewriteTags: function(){

        var that = this,
            $tags = that.tags,
            pages = that.pages,
            opt = that.opt;

        !opt.keepTags && $tags.length === 1 && (function(){

            var str = "",
                i = 0,
                tagName = $tags[0].nodeName.toLowerCase() === "ul" ? "<li>" : "<span>",
                tagNameEnd = tagName.replace("<", "</");

            for(; i < pages; ){
                str += tagName + (++i) + tagNameEnd;
            }
            $tags = $tags.html(str).children();
        })();

        $tags = $tags.length > 1 ? $tags : $tags.children();
        that.tags = $tags.removeClass(opt.tagClass);

        $tags.each(function(i, ele){
            $(ele).data("i", i);
        });

        return $tags;
    },

    //绑定标签操作
    bindTags: function(){

        var that = this,
            opt = that.opt,
            tagClass = opt.tagClass,
            trigger = opt.trigger,
            ismousehover = trigger === "mouseenter" || trigger === "mouseover",
            stopDelay, $tags, func;

        //重置标签项
        $tags = that.rewriteTags();

        //绑定标签项的事件处理
        if(ismousehover && opt.hoverDelay){

            func = function(){
                var $ele = $(this);
                clearTimeout(stopDelay);
                stopDelay = setTimeout(function(){
                    that.show($ele.data("i"));
                }, opt.hoverDelay);
            };

            $tags.on("mouseleave", function(){
                clearTimeout(stopDelay);
            });

        } else {

            func = function(){
                that.show($(this).data("i"));
            };
        }
        $tags.on(trigger, func);

        //单击事件触发的情况下，标签项的链接首次不会被访问
        !ismousehover && $tags.on("click", "a", function(e){
            if(!$(this).parent().hasClass(tagClass)){
                e.preventDefault();
            }
        });
    },

    //绑定按钮操作
    bindBtns: function(){

        var that = this,
            old = that.old,
            opt = that.opt,
            btnClass = opt.btnClass;

        //绑定前后按钮的事件处理
        that.btnPrev.on("click", function(){
            !$(this).hasClass(btnClass) && that.prev();
            return false;
        });
        that.btnNext.on("click", function(){
            !$(this).hasClass(btnClass) && that.next();
            return false;
        });
        if(opt.btnLock){
            if(old === 0){
                that.btnPrev.addClass(btnClass);
            }else if(old === that.pages - 1){
                that.btnNext.addClass(btnClass);
            }
        }
    },

    //绑定自动切换处理
    bindAuto: function(){

        var that = this;

        //自动切换时，鼠标悬浮在标题或者内容的上方时将暂停切换操作
        //当鼠标移出后，恢复自动切换
        that.ele.on({
            "mouseenter": function(){
                that.pause();
            },
            "mouseleave": function(){
                that.play();
            }
        });
    },

    //切换至上一页
    prev: function(){

        var cur = this.old - 1;
        cur = cur < 0 ? this.pages - 1 : cur;
        this.show(cur, "prev");
    },

    //切换至下一页
    next: function(){

        var cur = this.old + 1;
        cur = cur >= this.pages ? 0 : cur;
        this.show(cur, "next");
    },

    //切换到指定位置
    //cur：接下来需要显示的索引项
    //action：相关动作的标识，"must"-强制执行,"prev"-上一页，"next"-下一页，undefined-标签项切换
    show: function(cur, action){

        var that = this,
            opt = that.opt,
            old = that.old,
            $tags = that.tags,
            $posCur = that.posCur,
            tagClass = opt.tagClass,
            btnClass = opt.btnClass,
            startFun = opt.startFun;

        if(old === cur && action !== "must") return;

        $tags && $tags.eq(old).removeClass(tagClass).end().eq(cur).addClass(tagClass);
        $posCur && $posCur.html(cur + 1);

        if(opt.btnLock){
            that.btnPrev.toggleClass(btnClass, cur === 0);
            that.btnNext.toggleClass(btnClass, cur === that.pages - 1);
        }

        startFun && startFun.call(that, cur, old);
        that.callback.call(that, cur, old, action);
        that.old = cur;

        if(opt.auto){
            that.tStartAuto = $.now();
            that.auto();
        }
    },

    //暂停自动
    pause: function(){

        this.isPaused = true;
    },

    //恢复自动
    play: function(){

        this.isPaused = false;
        this.auto(true);
    },

    //开启自动
    auto: function(byPlay){

        var that = this,
            opt = that.opt,
            duration = opt.duration,
            interval = opt.interval;

        clearTimeout(that.stopDoAuto);
        if(!that.isPaused)
        {
            //如果暂停自动切换持续时间较长，当恢复自动切换时，应减少延时触发的时间
            if(byPlay && that.tStartAuto !== undefined){
                interval = interval - ($.now() - that.tStartAuto);
            }

            that.stopDoAuto = setTimeout(function(){
                !that.isPaused && that.next();
            }, interval + duration);
        }
    },

    //将两个参数相除，在不被整除的情况下返回 商+1 的结果
    getDiv: function(num1, num2)
    {
        var result = Math.floor(num1 / num2);
        return num1 % num2 === 0 ? result : result + 1;
    }
}
window.Slide = Slide;

})(window, jQuery);