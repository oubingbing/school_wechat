const util = require("../../utils/util.js");
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    sales:[],
    baseImageUrl: app.globalData.imageUrl,
    currentTime:'',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1
  },
  onLoad: function () {

    wx.showLoading({
      title: '加载中',
    });

    this.getList();

    //设置当前时间
    this.setData({
      currentTime: util.formatTime(new Date())
    });
    console.log('当前时间：' + this.data.currentTime);


  },
  onShow:function(){

    console.log('当前时间：' + this.data.currentTime);

    if (app.globalData.changeSchoolSale) {
      //切换了学校
      this.setData({
        sales: [],
        pageNumber: this.data.initPageNumber
      });
      app.globalData.changeSchoolSale = false;
      this.getList();
      //设置当前时间
      this.setData({
        currentTime: util.formatTime(new Date())
      });
    }else{
      this.getMostNewData();
    }

    let _this = this;

    let type = 0;
    app.getNewInbox(type, function (res) {
      console.log("新消息数量：" + res.data.data);
      if (res.data.data != 0 && res.data.data != null && res.data.data != '') {
        _this.setData({
          newMessage: true,
          newMessageNumber: res.data.data
        });
      } else {
        _this.setData({
          newMessage: false,
          newMessageNumber: 0
        });
      }
    });

  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '喜欢ta，那就说出来吧',
      path: '/pages/index/index',
      imageUrl: 'http://image.kucaroom.com/sale_friend_bg.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /** 
   * 预览图片
   */
  previewImage: function (event) {

    console.log(event.target.id);

    let url = event.target.id;

    wx.previewImage({
      current: '',
      urls: [url]
    })
  },
  /**
  * 跳转到私信
  */
  letter: function (e) {
    console.log('跳转到私信');

    let id = e.currentTarget.dataset.obj;

    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id
    })
  },
  /**
   * 获取具体类型的贴子
   */
  selected:function(e) {
    console.log('selected');
    console.log(e.target.dataset.type);

    let objType = e.target.dataset.type;
    this.setData({
      select: objType,
      sales: []
    })

    this.setData({
      pageNumber: this.data.initPageNumber
    });

    let _this = this;

    _this.getList();

  },
  /**
   * 进入发表页面
   */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_sale/post_sale'
    })
  },

  /**
   * 进入品论页面
   */
  comment:function(e){
    
    let id = e.currentTarget.dataset.objid;

    wx.navigateTo({
      url: '/pages/comment_sale/comment_sale?id='+id
    })
  },

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0&new_message=1'
    })
  },

  /**
   * 获取贴子列表
   */
  getList:function(){

    let _this = this;
    let objType = this.data.select;

    var order_by = 'created_at';
    var sort_by = 'desc';

    if (objType == 4) {
      order_by = 'praise_number';
      sort_by = 'desc';
      console.log('最新');
    }


    if (this.data.postType == 3) {
      this.setData({
        pageNumber: this.data.initPageNumber
      });
    }

    app.http('get',
      `/sale_friends?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}`,
     {},
      res => {

      wx.hideLoading();

      this.setData({
        showGeMoreLoadin: false
      });
      
      console.log('返回的贴子数据');
      console.log(res.data.data.page_data);
      console.log('第几页' + this.data.pageNumber);

      let data = res.data.data.page_data;

      let sales = _this.data.sales;

      if (data.length > 0) {
        data.map(item => {
          sales.push(item);
        });

        this.setData({
          sales: sales,
          pageNumber: this.data.pageNumber + 1
        });
      } else {
        this.setData({
          notDataTips: true
        });
      }

    });

  },

  /**
  * 下拉刷新，获取最新的贴子
  */
  onPullDownRefresh: function () {

    console.log('当前时间：' + this.data.currentTime);

    this.getMostNewData();
  },

  /**
   * 上拉加载跟多
  */
  onReachBottom: function () {

    console.log('到底了');

    let _this = this;

    this.setData({
      notDataTips: false
    });

    this.setData({
      showGeMoreLoadin: true
    });

    this.getList();

  },

  /**
   * 获取当前最新的贴子
   */
  getMostNewData:function(){

    let _this = this;

    let time = this.data.currentTime;

    app.http('get',
     '/most_new_sale_friend?time='+time, {}, res => {

      let sales = _this.data.sales;

      let data = 

      res.data.data.map(item => {

        let ifRepeat = false;
        for(let sale of sales){
          if(sale.id == item.id){
            ifRepeat = true;
          }
        }

        if(!ifRepeat){
          sales.unshift(item);
        }

      });

      _this.setData({
        sales:sales
        });

      wx.stopPullDownRefresh();

      console.log(res);

      _this.setData({
        currentTime: util.formatTime(new Date())
      });

    });

  },

  /**
   * 删除帖子
   */
  delete:function(e){
    console.log(e);

    let id = e.currentTarget.dataset.objid;
    let _this = this;

    wx.showModal({
      title: '提示',
      content: '确认删除?',
      success: function (res) {
        if (res.confirm) {

          console.log('用户点击确定')

          app.http('delete', `/delete/${id}/sale_friend`, {}, res => {

            console.log(res);

            if (res.data.data) {

              let oldSales = _this.data.sales;
              let sales = oldSales.filter(item => {
                if (item.id != id) {
                  return item;
                }

              });

              _this.setData({
                sales: sales
              });

            }

          });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  
  },

  /**
   * 点赞
   */
  praise:function(e){
    console.log('点赞');
    let objId = e.currentTarget.dataset.objid;
    let objType = 2;
    console.log(objId);

    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });

    let _this = this;

    app.http('post', `/praise`, {
       obj_id: objId, 
       obj_type: objType 
       }, res => {
      console.log('点赞成功' + res);

        if(res.data.data.length != 0){
          let sales = _this.data.sales;
          let newSales = sales.map(item => {
            if (item.id == objId) {
              item.praise_number += 1;
            }

            return item;
          });

          _this.setData({
            sales: newSales
          });
        }

    });

  },
  /**
   * 关注
   */
  follow: function (e) {

    console.log(e);

    let _this = this;
    let objId = e.target.dataset.obj;

    console.log(objId);

    app.http('post', '/follow', {
      obj_id: objId,
      obj_type: 2
    }, function (res) {

      console.log(res.data);

      let follow = res.data.data;
      let sales = _this.data.sales;

      let newSale = sales.map(item => {

        if (item.id == follow.obj_id) {
          item.follow = true;
        }

        return item;
      });

      _this.setData({
        sales: newSale
      });
    });
  },
  /**
   * 取消关注
   */
  cancelFolllow: function (e) {

    let _this = this;
    let objId = e.target.dataset.obj;

    app.http('patch', `/cancel/${objId}/follow/2`, {}, function (res) {

      console.log(res.data);

      let follow = res.data.data;
      let sales = _this.data.sales;

      let newSale = sales.map(item => {

        if (item.id == objId) {
          item.follow = false;
        }

        return item;
      });

      _this.setData({
        sales: newSale
      });
    });

  },
  searchAudit: function () {

    wx.navigateTo({
      url: '/pages/school/school?type=2'
    })

  }

})