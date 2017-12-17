const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    image:'tmp/wx46d5674c81153f30.o6zAJs3oh85Zb1lJE8oWix57vny0.2b862a6493fd893b7fbc37bd8dfd424f.jpg',
    baseImageUrl: app.globalData.imageUrl,
    messageList:[]
  },
  onLoad: function (option) {

    let objType = option.type;
    let messageType = option.new_message;
    console.log('对象类型：'+objType);
    console.log('消息类型：' + messageType);

    this.getInboxList(objType, messageType);


  },
  getInboxList: function (type, messageType){
    let _this = this;
    let message_type = messageType;
    app.http('GET', `/user/${type}/inbox/${message_type}`, {}, function (res) {

      console.log('消息列表：'+res.data.data);
      _this.setData({
        messageList:res.data.data
      });

    });

  }
})
