
const app = getApp();
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

    console.log(option);

    let objId = option.id;

    app.http('get', `/sale_friend/${objId}`, {}, res => {
      
      console.log(res);

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
    console.log('inde-hiddenComment：触摸后移动');
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

    console.log(e)

    console.log('评论人的Id:'+refId);

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

              console.log(sale);

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
    console.log("评论框输入内容:" + event.detail.value);

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

    console.log(refCommentId);

    app.http('post', '/comment', {
      content: content,
      obj_id: objId,
      type: objType,
      ref_comment_id:refCommentId
    }, function (res) {

      wx.hideLoading();

      console.log('返回的评论内容');
      console.log(res);

      let resData = res.data.data;

      if (!resData.error_code){

        let sale = _this.data.sale;

        console.log(resData);

        if (resData.obj_type == 2){
          console.log('评论贴子')
          let data = resData;
          sale.comments.unshift(data);
          sale.comment_number += 1;

          _this.setData({
            sale: sale
          });
        }else{

          console.log('评论评论');
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
