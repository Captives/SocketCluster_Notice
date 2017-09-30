var EventEmitter = require('wolfy87-eventemitter');
var log4js = require('./../conf/Logger');
var console = log4js.getLogger('one');

/**状态**/
const ClientState = {NORMAL: "normal", INACTIVE: 'inactive', ACTIVE: 'active', DISABLED: 'disabled'};

module.exports = {
    Client: UUABCOneClient,
    ClientState: ClientState,
};

/**
 * Created by Administrator on 2017/4/28.
 * 教室内的每一个用户对象,包括僵尸号
 */
function UUABCOneClient(ws, us) {
    //业务状态
    this.state = ClientState.NORMAL;

    //用户id
    this.userId = null;
    //用户类型
    this.userType = null;
    //用户名
    this.userName = null;
    //用户头像
    this.userPhoto = null;

    //U币
    this.ub = 0;

    //答题得的钻石数
    this.diamond = 0;

    //用户送出的花数
    this.flower = 0;

    //登入设备
    this.device = null;

    //当前登入的UserAgent
    this.userAgent = null;

    this.manager = false;

    //登入时间
    this.loginTime = 0;

    //是否被独立禁言
    this.shield = false;

    //数据请求地址
    this.host = null;

    //数据请求地址
    this.address = {};

    /**************************************************************************************/
    var _user = null;
    _user = us || {};
    this.loginTime = Date.now();
    this.userId = us.id;
    this.userType = us.type;
    this.userName = us.name;
    this.userPhoto = us.photo;
    this.address = ws.address;

    var _token = us.token;
    _user.token = _token;
    /**************************************************************************************/

    //用户的socket
    var _socket = ws;
    _socket.token = _token;

    var that = this;
    Object.defineProperties(this, {
        id: {//只读
            get: function () {
                if(_socket){
                    return _socket.id;
                }else{
                    return null;
                }
            }
        },
        token: {//只读
            get: function () {
                return _token;
            }
        },
        socket: {
            get: function () {
                return _socket;
            }
        },
        user: {
            get: function () {
                return _user;
            }
        }
    });

    this.toString = function () {
        var list = [];
        list.push(this.id);
        list.push(this.token);
        list.push(this.userId);
        list.push(this.userType);
        list.push(this.userName);
        list.push(this.user.token);
        return list.join(', ');
    };
}

UUABCOneClient.prototype = new EventEmitter();

/**
 * 匹配未知client对象是否是当前用户的
 * @param client
 * @returns {boolean}
 */
UUABCOneClient.prototype.match = function (client) {
    if (client && client.userId == this.userId && client.userType == this.userType) {
        return true;
    }
    return false;
};
/**
 * 销毁Client对象
 */
UUABCOneClient.prototype.search = function (socket) {
    if (socket && socket.id == this.id) {
        console.log("Client", socket.id, this.id, "Socket 匹配完成!");
        return true;
    }
    return false;
};

/**
 * 登入拒绝
 * @param error 错误提示文本
 */
UUABCOneClient.prototype.enterReject = function (error) {
    var data = {
        code: 1001,
        info: error,
        id: this.id,
        time: Date.now()
    };
    this.call('enterReject', data);
};

/**
 * 告知自己登入成功,并列出已在线client集合
 * @param list
 */
UUABCOneClient.prototype.enterSuccess = function (list) {
    this.state = ClientState.ACTIVE;
    if (this.socket) {
        this.attach(this.socket);
    }
    var data = {
        id: this.id,
        user: this.user,
        device: this.device,
        address: this.address,
        list: list,
        time: Date.now(),
    };
    this.call('enterSuccess', data);
};

/**
 * 当前用户已经在新的地方登入client,告知自己断开
 * @param device    设备名称
 */
