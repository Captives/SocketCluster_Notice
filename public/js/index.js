
$(document).ready(function () {
    // Initiate the connection to the server
    var socket = socketCluster.connect();

    socket.on('error', function (err) {
        throw 'Socket error - ' + err;
    });

    socket.on('connect', function () {
        console.warn('CONNECTED');
        socket.emit('login', {
            room: 1000, date: Date.now()
        }, function (text) {
            $('.title').html("PID : " + text.pid+"<small>" + text.sid + "</small>");
            console.log(text.sid, text.pid);
        });
    });

    var sampleChannel = socket.subscribe('sample');

    sampleChannel.on('subscribeFail', function (err) {
        console.log('Failed to subscribe to the sample channel due to error: ' + err);
    });

    sampleChannel.watch(function (num) {
        console.log('Sample channel message:', num);
    });

    document.querySelector('#stopSubcribe').onclick = function (e) {
        console.log(' -- 停止订阅 --');
        socket.unsubscribe('sample');
    };


    document.querySelector('#resetSubcribe').onclick = function (e) {
        console.log(' -- 恢复订阅 --');
        socket.subscribe('sample');
    };
});