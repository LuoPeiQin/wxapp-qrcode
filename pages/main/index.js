// pages/main/index.js
var QR = require("../../utils/qrcode.js");
Page({
  data: {
    maskHidden: true,
    imagePath: '',
    text: 'https://m.baidu.com',
    autoIpValue: '0',
    localIpValue: '172.21.75.13',
    subnetMaskValue: '172.21.75.13',
    gatewayValue: '172.21.75.1',
    dnsValue: '114.114.114.114',
    XTMSIPValue: '172.21.75.100',
    XTMSPortValue: '16999',
    volumeValue: '5',
    isSave: false,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // var size = this.setCanvasSize(); //动态设置画布大小
    // var initUrl = this.data.text;
    // this.createQrCode("", "mycanvas", size.w, size.h);
    this.setData({
      isSave: wx.getStorageSync("isSave")
    })
    if (this.data.isSave) {
      this.showLocal()
    }
  },
  checkboxChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == "cb") {
      this.setData({
        isSave: true
      })
    } else {
      this.setData({
        isSave: false
      })
    }
    wx.setStorageSync('isSave', this.data.isSave)
  },
  showLocal() {
    var localIP = wx.getStorageSync("localIP")
    console.log("localIP = " + localIP)
    if (localIP.length > 0) {
      this.setData({
        autoIpValue: wx.getStorageSync("autoIP"),
        localIpValue: wx.getStorageSync("localIP"),
        subnetMaskValue: wx.getStorageSync("subnetMask"),
        gatewayValue: wx.getStorageSync("gateway"),
        dnsValue: wx.getStorageSync("DNS"),
        XTMSIPValue: wx.getStorageSync("XTMSIP"),
        XTMSPortValue: wx.getStorageSync("XTMSPort"),
        volumeValue: wx.getStorageSync("volume")
      })
    }
  },
  onReady: function () {

  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH, this, this.canvasToTempImage);
    // setTimeout(() => { this.canvasToTempImage();},100);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function (res) {
        console.log(res);
      }
    }, that);
  },
  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  submit: function (e) {
    var that = this;
    // 自动获取IP验证
    var autoIp = this.data.autoIpValue;
    if (autoIp != "0" && autoIp != "1") {
      wx.showToast({
        icon: 'none',
        title: '自动获取IP只能输入0或1',
      })
      return
    }
    // 本地IP
    var localIp = this.data.localIpValue;
    if (!checkIp(localIp)) {
      wx.showToast({
        icon: 'none',
        title: '本地IP输入不合法',
      })
      return
    }

    var subnetMask = this.data.subnetMaskValue;
    if (!checkIp(subnetMask)) {
      wx.showToast({
        icon: 'none',
        title: '子网掩码输入不合法',
      })
      return
    }

    var gateway = this.data.gatewayValue;
    if (!checkIp(gateway)) {
      wx.showToast({
        icon: 'none',
        title: '网关输入不合法',
      })
      return
    }

    var dns = this.data.dnsValue;
    if (!checkIp(dns)) {
      wx.showToast({
        icon: 'none',
        title: 'DNS服务器地址输入不合法',
      })
      return
    }

    var xtmsIp = this.data.XTMSIPValue;
    if (!checkIp(xtmsIp)) {
      wx.showToast({
        icon: 'none',
        title: 'XTMS服务器IP地址输入不合法',
      })
      return
    }

    var xtmsPort = parseInt(this.data.XTMSPortValue);
    if (!(xtmsPort > 0 && xtmsPort < 65536)) {
      wx.showToast({
        icon: 'none',
        title: 'XTMS服务器端口需要大于0小于65536',
      })
      return
    }

    var volume = parseInt(this.data.volumeValue);
    if (!(volume >= 0 && volume <= 5)) {
      wx.showToast({
        icon: 'none',
        title: '外置喇叭音量只能是0到5',
      })
      return
    }
    this.setData({
      text: "{\"autoIP\":\"" + this.data.autoIpValue + "\"," +
        "\"localIP\":\"" + this.data.localIpValue + "\"," +
        "\"subnetMask\":\"" + this.data.subnetMaskValue + "\"," +
        "\"gateway\":\"" + this.data.gatewayValue + "\"," +
        "\"DNS\":\"" + this.data.dnsValue + "\"," +
        "\"XTMSIP\":\"" + this.data.XTMSIPValue + "\"," +
        "\"XTMSPort\":\"" + this.data.XTMSPortValue + "\"," +
        "\"volume\":\"" + this.data.volumeValue + "\"}"
    })
    that.setData({
      maskHidden: false,
    });
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000
    });
    var st = setTimeout(function () {
      wx.hideToast()
      var size = that.setCanvasSize();
      //绘制二维码
      that.createQrCode(that.data.text, "mycanvas", size.w, size.h);
      that.setData({
        maskHidden: true
      });
      if (that.data.isSave) {
        that.saveLocal()
      }
      clearTimeout(st);
      wx.setScreenBrightness({
        value: 1,
      })
    }, 2000)

  },
  saveLocal() {
    wx.setStorageSync("autoIP", this.data.autoIpValue)
    wx.setStorageSync("localIP", this.data.localIpValue)
    wx.setStorageSync("subnetMask", this.data.subnetMaskValue)
    wx.setStorageSync("gateway", this.data.gatewayValue)
    wx.setStorageSync("DNS", this.data.dnsValue)
    wx.setStorageSync("XTMSIP", this.data.XTMSIPValue)
    wx.setStorageSync("XTMSPort", this.data.XTMSPortValue)
    wx.setStorageSync("volume", this.data.volumeValue)
  },
  bindAutoIpInput(e) {
    this.setData({
      autoIpValue: e.detail.value
    })
  },
  bindLocalIpInput(e) {
    this.setData({
      localIpValue: e.detail.value
    })
  },
  bindSubnetMaskInput(e) {
    this.setData({
      subnetMaskValue: e.detail.value
    })
  },
  bindGatewayInput(e) {
    this.setData({
      gatewayValue: e.detail.value
    })
  },
  bindDnsInput(e) {
    this.setData({
      dnsValue: e.detail.value
    })
  },
  bindXTMSIPInput(e) {
    this.setData({
      XTMSIPValue: e.detail.value
    })
  },
  bindXTMSPortInput(e) {
    this.setData({
      XTMSPortValue: e.detail.value
    })
  },
  bindVolumeInput(e) {
    this.setData({
      volumeValue: e.detail.value
    })
  }

})

function checkIp(ipValue) {
  // var length = ipValue.split(".").length
  // if (length == 4) {
  //   if (/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(ipValue)) {
  //     return true
  //   }
  // }
  if (/^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/.test(ipValue)) {
    return true
  }
  return false
}

/**
   *  
   {
    "自动获取IP": "0",
    "本地IP": "172.21.75.13",
    "子网掩码": "255.255.255.0",
    "网关": "172.21.75.1",
    "DNS服务器地址": "114.114.114.114",
    "XTMS服务器IP": "172.21.75.100",
    "XTMS服务器端口": "16999",
    "外置喇叭音量": "5"
  }
{
    "autoIP": "0",
    "localIP": "172.21.75.13",
    "subnetMask": "255.255.255.0",
    "gateway": "172.21.75.1",
    "DNS": "114.114.114.114",
    "XTMSIP": "172.21.75.100",
    "XTMSPort": "16999",
    "volume": "5"
}
   */