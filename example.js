var http = require('http');
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var app = express();

http.createServer(app).listen(3000, function () {
    console.log('Ready');
});
app.use(serveStatic(path.resolve(__dirname, 'public')));
//-------------------------------------------------
var router = express.Router();
app.use(router);
// 该路由使用的中间件
router.use(function(req, res, next) {
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

//-------------------------------------------------
//http://www.cnblogs.com/chyingp/p/express-session.html

/**
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser);
app.use(session({
    resave:true,
    saveUninitialized:false,
    secret:'live'
}));

app.use(function(req,res,next){
    if (!req.session.user) {
        if(req.url=="/login"){
            next();//如果请求的地址是登录则通过，进行下一个请求
        }
        else
        {
            res.redirect('/login');
        }
    } else if (req.session.user) {
        next();
    }
});

app.get('/login',function(req,res){
    res.render("login");
});

app.post('/login',function(req,res){
    if(req.body.username=="love" && req.body.password=="love"){
        var user = {'username':'love'};
        req.session.user = user;
        res.redirect('/admin/app/list');
    }
    else
    {
        res.redirect('/login');
    }
});

app.get('/logout',function(req,res){
    req.session.user = null;
    res.redirect('/login');
});**/