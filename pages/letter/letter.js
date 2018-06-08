const util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader");
const uploader = require("../../utils/uploadImage");
const app = getApp();

Page({
  data: {
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
    canChat:true
  },
  onLoad: function (option) {
    
    let cantChat = 0

    let friendId = option.friend_id;
    cantChat = option.can_chat;

    console.log('是否可以聊天：'+cantChat);

    this.setData({
      friendId: friendId,
      canChat:cantChat
    });

    console.log(friendId);

    this.setTitle(friendId,cantChat);
    this.getMessageList(friendId);

    let _this = this;
    setTimeout(function () {
      wx.pageScrollTo({
        scrollTop: _this.data.scrollTop
      })
    }, 500); 

    //this.polling(_this);

  },
  /**
   * 设置title
   */
  setTitle: function (id,cantChat){

    let _this = this;

    if (cantChat != 1){
      app.http('get', `/user/${id}`,
        {},
        function (res) {
          console.log(res.data.data);
          let name = res.data.data.nickname;
          wx.setNavigationBarTitle({ title: name });
        });

    }else{
      wx.setNavigationBarTitle({ title: '匿名の同学' });
    }

  },

  /**
   * 获取消息 
   */
  getMessageList:function(id,oprateType=null){

    let _this = this;

    let pageSize = _this.data.pageSize;
    let pageNumber = _this.data.pageNumber;
    
    app.http('get', `/message/${id}/list?page_size=${pageSize}&page_number=${pageNumber}`,
      {},
      function (res) {

        wx.stopPullDownRefresh();

        console.log(res.data.data);
        let data = res.data.data.page_data;
        let list = _this.data.list;

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

        _this.setData({
          list: list,
          pageNumber: _this.data.pageNumber + 1
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
    console.log('长按事件');

    let objId = e.currentTarget.dataset.objid;
    let _this = this;

    console.log(objId);

    wx.showModal({
      title: '提示',
      content: '确定撤回该消息吗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')

          app.http('delete', `/delete/${objId}/chat_message`,
            {},
            function (res) {

              let list = _this.data.list;
              let newList = list.filter((item, index) => {

                if (item.id != objId) {
                  return item;
                }

              });

              _this.setData({
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
    console.log("评论框输入内容:" + event.detail.value);

    let content = event.detail.value;
    this.setData({
      content: content
    })
  },
  /**
   * 发送消息
   */
  send:function(){

    wx.showLoading({
      title: '发送中',
    });

    let friendId = this.data.friendId;
    let content = this.data.content;
    let attachments = this.data.imageArray;
    let _this = this;

    _this.setData({
      imageArray: []
    })

    console.log(friendId)
    console.log(content)

    if (content == '' && attachments.length == 0){
      return;
    }

    app.http('post', `/send/${friendId}/message`,
     {
       content:content,
       attachments: attachments
     }, 
     function (res) {

       wx.hideLoading();

       _this.setData({
         content:''
       })

      console.log(res.data);

      let chatData = _this.data.list;

      chatData.push(res.data.data);

      _this.setData({
        list:chatData,
        content:''
        })

      setTimeout(function () {
        wx.pageScrollTo({
          scrollTop: _this.data.scrollTop += 1000
        })
      }, 500); 

    });

  },
  /**
   * 轮询
   */
  polling:function(_this){

    let friendId = _this.data.friendId;

    setTimeout(function () {//setInterval
      
      app.http('get', `/new/${friendId}/messages`,
        {},
        function (res) {

          console.log("消息："+res.data);
          let newMessages = res.data.data;
          if(newMessages.length > 0){
            let list = _this.data.list;

            newMessages.map(item => {
              if(item.from_user_id != item.to_user_id){
                list.push(item);
              }
            });

            _this.setData({
              list: list
            })

            setTimeout(function () {
              wx.pageScrollTo({
                scrollTop: _this.data.scrollTop += 700
              })
            }, 500); 
          }

        });

    }, 1000);
  },
  /**
   * 发图片
   */
  sendImage:function(){

      console.log('select image');
      let _this = this;

      wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {

          var filePaths = res.tempFilePaths;
          let position = res.tempFilePaths.length - 1;

          console.log(res.tempFilePaths);

          wx.showLoading({
            title: '发送中',
          })

          filePaths.map((item, index) => {

            uploader.upload(item, key => {
              console.log('上传图片成功的回调');
              console.log(position);
              if (position == index) {
                wx.hideLoading();
              }

              if (key != '' || key != null) {
                //提交到服务器
                let tempImageArray = _this.data.imageArray;
                tempImageArray.push(key)
                _this.setData({
                  imageArray: tempImageArray
                })
                _this.send();
              }
            })

          });

        }
      })
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
})
