
const app = getApp();
const http = require("./../../../utils/http.js");

Page({
  data: {
    user: '',
    newLetterNumber: 0,
    serviceId: '',
    param: app.globalData.param,
    showLoginButton: app.globalData.authStatus
  },
  onLoad: function () {

    this.checkAuth();

    let userStorage = wx.getStorageSync('user');
    if (userStorage){
      this.setData({
        user: userStorage
      })
    }
    this.setData({ param: app.globalData.param })
    this.getPersonalInfo();
    //this.newLetterCount();
    this.getService();
  },

  onShow: function () {
    //this.newLetterCount();
    this.checkLogin();
  },

  checkLogin:function(){
    http.post(`/check_login`, {}, res => {
      if (res.data.error_code == '5000') {
        app.globalData.authStatus = true;
        this.setData({
          showLoginButton : true
        })
      }
    });
  },

  /**
   * 是否授权
   */
  checkAuth:function(){
    let that = this;

    if (wx.getUserProfile) {
      this.setData({
        showLoginButton: false
      })
      that.getPersonalInfo()
    }
  },

  /**
   * 获取客服id
   */
  getService: function () {
    http.get(`/service`, {}, res => {
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
    http.get(`/personal_info`, {}, res => {
      console.log(res.data.data);
      this.setData({
        user: res.data.data
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  /**
   * 获取未读私信数量
   */
  newLetterCount: function () {
    http.get(`/new_messages`, {}, res => {
      console.log(res.data.data);
      if (res.data.data != null) {
        this.setData({
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
      url: '/pages/personal/message/message?type=0&new_message=0'
    })
  },

  /**
   * 进入私信列表
   */
  openLetter: function () {
    wx.navigateTo({
      url: '/pages/personal/friends/friends'
    })
  },

  /**
   * 进入建议留言列表
   */
  openSugesstion: function () {
    let id = this.data.serviceId;
    console.log('客服id' + id);
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  /**
   * 进入表白墙列表
   */
  opendPostList: function () {
    wx.navigateTo({
      url: '/pages/personal/post_list/post_list'
    })
  },

  /**
   * 进入卖舍友列表
   */
  openSaleList: function () {
    wx.navigateTo({
      url: '/pages/personal/sale_list/sale_list'
    })
  },

  /**
   * 进入匹配列表
   */
  openMatchList: function () {
    wx.navigateTo({
      url: '/pages/help/help_single/help_single'
    })
  },

  updateInfo: function () {
    wx.navigateTo({
      url: '/pages/personal/set_profile/set_profile'
    })
  },

  /**
 * 监听用户点击授权按钮
 */
  getAuthUserInfo: function (data) {
    this.setData({
      showLoginButton: false
    });
    http.login(null, null, null, res => {
      this.getPersonalInfo();
    });
  },
})