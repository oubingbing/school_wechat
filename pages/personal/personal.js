
const app = getApp();

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    
  },
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0&new_message=0'
    })
  },
  openLetter:function(){
      wx.navigateTo({
        url: '/pages/friends/friends'
      })
  },
  openSugesstion: function () {
    wx.navigateTo({
      url: '/pages/suggestion/suggestion'
    })
  }
})