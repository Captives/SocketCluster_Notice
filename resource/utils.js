var UAParser = require('ua-parser-js');
var log4js = require('./../conf/Logger');
var console = log4js.getLogger();
function Device(userAgent){
    this.ua = null;
    if(userAgent){
        var _ua = new UAParser(userAgent);
        if (_ua == "" || _ua == undefined || _ua == null || !_ua) {
            console.error('无法解析UserAgent', userAgent);
        }else{
            this.ua = _ua;
            this.device = _ua.getDevice();
            this.browser = _ua.getBrowser();
            this.os = _ua.getOS();
            console.log("UserAgent 解析结果：", this.device, this.browser, this.os);
        }
    }
}

Device.prototype.info = function () {
    if(!this.ua){
        return ["unknown device"];
    }

    var dev = this.device;
    var bw = this.browser;
    var os = this.os;
    var text = "";
    if (dev && dev.type) {
        if (dev.vendor) {
            text = dev.vendor + " " + dev.model;
        } else {//山寨产品
            text = os.name + " " + dev.type;
        }
    } else {//桌面设备
        if (os.version) {
            text = os.name + " " + subVersion(os.version);
        } else {
            text = os.name;
        }
    }

    function subVersion(version) {
        var text = "";
        if (version) {
            var index = version.indexOf(".");
            if (index == -1) {
                text = version;
            } else {
                text = version.substring(0, index);
            }
        }
        return text;
    }

    if (bw.name == 'WebKit') {
        return [text];
    }

    return [text, bw.name + " " + subVersion(bw.version)];
};

/**
 * 获取设备信息
 * @param info
 * @param type
 * @returns {*}
 */
var devInfo = function (userAgent) {
    var device = new Device(userAgent);
    return device.info();
};

module.exports = {
    devInfo:devInfo,
    Device:Device,
};
