
const app = getApp();
const http = require("./../../../utils/http.js");

Page({
  data: {
    user: '',
    newLetterNumber: 0,
    serviceId: '',
    param: app.globalData.param,
    showLoginButton: app.globalData.authStatus,
    selectPoster:1,
    sinageture:"",
    todayStep:0,
    myRank:0
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
    this.newLetterCount();
    this.getService();
    this.statistic()
    this.getMyRank()
  },

  onShow: function () {
    this.newLetterCount();
    this.checkLogin();
    let user = wx.getStorageSync('user')
    this.setData({sinageture:user.personal_signature})
  },

  getMyRank: function () {
    http.get(`/my_rank`, {}, res => {
      let resData = res.data;
      if (resData.error_code == 0) {
        this.setData({
          myRank: resData.data.rank
        })
      }
    });
  },

    /**
   * 获取统计的数据
   */
  statistic: function () {
    http.get('/run_statistic', {}, res=>{
      let todayStep = res.data.data.today_step != null ? res.data.data.today_step : 0;
      let totalStep = res.data.data.total_step != null ? res.data.data.total_step : 0;
      this.setData({
        todayStep: todayStep
      })
      wx.setStorageSync('todayStep', todayStep);
      wx.setStorageSync('totalStep', totalStep);
    });
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
      that.statistic()
      that.getMyRank()
    }
  },

  /**
   * 获取客服id
   */
  getService: function () {
    http.get(`/service`, {}, res => {
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
      this.setData({
        user: res.data.data,
        sinageture:res.data.data.personal_signature
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  /**
   * 获取未读私信数量
   */
  newLetterCount: function () {
    http.get(`/new_messages`, {}, res => {
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
    let that = this
    http.login(null, null, null, res => {
      that.getPersonalInfo();
      that.statistic()
      that.getMyRank()
    });
  },
})