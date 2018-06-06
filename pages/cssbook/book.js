var app = getApp();
const util = require('../../utils/util.js')
// 图片地址信息
const imgPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/"
const iconPrefix = "https://integratedwall.oss-cn-beijing.aliyuncs.com/books/icon/"

// 模拟所有图片队列
const innerImgs = ["books/1"];//['1', '2'];
/**未读图片队列數據結構 {img:图片名,y:當前y軸角度,zidx: z-index(數組長度-元素下標位置）} **/
var unreadImgs = [];

var selectedKeywords = [];

//队列 api参考文档 http://www.w3school.com.cn/jsref/jsref_splice.asp
// 滚动一次加载数量
const lazySize = 12;
// 所有图片懒加载队列
var lazyImgs;
//自动播放定时器
var timer = '';
var moveSize = 10;

Page({
  data: {
    category:[],
    categoryNames: [],
    selectedCategoryIdx:0,
    maxSize:0,
    hideLoading: false,
    lazyImgs: lazyImgs,
    loadedImgStart: 0,
    loadedImgEnd: lazySize,
    unreadImgs: unreadImgs,
    readIdx: 0,
    total: (innerImgs.length - 1),
    imgPrefix: imgPrefix,
    iconPrefix: iconPrefix,
    clientHeight: '',
    clientWidth: '',
    autoPlay: false,
    scale: false,
    scaleVal: 1,
    hiddenScaleView:true,
    caleImgSrc:'',
    maxMoveY:0,
    showJumpPageTab: false,
    inputVal: '',
    showNav: false,
    hiddenAllImgTab: true,
    hiddenCatagoryTab: true,
    cataOrSearch: 'search',
    searchInputVal: ''
  },
  //handletouchtart+handletouchmove 判断左滑右滑
  handletouchtart: function (e) {
    app.globalData.touch.lastX = e.touches[0].pageX
    app.globalData.touch.lastY = e.touches[0].pageY
  },
  handletouchend: function (e) {
    //获取滑动距离（误差值2 是避免点击时，触发滑动效果）
    var move = (app.globalData.touch.lastX - e.changedTouches[0].pageX)
    if (move > moveSize) {
      //左滑翻书，
      this.turnPageNext();
    } else if (move < -moveSize) {
      this.turnPagePreview();
    }
  },
  handlescroll: function (e) {
    let mod = e.detail.scrollTop % 150;
    //console.log("mod="+mod)
    if (mod > 90) {
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
    let bufferImgs = this.data.unreadImgs.slice(this.data.loadedImgStart, this.data.loadedImgEnd);
    //图片没有加载完才继续加载
    if (bufferImgs.length > 0) {
      for (var i = 0; i < bufferImgs.length; i++) {
        if (bufferImgs[i] != null) {
          var obj = bufferImgs[i];
          lazyImgs.splice(this.data.loadedImgStart, 1, obj);
          this.data.loadedImgStart++;
        } else {
          break;
        }
      }
      //每次滚动加载9张图
      this.data.loadedImgEnd = this.data.loadedImgEnd + 9;
      //  console.log(lazyImgs);
      this.setData({
        lazyImgs: lazyImgs
      });
    }
  },
  // 跳页控制--开始
  turnPagePreview: function () {
    //回到首页，不再触发滑动
    let index = this.data.readIdx;
    if (index >= 1) {
      unreadImgs[index - 1].y = 0;
      this.setData({
        unreadImgs: unreadImgs,
        readIdx: index - 1,
        inputVal: ''
      });
    }
  },
  turnPageNext: function () {
    //实时改变unreadImgs的元素属性，实现类似js操作dom的效果
    let index = this.data.readIdx;
    if (index <= unreadImgs.length - 2) {
      unreadImgs[index].y = -90;
      unreadImgs[index].zidx = unreadImgs.length - index;
      //调用setData()方法触发页面重新渲染
      this.setData({
        unreadImgs: unreadImgs,
        readIdx: (index += 1),
        inputVal: ''
      });
    }
  },
  jumpPage: function (checkedIdx) {
    //改变队列中，选中元素下表以前的属性状态
    let index = this.data.readIdx;
    if (checkedIdx > index) {
      //往左侧翻书
      for (; index < checkedIdx; index++) {
        unreadImgs[index].y = -90;
        unreadImgs[index].zidx = unreadImgs.length - index;
      }
    } else {
      //往右侧翻书
      for (; index > checkedIdx; index--) {
        unreadImgs[index - 1].y = 0;
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
   // console.log("checkedIdx=" + checkedIdx + "   readIdx=" + this.data.readIdx)
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
    //console.log(e);
    var keyword = e.detail.value.searchKeyWord;
    if (keyword == null || keyword == "") {
      return;
    }
    var that=this;

    for (var i = 0; i < this.data.category.length;i++){
      var item = this.data.category[i];
      if (item.chineseName.indexOf(keyword) > -1) {
        wx.request({
          url: app.globalData.getFileListByCategoryUrl + item.path,
          success: function (res) {
            var imgs = res.data;
            let i = 0;
            let len = imgs.length;

            var start = imgs[0].lastIndexOf('/') + 1;
            let selectedKeywordsArr = [];
            for (; i < len; i++) {
                 var fileName = imgs[i];
                var end = fileName.lastIndexOf('.');
                var no = fileName.substring(start, end);
                selectedKeywordsArr.push({ keyword: no, page: i+1 });
            }
            //重新渲染頁面
            that.setData({
              innerImgs: imgs,
              unreadImgs: unreadImgs,
              maxSize: imgs.length,
              selectedKeywords: selectedKeywordsArr
            });
          }
        });
       
        break;
      }
    }
   
   //从当前选中分类查找
    let selectedKeywords = [];
    this.data.unreadImgs.forEach(function (item, index) {
      if (item.no.toLowerCase().indexOf(keyword.toLowerCase())>-1) {
          selectedKeywords.push({ keyword: item.no, page: item.zidx });
        }
    });
    //重新渲染頁面
    that.setData({
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
      //selectedKeywords: [],//清除搜索历史
      //searchInputVal: ''
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
    if (this.data.scale==false){
      this.data.hiddenScaleView=false;
    }else{
      this.data.hiddenScaleView = true;
    }

    this.setData({
      scale: this.data.scale ? false : true,
      hiddenScaleView: this.data.hiddenScaleView,
      caleImgSrc: unreadImgs[this.data.readIdx].img,
      scaleVal:1
    });
  },
  bindPickerChange:function(e){
    var selectCateIdx = e.detail.value;
    this.loadFileByCategory(this.data.category[selectCateIdx].path);

    this.setData({
      selectedCategoryIdx: selectCateIdx
    })

  },
  loadFileByCategory:function(path){
    var that = this;
    that.setData({
      hideLoading: false
    });
    wx.request({
      url: app.globalData.getFileListByCategoryUrl+path,
      success: function (res) {
        var files = res.data;

        //初始化未读照片队列
        let allImgSize = files.length;
        lazyImgs = new Array(allImgSize);
        unreadImgs=[];
        var start = files[0].lastIndexOf('/')+1;
        for (var idx = 0; idx < allImgSize; idx++) {
          var fileName = files[idx];   
          var end = fileName.lastIndexOf('.');
          var no = fileName.substring(start,end);
          var img = { img: imgPrefix + fileName, y: 0, zidx: allImgSize - idx, no: no };
          unreadImgs.push(img);
        }

        that.setData({
          innerImgs: files,
          unreadImgs: unreadImgs,
          maxSize: allImgSize,

          loadedImgStart:0,
          loadedImgEnd:12,
          readIdx: 0,
          total: (allImgSize - 1),
          autoPlay: false,
          scale: false,
          scaleVal: 1,
          hiddenScaleView: true,
          caleImgSrc: '',
          maxMoveY: 0,
          showJumpPageTab: false,
          inputVal: '',
          showNav: false,
          hiddenAllImgTab: true,
          cataOrSearch: 'search',
          searchInputVal: ''
        }, function () {
          that.setData({
            hideLoading: true
          })
        })
      }
    });
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

    wx.request({
      url: app.globalData.categoryUrl, 
      success: function (res) {
        var categoryNames=[];
        var cate=res.data;
    
        for (var k = 0, length = cate.length; k < length; k++) {
          categoryNames[k] = cate[k].chineseName;
        }

        that.setData({
          category: res.data,
          categoryNames: categoryNames
        });

        //异步加载图片
        that.loadFileByCategory(cate[0].path);
      }
    });
  }
})
