//线上日志的配置
var logconfig = {
    appenders: {
        console: {type: 'console'},
        stdout: {type: 'console'},
        index: {type: 'console'},
        one: {type: 'console'},
        many: {type: 'console'},
        live: {type: 'console'},
        search: {type: 'console'},
        other: {type: 'console'},
    },
    categories: {
        index: {appenders: ['index'], level: 'debug'},
        one: {appenders: ['one'], level: 'debug'},
        many: {appenders: ['many'], level: 'ALL'},
        live: {appenders: ['live'], level: 'debug'},
        search: {appenders: ['search'], level: 'debug'},
        default: {appenders: ['other'], level: 'debug'},
    },
    replaceConsole: true
};

/******************************* console *******************************/
//自定义控制台输出
function replaceConsole(logger, name) {
    var path = require('path');
    var stackInfo = function () {
        var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
        var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
        var stacklist = (new Error()).stack.split('\n').slice(3);
        var s = stacklist[0];
        var sp = stackReg.exec(s) || stackReg2.exec(s);
        var data = {};
        if (sp && sp.length === 5) {
            data.method = sp[1];
            data.path = sp[2];
            data.line = sp[3];
            data.pos = sp[4];
            data.file = path.basename(data.path);
        }
        return data;
    };

    var Logger = {
        log: logger.log,
        info: logger.info,
        warn: logger.warn,
        error: logger.error,
        fatal: logger.fatal,
        includeTime: true,
        includeLevel: true,
        includeLabel: true,
        includeMethod: false,
        color: {
            black: 30,//黑色
            red: 31,//红色
            green: 32,//绿色
            yellow: 33,//黄色
            blue: 34,//蓝色
            pink: 35,//粉红
            cyan: 36,//青色
            gray: 37,//灰色
        },
        trace: function (level, stackInfo, code, arguments) {
            var method = stackInfo['method'];
            var file = stackInfo['file'];
            var line = stackInfo['line'];

            var arr = Array.prototype.slice.call(arguments);
            arr.push('\033[0m');
            if(['[WARN]','[ERROR]'].indexOf(level) == -1){
                arr.unshift('\033[0;' + code + 'm');
            }else{
                arr.unshift('\033[1;' + code + 'm');
            }
            if (this.includeMethod) {
                arr.unshift(method);//方法
            }

            if (this.includeLabel) {
                arr.unshift(file + ':' + line);//文件和行号
                arr.unshift(name + " -");
            }

            arr.unshift('\033[0;32m');
            if (this.includeLevel) {
                arr.unshift(level);//日志级别
            }

            if (this.includeTime) {
                arr.unshift(new Date().toLocaleString());//日志级别
            }

            arr.unshift('\033[0;36m');

            var text = arr.join(" ");
            console.log(text);
        }
    };

    logger.log = function () {
        Logger.log.apply(logger, arguments);
        Logger.trace("[LOG]", stackInfo(), Logger.color.black, arguments);
    };

    logger.info = function () {
        Logger.info.apply(logger, arguments);
        Logger.trace("[INFO]", stackInfo(), Logger.color.black, arguments);
    };

    logger.warn = function () {
        Logger.warn.apply(logger, arguments);
        Logger.trace("[WARN]", stackInfo(), Logger.color.yellow, arguments);
    };

    logger.error = function () {
        Logger.error.apply(logger, arguments);
        Logger.trace("[ERROR]", stackInfo(), Logger.color.red, arguments);
    };

    logger.fatal = function () {
        Logger.fatal.apply(logger, arguments);
        Logger.trace("[FATAL]", stackInfo(), Logger.color.pink, arguments);
    };
    
    return Logger;
}

/******************************* Logger *******************************/
var conf = require('./../conf/conf');
var logAppenders = conf.logAppenders;
var logStdout = conf.logStdout;
logconfig.appenders = logAppenders || logconfig.appenders;

var log4js = require('log4js');
log4js.configure(logconfig);
var getLogger = function (name) {
    var logger = log4js.getLogger(name);
    logger.log = logger.info;
    name = name || "default";

    if(logStdout && logAppenders != null){
        replaceConsole(logger, name);
    }
    return logger;
};

module.exports = {
    getLogger: getLogger,
    replaceConsole:replaceConsole
};
/******************************* Logger END *******************************/