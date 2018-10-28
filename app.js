const config = require("./config.js");
const http = require("./utils/http.js");

App({
  onLaunch: function () {

    this.globalData.apiUrl = config.domain;
    this.globalData.appKey = config.alianceKey;
    this.globalData.imageUrl = config.qiniuDomain;
    this.globalData.bgIimage = config.bgImage;

    let token = wx.getStorageSync('token');
    if (!token) {
      this.login();
    } else {
      console.log('token=' + token);
    }
  },

  /**
  * 登录获取token
  */
  login: function (_method = null, _url = null, _data = null, callback = null) {
    http.login(_method,_url,_data,callback)
  },

  /** 
   * 获取七牛上传token
   */
  setUploadToken: function (call) {
    http.get('/upload_token', {}, function (res) {
      if(res.data.data != null){
        var token = res.data.data.uptoken;
        if (call) {
          call(token);
        }
        wx.setStorageSync('uploadToken', token);
      }
    });
  },

  /** 
   * 获取七牛上传token
   */
  getUploadToken: function (callback) {
    this.setUploadToken(callback);
  },

  /**
   * 获取新的消息盒子
   */
  getNewInbox:function(type,callback){
    http.get( `/new/${type}/inbox`, {}, function (res) {
      callback(res);
    });
  },

  /**
   * 收集form id
   */
  collectFormId:function(formId){
    http.post( `/save_form_id`, {
      form_id:formId
    }, function (res) {
      console.log(res);
    });
  },

  globalData: {
    appId:null,
    userInfo: null,
    apiUrl: null,
    color: '0aecc3',
    imageUrl:'',
    bgImage:'',
    changeSchoolPost:false,
    changeSchoolSale: false,
    changeSchoolMatch: false,
    postHelp:false
  }
})