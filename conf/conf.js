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

module.exports = {
    UserType:UserType,
    api:api,
    sql:mysql
};


