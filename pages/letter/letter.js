const util = require('../../utils/util.js')
const app = getApp();

Page({
  data: {
    grant_type:'password',
    friendId:'',
    content:'',
    list:[],
    to:12,
    scrollTop:1200
  },
  onLoad: function (option) {
    
    let friendId = option.friend_id;

    this.setData({
      friendId: friendId
    });

    console.log(friendId);

    this.setTitle(friendId);

    this.getMessageList(friendId);

    let _this = this;
    setTimeout(function () {
      wx.pageScrollTo({
        scrollTop: _this.data.scrollTop
      })
    }, 500); 

    this.polling(_this);

  },
  /**
   * 设置title
   */
  setTitle: function (id){

    let _this = this;

    app.http('get', `/user/${id}`,
      {},
      function (res) {

        console.log(res.data.data);
        let name = res.data.data.nickname;
        wx.setNavigationBarTitle({ title: name });

      });

  },

/**
 * 获取消息 
 */
getMessageList:function(id){

    let _this = this;

    app.http('get', `/message/${id}/list`,
      {},
      function (res) {

        console.log(res.data.data);
        let data = res.data.data;

        _this.setData({
          list:data
        })
        
      });

  },
  /** 获取输入内容 */
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
    let friendId = this.data.friendId;
    let content = this.data.content;
    let _this = this;

    console.log(friendId)
    console.log(content)

    app.http('post', `/send/${friendId}/message`,
     {
       content:content,
       attachments:''
     }, 
     function (res) {
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
          scrollTop: _this.data.scrollTop += 700
        })
      }, 500); 

    });

  },
  /**
   * 轮询
   */
  polling:function(_this){

    let friendId = _this.data.friendId;

    setInterval(function(){
      
      app.http('get', `/new/${friendId}/messages`,
        {},
        function (res) {

          console.log("消息："+res.data);
          let newMessages = res.data.data;
          if(newMessages.length > 0){
            let list = _this.data.list;

            newMessages.map(item => {
              list.push(item);
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

    }, 5000);
  }
})
