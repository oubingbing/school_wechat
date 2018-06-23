const app = getApp();

Page({
  data: {

  },
  onLoad: function () {

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