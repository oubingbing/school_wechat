const util = require("./../../../utils/util.js");
const http = require("./../../../utils/http.js");

const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    baseImageUrl: app.globalData.imageUrl,
    currentTime:'',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1,

    leftList: [],
    rightList: [],
    leftHeight: 0,
    rightHeigt: 1,
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
  },

  onShow:function(){
    let type = 0;
    http.getNewInbox(type,res=> {
      if (res.data.data != 0 && res.data.data != null && res.data.data != '') {
        this.setData({
          newMessage: true,
          newMessageNumber: res.data.data
        });
      } else {
        this.setData({
          newMessage: false,
          newMessageNumber: 0
        });
      }
    });

    if (app.globalData.reloadSale == true){
      app.globalData.reloadSale = false;
      this.setData({
        leftList: [],
        rightList: [],
        leftHeight: 0,
        rightHeigt: 1,
        pageNumber:1
      })
      this.getList();
    }

  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '喜欢ta，那就说出来吧',
      path: '/pages/home/index_2/index_2',
      imageUrl: 'http://img.qiuhuiyi.cn/sale_friend_bg.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 获取具体类型的贴子
   */
  selected:function(e) {
    let objType = e.target.dataset.type;
    this.setData({
      select: objType,
      sales: []
    })

    this.setData({
      pageNumber: this.data.initPageNumber,
      leftList: [],
      rightList: [],
      leftHeight: 0,
      rightHeigt: 1
    });
    this.getList();
  },

  /**
   * 进入发表页面
   */
  post: function () {
    wx.navigateTo({
      url: '/pages/sale/post_sale/post_sale'
    })
  },

  /**
   * 进入详情页面
   */
  comment:function(e){
    let id = e.currentTarget.dataset.objid;
    wx.navigateTo({
      url: '/pages/sale/comment_sale/comment_sale?id='+id
    })
  },

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/personal/message/message?type=0&new_message=1&t=1'
    })
  },

  /**
   * 获取贴子列表
   */
  getList:function(){
    let objType = this.data.select;
    var order_by = 'created_at';
    var sort_by = 'desc';
    if (objType == 4) {
      order_by = 'praise_number';
      sort_by = 'desc';
    }
    if (this.data.postType == 3) {
      this.setData({
        pageNumber: this.data.initPageNumber
      });
    }
    http.get(`/sale_friends_v2?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}`,{},res => {
      wx.hideLoading();
      this.setData({
        showGeMoreLoadin: false
      });
      let data = res.data.data.page_data;
      if(data){
        let leftList = this.data.leftList;
        let rightList = this.data.rightList;
        let leftHeight = this.data.leftHeight;
        let rightHeigt = this.data.rightHeigt;

        if (data.length > 0) {
          data.map(item => {
            if(item.attachments.length>=1){
              if (leftHeight <= rightHeigt) {
                leftList.push(item);
                leftHeight += item.attachments[0]['height'];
              } else {
                rightList.push(item)
                rightHeigt += item.attachments[0]['height'];
              }
              this.setData({
                leftList: leftList,
                rightList: rightList,
                leftHeight: leftHeight,
                rightHeigt: rightHeigt,
              })
            }
          });

          this.setData({
            pageNumber: this.data.pageNumber + 1
          });
        } else {
          this.setData({
            notDataTips: true
          });
        }
      }
    });
  },

  /**
  * 下拉刷新，获取最新的贴子
  */
  onPullDownRefresh: function () {
    this.getMostNewData();
  },

  /**
   * 上拉加载跟多
  */
  onReachBottom: function () {
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
    let time = this.data.currentTime;
    http.get('/most_new_sale_friend?time='+time, {}, res => {
      let sales = this.data.sales;
      let data = res.data.data.map(item => {
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

      this.setData({
        sales:sales
        });
      wx.stopPullDownRefresh();
      this.setData({
        currentTime: util.formatTime(new Date())
      });
    });
  },

  /**
   * 点赞
   */
  praise:function(e){
    let objId = e.currentTarget.dataset.objid;
    let objType = 2;
    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });
    http.post(`/praise`, {obj_id: objId, obj_type: objType }, res => {
        if(res.data.data.length != 0){
          let sales = this.data.sales;
          let newSales = sales.map(item => {
            if (item.id == objId) {
              item.praise_number += 1;
            }

            return item;
          });

          this.setData({
            sales: newSales
          });
        }
    });
  },
  openUserInfo:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal/user_info/personal?id=' + id
    })
  }
})