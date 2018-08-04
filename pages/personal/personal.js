
const app = getApp();

Page({
  data: {
    user: '',
    newLetterNumber: 0,
    serviceId: '',
    showNormal: false,
    showAudit: false
  },
  onLoad: function () {
    let userStorage = wx.getStorageSync('user');
    if (userStorage){
      this.setData({
        user: userStorage
      })
    }
    let that = this;
    app.getConfig(function (res) {
      if (res == 2) {
        that.setData({
          showNormal: true,
          showAudit: false,
        })
      } else {
        that.setData({
          showNormal: false,
          showAudit: true,
        })
      }
    })
    this.getPersonalInfo();
    this.newLetterCount();
    this.getService();
  },
  onShow: function () {
    let that = this;
    app.getConfig(function (res) {
      if (res == 2) {
        that.setData({
          showNormal: true,
          showAudit: false,
        })
      } else {
        that.setData({
          showNormal: false,
          showAudit: true,
        })
      }
    })
    this.newLetterCount();
  },
  onReady: function () {
  },
  /**
   * 获取客服id
   */
  getService: function () {
    app.http('get', `/service`, {}, res => {
      console.log('客服id:' + res.data.data);
      this.setData({
        serviceId: res.data.data
      });
    });
  },
  /**
   * 获取个人信息
   */
  getPersonalInfo() {

    let _this = this;

    app.http('get', `/personal_info`, {}, res => {
      console.log(res.data.data);
      _this.setData({
        user: res.data.data
      })
      wx.setStorageSync('user', res.data.data);
    });
  },
  /**
   * 获取未读私信数量
   */
  newLetterCount: function () {
    let _this = this;

    app.http('get', `/new_messages`, {}, res => {
      console.log(res.data.data);
      if (res.data.data != null) {
        _this.setData({
          newLetterNumber: res.data.data
        })
      }
    });
  },
  /**
   * 进入消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0&new_message=0'
    })
  },
  /**
   * 进入私信列表
   */
  openLetter: function () {
    wx.navigateTo({
      url: '/pages/friends/friends'
    })
  },
  /**
   * 进入建议留言列表
   */
  openSugesstion: function () {
    let id = this.data.serviceId;
    console.log('客服id' + id);
    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id
    })
  },
  /**
   * 进入表白墙列表
   */
  opendPostList: function () {
    wx.navigateTo({
      url: '/pages/post_list/post_list'
    })
  },
  /**
   * 进入卖舍友列表
   */
  openSaleList: function () {
    wx.navigateTo({
      url: '/pages/sale_list/sale_list'
    })
  },
  /**
   * 进入匹配列表
   */
  openMatchList: function () {
    wx.navigateTo({
      url: '/pages/help_single/help_single'
    })
  },
  updateInfo: function () {
    wx.navigateTo({
      url: '/pages/set_profile/set_profile'
    })
  }
})