//upload js


const app = getApp();
const qiniuUploader = require("qiniuUploader.js");

// 初始化七牛相关参数
function initQiniu() {
  var options = {
    region: 'SCN', // 华北区
    uptokenURL: app.globalData.apiUrl + '/upload_token',
    // uptoken: 'xxxx',
    domain: 'http://school.bkt.clouddn.com',
    shouldUseQiniuFileName: false
  };
  qiniuUploader.init(options);
}


/** 异步上传单张图片 */
let asyncUploadImage = async function (image) {

  initQiniu();

  return new Promise(function (resolve, reject) {

    let filePath = image;

    qiniuUploader.upload(filePath, (res) => {

      let url = res.key;
      console.log(url);

      resolve(url);

    }, (error) => {

      console.error('error: ' + JSON.stringify(error));

      reject('网络错误，请重试');

    });

  });

}

/** 异步上传所有的图片 */
let uploadAll = async function (imageArray) {

  let _this = this;

  let promises = imageArray.map((item) => {
    return getImageUrl(item);
  });

  let results = await Promise.all(promises);

  console.log(results);

  return results;

}

/** 获取七牛返回的图片url */
let getImageUrl = async function (image) {

  console.log('get image url');

  let qiNiuImageUrl = null;

  await asyncUploadImage(image).then(url => {

    qiNiuImageUrl = url;

  }, error => {

    qiNiuImageUrl = error;

  });

  return qiNiuImageUrl;

}


module.exports = {
  upload: uploadAll
}