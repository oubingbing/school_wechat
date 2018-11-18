const util = require("./../../../utils/util.js");
const http = require("./../../../utils/http.js");
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    sales: [],
    baseImageUrl: app.globalData.imageUrl,
    currentTime: '',
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
  },
  /**
  * 跳转到私信
  */
  letter: function (e) {
    let id = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  /**
   * 进入品论页面
   */
  comment: function (e) {
    let id = e.currentTarget.dataset.objid;
    wx.navigateTo({
      url: '/pages/sale/comment_sale/comment_sale?id=' + id
    })
  },

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/personal/message/message?type=0&new_message=1'
    })
  },

  /**
   * 获取贴子列表
   */
  getList: function () {
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

    http.get(`/sale_friends?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}&just=1`,{},res => {
        wx.hideLoading();
        this.setData({
          showGeMoreLoadin: false
        });
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
   * 上拉加载跟多
   */
  onReachBottom: function () {
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
   * 删除帖子
   */
  delete: function (e) {
    let id = e.currentTarget.dataset.objid;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认删除?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${id}/sale_friend`, {}, res => {
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
  praise: function (e) {
    console.log('点赞');
    let objId = e.currentTarget.dataset.objid;
    let objType = 2
    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });
    let _this = this;
    http.post(`/praise`, {
      obj_id: objId,
      obj_type: objType
    }, res => {
      if (res.data.data.length != 0) {
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
    let _this = this;
    let objId = e.target.dataset.obj;
    http.post('/follow', {
      obj_id: objId,
      obj_type: 2
    }, function (res) {
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
    http.put(`/cancel/${objId}/follow/2`, {}, function (res) {
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
  }
})