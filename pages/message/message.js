const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    image:'tmp/wx46d5674c81153f30.o6zAJs3oh85Zb1lJE8oWix57vny0.2b862a6493fd893b7fbc37bd8dfd424f.jpg',
    baseImageUrl: app.globalData.imageUrl,
    messageList:[],
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
  },
  onLoad: function (option) {

    let objType = option.type;
    let messageType = option.new_message;
    console.log('对象类型：'+objType);
    console.log('消息类型：' + messageType);

    this.getInboxList(objType, messageType);
  },
  /**
   * 获取消息列表
   */
  getInboxList: function (type, messageType){

    let _this = this;
    let message_type = messageType;
    app.http('GET', 
    `/user/${type}/inbox/${message_type}?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}`,
     {}, function (res) {

       _this.setData({
         showGeMoreLoadin: false
       });

      console.log('消息列表：'+res.data.data);

      let inboxs = res.data.data.page_data;
      let messageList = _this.data.messageList;

      if (inboxs.length == 0){
        _this.setData({
          notDataTips: true
        });
      }

      inboxs.map(item=>{
        messageList.push(item);
      });

      _this.setData({
        messageList: messageList,
        pageNumber: _this.data.pageNumber + 1,
      });

    });

  },
  /**
  * 上拉加载跟多
  */
  onReachBottom: function () {

    console.log('到底了');

    this.getInboxList();

    this.setData({
      showGeMoreLoadin: true
    });

  },
  /**
   * 打开详情
   */
  opendDetail:function(e){
    let objType = e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;
    console.log(objType);
    console.log(e);

    if (objType == 1){
        wx.navigateTo({
          url: `/pages/post_detail/post_detail?id=${id}`
        })
    }

    if (objType == 2) {
      wx.navigateTo({
        url: `/pages/comment_sale/comment_sale?id=${id}`
      })
    }

    if (objType == 3) {
      wx.navigateTo({
        url: `/pages/match_detail/match_detail?id=${id}`
      })
    }

  }
})
