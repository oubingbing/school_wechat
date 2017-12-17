
const app = getApp();

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    
  },
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0'
    })
  },
  openLetter:function(){
      wx.navigateTo({
        url: '/pages/suggestion/suggestion'
      })
  }
})