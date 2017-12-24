const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    grant_type:'password',
    friendId:'',
    content:'',
    list:[],
    to:12
  },
  onLoad: function (option) {
    
    let friendId = option.friend_id;

    this.setData({
      friendId: friendId
    });

    console.log(friendId);

    this.getMessageList(friendId);

  },
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

    });

  }
})
