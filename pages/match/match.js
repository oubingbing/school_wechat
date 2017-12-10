
const app = getApp();

Page({
  data: {
    matchs:[]
  },
  onLoad: function () {
    this.getList();
  },
  /**
  * 进入发表页面
  */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_match/post_match'
    })
  },
  getList:function(){

    let _this = this;

    app.http('get', '/match_loves', {}, res => {
    
      console.log(res);

      _this.setData({
        matchs: res.data.data.page_data
      })

      console.log(_this.data.matchs);

    });

  }
})