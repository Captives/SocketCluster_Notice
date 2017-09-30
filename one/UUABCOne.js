/**
 * Created by Administrator on 2017/4/28.
 */
var log4js = require('./../conf/Logger');
var console = log4js.getLogger('one');
//教室对象
var Room = require('./UUABCOneRoom');
module.exports = UUABCMany;
function UUABCMany() {
    //socket 集合
    this.clients = {};
    //服务列表,指定房间的服务集合channel
    this.roomList = {};
};

/**
 *附加一个socketServer
 * @param server
 */
UUABCMany.prototype.attach = function (socketServer) {
    var that = this;
    socketServer.on('connection', function (socket) {
        socket.address = socket.remoteAddress.replace("::ffff:","");
        console.log("TD new socket", socket.id, socket.address);
        that.push(socket);
    });
};

/**
 * 根据通道获取房间Room对象
 * @param td
 * @returns {*|Array}
 */
UUABCMany.prototype.getRoomByTD = function (td) {
    td = td || 199;//如果通道为空,则前往公共通道
    return this.roomList[td];
};

/**
 * 把socket存储管理器
 * @param socket
 */
UUABCMany.prototype.push = function (socket) {
    var that = this;
    //socket 登入
    socket.on('login', function (data, response) {
        //获取指定通道号的服务, 如果没有创建一个新的
        var room = that.getRoomByTD(data.room);
        if(!room){
            room = new Room(data.room);
            that.roomList[room.td] = room;
        }

        //归属房间号
        socket.room = room.td;
        //把Socket和用户数据添加到房间内
        room.add(socket, data);
        // response(socket.id);
    });

    //断开连接
    socket.on('disconnect', function () {
        // 如果有房间id的，去房间内断开，如果没有,直接清除
        if(socket.room){
            var room = that.getRoomByTD(socket.room);
            if(room){
                room.remove(socket);
                //房间内元素为0,销毁房间
                if(room.length == 0){
                    room.destroy();
                    delete that.roomList[room.td];
                }
            }
        }

        //移除列表中 socket
        delete that.clients[socket.id];
        console.log('-------- disconnect -----------', socket.room, socket.id);
    });

    //错误
    socket.on('error', function (err) {
        console.error(err);
    });

    this.clients[socket.id] = socket;
    console.log('new push', socket.id);
};