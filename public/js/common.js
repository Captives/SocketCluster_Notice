function formatTimeToString(time, fmt) {
    var date = new Date();
    date.setTime(time * 1000);

    fmt = fmt || "yyyy-MM-dd HH:mm:ss";
    var o = {
        "M+" : date.getMonth()+1, //月份
        "d+" : date.getDate(), //日
        "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时
        "H+" : date.getHours(), //小时
        "m+" : date.getMinutes(), //分
        "s+" : date.getSeconds(), //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S" : date.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "/u65e5",
        "1" : "/u4e00",
        "2" : "/u4e8c",
        "3" : "/u4e09",
        "4" : "/u56db",
        "5" : "/u4e94",
        "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
};


//用时间戳返回格式化时间时分秒，
function getFormatDate(timeStamp){
    var d = new Date(timeStamp);
    var h = d.getHours();
    var m = d.getMinutes();

    if(m<10){
        m = "0" + m;
    }

    var s = d.getSeconds();
    if(s<10){
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}

/**
 * 格式化时间
 * */
function formatTimes(value){
    var result = (value % 60) +"";
    if(result.length == 1){
        result = Math.floor(value / 60) + ":0" + result;
    }else{
        result = Math.floor(value / 60) + ":" + result;
    }
    return result;
}

if(console){
    var logger = {
        log: console.log,
        info: console.info,
        warn:console.warn,
        error: console.error,
        trace: function (tag, args, color) {
            var arr = Array.prototype.slice.call(args);
            arr.unshift(tag);
            arr.unshift(new Date().toLocaleString());
            arr.unshift('>');
            var text = arr.join("&nbsp;&nbsp;");
            var item = document.createElement('li');
            item.innerHTML = text;
            item.style.color = color || '#FFF';
            var debug = document.getElementById("console");
            if (debug) {
                debug.appendChild(item);
                debug.scrollTop = debug.scrollHeight;
            }
            return text;
        }
    };

    console.log = function () {
        logger.log.apply(console, arguments);
        logger.trace("[LOG]", arguments,'#8DDAF0');
    };

    console.info = function () {
        logger.info.apply(console, arguments);
        logger.trace("[INFO]", arguments,'#35AD83');
    };

    console.warn = function () {
        logger.warn.apply(console, arguments);
        logger.trace("[WARN]", arguments, '#FDDC03');
    };

    console.error = function () {
        logger.error.apply(console, arguments);
        logger.trace("[ERROR]", arguments, '#F25745');
    }
}
