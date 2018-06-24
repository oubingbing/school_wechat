const app = getApp();

Page({
  data: {
    profile:null
  },
  onLoad: function () {

  },
  onShow:function(){
    this.getProfile();
  },
  getProfile: function () {
    let _this = this;

    app.http('GET', '/profile', {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let profile = res.data.data;

        _this.setData({ profile: profile })

        if (profile == null) {
          wx.showLoading({
            title: '请先完善资料！',
          });
          setTimeout(function () {
            wx.hideLoading();
            wx.navigateTo({
              url: '/pages/set_profile/set_profile'
            })
          }, 2000);

        }
      }
    });
  },
  /** 
 * 进入发表页面
 */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_help/post_help'
    })
  },
  /**
 * 获取具体类型的贴子
 */
  selected(e) {

  },
  callPhone:function(e){

    let phone = e.currentTarget.dataset.phone;

    wx.makePhoneCall({
      phoneNumber: phone 
    })
  }
});