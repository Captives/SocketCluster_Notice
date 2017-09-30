/*******************************************************************
 * 实时消息     依赖SocketCluster
 * @constructor
 *******************************************************************/
function RemoteClient() {
    if (!window.WebSocket) {
        console.warn("This browser does not support WebSocket.");
    }

    if (window.location.protocol != "https:") {
        window.location.href = window.location.href.replace('http', 'https');
    }
}

RemoteClient.prototype = new EventEmitter();

RemoteClient.prototype.connect = function (server, instance) {
    var options = {
        hostname: ws.hostname,
        port: ws.port,
        path: instance,
        secure: true,
    };
    var socket = this.socket = socketCluster.connect(options);

    this.count = 3;
    var that = this;
    console.log("SocketCluster..", socketCluster.version, socketCluster.connections);

    this.socket.connectAttempts = this.count;
    //连接
    this.socket.on("connecting", function (event) {
        console.log("connecting ....", options, socket);
        if (socket.connectAttempts >= that.count) {
            console.warn('重连次数超限制,停止重连');
            that.emit('close');
            that.close();
        }
        that.emit('reconnect', socket.connectAttempts, that.count);
    });

    //连接时触发
    this.socket.on("connect", function () {
        that.connected = true;
        console.log("socket io", server, "socket io connected success");
        that.emit('open', that.socket);
    });

    //断开连接时触发
    this.socket.on('disconnect', function () {
        that.connected = false;
        that.emit('disconnect', that.connected);
        console.log("socket io", 'disconnect');
    });

    this.socket.on("connectAbort", function () {
        that.connected = false;
        that.emit('disconnect', that.connected);
        that.emit('reconnect', socket.connectAttempts, that.count);
        console.log("socket io", "connect_timeout");
    });

    this.socket.on('error', function (err) {
        that.connected = false;
        console.log("socket io", 'error');
    });

    //私有的消息处理
    this.socket.on('data', function (obj, response) {
        if (obj['event']) {
            that.emit(obj['event'], obj.data);
            response();
        } else {
            response("无效格式的数据" + JSON.stringify(obj));
            console.warn('已忽略的服务消息', JSON.stringify(obj));
        }
    });
};

RemoteClient.prototype.send = function (event, data) {
    // console.log('## send event', event, 'data=', JSON.stringify(data));
    var that = this;
    return new Promise(function (resolve, reject) {
        if (that.connected) {
            that.socket.emit(event, data, function (json) {
                resolve(json);
            });
        } else {
            console.warn(event, '--------- socket 未连接 ------------');
        }
    });
};

/**
 * 关闭远程消息传送
 */
RemoteClient.prototype.close = function () {
    if (this.socket) {
        this.socket.disconnect();
        console.log("----------- socket close -------------");
    }
};


function UUABCClient() {

}

UUABCClient.prototype = new RemoteClient();

UUABCClient.prototype.login = function (options) {
    return this.send('login', options);
};

//数据交换,业务事件
UUABCClient.prototype.share = function (type, data, toId, toType, back) {
    toId = toId || [];
    toType = toType || [];
    back = back || false;

    var data = {
        action: type,
        value: data,
        toId: toId,
        toType: toType,
        back: back
    };

    return this.send('share', data);
};

//下线
UUABCClient.prototype.offline = function (list) {
    return this.send('logout', list);
};

//结束课程
UUABCClient.prototype.classOver = function () {
    return this.send('complete', {});
};

/********************************************************
 *      事件处理器
 *********************************************************/
function EventEmitter() {
    this.events = {};
}
//绑定事件函数
EventEmitter.prototype.on = function(eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
};

//触发事件函数
EventEmitter.prototype.emit = function(eventName, _) {
    var events = this.events[eventName],
        args = Array.prototype.slice.call(arguments, 1),i, m;

    if (!events) {
        return;
    }

    for (i = 0, m = events.length; i < m; i++) {
        events[i].apply(null, args);
    }
};