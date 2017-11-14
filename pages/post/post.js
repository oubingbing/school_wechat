
const app = getApp();
const qiniuUploader = require("../../utils/qiniuUploader");
const upload = require("../../utils/upload");
const uploadToken = app.getUploadToken();

console.log('post七牛token'+uploadToken);

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
  console.log('post int');
}

Page({
  data: {
    logs: [],
    imageArray: [],
    uploadToken: null
  },
  onLoad: function () {

    //设置七牛上传token
    app.setUploadToken();

  },

  /** 提交 */
  post:async function () {

    console.log('post');

    let qiNiuImageUrl = [];
    let imageArray = this.data.imageArray;

    console.log('upload'+upload);


    let result = await upload.upload(imageArray);

    console.log(result);

  

  },



  /** 异步上传图片 */
  asyncUploadImage:async function(){

    initQiniu();

    return new Promise(function(resolve, reject) {

    let filePath = this.data.imageArray[0];

    qiniuUploader.upload(filePath, (res) => {

    let url = res.imageURL;
     console.log(url);

     resolve(url);

     }, (error) => {

      console.error('error: ' + JSON.stringify(error));

      reject('网络错误，请重试');

    });

    });

  },

  /** 选择图片 */
  selectImage: function () {

    console.log('select image');
    let _this = this;

    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        let temArray = _this.data.imageArray;

        var filePaths = res.tempFilePaths;

        filePaths.map(item=>{
          temArray.push(item);
        });

        _this.setData({
          imageArray: temArray
        });

        console.log(filePaths);
      }
    })

  },

  /** 预览图片 */
  previewImage: function (event) {

    console.log(event.target.id);

    let url = event.target.id;

    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /** 移除图片 */
  removeImage: function (event) {
    console.log(event.target.id);

    let id = event.target.id;
    let arr = this.data.imageArray;

    let newArray = arr.filter((item, index) => {
      if (index != id) {
        return item;
      }
    });

    this.setData({
      imageArray: newArray
    });

  }

})