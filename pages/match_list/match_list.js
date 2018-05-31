const uploader = require("../../utils/util.js");
const app = getApp();

Page({
  data: {
    matchs: [],
    newMessage: false,
    newMessageNumber: 0,
    select: 1,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    currentTime: ''
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    });

    //设置当前时间
    this.setData({
      currentTime: uploader.formatTime(new Date())
    });

    this.getList();
  },
  onShow() {
    let _this = this;
  },

  /**
   * 上拉加载跟多
   */
  onReachBottom: function () {

    console.log('到底了');

    let _this = this;

    this.setData({
      showGeMoreLoadin: true
    });

    this.getList();

  },

  /**
  * 跳转到私信
  */
  letter: function (e) {
    console.log('跳转到私信');

    let id = e.currentTarget.dataset.obj;

    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id
    })
  },

  /**
  * 获取具体类型的贴子
  */
  selected: function (e) {
    console.log('selected');
    console.log(e.target.dataset.type);

    let objType = e.target.dataset.type;
    this.setData({
      select: objType,
      matchs: []
    })


    this.setData({
      pageNumber: this.data.initPageNumber
    });

    let _this = this;

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

  /**
   * 获取贴子列表
   */
  getList: function () {

    let _this = this;
    let objType = this.data.select;

    let order_by = 'created_at';
    let sort_by = 'desc';

    if (objType == 4) {
      order_by = 'praise_number';
      sort_by = 'desc';
    }

    if (this.data.postType == 3) {
      this.setData({
        pageNumber: this.data.initPageNumber
      });
    }

    app.http(
      'get', 
      `/match_loves?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}&just=1`,
       {},
        res => {

        wx.hideLoading();

      console.log(res);
      _this.setData({
        showGeMoreLoadin: false
      })

      let matchs = _this.data.matchs;

      if (res.data.data.page_data.length > 0) {
        res.data.data.page_data.map(item => {
          matchs.push(item);
        });

        _this.setData({
          matchs: matchs,
          pageNumber: _this.data.pageNumber + 1
        })
      } else {
        _this.setData({
          notDataTips: true
        });
      }

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

    app.http('put', `/cancel/${objId}/follow/3`, {}, function (res) {

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

  },

  /**
   * 删除帖子
   */
  delete: function (e) {

    let objId = e.currentTarget.dataset.obj;
    let _this = this;

    console.log(objId);

    wx.showModal({
      title: '提示',
      content: '确认删除该匹配？',
      success: function (res) {
        if (res.confirm) {

          console.log('用户点击确定');

          app.http('delete', `/delete/${objId}/match_love`, {}, res => {

            if (res.data.data == 1) {

              let newMatchs = _this.data.matchs.filter((item, index) => {
                if (item.id != objId) {

                  return item;

                }
              });

              _this.setData({
                matchs: newMatchs
              });
            }

          });


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 点赞
   */
  praise: function (event) {

    let objId = event.currentTarget.dataset.obj;
    let objType = 3;
    console.log(objId);

    let _this = this;

    app.http('post', `/praise`, { obj_id: objId, obj_type: objType }, res => {
      console.log('点赞成功' + res);

      if (res.data.data.length != 0) {
        let matchList = _this.data.matchs;
        let newMatchs = matchList.map(item => {

          if (objId == item.id) {
            item.praise_number += 1;
          }

          return item;
        });

        //重新赋值，更新数据列表
        _this.setData({
          matchs: newMatchs
        });
      }

    });

  },
  /**
   * 匹配结果
   */
  matchResult: function (e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);

    wx.navigateTo({
      url: `/pages/match_result/match_result?id=${id}`
    })
  }
})