/******************************* Logger *******************************/
var log4js = require('log4js');
log4js.configure({
    appenders: {
        console : {type: 'console', category:"console"},
        stdout:{type : 'stdout'},
        other:{type: 'file', filename: 'logs/other.log'},
        index:{type: 'file', filename: 'logs/server.log'},
        one:{type: 'console', filename: 'logs/one/console.log'},
        many:{
            type: 'console',
            filename: 'logs/many/log',
            alwaysIncludePattern: true,
            pattern: "_yyyy_MM_ddhh.log"
        },
        live:{type: 'file', filename: 'logs/live/console.log'},
    },
    categories: {
        // console: {appenders: ['console','other', 'index','many'], level: 'ALL'},
        default: {appenders: ['other'], level: 'debug'},
        index: {appenders: ['index'], level: 'debug'},
        one: {appenders: ['one'], level: 'debug'},
        many: {appenders: ['many'], level: 'ALL'},
        live: {appenders: ['live'], level: 'debug'},
    },
    replaceConsole: true
});

var getLogger = function (path) {
    var logger = log4js.getLogger(path);
    logger.log = logger.info;
    return logger;
};



/*
var appenders = {};
appenders.console = {type: 'console', category:"console"};
appenders.other = {type: 'file', filename: 'logs/other.log'};
appenders.index = {type: 'file', filename: 'logs/server.log'};
appenders.one = {type: 'file', filename: 'logs/one/console.log'};

appenders.many = {};
appenders.many.type =  'console';
appenders.many.filename = 'logs/many/log';
appenders.many.alwaysIncludePattern = true;
appenders.many.pattern = "_yyyy_MM_ddhh.log";

appenders.live = {};
appenders.live.type = 'file';
appenders.live.filename = 'logs/live/console.log';

var categories = {};
categories.default = {appenders: ['other'], level: 'debug'};
categories.index = {appenders: ['index'], level: 'debug'};
categories.one = {appenders: ['one'], level: 'debug'};
categories.many = {appenders: ['many'], level: 'ALL'};
categories.live = {appenders: ['live'], level: 'debug'};
*/


module.exports = {
    getLogger: getLogger
};
/******************************* Logger END *******************************/