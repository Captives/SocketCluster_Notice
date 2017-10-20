/**
 * Created by Administrator on 2017/4/28.
 * 表示归属每个房间对象
 */
var EventEmitter = require('wolfy87-eventemitter');
var Client = require('./UUABCOneClient').Client;
var ClientState = require('./UUABCOneClient').ClientState;

var Device = require('./../resource/utils').Device;
var UserType = require('./../conf/conf').UserType;

var log4js = require('./../conf/Logger');
var console = log4js.getLogger('one');
module.exports = UUABCOneRoom;
function UUABCOneRoom(td) {
    //通道号,房间号
    this.td = td;

    //相同房间内的客户端对象
    this.clients = [];

    //当前是否禁止聊天
    this.banned = false;

    //课程是否已经结束
    this.finished = false;

    var that = this;
    Object.defineProperties(this, {
        size: {
            get: function () {
                var i = 0;
                that.clients.forEach(function (client) {
                    if (client.userType == UserType.STUDENT) {
                        i++;
                    }
                });
                return i;
            }
        },
        length: {
            get: function () {
                return that.clients.length;
            }
        }
    });

    console.log(td, '房间初始化完成');
};

UUABCOneRoom.prototype = new EventEmitter();

/**
 * 添加Socket到room
 * @param socket
 * @param data
 */
UUABCOneRoom.prototype.add = function (socket, data) {
    // 添加Socket和登入信息到当前Room
    var user = data.user;
    var client = new Client(socket, user);
    client.userAgent = data.ua;
    client.host = data.host;

    var device = new Device(data.ua);
    client.device = device.info();
    var dev = device.device;
    if (dev.type && ['mobile','tablet'].indexOf(dev.type) !=-1) {//移动设备
        this.checkLogin(client);
    } else {//电脑端限制
        var bw = device.browser;
        if (client.userType == UserType.TEACHER || client.userType == UserType.STUDENT) {
            if (['Opera', 'Chrome'].indexOf(bw.name) == -1) {
                client.enterReject(user.type == UserType.TEACHER ? 'Please use the Chrome browser' : '为保障您稳定上课，请使用Chrome浏览器');
            } else {
                this.checkLogin(client);
            }
        } else {
            this.checkLogin(client);
        }
    }
    console.log(this.td, client.toString(), client.device, client.address);
};

/**
 * 查找指定用户已经登入的Client对象
 * @param client
 */
UUABCOneRoom.prototype.searchClient = function (client) {
    var list = [];
    this.clients.forEach(function (item) {
        var r = item.match(client);
        if (r) {
            list.push(item);
        }
    });
    return list;
};

/**
 * 检查客户端的重复性,是否允许登入
 * @param client
 * @returns {boolean}   允许登入true,拒绝登入false
 */
UUABCOneRoom.prototype.checkLogin = function (client) {
    var that = this;
    //查询相同身份的用户client对象
    var list = this.searchClient(client);
    console.log(this.td, "相同身份连接数：", list.length, client.toString());
    if (list.length > 0) {
        //家长监控添加接入次数限制
        if (client.userType == UserType.PAR) {
            if (list.length >= 99) {
                client.enterReject("超出限制99个连接数");
            } else {
                this.online(client);
            }
        } else {
            list.forEach(function (item) {
                //多余登入掉线
                that.removeClient(item);
                //已经登入的告知掉线
                item.offline(client.device);
            });
            //当前上线
            this.online(client);
        }
    } else {
        this.online(client);
    }
};

/**
 * 登入
 * @param client
 */
UUABCOneRoom.prototype.online = function (client) {
    var that = this;
    this.clients.push(client);
    var list = [];
    this.clients.forEach(function (item) {
        if (item.state == ClientState.ACTIVE) {
            list.push({
                id: item.id,
                user: item.user,
                address: item.address,
                device: item.device,
                time: item.loginTime,
            });
            //告知已在线用户,有新用户的加入
            item.userEnter(client);
        }
    });

    //告知自己登入成功,并列出当前已在线列表
    client.enterSuccess(list);
    console.log(this.td, '激活成功', this.clients.length, client.toString());
    //附加业务
    this.attach(client);
};

/**
 * 监听客户端对象事件
 * @param client
 */
UUABCOneRoom.prototype.attach = function (client) {
    var that = this;

    //共享事件
    client.on('shareHandler', function (data, time) {
        that.clients.forEach(function (item) {
            item.sending(client, data, time);
        });
    });

    client.on('logout', function (list, time) {
        //TODO 此处暂无业务
    });

    //课程结束
    client.on('complete', function (userType, data, time) {
        if (userType == UserType.TEACHER) {
            that.finished = true;
            that.clients.forEach(function (item) {
                item.classOver(client, data, time);
                console.log(that.td, "已经下课", data, item.toString());
            });
        }
    });
};

/***
 * 根据socket对象移除client
 * @param socket
 * @param data
 */
UUABCOneRoom.prototype.remove = function (socket) {
    var that = this;
    this.clients.forEach(function (item, index) {
        var status = item.search(socket);//客户端查询
        if (status) { //匹配成功
            that.removeClient(item);
            console.log(that.td, '依据Socket移除Client', index, item.id);
        }
    });
};

/***
 * 服务器端移除指定Client
 * @param socket
 * @param data
 */
UUABCOneRoom.prototype.removeClient = function (client) {
    //移除Client来自当前Room
    var that = this;
    client.state = ClientState.DISABLED;
    this.clients.forEach(function (item, index) {
        if (item.state == ClientState.ACTIVE) {
            item.userQuit(client);
        }

        if (item.state == ClientState.DISABLED) {
            that.clients.splice(index, 1);//删除多余的客户端
            console.log(that.td, 'Client移除Client', client.toString());
        }
    });
};

/**
 * 销毁Room
 */
UUABCOneRoom.prototype.destroy = function () {
    //清除间隔器
    console.log(this.td, '房间销毁完成');
};