UUABCOneClient.prototype.offline = function (device, info) {
    this.state = ClientState.INACTIVE;
    var data = {
        id: this.id,
        token: this.token,
        device: device,
        info: info,
        time: Date.now()
    };

    this.call('offline', data);
    console.log("已经下线", this.toString(), this.device);
};

/**
 * 告知自己有新的client加入
 * @param client
 */
UUABCOneClient.prototype.userEnter = function (client) {
    var data = {
        id: client.id,
        user: client.user,
        address: client.address,
        device: client.device,
        time: Date.now(),
    };
    this.call('userEnter', data);
};

/**
 * 有用户退出
 * @param client    退出的用户
 */
UUABCOneClient.prototype.userQuit = function (client) {
    var data = {
        id: client.id,
        user: client.user,
        address: client.address,
        device: client.device,
        time: Date.now()
    };
    this.call('userQuit', data);
};

/**
 * 下课通知
 * @param user
 * @param time
 */
UUABCOneClient.prototype.classOver = function (client, data, time) {
    var data = {
        id: client.id,
        user: client.user,
        value: data,
        time: time
    };
    this.call('complete', data);
};

/**
 * 附加共享事件监听业务
 */
UUABCOneClient.prototype.attach = function (socket) {
    var that = this;
    //共享
    socket.on('share', function (data, response) {
        var time = Date.now();
        if (that.state == ClientState.ACTIVE) {
            that.emit('shareHandler', data, time);
            response({time: time, info: 'success'});
        } else {
            response({time: time, info: 'Invalid message'});
        }
    });

    //登出
    socket.on('logout', function (data, response) {
        var time = Date.now();
        if (that.state == ClientState.ACTIVE) {
            that.emit('logout', data, time);
            response({time: time, info: 'success'});
        } else {
            response({time: time, info: 'The current user is offline'});
        }
    });

    //课程完成
    socket.on('complete', function (data, response) {
        var time = Date.now();
        if (that.state == ClientState.ACTIVE) {
            that.emit('complete', that.userType, time);
            response({time: time, info: 'success'});
        }else{
            response({time: time, info: 'The current user is offline'});
        }
    });
};

/**
 * 指定客户端上共享数据
 * @param client
 * @param data
 */
UUABCOneClient.prototype.share = function (client, data, back) {
    if (client.id == this.id) { //是当前client
        if (back) {
            this.call('share', data);
        }
    } else {
        this.call('share', data);
    }
};

/**
 * 发送消息
 * @param user      消息发送者用户
 * @param data      消息内容
 * @param time      到达服务器时间
 */
UUABCOneClient.prototype.sending = function (client, value, time) {
    var toId = value['toId'];
    var toType = value['toType'];
    var back = value.back || false;

    var data = {
        id: client.id,
        user: client.user,
        message: value,
        time: time
    };

    if ((toId == null || toId == "" || toId == [])
        && (toType == null || toType == "" || toType == [])) {
        //TODO 发送消息到客户端
        this.share(client, data, back);
        return;
    }

    if (toId instanceof Array) {
        if (toId.indexOf(this.userId) != -1) {
            //TODO 发送消息到客户端
            this.share(client, data, back);
            return;
        }
    } else {
        if (toId == this.userId) {
            //TODO 发送消息到客户端
            this.share(client, data, back);
            return;
        }
    }

    if (toType instanceof Array) {
        if (toType.indexOf(this.userType) != -1) {
            //TODO 发送消息到客户端
            this.share(client, data, back);
            return;
        }
    } else {
        if (toType == this.userType) {
            //TODO 发送消息到客户端
            this.share(client, data, back);
            return;
        }
    }
};

/**
 * 呼叫客户端方法
 * @param data
 */
UUABCOneClient.prototype.call = function (eventName, data) {
    var options = {event: eventName, data: data};
    return new Promise((resolve, reject) => {
        if (this.socket) {
            this.socket.emit('data', options, function (json) {
                resolve(json);
            });
        } else {
            reject('无效socket,消息发送失败');
        }
    });
};
