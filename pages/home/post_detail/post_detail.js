
const uploader = require("./../../../utils/util.js");
const http = require("./../../../utils/http.js");
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    school: '',
    praiseBorder: '',
    notPraiseBorder: '',
    posts: [],
    baseImageUrl: app.globalData.imageUrl,
    show: 0,
    hidden: false,
    showCommentInput: false,
    showCommentInput: false,
    commentContent: '',
    commentObjId: '',
    commentType: '',
    refcommentId: '',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    currentTime: '',
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1,
    id:'',
    param: app.globalData.param
  },

  onLoad: function (option) {
    wx.showLoading()
    let objId = option.id;

    this.setData({
      id: objId
    })

    this.setData({ param: app.globalData.param })
    let _this = this;
    let token = wx.getStorageSync('token');
    this.getPost(_this);
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 获取贴子
   */
  getPost: function (_this, objType = null) {
    let id = this.data.id;
    http.get(`/post/${id}`, {}, res => {
      wx.hideLoading();
      let post = _this.data.posts;
      post.push(res.data.data);
      this.setData({
        posts: post
      })
    });

  },
  /**
   * 预览图片
   */
  previewImage: function (event) {
    let url = event.target.id;
    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /**
   * 显示评论控制面板
   */
  showComment: function (event) {
    this.setData({
      show: 0
    });

    let id = event.target.id;
    let hidden = event.target.dataset.show;
    if (!hidden) {
      this.setData({
        show: id,
        hidden: true
      });
    } else {
      this.setData({
        show: 0,
        hidden: false
      });
    }
  },

  /**
   * 触摸屏幕后移动触发一些隐藏操作
   */
  hiddenComment: function () {
    console.log('inde-hiddenComment：触摸后移动');
    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });
  },

  /**
   * 点赞
   */
  praise: function (event) {
    let objId = event.target.dataset.obj;
    let objType = 1;
    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });

    let _this = this;
    http.post(`/praise`, { obj_id: objId, obj_type: objType }, res => {
      let postList = _this.data.posts;
      let newPostList = postList.map(item => {
        if (objId == item.id) {
          item.praises.push(res.data.data);
        }
        return item;
      });

      //重新赋值，更新数据列表
      _this.setData({
        posts: newPostList
      });
    });
  },

  /**
   * 激活评论框
   */
  showCommentInput: function (event) {
    let objId = event.target.dataset.objid;
    let type = event.target.dataset.objtype;
    this.setData({
      commentObjId: objId,
      commentType: type,
      show: 0,
      hidden: false,
      showCommentInput: true
    });
  },

  /**
   * 获取评论框的输入内容
   */
  getCommentContent: function (event) {
    this.setData({
      commentContent: ''
    })
    let content = event.detail.value;
    this.setData({
      commentContent: content
    })
  },

  /**
   * 提交评论
   */
  sendComment: function (e) {
    let _this = this;
    let content = this.data.commentContent;
    let objId = this.data.commentObjId;
    let type = this.data.commentType;
    let refcommentId = this.data.refcommentId;
    if (content == '') {
      return;
    }
    http.post('/comment', {
      content: content,
      obj_id: objId,
      type: type,
      ref_comment_id: refcommentId
    }, function (res) {

      _this.setData({
        commentContent: '',
        commentObjId: '',
        commentType: '',
        showCommentInput: false,
        refcommentId: ''
      })
      let postList = _this.data.posts;
      let newPostList = postList.map(item => {
        if (objId == item.id) {
          item.comments.push(res.data.data);
        }
        return item;
      });

      //重新赋值，更新数据列表
      _this.setData({
        posts: newPostList
      });
    });
  },

  /**
   * 回复别人
   */
  commentOtherComment: function (e) {
    let objId = e.currentTarget.dataset.objid;
    let type = e.currentTarget.dataset.objtype;
    let refcommentId = e.currentTarget.dataset.refid;
    this.setData({
      commentObjId: objId,
      commentType: type,
      show: 0,
      hidden: false,
      showCommentInput: true,
      refcommentId: refcommentId
    });
  },

  /**
   * 删除评论
   */
  deleteComment: function (e) {
    let objId = e.currentTarget.dataset.objid;
    let commentId = e.currentTarget.dataset.refid;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${commentId}/comment`, {}, res => {
            if (res.data.data == 1) {
              let newPostList = _this.data.posts.map(item => {
                if (objId == item.id) {
                  let newComment = item.comments.filter((item, index) => {
                    if (item.id != commentId) {
                      return item;
                    }
                  });
                  item.comments = newComment;
                }
                return item;
              });
              _this.setData({
                posts: newPostList
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
   * 删除帖子
   */
  deletePost: function (e) {
    let objId = e.target.id;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除吗?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${objId}/post`, {}, res => {
            let result = res.data.data;
            if (result == 1) {
              let newPosts = _this.data.posts.filter((item, index) => {
                if (item.id != objId) {
                  return item;
                }
              });

              _this.setData({
                posts: newPosts
              });
            } else {
              console.log('删除失败');
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  letter: function (e) {
    let id = e.target.dataset.obj;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
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
      obj_type: 1
    }, function (res) {
      let follow = res.data.data;
      let post = _this.data.posts;
      let newPost = post.map(item => {
        if (item.id == follow.obj_id) {
          item.follow = true;
        }
        return item;
      });
      _this.setData({
        posts: newPost
      });
    });
  },

  /**
   * 取消关注
   */
  cancelFolllow: function (e) {
    let _this = this;
    let objId = e.target.dataset.obj;
    http.put(`/cancel/${objId}/follow/1`, {}, function (res) {
      let follow = res.data.data;
      let post = _this.data.posts;
      let newPost = post.map(item => {
        if (item.id == objId) {
          item.follow = false;
        }
        return item;
      });

      _this.setData({
        posts: newPost
      });
    });
  }
})