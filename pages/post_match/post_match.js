//logs.js
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    me: '',
    ta: '',
    content:'',
    privation:false
  },
  onLoad: function () {

  },
  getMe: function (event) {
    let value = event.detail.value;
    console.log(value);
    this.setData({
      me: value
    });
  },
  getTa: function (event) {
    let value = event.detail.value;
    console.log(value);
    this.setData({
      ta: value
    });
  },
  getContent: function (event) {
    let value = event.detail.value;
    console.log(value);
    this.setData({
      content: value
    });
  },

  /** 
   * 设置是否匿名
   */
  setPrivate: function (event) {
    console.log(event.detail.value);

    this.setData({
      privation: event.detail.value
    });
  },
  
  /**
   * 提交
   */
  post:function(event){

    let me = this.data.me;
    let ta = this.data.ta;
    let content = this.data.content;
    let privation = this.data.privation;

    if(me == ''){
      wx.showLoading({
        title: '你的名字不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 2000);
    }

    if(ta == ''){
      wx.showLoading({
        title: 'ta的名字不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 2000);
    }

    wx.showLoading({
      title: '发送中',
    })

    app.http('post', '/match_love', {
      match_name: ta,
      username:me,
      content:content,
      privation: privation
    }, res => {
      wx.hideLoading();
      console.log(res);

      if(res.data.data != null){
        wx.navigateTo({
          url: `/pages/match_result/match_result?id=${res.data.data.id}`
        })
      }else{
        wx.navigateBack({ comeBack: true });
      }

    });

  }

})
