var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');
var log4js = require('./conf/Logger');
var console = log4js.getLogger('index');

module.exports.run = function (worker) {
    console.log('   >> Worker PID:', process.pid);
    var environment = worker.options.environment;
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;

    var app = express();
    var router = express.Router();
    app.use(router);
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    if (environment == 'dev') {
        app.use(morgan('dev'));
    }

    healthChecker.attach(worker, app);
    httpServer.on('request', app);

    var SupportServer = require('./support/Support');
    new SupportServer().attach(scServer);

    var SupportRoute = require('./support/SupportRoute');
    new SupportRoute(scServer).listen(app);

    setInterval(function (e) {
        scServer.exchange.publish('sample',Date.now());
    },1000);
};
