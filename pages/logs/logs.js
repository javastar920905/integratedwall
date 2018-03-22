//logs.js
const util = require('../../utils/util.js')
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/"
const innerImgs = [1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454];
const imgSuffix = ".jpg";

Page({
  data: {
    logs: [],
    banner: [],
    imgPrefix:'',
    imgSuffix:'',
    clientHeight: '',
    clientWidth:'',
    transform:{},
    rotate:{}
  },
  cgImg:function(e){
   // console.log(e.detail)
    var that=this;
    var transformX=300;
    var rotateX = -10;
    var timer= setInterval(function(){
      if (rotateX < 180){
        transformX--;
        rotateX += 10;
        that.setData({
          transform: { x: transformX, y: rotateX },
          rotate: { x: rotateX }
        })
      }else{
        clearInterval(timer);
      }
     
    },100);
    
  },
  onLoad: function () {
    var that=this;
    wx.getSystemInfo({
      success: function (res) {

        that.setData({
          banner: innerImgs,
          imgPrefix: imgPrefix,
          imgSuffix: imgSuffix,
          clientHeight: res.windowHeight,
          clientWidth:res.windowWidth,
          logs: (wx.getStorageSync('logs') || []).map(log => {
            return util.formatTime(new Date(log))
          })
        })
       
      }
    });
    
  }
})
