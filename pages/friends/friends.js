const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    friendId: '',
    friends: [],
    showNormal: false
  },
  onLoad: function (option) {
    this.friends();
    this.setData({
      showNormal: app.globalData.showNormal
    });
  },
  onShow(){
    this.friends();
  },
  onReady: function () {
    wx.hideTabBar();
    if (this.data.showNormal) {
      wx.showTabBar();
    } else {
      wx.hideTabBar();
    }
  },
  /**
   * 好友列表
   */
  friends:function(){
    let _this = this;

    app.http('get', `/friends`,
      {},
      function (res) {

        console.log(res.data.data);

        console.log('获取好友列表');

        _this.setData({
          friends: res.data.data
        })

      });

  },
  /**
   * 跳转私信
   */
  letter: function (e) {
    console.log('跳转到私信');
    console.log(e.target.dataset.obj);

    let id = e.currentTarget.dataset.obj;

    console.log(e);

    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id
    })
  }
  
})
