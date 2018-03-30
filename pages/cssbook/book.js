var app = getApp();
const util = require('../../utils/util.js')
// 图片地址信息
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/"
const iconPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/icon/"
const imgSuffix = ".jpg";

// 模拟所有图片队列
const innerImgs = [1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  ,  3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
];
/**未读图片队列 {图片名,當前y軸角度,z-index=(數組長度-元素下標位置）} **/
var unreadImgs = [];

//队列 api参考文档 http://www.w3school.com.cn/jsref/jsref_splice.asp
// 滚动一次加载数量
const lazySize = 12;
const maxSize = innerImgs.length;
// 所有图片懒加载队列
const lazyImgs = new Array(maxSize);
//自动播放定时器
var timer = '';


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
    isShowAllImages: false,
    autoPlay: false,
    scale: false,
    showJumpPageTab: false
  },
  //handletouchtart+handletouchmove 判断左滑右滑
  handletouchtart: function (e) {
    app.globalData.touch.lastX = e.touches[0].pageX
    app.globalData.touch.lastY = e.touches[0].pageY
  },
  handletouchend: function (e) {
    //获取滑动距离（误差值2 是避免点击时，触发滑动效果）
    var move = (app.globalData.touch.lastX - e.changedTouches[0].pageX)
    if (move > 2) {
      //左滑翻书，
      this.turnPageNext();
    } else if (move < -2) {
      this.turnPagePreview();
    }
  },
  handlescroll: function (e) {
    let mod = e.detail.scrollTop % 200;
    if (mod > 100) {
      this.lazyLoadImg();
    }
  },
  handleLazyImgTap: function (e) {
    //接收页面元素属性 https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
    this.jumpPage(e.currentTarget.dataset.index)
  },
  handletap: function () {
    if (this.data.headTopAnimate == "slideDown") {
      this.setData({
        headTopAnimate: 'slideUp',
        bottomAnimate: 'bottomSlideDown',
        showJumpPageTab:false
      })
    } else {
      this.setData({
        headTopAnimate: 'slideDown',
        bottomAnimate: 'bottomSlideUp'
      })
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
  // 跳页控制--开始
  turnPagePreview: function () {
    //回到首页，不再触发滑动
    if (this.data.readIdx >= 1) {
      unreadImgs[this.data.readIdx - 1].y = 0;
      this.setData({
        unreadImgs: unreadImgs,
        readIdx: this.data.readIdx - 1
      });
    }
  },
  turnPageNext: function () {
    //实时改变unreadImgs的元素属性，实现类似js操作dom的效果
    if (this.data.readIdx <= unreadImgs.length - 2) {
      unreadImgs[this.data.readIdx].y = -90;
      unreadImgs[this.data.readIdx].zidx = unreadImgs.length - this.data.readIdx;
      //调用setData()方法触发页面重新渲染
      this.setData({
        unreadImgs: unreadImgs,
        readIdx: (this.data.readIdx += 1)
      });
    }
  },
  jumpPage: function (checkedIdx) {
    //改变队列中，选中元素下表以前的属性状态
    if (checkedIdx > this.data.readIdx) {
      //往左侧翻书
      for (; this.data.readIdx < checkedIdx; this.data.readIdx++) {
        unreadImgs[this.data.readIdx].y = -90;
        unreadImgs[this.data.readIdx].zidx = unreadImgs.length - this.data.readIdx;
      }
    } else {
      //往右侧翻书
      for (; this.data.readIdx > checkedIdx; this.data.readIdx--) {
        unreadImgs[this.data.readIdx - 1].y = 0;
      }
    }
    //console.log("checkedIdx=" + checkedIdx+"   readIdx=" + this.data.readIdx)
    //重新渲染页面
    this.setData({
      isShowAllImages: false,
      unreadImgs: unreadImgs,
      readIdx: checkedIdx
    })
  },
  jumpPageFirst: function () {
    this.jumpPage(0);
  },
  jumpPageLast: function () {
    this.jumpPage(unreadImgs.length - 1);
  },
  // 底部导航控制按钮--开始
  showAllImage: function () {//展示所有背景墙图片
    this.setData({
      isShowAllImages: this.data.isShowAllImages ? false : true
    });
    if (this.data.isShowAllImages) {
      this.lazyLoadImg()
    }
  },
  showJumpPageTab: function () {
    this.setData({
      showJumpPageTab: this.data.showJumpPageTab ? false : true
    })
  },
  startPlay: function () {
    if (this.data.autoPlay == true) {
      return;
    }
    var that = this;
    timer = setInterval(function () {
      that.turnPageNext()
    }, 3000);
    that.setData({
      autoPlay: true
    });
  },
  stopPlay: function () {
    clearInterval(timer);
    this.setData({
      autoPlay: false
    });
  },
  startScale: function () {
    if (this.data.scale == true) {
      return;
    }
    console.log("todo 放大，把图片显示在一个可拖动容器上")
    this.setData({
      scale: true
    });
  },
  stopScale: function () {
    //todo 隐藏可拖动容器
    this.setData({
      scale: false
    });
  },
  onLoad: function () {
    var that = this;
    //初始化未读照片队列
    var allImgSize = innerImgs.length;
    for (var idx = 0; idx < allImgSize; idx++) {
      var img = { img: innerImgs[idx], y: 0, zidx: allImgSize - idx };
      unreadImgs.push(img);
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight,
          clientWidth: res.windowWidth,
          unreadImgs: unreadImgs
        })
      }
    });
  }

})
