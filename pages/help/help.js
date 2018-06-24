const app = getApp();

Page({
  data: {

  },
  onLoad: function () {

  },
  onShow:function(){
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
  order: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/help_detail/help_detail'
    })
  }
});