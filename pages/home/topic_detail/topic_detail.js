const app = getApp();
const util = require("./../../../utils/util.js");
const http = require("./../../../utils/http.js");

Page({
  data: {
    baseImageUrl: app.globalData.imageUrl,
    title:'',
    topicContent:'',
    content:'',
    attachments:'',
    praiseNumber:0,
    viewNumber:0,
    commentNumber:0,
    comments:[],
    showCommentInput:false,
    objId: '',
    objType: '',
    refCommentId: '',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin:false,
    showFooter:false,
    currentTime:''
  },

  onLoad: function (options) {
    this.setData({
      currentTime: util.formatTime(new Date())
    });

    let id = options.id;
    this.setData({
      objId:id
    });
    this.getTopic(id);
    this.getComments();
  },

  openUserInfo:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal/user_info/personal?id=' + id
    })
  },

  getTopic:function(id){
    http.get(`/topic/`+id,{},res => {
      let topic = res.data.data;
      this.setData({
        title: topic.title,
        topicContent: topic.content,
        attachments: topic.attachments,
        praiseNumber: topic.praise_number,
        viewNumber: topic.view_number,
        commentNumber: topic.comment_number,
        //comments: topic.comments ? topic.comments,
        objId:topic.id,
        showFooter: true
      });
    });
  },

  onShow: function (option) {
    this.getNewComments()
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
* 获取话题评论 
*/
  getComments: function () {
    wx.showLoading({
      title: '评论加载中',
    });
    let id = this.data.objId;
    http.get('/topic/' + id + `/comments?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}`,{}, res=> {
       let tempArray = this.data.comments;
       wx.hideLoading();
       this.setData({
         showGeMoreLoadin: false
       });

      if (res.data.data.page_data){
        res.data.data.page_data.map(item=>{
          if (item != undefined){
            tempArray.push(item);
          }
        })
        this.setData({
          comments: tempArray,
          pageNumber: this.data.pageNumber + 1
        });
      }
    });
  },
  /**
  * 获取话题评论 
  */
  getNewComments: function () {
    let id = this.data.objId;
    http.get('/topic/' + id + `/new_comments?time=` + this.data.currentTime,
      {}, res=> {
        if (res.data.data) {
          let commentsArray = this.data.comments;
          res.data.data.map(item => {
            let ifRepeat = false;
            for (let comment of commentsArray) {
              if (comment.id == item.id) {
                ifRepeat = true;
              }
            }
            if (!ifRepeat) {
              commentsArray.unshift(item);
            }
          })
          this.setData({
            comments: commentsArray
          });
        }
      });
  },
  /**
 * 上拉加载更多
 */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    });
    this.getComments();

  },

  /**
* 点赞话题
*/
  praiseTopic: function (e) {
    let id = e.currentTarget.dataset.id;
    http.post('/praise/' + id + '/topic', {}, res=> {
      this.setData({ praiseNumber: res.data.data.praise_number });
    });
  },
  /**
   * 进入评论
   */
  openCommentTopic:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/home/topic_comment/topic_comment?id=' + id
    })
  },

  /**
   * 触摸屏幕后移动触发一些隐藏操作
   */
  hiddenComment: function () {
    this.setData({
      showCommentInput: false
    });
  },

  /**
   * 显示评论输入框
   */
  showCommentInput: function (e) {
    let objid = e.currentTarget.dataset.objid;
    let type = e.currentTarget.dataset.type;
    let refId = e.currentTarget.dataset.refid;
    this.setData({
      showCommentInput: true,
      objId: objid,
      objType: type,
      refCommentId: refId
    });
  },
  
  removeComment:function(e){
    let commentId = e.currentTarget.dataset.refid;
    let _this = this;
    let comments = this.data.comments;
    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${commentId}/comment`, {}, res => {
            if (res.data.data == 1) {
              let newComment = comments.filter(item => {
                if (item.id != commentId) {
                  return item;
                }
              });
              newComment;
              _this.setData({
                comments: newComment
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
              let comments = _this.data.comments;
              let newComment = comments.map(comment => {
                let sub_comments = comment.sub_comments;
                let newSubComments = sub_comments.filter((item, index) => {
                  if (item.id != commentId) {
                    return item;
                  }
                });
                comment.sub_comments = newSubComments;
                return comment;
              })
              comments = newComment;
              _this.setData({
                comments: comments
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
   * 获取评论框的输入内容
   */
  getCommentContent: function (event) {
    let content = event.detail.value;
    this.setData({
      content: content
    })
  },

  /**
   * 评论
   */
  postComment: function (e) {
    wx.showLoading({
      title: '发送中',
    });

    let objType = this.data.objType;
    let objId = this.data.objId;
    let content = this.data.content;
    let refCommentId = this.data.refCommentId;
    let _this = this;
    http.post('/comment', {
      content: content,
      obj_id: objId,
      type: objType,
      ref_comment_id: refCommentId
    }, function (res) {

      wx.hideLoading();
      let resData = res.data.data;
      if (!resData.error_code) {
        let comments = _this.data.comments;
        if (resData.obj_type == 2) {
          let data = resData;
          comments.unshift(data);
          comments.comment_number += 1;
          _this.setData({
            comments: comments
          });
        } else {
          let newComments = _this.data.comments.map(item => {
            if (item.id == objId) {
              item.sub_comments.push(resData);
            }
            return item;
          });

          comments = newComments;
          _this.setData({
            comments: comments
          });
        }
        _this.setData({
          content: '',
          objId: '',
          objType: '',
          showCommentInput: false
        });
      }
    });
  },

  /**
   * 点赞
   */
  praise: function (e) {
    let objId = e.currentTarget.dataset.objid;
    let objType = 2;
    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });
    let _this = this;
    http.post(`/praise`,
      { obj_id: objId, obj_type: objType },
      res => {
        if (!res.data.data.error_code) {
          let praise_number = _this.data.praise_number;
          praise_number += 1;
          _this.setData({
            praise_number: praise_number
          });
        }
      });
  }
})