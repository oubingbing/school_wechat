const app = getApp();
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //设置当前时间
    this.setData({
      currentTime: util.formatTime(new Date())
    });

    let id = options.id;

    this.setData({
      objId:id
    });

    console.log(options)

    this.getTopic(id);

    this.getComments(this);
  },
  getTopic:function(id){
    app.http('get',`/topic/`+id,{},res => {
      console.log(res);

      let topic = res.data.data;
      this.setData({
        title: topic.title,
        topicContent: topic.content,
        attachments: topic.attachments,
        praiseNumber: topic.praise_number,
        viewNumber: topic.view_number,
        commentNumber: topic.comment_number,
        comments:topic.comments,
        objId:topic.id,
        showFooter: true
      });

    });
  },

  onShow: function (option) {
    this.getNewComments(this)
  },
  /**
   * 预览图片
   */
  previewImage: function (event) {

    console.log(event.target.id);

    let url = event.target.id;

    wx.previewImage({
      current: '',
      urls: [url]
    })
  },
/**
* 获取话题评论 
*/
  getComments: function (_this) {

    wx.showLoading({
      title: '评论加载中',
    });

    let id = this.data.objId;
    let commentsArray = this.data.comments;

    app.http(
      'get',
      '/topic/' + id + `/comments?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}`,
     {}, function (res) {

       wx.hideLoading();

       _this.setData({
         showGeMoreLoadin: false
       });

      console.log(res.data.data.page_data);

      if (res.data.data.page_data){

        console.log('commentsArray:' + commentsArray);

        res.data.data.page_data.map(item=>{
          commentsArray.push(item);
        })

        _this.setData({
          comments: commentsArray,
          pageNumber: _this.data.pageNumber + 1
        });
      }
    });
  },
  /**
  * 获取话题评论 
  */
  getNewComments: function (_this) {

    let id = this.data.objId;
    let commentsArray = this.data.comments;

    app.http(
      'get',
      '/topic/' + id + `/new_comments?time=` + this.data.currentTime,
      {}, function (res) {

        console.log(res.data.data);

        if (res.data.data) {

          console.log('commentsArray:' + commentsArray);

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

          _this.setData({
            comments: commentsArray
          });
        }
      });
  },
  /**
 * 上拉加载更多
 */
  onReachBottom: function () {

    console.log('到底了');

    this.setData({
      showGeMoreLoadin: true
    });

    this.getComments(this);

  },

  /**
* 点赞话题
*/
  praiseTopic: function (e) {

    let id = e.currentTarget.dataset.id;

    let _this = this;

    app.http('POST', '/praise/' + id + '/topic', {}, function (res) {

      console.log(res.data.data);

      _this.setData({ praiseNumber: res.data.data.praise_number });
    });
  },
  /**
   * 进入评论
   */
  openCommentTopic:function(e){
    let id = e.currentTarget.dataset.id;
    console.log('id是什么：'+id);

    wx.navigateTo({
      url: '/pages/topic_comment/topic_comment?id=' + id
    })

  },

  /**
   * 触摸屏幕后移动触发一些隐藏操作
   */
  hiddenComment: function () {
    console.log('移动屏幕');
    console.log('inde-hiddenComment：触摸后移动');
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

    console.log(e)

    console.log('评论人的Id:' + refId);

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

          console.log('用户点击确定')

          app.http('delete', `/delete/${commentId}/comment`, {}, res => {

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
    console.log('删除评论')

    let objId = e.currentTarget.dataset.objid;
    let commentId = e.currentTarget.dataset.refid;
    let _this = this;

    console.log('评论Id：' + commentId);
    console.log('帖子Id' + objId);

    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: function (res) {
        if (res.confirm) {

          console.log('用户点击确定')

          app.http('delete', `/delete/${commentId}/comment`, {}, res => {

            if (res.data.data == 1) {

              let comments = _this.data.comments;

              let newComment = comments.map(comment => {
                let sub_comments = comment.sub_comments;
                let newSubComments = sub_comments.filter((item, index) => {
                  if (item.id != commentId) {
                    console.log("item.id:" + item.id);
                    console.log("commentId:" + commentId);
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
    console.log("评论框输入内容:" + event.detail.value);

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

    console.log('对象类型：' + objType);

    app.http('post', '/comment', {
      content: content,
      obj_id: objId,
      type: objType,
      ref_comment_id: refCommentId
    }, function (res) {

      wx.hideLoading();

      console.log('返回的评论内容');
      console.log(res);

      let resData = res.data.data;

      if (!resData.error_code) {

        let comments = _this.data.comments;

        console.log(resData);

        if (resData.obj_type == 2) {
          console.log('评论贴子')
          let data = resData;
          comments.unshift(data);
          comments.comment_number += 1;

          _this.setData({
            comments: comments
          });
        } else {

          console.log('评论评论');

          console.log('这是什么：'+_this.data.comments);

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

    console.log('点赞');
    let objId = e.currentTarget.dataset.objid;
    let objType = 2;
    console.log(objId);

    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });

    let _this = this;

    app.http(
      'post',
      `/praise`,
      { obj_id: objId, obj_type: objType },
      res => {
        console.log('点赞成功' + res);

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