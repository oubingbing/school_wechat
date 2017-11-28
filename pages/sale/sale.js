
const app = getApp();

Page({
  data: {
    logs: []
  },
  onLoad: function () {

  },
  /**
   * 进入发表页面
   */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_sale/post_sale'
    })
  },

  /**
   * 进入品论页面
   */
  comment:function(){
    wx.navigateTo({
      url: '/pages/comment_sale/comment_sale'
    })
  }
})