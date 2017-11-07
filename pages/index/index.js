//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    avatar:"http://wx.qlogo.cn/mmhead/Q3auHgzwzM5guVcHYGyerpKIqHsklVJhk118GzqwcNYFTthiawhYHYg/132"
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {   

    let token = wx.getStorageSync('token')
    console.log('获取到token:'+token);
    if(!token){
      let _this = this;
      let _app = app;
      app.refreshToken(this, app);
    }


  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  post:function(){
    console.log('Post');

    wx.navigateTo({
      url: '../post/post'
    })
  },
  selectSchool:function(){
    console.log('select school');

    wx.navigateTo({
      url: '../school/school'
    })
  }

})