
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
    attachments:'',
    canFollow:true,
    param: app.globalData.param
  },
  onLoad: function (option) {
    this.setData({ param: app.globalData.param})
    console.log(app.globalData.param)
    let objId = option.id;
    this.setData({
      objId: objId,
    });
    this.getDetail()
  },

  getDetail:function() {
    http.get(`/sale_friend/${this.data.objId}`, {}, res => {
      let data = res.data.data;
      data.comments = data.comments.reverse();
      this.setData({
        sale: data,
      });
    });
  },

  openUserInfo:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal/user_info/personal?id=' + id
    })
  },

  /**
   * 删除评论
   */
  deleteMainComment: function (e) {
    let commentId = e.currentTarget.dataset.refid;
    let that = this
    let objId = this.data.objId
    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${commentId}/comment`, {}, res => {
            if (res.data.data == 1) {
              http.get(`/sale_friend/${objId}`, {}, resp => {
                let dataNew = resp.data.data;
                dataNew.comments = dataNew.comments.reverse();
                that.setData({
                  sale: dataNew,
                });
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
  deleteSale: function (e) {
    let id = this.data.sale.id;
    wx.showModal({
      title: '提示',
      content: '确认删除?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${id}/sale_friend`, {}, res => {
            console.log(res.data)
            if (res.data.error_code == 0) {
              app.globalData.reloadSale = true;
              wx.navigateBack({ comeBack: true });
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
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id + '&can_chat=' + true
    })
  },

  /**
   * 关注
   */
  follow: function (e) {
    if (this.data.canFollow == false){
      return false;
    }

    this.setData({ canFollow: false})

    let objId = this.data.sale.id;
    http.post('/follow', {
      obj_id: objId,
      obj_type: 2
    }, res=> {
      let sale = this.data.sale;
      sale.follow = false;
      sale.follow_number += 1
      this.setData({ sale: sale, canFollow:true});
    });
  },

  /**
 * 取消关注
 */
  cancelFollow: function (e) {
    if (this.data.canFollow == false) {
      return false;
    }

    this.setData({ canFollow: false })

    let objId = this.data.sale.id;
    http.put(`/cancel/${objId}/follow/2`, {}, res=> {
      let sale = this.data.sale;
      sale.follow = true;
      sale.follow_number -= 1
      this.setData({ sale: sale, canFollow: true });
    })
  },

  /** 
   * 预览图片
   */
  previewImage: function (event) {
    let url = event.target.id;
    console.log(url)
    wx.previewImage({
      current: '',
      urls: [url]
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
    wx.showModal({
      title: '提示',
      content: '确认删除该评论?',
      success: function (res) {
        if (res.confirm) {
          http.httpDelete(`/delete/${commentId}/comment`, {}, res => {
            if (res.data.data == 1) {
              let sale = this.data.sale;
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
              this.setData({
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

    http.post('/comment', {
      content: content,
      obj_id: objId,
      type: objType,
      ref_comment_id:refCommentId
    }, res=> {
      wx.hideLoading();
      let resData = res.data.data;

      if(res.data.error_code == 0){
        if (!resData.error_code){
          let sale = this.data.sale;
          if (resData.obj_type == 2){
            let data = resData;
            sale.comments.unshift(data);
            sale.comment_number += 1;
            this.setData({
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
            this.setData({
              sale: sale
            });
          }
          this.setData({
            content: '',
            objId: '',
            objType: '',
            showCommentInput: false
          });
        }
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
    http.post(`/praise`,
      { obj_id: objId, obj_type: objType },
      res => {
      if (!res.data.data.error_code){
        let sale = this.data.sale;
        sale.praise_number += 1;
        this.setData({
          sale:sale
        });
      }
    });
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    return {
      title: "卖舍友啦，便宜又好看，五毛钱一个清仓大甩卖...",
      path: '/pages/home/index/index?type=sale_friend&id=' + this.data.sale.id,
      imageUrl: this.data.baseImageUrl+this.data.sale.attachments[0],
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 跳转到私信
   */
  letter: function (e) {
    let id = e.target.dataset.objid;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },
})
