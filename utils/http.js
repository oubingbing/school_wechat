const config = require("./../config.js");
const app = getApp();

/**
* 登录获取token
*/
const login = function (_method = null, _url = null, _data = null, callback = null) {
  getUserInfo(_method, _url, _data, callback);
}

/**
* 获取用户信息 
*/
const getUserInfo = function (_method = null, _url = null, _data = null, callback = null) {
  console.log('get user info');
  let that = this;
  console.log("内容")
  wx.getUserProfile({
    desc: '用于完善会员资料',
    success: res => {
      wx.login({
        success: loginResult => { // 发送 res.code 到后台换取 openId, sessionKey, unionId
          post("/auth/login_v2?type=weChat", {
            encrypted_data: res.encryptedData,
            code: loginResult.code,
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

        },
        fail:res=>{
          console.log(res);
        }
      })
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
            url: '/pages/personal/index_2/personal?status=ture'
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

