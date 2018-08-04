
App({
  onLaunch: function () {

    this.globalData.appKey = '04rNbDIGuBoYcsQn';

    //设置基本接口全局变量

    this.globalData.apiUrl = 'https://lianyan.kucaroom.com/api/wechat';
    //this.globalData.apiUrl = 'http://localhost:8000/api/wechat';
  
    //七牛图片外链域名0
    this.globalData.imageUrl = 'http://image.kucaroom.com/';
    this.globalData.bgIimage = this.globalData.imageUrl+'30269a739a66831daa31ec93d28318af.jpg';

    this.globalData.showNormal=false;
    this.globalData.showAudit=true;

    let token = wx.getStorageSync('token');
    if (!token) {
      let _this = this;
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
              this.globalData.userInfo = res.userInfo

              console.log("用户信息：" + JSON.stringify(res.userInfo));

              wx.request({
                url: this.globalData.apiUrl + '/auth/login?type=weChat',
                header: {
                  'content-type': 'application/json'
                },
                method: 'POST',
                data: {
                  user_info: res.userInfo,
                  code: code,
                  app_id: this.globalData.appKey
                },
                success: function (res) {
                  wx.setStorageSync('token', res.data.data);
                  console.log('token:' + res.data.data);
                  if (_method) {
                    that.http(_method, _url, _data, callback);
                  }

                  if(callback){
                    callback();
                  }
                }
              })
            }
          })
        } else {
          console.log('未授权');
        }
      }
    })
  },

  /** 
  * 封装微信http请求
  */
  http: function (_method, _url, _data, callback) {

    console.log('method：' + _method);

    let token = wx.getStorageSync('token');
    let _this = this;

    wx.request({
      url: this.globalData.apiUrl + _url,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      method: _method,
      data: _data,
      success: function (res) {

        if (res.data.error_code == '4001' || res.data.error_code == '4000') {
          console.log('token过期了');
          _this.login(_method, _url, _data, callback);
        } else {
          callback(res);
        }

      },
      fail: function (res) {
        console.log(res);
        console.log('出错了');
      }
    })

  },

  /** 
   * 获取七牛上传token
   */
  setUploadToken: function (call) {

    this.http('GET', '/upload_token', {}, function (res) {

      console.log('150行：'+res.data);

      if(res.data.data != null){
        var token = res.data.data.uptoken;

        if (call) {
          call(token);
        }

        console.log('设置七牛upload token' + token);

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

    this.http('GET', `/new/${type}/inbox`, {}, function (res) {
      callback(res);
    });

  },

  /**
   * 获取用户最新信息
   */
  getConfig:function(callback){
    wx.request({
      url: this.globalData.apiUrl + '/config?',
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      data: {
        app_id: this.globalData.appKey
      },
      success: function (res) {

        var config = res.data.data

        callback(config);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },

  /**
   * 收集form id
   */
  collectFormId:function(formId){
    this.http('POST', `/save_form_id`, {
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
    showNormal:false,
    showAudit:false,
    postHelp:false
  }
})