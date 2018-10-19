const config = require("./../config.js");

const get=function ( _url, _data, callback) {
  httpRequest("GET",_url,_data,callback);
}

const post = function (_url, _data, callback) {
  httpRequest("POST", _url, _data, callback);
}

const put = function (_url, _data, callback) {
  httpRequest("PUT", _url, _data, callback);
}

const httpDelete = function (_url, _data, callback) {
  httpRequest("DELETE", _url, _data, callback);
}

const patch = function (_url, _data, callback) {
  httpRequest("PATCH", _url, _data, callback);
}
/** 
* 封装微信http请求
*/
const httpRequest=function (_method, _url, _data, callback) {
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
}

module.exports = { get, post, patch, put, httpDelete, httpRequest}

