const util = require('./../../../utils/util.js')
const http = require("./../../../utils/http.js");
const qiniuUtil = require("./../../../utils/qiniuToken.js");
const config = require("./../../../config.js");
const app = getApp();

const icon = '/image/get-phone-2.png';

Page({
  data: {
    showCommentInput: false,
    grant_type:'password',
    friendId:'',
    content:'',
    list:[],
    to:12,
    scrollTop:3500,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    imageArray: [],
    baseImageUrl: app.globalData.imageUrl,
    canChat:true,
    canPost:true,

    icon: {
      width: "90rpx",
      height: "90rpx",
      path: icon,
      showImage: false
    },
    qiniu: {
      uploadNumber: 9,
      region: config.region,
      token: '',
      domain: config.qiniuDomain,
      returnAllImage: false
    }
  },
  onLoad: function (option) {
    wx.hideTabBar();
    let cantChat = 0
    let friendId = option.friend_id;
    cantChat = option.can_chat;
    this.setData({
      friendId: friendId,
      canChat:cantChat
    });

    this.setTitle(friendId,cantChat);
    this.getMessageList(friendId);

    let _this = this;
    setTimeout(function () {
      wx.pageScrollTo({
        scrollTop: _this.data.scrollTop
      })
    }, 500); 

    this.getQiNiuToken();
  },

  /**
   * 获取七牛token
   */
  getQiNiuToken: function () {
    qiniuUtil.getQiniuToken(res => {
      let qiniu = this.data.qiniu;
      qiniu.token = res;
      this.setData({ qiniu: qiniu })
    })
  },

  /**
   * 获取上传的图片
   */
  uploadSuccess: function (uploadData) {
    let attachments = [];
    attachments.push(uploadData.detail.key)
    this.send(null,attachments);
  },

  /**
   * 获取删除后的图片
   */
  deleteSuccess: function (uploadData) {
    this.setData({ imageArray: uploadData.detail })
  },

  /**
   * 设置title
   */
  setTitle: function (id,cantChat){
    http.get(`/user/${id}`, {}, res => {
      let name = res.data.data.nickname;
      wx.setNavigationBarTitle({ title: "留言板 | "+name });
    });
  },

  /**
   * 获取消息 
   */
  getMessageList:function(id,oprateType=null){
    let pageSize = this.data.pageSize;
    let pageNumber = this.data.pageNumber;
    http.get(`/message/${id}/list?page_size=${pageSize}&page_number=${pageNumber}`,{},res=>{
        wx.stopPullDownRefresh();
        let data = res.data.data.page_data;
        let list = this.data.list;
        if (oprateType == 'unshift'){
          if(data.length == 0){
            wx.showLoading({
              title: '没有更多记录了~_~',
            })
            setTimeout(function () {
              wx.hideLoading()
            }, 2000)
          }
          data.map(item => {
            list.unshift(item);
          })
        }else{
          data.map(item => {
            list.push(item);
          })
        }
        this.setData({
          list: list,
          pageNumber: this.data.pageNumber + 1
        })
      });
  },

  /**
  * 下拉刷新，获取最新的贴子
  */
  onPullDownRefresh: function () {
    let friendId = this.data.friendId;
    this.getMessageList(friendId,'unshift');
  },

  /**
   * 撤回消息
   */
  deleteContent:function(e){
    let objId = e.currentTarget.dataset.objid;
    wx.showModal({
      title: '提示',
      content: '确定撤回该消息吗',
      success: res=> {
        if (res.confirm) {
          http.httpDelete(`/delete/${objId}/chat_message`,{},res=>{
              let list = this.data.list;
              let newList = list.filter((item, index) => {
                if (item.id != objId) {
                  return item;
                }
              });
              this.setData({
                list: newList
              })
            });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 获取输入内容
   */
  getContent: function (event) {
    let content = event.detail.value;
    this.setData({
      content: content
    })
  },
  /**
   * 发送消息
   */
  send: function (e,attachments=null){
    wx.showLoading({
      title: '发送中',
    });
    let friendId = this.data.friendId;
    let content = this.data.content;
    //let attachments = this.data.imageArray;
    if (content == '' && attachments.length == 0){
      this.setData({ canPost: true })
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
      setTimeout(function () {
        wx.hideLoading();
      }, 1500)
      return false;
    }

    http.post(`/send/${friendId}/message`,{content:content,attachments: attachments?attachments:[]}, res=>{
       this.setData({ canPost:true})
       wx.hideLoading();
       this.setData({
         content:''
       })
       if(res.data.error_code == 0){
        let chatData = this.data.list;
        chatData.push(res.data.data);
        this.setData({
          list:chatData,
          content:''
          })
        setTimeout(res=> {
          wx.pageScrollTo({
            scrollTop: this.data.scrollTop += 1000
          })
        }, 500); 
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
   * 弹出输入框
   */
  comment:function(e){
    this.setData({
      showCommentInput: true
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
})
