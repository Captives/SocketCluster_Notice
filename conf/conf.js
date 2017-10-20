const UserType = {STUDENT:1, TEACHER:2, PAR:3, ADMIN:4};
const api = {
    host: "dev.uuabc.com",
    port : 443,
};

const mysql = {
    host : '10.63.0.30',
    port : 3306,
    user : 'root',
    password : 'root',
    database : 'nodejs'
};

//日志是否控制台输出
var logStdout = true;
/**
 * 日志输出配置
 * @type
 */
var logconfig = {
    console: {type: 'console'},
    index: { type: 'console'},
    one: {
        type: 'dateFile',
        filename: 'logs/',
        alwaysIncludePattern: true,
        pattern: "yyyyMM/one/yyyyMMdd.log"
    },
    many: {
        type: 'dateFile',
        filename: 'logs/',
        alwaysIncludePattern: true,
        pattern: "yyyyMM/more/yyyyMMdd.log"
    },
    live: {
        type: 'dateFile',
        filename: 'logs/',
        alwaysIncludePattern: true,
        pattern: "yyyyMM/live/yyyyMMdd.log"
    },
    search: {
        type: 'dateFile',
        filename: 'logs/',
        alwaysIncludePattern: true,
        pattern: "yyyyMM/search.log"
    },
    other: {
        type: 'dateFile',
        filename: 'logs/',
        alwaysIncludePattern: true,
        pattern: "yyyyMM/other.log"
    }
};

module.exports = {
    UserType:UserType,
    api:api,
    sql:mysql,
    logStdout:logStdout,
    logAppenders:logconfig,
};