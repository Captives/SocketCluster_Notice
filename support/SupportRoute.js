module.exports = SupportRoute;

function SupportRoute(scServer) {

}

SupportRoute.prototype.listen = function (router) {
    // 该路由使用的中间件
    router.use(function timeLog(req, res, next) {
        console.log('Time: ', Date.now());
        next();
    });

    // 定义网站主页的路由
    router.get('/', function(req, res) {
        console.log('Birds home page');
        res.send('Birds home page');
    });

    // 定义 about 页面的路由
    router.get('/about', function(req, res) {
        console.log('About birds');
        res.send('About birds');
    });
};