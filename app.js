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
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res);
        this.getUserInfo(res.code, _method, _url, _data, callback);
      }
    })
  },

  /**
  * 获取用户信息 
  */
  getUserInfo: function (code, _method = null, _url = null, _data = null, callback = null) {
    console.log('get user info');
    let that = this;
    wx.getSetting({
      success: res => {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
<<<<<<< HEAD
              this.globalData.userInfo = res.userInfo;

              console.log("数据" + JSON.stringify(res))

=======
              this.globalData.userInfo = res.userInfo
>>>>>>> 86b4fccd908d5c14e6e9800ad9c0366381149927
              http.post("/auth/login_v2?type=weChat", {
                encrypted_data: res.encryptedData,
                code: code,
                iv: res.iv,
                app_id: this.globalData.appKey
              }, function (res) {
                wx.setStorageSync('token', res.data.data);
                console.log('token:' + res.data.data);
                if (_method) {
                  that.http(_method, _url, _data, callback);
                }
                if (callback) {
                  //回调函数
                  callback();
                }
              });

            }
          })
        } else {
          console.log('未授权');
        }
      }
    })
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