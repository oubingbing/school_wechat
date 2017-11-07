//app.js
App({
  onLaunch: function () {

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);

    //设置基本接口全局变量
    this.globalData.apiUrl = 'https://www.kucaroom.com/api/wechat';
    //this.globalData.apiUrl = 'http://school.dev/api/wechat';
    console.log(this.globalData.apiUrl);

    let token = wx.getStorageSync('token');
    if(!token){
      let _this = this;
      this.login(_this);
    }else{
      console.log('token='+token);
    }

  },
  login:function(_this){

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
  getToken: function (_this, openId){

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
                }
              })

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (_this.userInfoReadyCallback) {
                _this.userInfoReadyCallback(res);
                console.log('回调');
              }
            }
          })
        }
      }
    })

  },
  refreshToken:function(_this,_app){

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
                  }
                })

              }
            })


          }
        })
      }
    })

  },
  http:function(_method,_url,_data,callback){

    wx.request({
      url: _url,
      header: {
        'content-type': 'application/json'
      },
      method: _method,
      data: _data,
      success: function (res) {
        console.log(res.data);
        wx.setStorageSync('token', res.data.data);
        callback();
      }
    })

  },
  globalData: {
    userInfo: null,
    apiUrl:null,
    color:'0aecc3'
  }
})