var app = getApp();
const util = require('../../utils/util.js')
// 图片地址信息
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/"
const iconPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/icon/"
const imgSuffix = ".jpg";

// 模拟所有图片队列
const innerImgs = [1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
];
/**未读图片队列 圖片名,當前y軸角度,z-index=(數組長度-元素下標位置 **/
var unreadImgs = [{ img: 1, y: 0, zidx: 3 }, { img: 2, y: 0, zidx: 2 }, { img: 3, y: 1, zidx: 1 }];

//队列 api参考文档 http://www.w3school.com.cn/jsref/jsref_splice.asp
// 滚动一次加载数量
const lazySize = 12;
const maxSize = innerImgs.length;
// 所有图片懒加载队列
const lazyImgs = new Array(maxSize);



Page({
  data: {
    lazyImgs: lazyImgs,
    loadedImgStart: 0,
    loadedImgEnd: lazySize,
    unreadImgs: unreadImgs,
    readIdx: 0,
    imgPrefix: imgPrefix,
    imgSuffix: imgSuffix,
    iconPrefix: iconPrefix,
    clientHeight: '',
    clientWidth: '',
    headTopAnimate: 'slideUp',
    bottomAnimate: 'bottomSlideDown',
    isShowAllImages: false
  },
  handletap: function () {
    if (this.data.headTopAnimate == "slideDown") {
      this.setData({
        headTopAnimate: 'slideUp',
        bottomAnimate: 'bottomSlideDown'
      })
    } else {
      this.setData({
        headTopAnimate: 'slideDown',
        bottomAnimate: 'bottomSlideUp'
      })
    }

  },
  //handletouchtart+handletouchmove 判斷左滑右滑
  handletouchtart: function (e) {
    app.globalData.touch.lastX = e.touches[0].pageX
    app.globalData.touch.lastY = e.touches[0].pageY
  },
  handletouchend: function (e) {
    var move = (app.globalData.touch.lastX - e.changedTouches[0].pageX)
    //误差值 是避免点击时，触发滑动效果
    if (move > 2) {
      //左滑
      //console.log("left=" + this.data.readIdx)
      if (this.data.readIdx <= unreadImgs.length - 1) {
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
    } else if (move < -2) {
      if (this.data.readIdx >= 1) {
        unreadImgs[this.data.readIdx - 1].y = 0;
        this.setData({
          unreadImgs: unreadImgs
        });
        this.data.readIdx -= 1;
      }
    }

  },
  // 展示所有背景墙图片
  showAllImage() {
    this.setData({
      isShowAllImages: true
    });
    this.lazyLoadImg()
  },
  handlescroll: function (e) {
    let mod = e.detail.scrollTop % 200;
    if (mod > 100) {
      this.lazyLoadImg();
    }
  },
  lazyLoadImg: function () {
    let bufferImgs = innerImgs.slice(this.data.loadedImgStart, this.data.loadedImgEnd);
    //图片没有加载完才继续加载
    if (bufferImgs.length > 0) {
      for (var i = 0; i < bufferImgs.length; i++) {
        if (bufferImgs[i] != null) {
          lazyImgs.splice(this.data.loadedImgStart, 1, bufferImgs[i]);
          this.data.loadedImgStart++;
        } else {
          break;
        }
      }

      //每次滚动加载3张图
      this.data.loadedImgEnd = this.data.loadedImgEnd + 3;

      // console.log("start"+this.data.loadedImgStart + " end " + this.data.loadedImgEnd);
      //  console.log(lazyImgs);
      this.setData({
        lazyImgs: lazyImgs
      });
    }

  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight,
          clientWidth: res.windowWidth
        })
      }
    });
  }

})
