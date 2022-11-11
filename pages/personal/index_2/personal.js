
const app = getApp();
const http = require("./../../../utils/http.js");

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    user: '',
    newLetterNumber: 0,
    serviceId: '',
    param: app.globalData.param,
    showLoginButton: app.globalData.authStatus,
    selectPoster:1,
    sinageture:"",
    todayStep:0,
    myRank:0,
    posts:[],
    pageSize: 10,
    pageNumber: 1,
    baseImageUrl: app.globalData.imageUrl,
    initPageNumber: 1,
    showCommentInput: false,
    commentContent: '',
    commentObjId: '',
    commentType: '',
    refcommentId: '',
    commentValue: '',
    showSubmit: false,
    canComment:true,
    leftList: [],
    rightList: [],
    leftHeight: 0,
    rightHeigt: 1,
    avatarUrl:defaultAvatarUrl,
    nickname:""
  },
  onLoad: function () {
    this.checkAuth();
    let userStorage = wx.getStorageSync('user');
    if (userStorage){
      this.setData({
        user: userStorage
      })
    }
    this.setData({ param: app.globalData.param })
    this.getPersonalInfo()
    this.newLetterCount()
    this.getService()
    this.statistic()
    this.getMyRank()
    this.getPost()
    this.getSaleList()
  },

  onChooseAvatar:function(e) {
    const { avatarUrl } = e.detail 
    console.log(e.detail,"头像")
    this.setData({
      avatarUrl,
    })
  },

  /**
   * 进入关注页面
   */
  openFollowList:function(e){
    let t = e.currentTarget.dataset.t;
    wx.navigateTo({
      url: `/pages/personal/follow_list/message?objType=${t}&id=0`
    })
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
   * 进入详情页面
   */
  openSalecomment:function(e){
    let id = e.currentTarget.dataset.objid;
    wx.navigateTo({
      url: '/pages/sale/comment_sale/comment_sale?id='+id
    })
  },


  /**
   * 获取贴子列表
   */
  getSaleList:function(){
    let objType = 1;
    var order_by = 'created_at';
    var sort_by = 'desc';
    if (objType == 4) {
      order_by = 'praise_number';
      sort_by = 'desc';
    }
    if (this.data.postType == 3) {
      this.setData({
        pageNumber: this.data.initPageNumber
      });
    }
    http.get(`/sale_friends_v2?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&type=${objType}&order_by=${order_by}&sort_by=${sort_by}&user_id=${this.data.user.id}`,{},res => {
      let data = res.data.data.page_data;
      if(data){
        let leftList = this.data.leftList;
        let rightList = this.data.rightList;
        let leftHeight = this.data.leftHeight;
        let rightHeigt = this.data.rightHeigt;

        if (data.length > 0) {
          data.map(item => {
            if(item.attachments.length>=1){
              if (leftHeight <= rightHeigt) {
                leftList.push(item);
                leftHeight += item.attachments[0]['height'];
              } else {
                rightList.push(item)
                rightHeigt += item.attachments[0]['height'];
              }
              this.setData({
                leftList: leftList,
                rightList: rightList,
                leftHeight: leftHeight,
                rightHeigt: rightHeigt,
              })
            }
          });

          this.setData({
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
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    });
    if(this.data.selectPoster == 1){
      this.getPost();
    }
    if(this.data.selectPoster == 2){
      this.getSaleList()
    }
  },

    /**
   * 获取贴子
   */
  getPost: function () {
    http.get(`/post?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&just=1&user_id=${this.data.user.id}`, {}, res => {
      this.setData({
        showGeMoreLoadin: false
      })
      let posts = this.data.posts;

      if (res.data.data.page_data.length > 0) {
        res.data.data.page_data.map(item => {
          posts.push(item);
        });

        this.setData({
          posts: posts,
          pageNumber: this.data.pageNumber + 1
        });
      }
    });
  },

  select(e) {
    let objType = e.target.dataset.type;
    this.setData({selectPoster:objType})
  },

  onShow: function () {
    this.newLetterCount();
    this.checkLogin();
    let user = wx.getStorageSync('user')
    this.setData({sinageture:user.personal_signature,user:user})
  },

  getMyRank: function () {
    http.get(`/my_rank`, {}, res => {
      let resData = res.data;
      if (resData.error_code == 0) {
        this.setData({
          myRank: resData.data.rank
        })
      }
    });
  },

    /**
   * 获取统计的数据
   */
  statistic: function () {
    http.get('/run_statistic', {}, res=>{
      let todayStep = res.data.data.today_step != null ? res.data.data.today_step : 0;
      let totalStep = res.data.data.total_step != null ? res.data.data.total_step : 0;
      this.setData({
        todayStep: todayStep
      })
      wx.setStorageSync('todayStep', todayStep);
      wx.setStorageSync('totalStep', totalStep);
    });
  },

  checkLogin:function(){
    http.post(`/check_login`, {}, res => {
      if (res.data.error_code == '5000') {
        app.globalData.authStatus = true;
        this.setData({
          showLoginButton : true
        })
      }
    });
  },

  /**
   * 是否授权
   */
  checkAuth:function(){
    let that = this;

    if (wx.getUserProfile) {
      this.setData({
        showLoginButton: false,
        pageNumber: this.data.initPageNumber,
        posts:[]
      })
      that.getPersonalInfo()
      that.statistic()
      that.getMyRank()
      this.getPost()
    }
  },

  /**
   * 获取客服id
   */
  getService: function () {
    http.get(`/service`, {}, res => {
      this.setData({
        serviceId: res.data.data
      });
    });
  },

  /**
   * 获取个人信息
   */
  getPersonalInfo() {
    http.get(`/personal_info`, {}, res => {
      this.setData({
        user: res.data.data,
        sinageture:res.data.data.personal_signature
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  /**
   * 获取未读私信数量
   */
  newLetterCount: function () {
    http.get(`/new_messages`, {}, res => {
      if (res.data.data != null) {
        this.setData({
          newLetterNumber: res.data.data
        })
      }
    });
  },

  /**
   * 进入消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/personal/message/message?type=0&new_message=0&t=2'
    })
  },

  /**
   * 进入私信列表
   */
  openLetter: function () {
    wx.navigateTo({
      url: '/pages/personal/friends/friends'
    })
  },

  /**
   * 进入建议留言列表
   */
  openSugesstion: function () {
    let id = this.data.serviceId;
    console.log('客服id' + id);
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  /**
   * 进入表白墙列表
   */
  opendPostList: function () {
    wx.navigateTo({
      url: '/pages/personal/post_list/post_list'
    })
  },

  /**
   * 进入卖舍友列表
   */
  openSaleList: function () {
    wx.navigateTo({
      url: '/pages/personal/sale_list/sale_list'
    })
  },

  /**
   * 进入匹配列表
   */
  openMatchList: function () {
    wx.navigateTo({
      url: '/pages/help/help_single/help_single'
    })
  },

  updateInfo: function () {
    wx.navigateTo({
      url: '/pages/personal/set_profile/set_profile'
    })
  },

  /**
 * 监听用户点击授权按钮
 */
  getAuthUserInfo: function (data) {
    this.setData({
      showLoginButton: false
    });
    let that = this
    http.login(null, null, null, res => {
      this.setData({
        pageNumber: this.data.initPageNumber,
        posts:[]
      });
      that.getPersonalInfo();
      that.statistic()
      that.getMyRank()
      this.getPost()

      wx.showLoading({
        title: '登录成功后可修改用户昵称和头像！',
      });
      setTimeout(res=>{
        wx.hideLoading();
        wx.navigateTo({
          url: '/pages/personal/message/message?type=0&new_message=0&t=2'
        })
      },1500)
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
      let repData = res.data
      if(repData.error_code == 0 && repData.data != null){
        let postList = this.data.posts;
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
    console.log(e)
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

})