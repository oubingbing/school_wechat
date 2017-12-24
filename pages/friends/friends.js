const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    friendId: '',
    friends: [],
  },
  onLoad: function (option) {
    this.friends();
  },
  friends:function(){
    let _this = this;

    app.http('get', `/friends`,
      {},
      function (res) {

        console.log(res.data.data);

        _this.setData({
          friends: res.data.data
        })

      });

  },
  letter: function (e) {
    console.log('跳转到私信');
    console.log(e.target.dataset.obj);

    let id = e.target.dataset.obj;

    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id
    })
  }
  
})
