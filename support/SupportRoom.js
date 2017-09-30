/**
 * Created by Administrator on 2017/4/28.
 * 表示归属每个房间对象
 */
var EventEmitter = require('wolfy87-eventemitter');
module.exports = UUABCOneRoom;
function UUABCOneRoom(td) {
    //通道号,房间号
    this.td = td;  //相同房间内的客户端对象
    this.clients = [];
    console.log(td, '通道初始化完成');
};

UUABCOneRoom.prototype = new EventEmitter();

UUABCOneRoom.prototype.add = function (socket, data) {
    this.clients.push(socket);
};

UUABCOneRoom.prototype.remove = function (socket) {

};

UUABCOneRoom.prototype.destroy = function () {
    //清除间隔器
    console.log(this.td, '房间销毁完成');
};