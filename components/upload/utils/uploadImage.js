//upload image

const uploadDomain = 'http://image.kucaroom.com/';
const qiniuUploader = require("qiniuUploader.js");

let uploadToken = '我是七牛token';

// 初始化七牛相关参数
function initQiniu(configs) {
  var options = {
    region: configs.region, // 华北区
    uptoken: configs.token,
    domain: configs.domain,
    shouldUseQiniuFileName: false
  };
  qiniuUploader.init(options);
}

/** 上传图片 */
function uploadImage(configs,image, callback = null) {
  initQiniu(configs);
  let filePath = image;
  qiniuUploader.upload(filePath, (res) => {
    callback(res);
  });
}


module.exports = {
  upload: uploadImage
}