//logs.js

const util = require('../../utils/util.js')
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/"
const innerImgs = [1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454];
const imgSuffix = ".jpg";
var app = getApp();
/**圖片信息 圖片名,當前y軸角度,z-index=(數組長度-元素下標位置 **/
var unreadImgs = [{ img: 1, y: 0, zidx: 3 }, { img: 2, y: 0, zidx: 2 }, { img: 3, y: 1, zidx: 1 }];

Page({
  data: {
    logs: [],
    unreadImgs: [],
    imgPrefix: '',
    imgSuffix: '',
    clientHeight: '',
    clientWidth: '',
    rotateY: 0,
    readIdx:0
  },
  //handletouchtart+handletouchmove 判斷左滑右滑
  handletouchtart: function (e) {
    app.globalData.touch.lastX = e.touches[0].pageX
    app.globalData.touch.lastY = e.touches[0].pageY
  },
  handletouchend: function (e) {
    if ((app.globalData.touch.lastX - e.changedTouches[0].pageX) > 0){
      //左滑
      //console.log("left=" + this.data.readIdx)
      if (this.data.readIdx <= unreadImgs.length-1){
        //TODO skill 這裡更新數據屬性 也可以實現類似操作demo的效果
        unreadImgs[this.data.readIdx].y = -90;
        //z-index=數組長度-元素下標位置
        unreadImgs[this.data.readIdx].zidx = unreadImgs.length - this.data.readIdx;
        this.setData({
          unreadImgs: unreadImgs
        });

        this.data.readIdx += 1;
      // console.log("left="+this.data.readIdx)
      // console.log(unreadImgs)
      }
     }else{
      // console.log("right 1=" + this.data.readIdx)
      // console.log(unreadImgs)
      if (this.data.readIdx>=1){
        unreadImgs[this.data.readIdx-1].y = 0;
        this.setData({
          unreadImgs: unreadImgs
        });
        this.data.readIdx -= 1;
      }
     
      //右滑
      // this.setData({
      //   rotateY: 0
      // });
    }
       
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {

        that.setData({
          unreadImgs: unreadImgs,
          imgPrefix: imgPrefix,
          imgSuffix: imgSuffix,
          clientHeight: res.windowHeight,
          clientWidth: res.windowWidth,
          logs: (wx.getStorageSync('logs') || []).map(log => {
            return util.formatTime(new Date(log))
          })
        })

      }
    });

  }
})
