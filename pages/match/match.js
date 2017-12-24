
const app = getApp();

Page({
  data: {
    matchs:[],
    newMessage: false,
    newMessageNumber: 0
  },
  onLoad: function () {
    this.getList();
  },
  onShow(){

    //this.getMostNewData();

    let _this = this;

    let type = 0;
    app.getNewInbox(type, function (res) {
      console.log("新消息数量：" + res.data.data);
      if (res.data.data != 0) {
        _this.setData({
          newMessage: true,
          newMessageNumber: res.data.data
        });
      } else {
        _this.setData({
          newMessage: false,
          newMessageNumber: 0
        });
      }
    });
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

  },
  /**
 * 进入新消息列表
 */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0&new_message=1'
    })
  },
  /**
 * 关注
 */
  follow: function (e) {

    console.log(e);

    let _this = this;
    let objId = e.target.dataset.obj;

    console.log(objId);

    app.http('post', '/follow', {
      obj_id: objId,
      obj_type: 3
    }, function (res) {

      console.log(res.data);

      let follow = res.data.data;
      let matchs = _this.data.matchs;

      let newMatchs = matchs.map(item => {

        if (item.id == follow.obj_id) {
          item.follow = true;
        }

        return item;
      });

      _this.setData({
        matchs: newMatchs
      });
    });
  },
  /**
   * 取消关注
   */
  cancelFolllow: function (e) {

    let _this = this;
    let objId = e.target.dataset.obj;

    app.http('patch', `/cancel/${objId}/follow/3`, {}, function (res) {

      console.log(res.data);

      let follow = res.data.data;
      let matchs = _this.data.matchs;

      let newMatchs = matchs.map(item => {

        if (item.id == objId) {
          item.follow = false;
        }

        return item;
      });

      _this.setData({
        matchs: newMatchs
      });
    });

  }
})