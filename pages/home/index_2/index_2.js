const util = require("./../../../utils/util.js");
const http = require("./../../../utils/http.js");
const app = getApp()

Page({
  data: {
    show_auth:false,
    userInfo: {},
    hasUserInfo: false,
    school: '',
    praiseBorder: '',
    notPraiseBorder: '',
    posts: [],
    postType: 1,
    baseImageUrl: app.globalData.imageUrl,
    show: 0,
    hidden: false,
    showCommentInput: false,
    commentContent: '',
    commentObjId: '',
    commentType: '',
    refcommentId: '',
    filter:'',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    currentTime: '',
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1,
    animationData: {},
    commentValue: '',
    showNormal: false,
    showAudit: false,
    topic:'',
    showTopic:false,
    showSelect: false,
    showBegin: true,
    showCancel: false,
    showReport: false,
    bindReport: false,
    showSubmit: false,
    showSearch:false,
    tryAgant: false,
    imageLeft: '',
    imageRight: '',
    postImageLeft: '',
    PostImageRight: '',
    rate: 0,
    face: '',
    conclusion: '',
    canComment:true,
    sharecomeIn:false,
    shareId:'',
    shareType:'',
    param:app.globalData.param
  },

  onLoad: function (e) {
    if (e.id != undefined) {
      this.setData({ sharecomeIn: true, shareId: e.id, shareType: e.type })
    }
    wx.showLoading({
      title: '加载中',
    });
    this.getPost();
    this.topic();
  },

  onShow: function (option) {

    if (app.globalData.reloadHome == true){
      app.globalData.reloadHome = false;
      this.setData({
        pageNumber: this.data.initPageNumber,
        posts: []
      });
      this.getPost();
    }

    let type = 0;
    http.getNewInbox(type, res=>{
      if (res.data.data != 0 && res.data.data != null && res.data.data != '') {
        this.setData({
          newMessage: true,
          newMessageNumber: res.data.data
        });
      } else {
        this.setData({
          newMessage: false,
          newMessageNumber: 0
        });
      }
    });
  },

  /**
   * 点赞话题
   */
  praiseTopic: function (e) {
    let id = e.currentTarget.dataset.id;
    http.post('/praise/'+id+'/topic', {}, function (res) {
      this.setData({topic:res.data.data});
    });
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    return {
      title: 'hi，同学，有人跟你表白了',
      path: '/pages/home/index_2/index_2',
      imageUrl:'http://img.qiuhuiyi.cn/share1.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 获取具体类型的贴子
   */
  selected(e) {
    let objType = e.target.dataset.type;
    let thisTopic = this.data.topic;

    if (objType == 1 && thisTopic != null){
      this.setData({
        showTopic: true,
        posts: []
      });
    }else{
      this.setData({
        showTopic: false
      });
    }

    if (objType == 5) {
      this.setData({
        showSearch: true,
        showTopic: false,
      });
    } else {
      this.setData({
        showSearch: false
      });
    }

    this.setData({
      select: objType,
      postType: objType,
      posts: [],
      filter:''
    })

    this.setData({
      pageNumber: this.data.initPageNumber
    });

    if (objType != 5) {
      this.getPost();
    }

  },

  /**
   * 搜索
   */
  search:function(){
    this.setData({
      postType: 1,
      posts: []
    })

    this.setData({
      pageNumber: this.data.initPageNumber
    });
    wx.showLoading({
      title: '搜索中...',
    });
    this.getPost();
  },

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/personal/message/message?type=0&new_message=1&t=1'
    })
  },

  /**
   * 下拉刷新，获取最新的贴子
   */
  onPullDownRefresh: function () {
    this.setData({
      pageNumber: this.data.initPageNumber,
      posts:[]
    });
    this.getPost();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    });
    this.getPost();
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /** 
   * 进入发表页面
   */
  post: function () {
    wx.navigateTo({
      url: '/pages/home/post/post'
    })
  },

  /**
   * 获取最新的贴子
   */
  getMostNewPost: function () {
    http.get('/most_new_post', {
      date_time: this.data.currentTime
    }, res => {

      this.setData({
        currentTime: util.formatTime(new Date())
      });
      wx.stopPullDownRefresh();
      let posts = this.data.posts;
      if(res.data.data){
        if (res.data.data.length > 0) {
          res.data.data.map(item => {
            let ifRepeat = false;
            for (let post of posts) {
              if (post.id == item.id) {
                ifRepeat = true;
              }
            }

            if (!ifRepeat) {
              posts.unshift(item);
            }
          });

          this.setData({
            posts: posts
          });
        }
      }
    });
  },

  /**
   * 发表贴子后获取最新的贴子
   */
  getNewPost: function () {
    //获取新的贴子
    http.post('/post', {
      page_size: 10,
      page_number: 1
    }, res => {
      if (res.data.data != null){
        this.setData({
          posts: res.data.data.page_data,
          pageNumber: this.data.initPageNumber
        });
      }
    });
  },

  /**
   * 获取贴子
   */
  getPost: function (objType = null) {
    let order_by = 'created_at';
    let sort_by = 'desc';
    if (this.data.postType == 4) {
      order_by = 'praise_number';
      sort_by = 'desc';
    }

    if (this.data.postType == 3) {
      this.setData({
        pageNumber: this.data.initPageNumber
      });
    }

    this.setData({
      notDataTips: false
    });

    http.get(`/post?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&obj_type=${objType}&type=${this.data.postType}&order_by=${order_by}&sort_by=${sort_by}&filter=${this.data.filter}`,
      {},
      res => {
        setTimeout(t=>{
          wx.stopPullDownRefresh();
        },700)
        wx.hideLoading();
        this.setData({
          showGeMoreLoadin: false
        })
        let posts = this.data.posts;
        if(res.data.data){
          if (res.data.data.page_data.length > 0) {
            res.data.data.page_data.map(item => {
              posts.push(item);
            });
            this.setData({
              posts: posts,
              pageNumber: this.data.pageNumber + 1              
            });
          } else {
            this.setData({
              notDataTips: true
            });
          }
        }
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
 * 预览图片
 */
  previewMoreImage: function (event) {
    let images = event.currentTarget.dataset.obj.map(item=>{
      return this.data.baseImageUrl+item;
    });
    let url = event.target.id;
    wx.previewImage({
      current: url,
      urls: images
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
        showCommentInput: true
      });
    } else {
      this.setData({
        show: 0,
        showCommentInput: false
      });
    }
  },

  /**
   * 触摸屏幕后移动触发一些隐藏操作
   */
  hiddenComment: function () {
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
    http.post(`/praise`,{ obj_id: objId, obj_type: objType }, res => {
        let postList = this.data.posts;
        let repData = res.data
        if(repData.error_code == 0 && repData.data != null){
          let newPostList = postList.map(item => {
            if (objId == item.id) {
              item.praises.push(res.data.data);
            }
            return item;
          });
          //重新赋值，更新数据列表
          this.setData({
            posts: newPostList
          });
        }
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
    let content = event.detail.value;
    this.setData({
      commentContent: ''
    })
    this.setData({
      commentContent: content
    })
  },

  /**
   * 获取搜索框的内容
   */
  getFilter: function (event){
    let content = event.detail.value;
    this.setData({
      filter: content
    })
  },
  
  /**
   * 提交评论
   */
  sendComment: function (e) {

    if (!this.data.canComment){
      return false;
    }

    this.setData({ canComment: false })

    wx.showLoading({
      title: '发送中',
    });
    
    let content = this.data.commentContent;
    let objId = this.data.commentObjId;
    let type = this.data.commentType;
    let refcommentId = this.data.refcommentId;
    if (content == '') {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
      this.setData({ canComment:true})
      return false;
    }

    http.post('/comment', {
      content: content,
      obj_id: objId,
      type: type,
      ref_comment_id: refcommentId
    }, res=> {
      this.setData({ canComment:true})
      wx.hideLoading();
      this.setData({
        commentContent: '',
        commentObjId: '',
        commentType: '',
        showCommentInput: false,
        refcommentId: ''
      })

      if(res.data.error_code == 0){
        let postList = this.data.posts;
        let newPostList = postList.map(item => {
          if (objId == item.id) {
            item.comments.push(res.data.data);
          }
          return item;
        });
  
        //重新赋值，更新数据列表
        this.setData({
          posts: newPostList
        });
      }else{
        wx.showToast({
          title: res.data.error_message,
          icon:'none'
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500)
      }

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
    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: res=> {
        if (res.confirm) {
          http.httpDelete(`/delete/${commentId}/comment`, {}, res => {
            if (res.data.data == 1) {
              let newPostList = this.data.posts.map(item => {
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
              this.setData({
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
    wx.showModal({
      title: '提示',
      content: '确定删除吗?',
      success: res=> {
        if (res.confirm) {
          http.httpDelete(`/delete/${objId}/post`, {}, res => {
            let result = res.data.data;
            if (result == 1) {
              let newPosts = this.data.posts.filter((item, index) => {
                if (item.id != objId) {
                  return item;
                }
              });

              this.setData({
                posts: newPosts
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
   * 跳转到私信
   */
  letter: function (e) {
    let id = e.target.dataset.obj;
    let canChat = e.target.dataset.chat;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  /**
   * 关注
   */
  follow: function (e) {
    let objId = e.target.dataset.obj;
    http.post('/follow', {obj_id: objId,obj_type: 1}, res=> {
      let follow = res.data.data;
      let post = this.data.posts;
      let newPost = post.map(item => {
        if (item.id == follow.obj_id) {
          item.follow = true;
        }
        return item;
      });

      this.setData({
        posts: newPost
      });
    });
  },

  /**
   * 取消关注
   */
  cancelFolllow: function (e) {
    let objId = e.target.dataset.obj;
    http.put(`/cancel/${objId}/follow/1`, {},res=> {
      let follow = res.data.data;
      let post = this.data.posts;
      let newPost = post.map(item => {
        if (item.id == objId) {
          item.follow = false;
        }
        return item;
      });
      this.setData({
        posts: newPost
      });
    });

  },

  topic:function(){
    http.get(`/topic`, {}, res=> {
      if(res.data.data){
        let topicShow = res.data.data != null ? true : false;
        this.setData({ topic: res.data.data, showTopic: topicShow });
      }

    });
  },
  
  openTopic:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/home/topic_detail/topic_detail?id=' + id
    })
  },

  openUserInfo:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal/user_info/personal?id=' + id
    })
  }

})