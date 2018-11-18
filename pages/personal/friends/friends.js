const util = require('./../../../utils/util.js')
const http = require("./../../../utils/http.js");
const app = getApp()

Page({
  data: {
    friendId: '',
    friends: []
  },
  onLoad: function (option) {
    this.friends();
  },
  onShow(){
    this.friends();
  },
  /**
   * 好友列表
   */
  friends:function(){
    let _this = this;
    http.get(`/friends`,
      {},
      function (res) {
        _this.setData({
          friends: res.data.data
        })
      });
  },
  /**
   * 跳转私信
   */
  letter: function (e) {
    let id = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  }
  
})
