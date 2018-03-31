var app = getApp();
const util = require('../../utils/util.js')
// 图片地址信息
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/"
const iconPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/icon/"
const imgSuffix = ".jpg";

// 模拟所有图片队列
const innerImgs = [1, 2, 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
  , 3, 4, 50, 51, 101, 102, 152, 201, 202, 251, 252, 302, 352, 353, 387, 453, 454
];
/**未读图片队列數據結構 {img:图片名,y:當前y軸角度,zidx: z-index(數組長度-元素下標位置）} **/
var unreadImgs = [];
//關鍵詞數據結構，或者redis獲取 {keyword:關鍵詞,start:開始下標,end:結束下標}
var keywords = [
  { keyword: '大理石墻板', start: 0, end: 15 },
  { keyword: '大理石1', start: 16, end: 20 },
  { keyword: '山水系列', start: 21, end: 40 },
  { keyword: '自然景觀', start: 41, end: 70 }
];
var selectedKeywords = [];

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
    total: (innerImgs.length - 1),
    imgPrefix: imgPrefix,
    imgSuffix: imgSuffix,
    iconPrefix: iconPrefix,
    clientHeight: '',
    clientWidth: '',
    autoPlay: false,
    scale: false,
    showJumpPageTab: false,
    inputVal: '',
    showNav: false,
    hiddenAllImgTab: true,
    hiddenCatagoryTab: true,
    cataOrSearch: 'search'
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
  handleShowNav: function () {
    this.setData({
      showNav: this.data.showNav ? false : true,
      showJumpPageTab: false
    })
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
        readIdx: this.data.readIdx - 1,
        inputVal: ''
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
        readIdx: (this.data.readIdx += 1),
        inputVal: ''
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
    //重新渲染页面，關閉所有蒙版tab,清除搜索結果
    this.setData({
      hiddenAllImgTab: true,
      hiddenCatagoryTab: true,
      unreadImgs: unreadImgs,
      readIdx: parseInt(checkedIdx),
      inputVal: ''
    });
    console.log("checkedIdx=" + checkedIdx + "   readIdx=" + this.data.readIdx)
  },
  jumpPageFirst: function () {
    this.jumpPage(0);
  },
  jumpPageLast: function () {
    this.jumpPage(this.data.total);
  },
  handleLazyImgTap: function (e) {
    //接收页面元素属性 https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
    this.jumpPage(e.currentTarget.dataset.index)
  },
  formSubmit: function (e) {
    var checkedIdx = e.detail.value.page;
    if (checkedIdx == null || checkedIdx == "" || checkedIdx <= 0) {
      return;
    } else if (checkedIdx > this.data.total) {
      checkedIdx = this.data.total
    }
    this.jumpPage(checkedIdx - 1);
  },
  searchFormSubmit: function (e) {
    //往搜索結果集合中填充信息
    console.log(e);
    var keyword = e.detail.value.searchKeyWord;
    if (keyword == null || keyword == "") {
      return;
    }
    selectedKeywords = [];
    keywords.forEach(function (item, index) {
      if (item.keyword.startsWith(keyword)) {
        let start = item.start;
        let end = item.end;
        for (; start < end; start++) {
          selectedKeywords.push({ keyword: item.keyword, page: start });
        }
      }
    });

    //重新渲染頁面
    this.setData({
      selectedKeywords: selectedKeywords
    });
  },
  // 底部导航控制按钮--开始
  handleShowAllImg: function () {//展示所有背景墙图片
    if (this.data.hiddenAllImgTab) {
      this.lazyLoadImg();
    }
    this.setData({
      hiddenAllImgTab: this.data.hiddenAllImgTab ? false : true
    });
  },
  handleCatagoryTab: function () {
    this.setData({
      hiddenCatagoryTab: this.data.hiddenCatagoryTab ? false : true,
      cataOrSearch: 'cata'
    })
  },
  handleSearchTab: function () {
    this.setData({
      hiddenCatagoryTab: this.data.hiddenCatagoryTab ? false : true,
      cataOrSearch: 'search',
      selectedKeywords: []//清除搜索歷史
    })
  },
  handleJump: function () {
    this.setData({
      showJumpPageTab: this.data.showJumpPageTab ? false : true
    })
  },
  handlePlay: function () {
    var that = this;
    if (this.data.autoPlay) {
      clearInterval(timer);
    } else {
      timer = setInterval(function () {
        that.turnPageNext()//不同作用域
      }, 3000);
    }
    that.setData({
      autoPlay: this.data.autoPlay ? false : true
    });
  },
  handleScale: function () {
    if (this.data.scale) {
      //todo 隐藏可拖动容器
    } else {
      console.log("todo 放大，把图片显示在一个可拖动容器上")
    }
    this.setData({
      scale: this.data.scale ? false : true
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
