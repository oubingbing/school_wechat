
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
  },
  opendPostList:function(){
    wx.navigateTo({
      url: '/pages/post_list/post_list'
    })
  },
  openSaleList:function(){
    wx.navigateTo({
      url: '/pages/sale_list/sale_list'
    })
  },
  openMatchList:function(){
    wx.navigateTo({
      url: '/pages/match_list/match_list'
    })
  }
})