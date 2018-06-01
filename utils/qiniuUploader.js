//qiniu upload

// created by gpake
(function () {

  var config = {
    qiniuRegion: '',
    qiniuImageURLPrefix: '',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: '',
    qiniuUploadTokenFunction: null,
    qiniuShouldUseQiniuFileName: false
  }

  let app = getApp();

  module.exports = {
    init: init,
    upload: upload,
  }

  // 在整个程序生命周期中，只需要 init 一次即可
  // 如果需要变更参数，再调用 init 即可
  function init(options) {
    config = {
      qiniuRegion: '',
      qiniuImageURLPrefix: '',
      qiniuUploadToken: '',
      qiniuUploadTokenURL: '',
      qiniuUploadTokenFunction: null,
      qiniuShouldUseQiniuFileName: false
    };
    updateConfigWithOptions(options);

    console.log('int:' + options);
  }

  function updateConfigWithOptions(options) {

    console.log(JSON.stringify(options));

    if (options.region) {

      config.qiniuRegion = options.region;

    } else {

      console.error('qiniu uploader need your bucket region');

    }
    if (options.uptoken) {

      config.qiniuUploadToken = options.uptoken;

    } else if (options.uptokenURL) {

      config.qiniuUploadTokenURL = options.uptokenURL;

    } else if (options.uptokenFunc) {

      config.qiniuUploadTokenFunction = options.uptokenFunc;

    }
    if (options.domain) {

      config.qiniuImageURLPrefix = options.domain;

    }
    config.qiniuShouldUseQiniuFileName = options.shouldUseQiniuFileName
  }

  function upload(filePath, success, fail, options) {

    console.log('options:' + options);

    if (null == filePath) {
      console.error('qiniu uploader need filePath to upload');
      return;
    }
    if (options) {
      updateConfigWithOptions(options);
    }
    if (config.qiniuUploadToken) {
      doUpload(filePath, success, fail, options);
    } else if (config.qiniuUploadTokenURL) {
      getQiniuToken(function () {
        doUpload(filePath, success, fail, options);
      });
    } else if (config.qiniuUploadTokenFunction) {
      config.qiniuUploadToken = config.qiniuUploadTokenFunction();
      if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
        console.error('qiniu UploadTokenFunction result is null, please check the return value');
        return
      }
    } else {
      console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
      return;
    }
  }

  function doUpload(filePath, success, fail, options) {

    if(!config.qiniuUploadToken){
      config.qiniuUploadToken = wx.getStorageSync('uploadToken');
    }

    if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
      console.error('qiniu UploadToken is null, please check the init config or networking');
      return
    }
    var url = uploadURLFromRegionCode(config.qiniuRegion);
    var fileName = filePath.split('//')[1];
    if (options && options.key) {
      fileName = options.key;
    }
    var formData = {
      'token': config.qiniuUploadToken
    };
    if (!config.qiniuShouldUseQiniuFileName) {
      formData['key'] = fileName
    }

    console.log('发送中');

    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'file',
      formData: formData,
      success: function (res) {
        console.log('success:' + res);
        var dataString = res.data
        try {
          var dataObject = JSON.parse(dataString);
          //do something
          var imageUrl = config.qiniuImageURLPrefix + '/' + dataObject.key;
          dataObject.imageURL = imageUrl;
          console.log(dataObject);
          if (success) {
            success(dataObject);
          }
        } catch (e) {
          console.log('parse JSON failed, origin String is: ' + dataString)
          if (fail) {
            fail(e);
          }
        }
      },
      fail: function (error) {
        console.error(error);
        if (fail) {
          fail(error);
        }
      }
    })
  }

  function getQiniuToken(callback) {

    const uploadToken = app.getUploadToken();

    config.qiniuUploadToken = uploadToken;
    if (callback) {
      callback();
    }


  }

  function uploadURLFromRegionCode(code) {
    var uploadURL = null;
    switch (code) {
      case 'ECN': uploadURL = 'https://up.qbox.me'; break;
      case 'NCN': uploadURL = 'https://up-z1.qbox.me'; break;
      case 'SCN': uploadURL = 'https://up-z2.qbox.me'; break;
      case 'NA': uploadURL = 'https://up-na0.qbox.me'; break;
      default: console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
    }
    return uploadURL;
  }

})();