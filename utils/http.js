const config = require("./../config.js");
const app = getApp();

/**
* 登录获取token
*/
const login = function (_method = null, _url = null, _data = null, callback = null) {
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      console.log(res);
      getUserInfo(res.code, _method, _url, _data, callback);
    }
  })
}

/**
* 获取用户信息 
*/
const getUserInfo = function (code, _method = null, _url = null, _data = null, callback = null) {
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
            post("/auth/login_v2?type=weChat", {
              encrypted_data: res.encryptedData,
              code: code,
              iv: res.iv,
              app_id: config.alianceKey
            }, function (res) {
              wx.setStorageSync('token', res.data.data);
              console.log('token:' + res.data.data);
              if (_method) {
                httpRequest(_method, _url, _data, callback);
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
}

/**
 * get
 */
const get=function ( _url, _data, callback) {
  httpRequest("GET",_url,_data,callback);
}

/**
 * post
 */
const post = function (_url, _data, callback) {
  httpRequest("POST", _url, _data, callback);
}

/**
 * put
 */
const put = function (_url, _data, callback) {
  httpRequest("PUT", _url, _data, callback);
}

/**
 * delete
 */
const httpDelete = function (_url, _data, callback) {
  httpRequest("DELETE", _url, _data, callback);
}

/**
 * patch
 */
const patch = function (_url, _data, callback) {
  httpRequest("PATCH", _url, _data, callback);
}

/** 
* 封装微信http请求
*/
const httpRequest=function (_method, _url, _data, callback) {
  _data.app_code = config.alianceKey
  let token = wx.getStorageSync('token');
  let _this = this;
  wx.request({
    url: config.domain + _url,
    header: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    method: _method,
    data: _data,
    success: function (res) {
      if (res.data.error_code == '5000') {
        app.globalData.authStatus = true;
        callback(res);
        wx.showToast({
          title: res.data.error_message,
          icon:"none"
        })
        setTimeout(res=>{
          wx.switchTab({
            url: '/pages/personal/index/personal?status=ture'
          })
        },1500)
        //login(_method, _url, _data, callback);
      } else {

        if (res.data.error_code != 0) {
          wx.showToast({
            title: res.data.error_message,
            icon:"none"
          })
        }

        callback(res);
      }
    },
    fail: function (res) {
      console.log(res);
    }
  })
}

/**
 * 获取新的消息盒子
 */
const getNewInbox = function(type, callback) {
  this.get(`/new/${type}/inbox`, {}, function (res) {
    callback(res);
  });
}

/**
 * 收集form id
 */
const collectFormId = function(formId) {
  this.post(`/save_form_id`, {
    form_id: formId
  }, function (res) {
    console.log(res);
  });
}

module.exports = { get, post, patch, put, httpDelete, httpRequest, login, getNewInbox,collectFormId}

