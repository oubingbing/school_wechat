
App({
  onLaunch: function () {

    console.log('app');

    //设置基本接口全局变量
    //this.globalData.apiUrl = 'https://www.kucaroom.com/api/wechat';
    this.globalData.apiUrl = 'http://school.dev/api/wechat';

  
    //七牛图片外链域名
    this.globalData.imageUrl = 'http://image.kucaroom.com/';
    this.globalData.bgIimage = this.globalData.imageUrl +'30269a739a66831daa31ec93d28318af.jpg';

    let token = wx.getStorageSync('token');
    if (!token) {
      let _this = this;
      this.login();
    } else {
      console.log('token=' + token);
    }

  },

  /** 登录 */
  login: function () {

    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res);
        wx.request({
          url: this.globalData.apiUrl + '/auth/login?type=weChat', //仅为示例，并非真实的接口地址
          header: {
            'content-type': 'application/json' // 默认值
          },
          method: 'POST',
          data: {
            code: res.code
          },
          success: function (res) {
            console.log(res.data);
            let openId = res.data.data;

            //获取token
            _this.getToken(_this, openId);
          }
        })
      }
    })

  },

  /** 获取token */
  getToken: function (_this, openId,callback=null) {

    console.log('function getToen');

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              _this.globalData.userInfo = res.userInfo

              console.log('用户openid' + openId);

              wx.request({
                url: _this.globalData.apiUrl + '/auth/token',
                header: {
                  'content-type': 'application/json'
                },
                method: 'POST',
                data: {
                  open_id: openId,
                  user_info: res.userInfo
                },
                success: function (res) {
                  console.log(res.data);
                  wx.setStorageSync('token', res.data.data);

                  console.log('获得token');

                  if(callback){
                    callback(res.data.data);
                  }
                }
              })

            }
          })
        }
      }
    })

  },

  /**刷新本地token**/
  refreshToken: function (_this, _app, callback = null) {

    console.log('刷新token');

    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res);
        wx.request({
          url: _app.globalData.apiUrl + '/auth/login?type=weChat',
          header: {
            'content-type': 'application/json'
          },
          method: 'POST',
          data: {
            code: res.code
          },
          success: function (res) {
            console.log(res.data);
            let openId = res.data.data;

            //获取新的token
            wx.getUserInfo({
              success: res => {
                wx.request({
                  url: _app.globalData.apiUrl + '/auth/token',
                  header: {
                    'content-type': 'application/json'
                  },
                  method: 'POST',
                  data: {
                    open_id: openId,
                    user_info: res.userInfo
                  },
                  success: function (res) {
                    console.log(res.data);
                    wx.setStorageSync('token', res.data.data);

                    if (callback) {
                      callback(res);
                    }

                  }
                })

              }
            })

          }
        })
      }
    })

  },

  /** 封装微信http请求 */
  http: function (_method, _url, _data, callback) {

    let token = wx.getStorageSync('token');
    let _this = this;

    console.log('http token:' + token);

    wx.request({
      url: this.globalData.apiUrl + _url,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      method: _method,
      data: _data,
      success: function (res) {

        console.log(res.data);

        if (res.data.error_message) {

          if (res.data.error_code == 4000) {
            console.log('token非法');
            setTimeout(function(){
              _this.refreshToken(_this, _this, _this.http(_method, _url, _data, callback));
            },2000);
          }

          if (res.data.error_code == 4004) {
            console.log('未授权');
            setTimeout(function(){
              _this.refreshToken(_this, _this, _this.http(_method, _url, _data, callback));
            },2000);
          }

          if (res.data.error_code == 4001) {
            console.log('token过期了');
            setTimeout(function(){
              _this.refreshToken(_this, _this, _this.http(_method, _url, _data, callback));
            },2000);
          }

          if (res.data.error_code == 5000) {
            console.log('token缺失');
            setTimeout(function(){
              _this.refreshToken(_this, _this, _this.http(_method, _url, _data, callback));
            },2000);
          }

        }else{
          wx.hideLoading();
          callback(res);
        }
    
      }
    })

  },

  /** 获取七牛上传token */
  setUploadToken: function (call) {

    this.http('GET', '/upload_token', {}, function (res) {

      var token = res.data.data.uptoken;

      call(token);

      console.log('设置七牛upload token' + token);

      wx.setStorageSync('uploadToken', token);

    });

  },

  /** 获取七牛上传token */
  getUploadToken: function (callback) {

    this.setUploadToken(callback);

  },

  /**
   * 获取新的消息盒子
   */
  getNewInbox:function(type,callback){

    this.http('GET', `/new/${type}/inbox`, {}, function (res) {

      console.log(res);

      callback(res);

    });

  },

  globalData: {
    userInfo: null,
    apiUrl: null,
    color: '0aecc3',
    imageUrl:'',
    bgImage:''
  }
})