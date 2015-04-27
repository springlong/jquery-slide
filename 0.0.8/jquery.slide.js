/**
 * @file        slide切换组件
 * @version     0.0.8
 * @author      yangtuan <yangtuan2009@126.com>
 */
(function($){

    /**
     * slide切换组件（多图滚动的无缝结构还有bug，逻辑部分还没有处理好）
     * @param  {Object}  params     配置参数（具体可配置参数请参见 $.slide.bind ）
     * @return {jQuery}             原jQuery对象
     */
    $.fn.doSlide = function(params)
    {
        return this.each(function(index, ele)
        {
            //切换操作的绑定
            params = $.slide.bind(ele, params, callback);
            if(params === false) return;

            //常用变量
            var $lists = params.lists,
                $parent = params.parent,
                effect = params.effect,
                duration = params.duration,
                easing = params.easing,
                cansee = params.cansee,
                pages = params.pages,
                scrollNums = params.scrollNums,
                scrolls = params.scrolls,
                scrollsSigle = params.scrollsSigle,
                scrollBase = params.scrollBase,
                scrollValue = params.scrollValue,
                scrollMax = params.scrollMax,
                seamless = params.seamless,
                seamlessDistance = 0,  //无缝结构附加的距离值
                current;    //标注当前显示项的索引值

            setStructure();

            //重置切换所需的基本结构
            function setStructure()
            {
                var listW, append = 0;

                if(seamless){

                    var $clonePrefix = $lists.slice(-cansee).clone(true).attr("data-clone", true),
                        $cloneAfter = $lists.slice(0, cansee).clone(true).attr("data-clone", true);
                    $lists = $parent.prepend($clonePrefix).append($cloneAfter).children();
                    seamlessDistance = scrollsSigle * scrollBase;
                    append = 2; //无缝结构下需要附加多余的行或列
                }

                if("fade,scrollx,scrolly".indexOf(effect) >= 0){

                    $parent.css("position") === "static" && $parent.css("position", "relative");
                }

                switch(effect)
                {
                    case "fade":

                        $lists.css({position: "absolute", left: 0, top: 0}).hide().eq(params.cur).show();
                        break;

                    case "scrollx":

                        listW = $lists.width();
                        $lists.css({ "float": "left", "width": listW });
                        $parent.css("width", scrollBase * scrolls + seamlessDistance * append);

                        //内容项自适应宽度的情况下，当浏览器调整窗口尺寸时需要重新调整宽度
                        if(params.doResize || listW === $(window).width()){
      
                            $(window).resize(function(){
                                scrollValue = scrollBase = params.wrap.width();
                                scrollMax = scrollBase * (scrolls-1);
                                $lists.css("width", scrollBase);
                                callback(current, current, "must");
                            });
                        }
                        break;
                }
            }

            //回调执行函数
            function callback(cur, old, action)
            {
                var scrollDistance;

                //针对无缝结构的特殊处理
                if(seamless && effect.indexOf("scroll") >= 0)
                {
                    var direct = effect === "scrollx" ? "left" : "top";
                    if(cur === 0 && old === pages - 1 && action === "next"){
                        
                        $parent.css(direct, 0); //最后到第一个
                    }
                    else if(cur === pages - 1 && old === 0 && action === "prev"){
                        
                        $parent.css(direct, -scrollMax - seamlessDistance*2); //第一个到最后
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
                        scrollDistance = (!seamless && cur === pages - 1 ? scrollMax : scrollValue * (cur)) + seamlessDistance;
                        $parent.stop().animate({left: -scrollDistance}, (action === "must" ? 0 : duration), easing);
                        break;

                    //垂直滚动
                    case "scrolly":
                        scrollDistance = (!seamless && cur === pages - 1 ? scrollMax : scrollValue * (cur)) + seamlessDistance;
                        $parent.stop().animate({top: -scrollDistance}, (action === "must" ? 0 : duration), easing);
                        break;
                }

                //保存当前显示项的索引值，供其他需求使用
                current = cur;
            }
        });
    };

    /**
     * 用于切换操作的公共处理
     * @type {Object}
     */
    $.slide = {

        /**
         * 用于slide切换操作中，绑定相关元素的事件处理
         * @param  {jQuery|String}   $ele        外围容器的jQuery对象 | 选择器字符串
         *
         * @param  {Object}  cf             配置参数
         * @param  {jQuery}  cf.lists       内容列表的查询selector，默认为：[data-class="slideLists"]
         * @param  {jQuery}  cf.tags        标签列表的查询selector，默认为：[data-class="slideTags"]
         * @param  {jQuery}  [cf.posCur]    显示当前页码的容器的查询selector，默认为：[data-class="posCur"]
         * @param  {jQuery}  [cf.posTotal]  显示总页数的容器的查询selector，默认为：[data-class="posTotal"]
         * @param  {jQuery}  [cf.btnPrev]   前一页按钮的查询selector，默认为：[data-class="btnPrev"]
         * @param  {jQuery}  [cf.btnNext]   后一页按钮的查询selector，默认为：[data-class="btnNext"]
         *
         * @param  {String}  [cf.trigger]   标签的触发方式，默认为“mouseenter”（鼠标滑入切换），也可设置为"click"（点击切换）
         * @param  {String}  [cf.tagClass]  标签项选中时附加的类名状态，默认为"current"
         * @param  {String}  [cf.btnClass]  按钮被禁用时附加的类名状态，默认为"disabled"
         * @param  {Number}  [cf.duration]  具有切换效果时的效果持续时间，默认为400（单位：毫秒）
         * @param  {Number}  [cf.delay]     自动切换时的时间间隔，默认为：5000（单位：毫秒）
         * @param  {Number}  [cf.hoverDelay] 鼠标悬浮切换时的等待延时，默认为50毫秒
         * @param  {Number}  [cf.cur]       默认显示的内容项索引，默认为：0
         * @param  {Boolean} [cf.keepTags]  是否保留标签项的内容，默认为false
         * @param  {Boolean} [cf.btnLock]   是否设置当按钮点击到最后一个时进入锁定状态不能点击，默认为false
         * @param  {Boolean} [cf.auto]      是否执行自动切换（默认为：false）
         *
         * @param  {String}  [cf.easing]    进行动画效果时的缓动算法，默认为"swing"
         * @param  {String}  [cf.effect]    切换方式，默认无效果，"none"-无效果，"fade"-淡入淡出，"fadeIn"-仅淡入效果，scrollx"-垂直滚动，"scrolly"-水平滚动，”“-自定义效果
         * @param  {Boolean} [cf.speed]     用来设置无缝滚动执行时的速度，“faster”-比fast更快一点、“fast”-快速、“normal”-正常、“slow”-缓慢，默认为"normal"
         * @param  {Number}  [cf.scrollLen] 每次切换将滚动的单位长度（scrollx按一列计算，scrolly按一行计算），默认为可视区域的所有列或所有行
         * @param  {Boolean} [cf.seamless]  是否为无缝结构（默认为：false）
         * @param  {Boolean} [cf.doMarquee] 是否执行无缝滚动效果，默认为false
         * @param  {Boolean} [cf.lazyload]  是否启用图片懒加载功能，默认为false-不启用（无缝滚动效果不支持图片懒加载，同时也不建议将图片列表做成无缝滚动效果）
         * @param  {Boolean} [cf.doResize]  是否在窗口大小变更的情况下调整内容项的宽度（仅使用与scrollx）
         *
         * @param  {Function} [cf.startFun]  即将执行切换之前触发的回调函数——function(cur, old){}，cur参数表示当前需要显示的索引项，old参数表示前一个显示的索引项，this指向配置参数对象
         * @param  {Function} [cf.endFun]    切换执行完成之后触发的回调函数——function(cur, old){}，cur参数表示当前需要显示的索引项，old参数表示前一个显示的索引项，this指向配置参数对象
         *
         * @param  {Function} callback       触发切换操作时所需执行的回调函数——function(cur, old, action){}，cur参数表示当前需要显示的索引项，old参数表示已有显示的索引项，action表示执行的相关动作（must , prev , next），this指向合并后的参数对象，
         * @return {Object|Boolean}          操作成功返回新的配置参数组合，失败则返回false
         */
        bind: function($ele, cf, callback)
        {
            var $lists, $tags,  //临时使用
                pages,          //总分页数
                old,            //始终保存当前显示内容项的索引值
                tStartAuto,     //表示即将执行自动处理时的时间快照
                stopDoAuto,     //执行自动切换处理的setTimeout的返回ID
                stopGoAuto,     //从切换显示准备进入到自动切换环节的setTimeout的返回ID
                stopDelay,      //鼠标悬浮延时处理的setTimeout的返回ID
                isPaused;       //标识自动切换是否处于暂停状态，默认为false

            return init();

            //初始化处理
            function init()
            {
                if($.slide.checkExec($ele, "doSlideBind") || setConfig() === false){
                    return false;
                }
                bindTags();
                bindBtns();
                bindAuto();

                cf.posTotal.html(pages); //更新正确的页数
                setTimeout(function(){
                    doShow(cf.cur, "must"); //初始化执行一次
                }, 0);
                return cf; //返回新的参数组合对象
            }

            //参数配置的整合
            function setConfig()
            {
                cf = $.extend({

                    //基本参数（在该函数中处理）
                    trigger: "mouseenter",
                    tagClass: "current",
                    btnClass: "disabled",
                    duration: 400,
                    delay: 5000,
                    hoverDelay: 50,
                    cur: 0,
                    keepTags: false,
                    btnLock: false,
                    auto: false,

                    //扩展参数（在回调函数中处理）
                    easing: "swing",
                    effect: "none",
                    speed: "normal",
                    scrollLen: 0,
                    seamless: false,
                    doMarquee: false,
                    lazyload: false,                
                    doResize: false,

                    //操作对象参数
                    lists: "[data-class=slideLists]",
                    tags: "[data-class=slideTags]",
                    posCur: "[data-class=posCur]",
                    posTotal: "[data-class=posTotal]",
                    btnPrev: "[data-class=btnPrev]",
                    btnNext: "[data-class=btnNext]"

                }, cf);

                //确定标签项和内容项
                $ele = $($ele);
                $lists = $ele.find(cf.lists),
                $tags = $ele.find(cf.tags);

                //将配置参数与操作对象进行组合
                $.extend(cf, {
                    lists: $lists.length > 1 ? $lists : $lists.children(),
                    tags: $tags.length > 1 ? $tags : $tags.children(),
                    posCur: $ele.find(cf.posCur),
                    posTotal: $ele.find(cf.posTotal),
                    btnPrev: $ele.find(cf.btnPrev),
                    btnNext: $ele.find(cf.btnNext)
                });

                //修正参数配置
                return correctConfig();
            }

            //对参数配置做进一步修正
            function correctConfig()
            {
                var $contParent = cf.lists.parent(),
                    $contWrap = $contParent.parent(),
                    doScrollx = cf.effect === "scrollx",
                    scrollLen = cf.scrollLen,
                    cansee = 1,
                    amount = cf.lists.length,
                    scrolls = amount,
                    isScroll = cf.effect.indexOf("s") >= 0,
                    canScroll = $contParent.length === 1 && cf.lists.eq(1).prev().is(cf.lists.first()),
                    cols = 1, rows = 1, listW, listH, contW, contH, scrollsSigle = 1;

                //参数重置
                cf.effect === "none" && (cf.duration = 0);                  //无效果切换时，设定切换持续时间为0
                cf.trigger !== "click" && (cf.trigger = "mouseenter");      //切换方式仅支持点击和悬浮，悬浮事件选用mouseenter代替mouseover是为了避免事件冒泡导致意外的发生
                cf.doMarquee && (cf.seamless = true);                       //无缝滚动效果必须是无缝结构
                !isScroll && (cf.seamless = false);                         //无缝结构仅针对滚动效果有效
                
                if(isScroll && !canScroll){
                    cf.seamless = false;
                    cf.effect = "none";
                }

                //正确计算可视内容项的情况
                if(canScroll){
                    listW = cf.lists.outerWidth(true);
                    listH = cf.lists.outerHeight(true);
                    contW = $contWrap.width();
                    contH = $contWrap.height();
                    cols = $.slide.getDivision(contW, listW);
                    rows = $.slide.getDivision(contH, listH);
                    cansee = rows * cols; //可视内容项的个数
                    scrolls = $.slide.getDivision(amount, doScrollx ? rows : cols);  //总行数或总列数
                    scrollsSigle = doScrollx ? cols : rows; //单页中的行数或列数
                }
                scrollLen = scrollLen === 0 ? scrollsSigle : (scrollLen > scrollsSigle ? scrollsSigle : scrollLen);
                pages = $.slide.getDivision(scrolls - scrollsSigle, scrollLen) + 1;  //计算总页数这里，有点纠结，最后确定这套计算方案

                //对参数对象进行补充
                cf.cur = cf.cur >= pages ? pages - 1 : cf.cur;           //纠正正确的默认显示页
                cf.wrap = canScroll ? $contWrap : $.noop;                //内容列表的外围容器
                cf.parent = canScroll ? $contParent : $.noop;            //内容列表的父级容器
                cf.cansee = cansee;                                      //可视切换内容的个数
                cf.pages = pages;                                        //可切换的总页数
                cf.scrollLen = scrollLen;                                //每次切换将滚动的单位长度（scrollx按一列计算，scrolly按一行计算）
                cf.scrollNums = scrollLen * (doScrollx ? rows : cols)    //每一次切换将带动多少个内容项
                cf.scrollBase = canScroll ? (doScrollx ? listW : listH) : 0;                 //单个元素所需滚动的距离
                cf.scrollValue = canScroll ? (cf.scrollBase * scrollLen) : 0;               //执行滚动时，表示每次移动的距离
                cf.scrollMax = canScroll ? cf.scrollBase * (scrolls - scrollsSigle) : 0;   //执行滚动时，表示最大可供移动的距离
                cf.scrolls = scrolls;                                                     //总行数或总列数（scrollx时表示列数；scrolly时表示行数；其他效果时为1）
                cf.scrollsSigle = scrollsSigle;                                          //单页中的行数或列数

                //只有当切换页数大于1才做切换处理
                if(pages < 2){
                    $tags.add(cf.posCur.parent()).add(cf.btnPrev.parent()).remove();
                    return false;
                }

                //部分变量的调整
                callback = typeof(callback) === "function" ? callback : $.noop;
                old = cf.cur;
            }

            //绑定标签操作
            function bindTags()
            {
                //重置标签项
                !cf.keepTags && $tags.length === 1 && (function(){

                    var str = "",
                        i = 0,
                        tagName = $tags[0].nodeName.toLowerCase() === "ul" ? "<li>" : "<span>";

                    for(; i < pages; ){
                        str += tagName + (++i) + tagName.replace("<", "</");
                    }
                    cf.tags = $tags.html(str).children();
                })();

                //绑定标签项的事件处理
                cf.tags.each(function(index, ele){

                    var func = cf.trigger === "mouseenter" ?function(){
                        clearTimeout(stopDelay);
                        stopDelay = setTimeout(function(){
                            doShow(index);
                        }, cf.hoverDelay);
                    }
                    : function(){
                        doShow(index);
                    };

                    $(ele).on(cf.trigger, func).children("a").on("click", function(e){
                        if(!$(this).parent().hasClass(cf.tagClass)){
                            e.preventDefault();
                        }
                    });
                });
            }

            //绑定按钮操作
            function bindBtns()
            {
                //绑定前后按钮的事件处理
                cf.btnPrev.on("click", function(){
                    !$(this).hasClass(cf.btnClass) && doPrev();
                    return false;
                });
                cf.btnNext.on("click", function(){
                    !$(this).hasClass(cf.btnClass) && doNext();
                    return false;
                });
                if(cf.btnLock){
                    if(old === 0){
                        cf.btnPrev.addClass(cf.btnClass);
                    }else if(old === pages - 1){
                        cf.btnNext.addClass(cf.btnClass);
                    }
                }
            }

            //绑定自动切换处理
            function bindAuto()
            {
                //自动切换时，鼠标悬浮在标题或者内容的上方时将暂停切换操作
                //当鼠标移出后，恢复自动切换
                cf.auto && $ele.on({
                    "mouseenter": function(){
                        doPause();
                    },
                    "mouseleave": function(){
                        doPlay();
                    }
                });
            }

            //执行上一页显示处理
            function doPrev()
            {
                var cur = old - 1;
                cur = cur < 0 ? pages - 1 : cur;
                doShow(cur, "prev");
            }

            //执行下一页显示处理
            function doNext()
            {
                var cur = old + 1;
                cur = cur >= pages ? 0 : cur;
                doShow(cur, "next");
            }

            //执行切换显示前的公共处理
            //cur：接下来需要显示的索引项
            //action：相关动作的标识，"must"-强制执行,"prev"-上一页，"next"-下一页，""-标签项切换
            function doShow(cur, action)
            {
                if(old === cur && action !== "must") return;

                cf.tags.length && cf.tags.eq(old).removeClass(cf.tagClass).end().eq(cur).addClass(cf.tagClass);
                cf.posCur.length && cf.posCur.html(cur + 1);

                if(cf.btnLock){
                    cf.btnPrev.toggleClass(cf.btnClass, cur === 0);
                    cf.btnNext.toggleClass(cf.btnClass, cur === pages - 1);
                }

                callback.call(cf, cur, old, action);
                old = cur;

                if(cf.auto){
                    clearTimeout(stopGoAuto);
                    stopGoAuto = setTimeout(function(){
                        tStartAuto = $.now();
                        doAuto();
                    }, cf.duration);
                }
            }

            //暂停自动切换
            function doPause()
            {
                isPaused = true;
            }

            //恢复自动切换
            function doPlay()
            {
                isPaused = false;
                if(cf.auto) doAuto(true);
            }

            //执行自动切换处理
            function doAuto(byDoPlay)
            {
                clearTimeout(stopDoAuto);
                if(!isPaused)
                {
                    var delay = cf.delay;

                    //如果暂停自动切换持续时间较长，当恢复自动切换时，应减少延时触发的时间
                    if(byDoPlay && tStartAuto !== undefined){
                        delay = delay - ($.now() - tStartAuto);
                    }

                    stopDoAuto = setTimeout(function(){
                        !isPaused && doNext();
                    }, delay);
                }
            }
        },

        /**
         * 动作：执行图片的懒加载
         * @param  {jQuery} $lists 内容项的jQuery对象
         * @param  {Number} index     当前显示内容的索引值
         * @return {undefined}
         */
        doImgLazy: function($lists, index)
        {
            var $imgs = $lists.eq(index).find("img[data-src]");
            $imgs.each(function(index, ele){
                ele.setAttribute("src", ele.getAttribute("data-src"));
                ele.removeAttribute("data-src");
            });
        },

        /**
         * 检测指定操作是否已经被执行
         * @param  {jQuery|Selector} $ele  需要检测的jQuery对象或查询选择器
         * @param  {String} label 操作的标识符
         * @return {Boolean}      是否被执行的布尔值
         */
        checkExec: function($ele, label)
        {
            $ele = $($ele);
            if($ele.data(label) === true) return true;
            $ele.data(label, true);
            return false;
        },

        /**
         * 将两个参数相除，在不被整除的情况下返回（商+1）的结果。该计算仅适用于正数！
         * @param  {Number} num1 被除数
         * @param  {Number} num2 除数
         * @return {Number}
         */
        getDivision: function(num1, num2)
        {
            var result = Math.floor(num1 / num2);
            return num1 % num2 === 0 ? result : result + 1;
        }
    };

})(jQuery);