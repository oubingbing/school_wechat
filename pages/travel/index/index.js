const app = getApp()
const http = require("./../../../utils/http.js");

Page({
  data: {
    show_auth: app.globalData.show_auth,
    qrCode: '',
    imageUrl: app.globalData.imageUrl,
    todayStep: 0,
    totalStep: 0,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    steps: [],
    user: '',
    showGeMoreLoadin: false,
    select:1
  },

  onLoad: function (option) {
    wx.showLoading({ title: '加载中' });
    this.setData({
      user: wx.getStorageSync('user'),
      todayStep: wx.getStorageSync('todayStep'),
      totalStep: wx.getStorageSync('totalStep')
    })
    this.statistic();
    this.steps();
    this.loginForRunData();
  },

  onReady: function (e) {
    this.getPersonalInfo();
  },

  /**
 * 获取具体类型的贴子
 */
  selected(e) {
    let objType = e.currentTarget.dataset.type;
    this.setData({ select:objType})
  },

  /**
   * 获取个人信息
   */
  getPersonalInfo() {
    http.get(`/personal_info`, {}, res => {
      this.setData({
        user: res.data.data
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  /**
   * 登录获取微信步数
   */
  loginForRunData: function () {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.werun']) {
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              console.log("res.code:" + res.code);
              let code = res.code;
              wx.getWeRunData({
                success(res) {
                  const encryptedData = res.encryptedData;
                  const iv = res.iv;
                  that.postRunData(encryptedData, iv, code);
                }
              })
            }
          })
        } else {
          wx.authorize({
            scope: "scope.werun", success(res) {
              that.loginForRunData();
              that.getPersonalInfo();
            }
          })
        }
      }
    })
  },

  /**
   * 收集用户步数
   */
  postRunData: function (encryptedData, iv, code) {
    http.post(`/run_data`,
      {
        encrypted_data: encryptedData,
        iv: iv,
        code: code
      }, res => {
        wx.hideLoading();
        console.log(res);
        this.statistic();
        this.steps();
      });
  },


  /** 
   * 小程序的二维码
   */
  getQrCode: function (_this) {
    http.get('/qr_code', {}, res=> {
      this.setData({
        qrCode: res.data.data.qr_code
      })
    });
  },

  /**
   * 获取统计的数据
   */
  statistic: function () {
    http.get('/run_statistic', {}, res=>{
      wx.hideLoading();
      let todayStep = res.data.data.today_step != null ? res.data.data.today_step : 0;
      let totalStep = res.data.data.total_step != null ? res.data.data.total_step : 0;
      this.setData({
        todayStep: todayStep,
        totalStep: totalStep
      })
      wx.setStorageSync('todayStep', todayStep);
      wx.setStorageSync('totalStep', totalStep);
    });
  },

  /**
   * 获取步数列表
   */
  steps: function () {
    //wx.showLoading({ title: '加载中' });
    let order_by = 'run_at';
    let sort_by = 'desc';
    http.get(`/run_steps?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&order_by=${order_by}&sort_by=${sort_by}`,
      {},
      res=> {
        wx.hideLoading();
        console.log(res);
        if (res.data.error_code == 0) {
          let steps = this.data.steps;
          let stepData = res.data.data.page_data;
          for (let step in stepData) {
            steps.push(stepData[step]);
          }
          this.setData({
            steps: steps,
            pageNumber: this.data.pageNumber + 1,
            showGeMoreLoadin: false
          })
        }
      });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    })
    this.steps();
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '说走就走，让步数带你去旅行吧',
      path: 'pages/index/index',
      imageUrl: '/image/share-pic.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },

  openTravelList: function () {
    wx.navigateTo({
      url: '/pages/travel_list/travel_list'
    })
  }

})