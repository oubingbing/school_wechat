const uploader = require("../../utils/util.js");
const http = require("./../../utils/http.js");
const app = getApp();

Page({
  data: {
    matchs:[],
    newMessage: false,
    newMessageNumber: 0,
    select:1,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin:false,
    currentTime:''
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
  onReady: function () {
  },
  onShow(){
    if (app.globalData.changeSchoolMatch) {
      //切换了学校
      this.setData({
        matchs: [],
        pageNumber: this.data.initPageNumber
      });
      app.globalData.changeSchoolMatch = false;
      this.getList();

      //设置当前时间
      this.setData({
        currentTime: uploader.formatTime(new Date())
      });
    } else {
      this.getMostNewMatch();
    }

    let _this = this;
    let type = 0;
    app.getNewInbox(type, function (res) {
      console.log("新消息数量：" + res.data.data);
      if (res.data.data != 0 && res.data.data != null && res.data.data != '') {
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'hi，同学，你被舍友卖掉了',
      path: '/pages/index/index',
      imageUrl: 'http://image.kucaroom.com/match_bg.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 上拉加载跟多
   */
  onReachBottom: function () {
    let _this = this;
    this.setData({
      showGeMoreLoadin: true
    });
    this.getList();
  },

 /**
 * 下拉刷新，获取最新的贴子
 */
  onPullDownRefresh: function () {
    this.getMostNewMatch();
  },

  /**
  * 跳转到私信
  */
  letter: function (e) {
    let id = e.currentTarget.dataset.obj;
    let canChat = e.target.dataset.chat;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id + '&can_chat=' + canChat
    })
  },

  /**
  * 获取具体类型的贴子
  */
  selected: function (e) {
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
    wx.navigateTo({
      url: '/pages/post_match/post_match'
    })
  },

  /**
   * 获取贴子列表
   */
  getList:function(){
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
    http.get(`/match_loves?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}`, {}, res => {
      wx.hideLoading();
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
      }else{
        _this.setData({
          notDataTips: true
        });
      }
    });
  },

  /**
   * 获取最新的贴子
   */
  getMostNewMatch: function () {
    let _this = this;
    //获取新的贴子
    http.get(`/most_new_match_loves?date_time=${this.data.currentTime}`,
     {},
      res => {
      this.setData({
        currentTime: uploader.formatTime(new Date())
      });
      wx.stopPullDownRefresh();
      let matchs = _this.data.matchs;
      if (res.data.data.length > 0) {
        res.data.data.map(item => {
          let ifRepeat = false;
          for (let match of matchs) {
            if (match.id == item.id) {
              ifRepeat = true;
            }
          }

          if (!ifRepeat) {
            matchs.unshift(item);
          }
        });

        _this.setData({
          matchs: matchs
        });
      }
    });
  },

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/personal/message/message?type=0&new_message=1'
    })
  },
  /**
   * 关注
   */
  follow: function (e) {
    let _this = this;
    let objId = e.target.dataset.obj;
    http.post('/follow', {
      obj_id: objId,
      obj_type: 3
    }, function (res) {
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
    http.put(`/cancel/${objId}/follow/3`, {}, function (res) {
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
  delete:function(e){
    let objId = e.currentTarget.dataset.obj;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认删除该匹配？',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${objId}/match_love`, {}, res => {
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
    let _this = this;
    http.post(`/praise`, { obj_id: objId, obj_type: objType }, res => {
      console.log('点赞成功' + res);
        if(res.data.data.length != 0){
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
   * 进入匹配结果页面
   */
  matchResult:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/match_result/match_result?id=${id}`
    })
  }
})