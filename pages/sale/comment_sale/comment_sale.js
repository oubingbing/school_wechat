
const app = getApp();
const http = require("./../../../utils/http.js");

let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    sale:'',
    comments:'',
    baseImageUrl: app.globalData.imageUrl,
    showCommentInput:false,
    content:'',
    objId:'',
    objType:'',
    refCommentId:'',
    attachments:''
  },
  onLoad: function (option) {
    let objId = option.id;
    http.get(`/sale_friend/${objId}`, {}, res => {
      let data = res.data.data;
      data.comments = data.comments.reverse();
      this.setData({
        sale: data,
      });
    });
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
  showCommentInput:function(e){
    let objid = e.currentTarget.dataset.objid;
    let type = e.currentTarget.dataset.type;
    let refId = e.currentTarget.dataset.refid;
    this.setData({
      showCommentInput: true,
      objId:objid,
      objType:type,
      refCommentId:refId
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
              let sale = _this.data.sale;
              let comments = sale.comments;
              let newComment = comments.map(comment=>{
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
              sale.comments = newComment;
              _this.setData({
                sale: sale
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
  postComment:function(e){
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
      ref_comment_id:refCommentId
    }, function (res) {
      wx.hideLoading();
      let resData = res.data.data;
      if (!resData.error_code){
        let sale = _this.data.sale;
        if (resData.obj_type == 2){
          let data = resData;
          sale.comments.unshift(data);
          sale.comment_number += 1;
          _this.setData({
            sale: sale
          });
        }else{
          let newComments = sale.comments.map(item=>{
            if(item.id == objId){
              item.sub_comments.push(resData);
            }
            return item;
          });
          sale.comments = newComments;
          _this.setData({
            sale: sale
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
  praise:function(e){
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
      if (!res.data.data.error_code){
        let sale = _this.data.sale;
        sale.praise_number += 1;
        _this.setData({
          sale:sale
        });
      }
    });
  }
})
