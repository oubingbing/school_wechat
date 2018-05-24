//upload image

const app = getApp();
const qiniuUploader = require("qiniuUploader.js");

let uploadToken = '';
app.getUploadToken(token => {
  uploadToken = token;
});

// 初始化七牛相关参数
function initQiniu() {
  var options = {
    region: 'SCN', // 华北区
    uptokenURL: app.globalData.apiUrl + '/upload_token',
    uptoken: uploadToken,
    domain: 'http://school.bkt.clouddn.com',
    shouldUseQiniuFileName: false
  };
  qiniuUploader.init(options);
}

/** 上传图片 */
function uploadImage(image, callback = null) {

  initQiniu();

  let filePath = image;

  qiniuUploader.upload(filePath, (res) => {

    let url = res.key;
    console.log(url);

    callback(res.key);

  });

}


module.exports = {
  upload: uploadImage
}