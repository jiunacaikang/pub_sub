(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS之类的
        module.exports = factory();
    } else {
        // 浏览器全局变量
        root.Popop = factory();
    }
}(this, function () {
    var caller = null, dftOpt = {}, timer = null, timerC = null, timerL = null, isMoile = _isMobile(), mouseOver = false, bindAction = false;

    function $$(id) {
        return id && document.getElementById(id);
    };

    function _isMobile () {
        var sUserAgent = navigator.userAgent.toLowerCase(),
        	bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
        	bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
        	bIsMidp = sUserAgent.match(/midp/i) == "midp",
        	bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
        	bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
        	bIsAndroid = sUserAgent.match(/android/i) == "android",
        	bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
        	bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM
    }
    
    window.onresize = () => {
        isMoile = _isMobile();
        $$("popBox") && addBind(dftOpt);
    }

    function pop(opt) {
        caller = this;
        if (typeof opt === 'string') {
            var content = opt;
            opt = {
                content: content,
            }
        }

        dftOpt = {
            blurId: opt && opt.blurId || '',
            type: opt && opt.type || "default",                             //弹框类型
            placeholder: opt && opt.placeholder || "请输入",                //placeholder
            title: opt && opt.title || "操作提示",                           //弹框 title
            content: opt && opt.content || "显示popop弹框",                    //弹框 内容
            activebg: opt && opt.activebg || "rgba(225,225,225,0.8)",        //弹框 确定/取消 背景active颜色
            bg: opt && opt.bg || "rgba(255,255,255,0.9)",                    //弹框 确定/取消 背景颜色
            use_a: opt && opt.use_a || false,                                //弹框 按钮是否使用a标签
            url: opt && opt.url || "javascript:;",                          //弹框 点击确定 链接跳转
            target: opt && opt.target || "_self",                            //弹框 连接跳转方式
            confirm: opt && opt.confirm || function () {                      //弹框 点击确认回调函数
                //toast("您点击了confirm");
            },
            cancel: opt && opt.cancel || function () {                        //弹框 点击取消回调函数 
                //toast("您点击了cancel");
            }
        };

        var popCon = '', conInfo = '', btnHtml = '';
        if (dftOpt.use_a) {
            btnHtml = '<a href="javascript:;" id="_cancel" class="_cancel _btn">取消</a>'+
                    '<a href="' + dftOpt.url + '" id="_confirm" class="_confirm _btn" target="'+ dftOpt.target +'">确定</a>';
        } else {
            btnHtml = '<span id="_cancel" class="_cancel _btn">取消</span><span id="_confirm" class="_confirm _btn">确定</span>';
        }

        if (dftOpt.type === 'prompt') {
            conInfo = '<input id="_pop-con-input" class="_pop-con-input" type="text" placeholder="'+ dftOpt.placeholder +'" />'
            setTimeout(() => { $$("_pop-con-input").focus() },30)
        } else {
            conInfo = '<div class="_pop-con-text">' + dftOpt.content+ '</div>'
        }

        popCon = '<div class="_pop">'+
                    '<div class="_pop-top">'+
                        '<div class="_pop-title">'+ dftOpt.title +'</div>'+
                        '<div class="_pop-con">'+ conInfo + '</div>'+
                    '</div>'+
                    '<div class="_pop-button">'+ btnHtml +'</div>'+
                '</div>'

        if ($$("popBox")) {//存在就不添加了
            $$("popBox").style.display = "block";
            $$("popBox").classList.add("_popBox");
            $$("popBox").classList.remove("_hide");
            $$("popBox").innerHTML = popCon;
        } else {
            var div = document.createElement("div");
            div.setAttribute("id", "popBox");
            div.setAttribute("class", "_popBox");
            div.setAttribute("useable", true);
            div.innerHTML = popCon;
            document.body.appendChild(div);
        }
        
        $$(dftOpt.blurId) && $$(dftOpt.blurId).classList.add("_blur");
        window.onhashchange = () => {//监听hashchange
            $$("popBox").style.display = 'none';
            if ($$(dftOpt.blurId)) {
                $$(dftOpt.blurId).classList.remove("_blur");
            }
        };
        addBind(dftOpt);
    };

    function prompt(opt) {
        opt.type = 'prompt';
        pop.call(this, opt)
    };

    function popHide(event, keydown) {
        if (mouseOver) return false;
        var useable = $$("popBox").getAttribute("useable");
        if (useable === "true") {
            $$("popBox").setAttribute("useable", false);
            $$("popBox").classList.add("_hide");
            if ($$(dftOpt.blurId)) {
                $$(dftOpt.blurId).classList.remove("_blur") 
            };
            setTimeout(() => {
                $$("popBox").style.display = 'none';
                $$("popBox").setAttribute("useable", true)
            }, 300);
            event.target.style.backgroundColor = dftOpt.bg;
            if (event.target.id === "_confirm" || keydown) {
                if (typeof (dftOpt.confirm) == "function") {
                    if (dftOpt.type === 'prompt') {
                        var inputValue = $$("_pop-con-input").value;
                        dftOpt.confirm.call(caller,inputValue) 
                    } else {
                        dftOpt.confirm.call(caller)
                    }
                }
            } else if (event.target.id === "_cancel") {
                if (typeof (dftOpt.cancel) == "function") {
                    dftOpt.cancel.call(caller);
                }
            } else {
                $$("popBox").setAttribute("useable", true);
                return false;
            }
        }
    };
    function addBind(opt) {
        if (bindAction) return; 
        if (isMoile) {
            $$("popBox").addEventListener('touchstart', event => {
                mouseOver = false;
                if (event.target.id === "_confirm" || event.target.id === "_cancel") {
                    event.target.style.backgroundColor = opt.activebg;
                } else {
                    $$("_confirm").style.backgroundColor = opt.bg;
                    $$("_cancel").style.backgroundColor = opt.bg;
                }
            });
            $$("popBox").addEventListener('touchmove', event => {
                event.preventDefault();
                if (event.target.id === "_confirm" || event.target.id === "_cancel") {
                    $$(event.target.id).style.backgroundColor = opt.bg;
                    mouseOver = true
                }
            });
            $$("popBox").addEventListener('touchend', popHide);
        } else {
            $$("popBox").addEventListener("mousemove", event => {
                if (event.target.id === "_confirm" || event.target.id === "_cancel") {
                    $$("_confirm").style.backgroundColor = opt.bg;
                    $$("_cancel").style.backgroundColor = opt.bg;
                    event.target.style.backgroundColor = opt.activebg;
                    $$("popBox").addEventListener('click', popHide);
                } else {
                    $$("_confirm").style.backgroundColor = opt.bg;
                    $$("_cancel").style.backgroundColor = opt.bg;
                }
            });
        }
        $$("popBox").addEventListener("keydown", e => {
            if (e.keyCode == 13) {
                popHide(e, true)
            }
        });
        bindAction = true;
    };
    function toast(str) {
        var hintCon = '<div class="_toast">' + (str || "toast show~") + '</div>';
        if ($$("_hintBox")) {
            $$("_hintBox").classList.add("_toastBox");
            $$("_hintBox").style.display = "block";
            $$("_hintBox").innerHTML = hintCon;
        } else {
            var div = document.createElement("div");
            div.setAttribute("id", "_hintBox");
            div.setAttribute("class", "_toastBox");
            div.innerHTML = hintCon;
            document.body.appendChild(div);
        }
        clearTimeout(timer); clearTimeout(timerC);
        timer = null; timerC = null;
        timer = setTimeout(() => {//显示1s后消失
            $$("_hintBox").classList.add("_toastBox", "_hide");
            timerC = setTimeout(() => { $$("_hintBox").style.display = "none"; }, 300);
        }, 2000);
    };
    function loading() {
        if (timerL) {
            clearTimeout(timerL);
        }
        if ($$("loadingBox")) {
            $$("loadingBox").style.display = "block";
            $$("loadingBox").classList.add("_loadingBox");
        } else {
            var div = document.createElement("div");
            div.setAttribute("id", "loadingBox");
            div.setAttribute("class", "_loadingBox");
            div.innerHTML = '<div class="_loading">'+
                                '<div class="_load"></div>'+
                                '<p>loading...</p>'+
                            '</div>';
            document.body.appendChild(div);
        }
        $$("loadingBox").addEventListener("touchmove", event => {
            event.preventDefault();
        });
    }
    function loadingClose() {
        if (!$$("loadingBox")) return false;
        $$("loadingBox").classList.add("_loadingBox", "_hide");
        timerL = setTimeout(() => { $$("loadingBox").style.display = "none"; }, 300);
    }

    return {
        toast: toast,    //hint方法
        pop: pop,      //pop方法
        prompt: prompt, //输入弹框
        loading: loading,    //loading
        loadingClose: loadingClose  //loadingClose
    };
}));