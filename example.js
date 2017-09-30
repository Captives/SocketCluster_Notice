var http = require('http');
var express = require('express');
var app = express();

http.createServer(app).listen(3000, function () {
    console.log('Ready');
});

//-------------------------------------------------
var router = express.Router();
// app.use('/',router);
app.use(router);
// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
// 定义网站主页的路由
router.get('/', function(req, res) {
    res.send('Birds home page');
});
// 定义 about 页面的路由
router.get('/about', function(req, res) {
    res.send('About birds');
});