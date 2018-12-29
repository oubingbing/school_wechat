
const app = getApp();
const http = require("./../../../utils/http.js");
const qiniuUtil = require("./../../../utils/qiniuToken.js");
const config = require("./../../../config.js");

Page({
  data: {
    logs: [],
    imageArray: [],
    uploadToken: null,
    attachments: [],
    textContent: '',
    objId:'',
    icon: {
      width: "100rpx",
      height: "100rpx",
      path: "",
      showImage: true
    },
    qiniu: {
      uploadNumber: 9,
      region: config.region,
      token: '',
      domain: config.qiniuDomain
    }
  },

  onLoad: function (options) {
    let id = options.id;
    this.setData({
      objId: id
    });

  },

  onShow: function () {
    this.getQiNiuToken();
  },

  /**
 * 获取上传的图片
 */
  uploadSuccess: function (uploadData) {
    console.log(uploadData)
    this.setData({ imageArray: uploadData.detail })
  },

  /**
   * 获取删除后的图片
   */
  deleteSuccess: function (uploadData) {
    this.setData({ imageArray: uploadData.detail })
  },

  /**
   * 获取七牛token
   */
  getQiNiuToken: function () {
    qiniuUtil.getQiniuToken(res => {
      let qiniu = this.data.qiniu;
      qiniu.token = res;
      this.setData({ qiniu: qiniu })
    })
  },

  /** 提交 */
  post: function () {
    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let id = this.data.objId;

    //获取图片
    this.data.imageArray.map(item => {
      attachments.push(item.uploadResult.key)
    })

    if (content == '') {
      wx.showToast({
        title: '文字内容不能为空',
        icon: 'none'
      })
      this.setData({ canPost: true })
      setTimeout(function () {
        wx.hideLoading();
      }, 1500)
      return false;
    }

    http.post('/comment', {
      content: content,
      attachments: attachments,
      type:5,
      obj_id: id,
    }, res => {
      let resData = res.data;
      wx.navigateBack({ comeBack: true });
      console.log(res);
    });

  },

  /**
   * 预览图片
   */
  previewImage: function (event) {
    let url = event.target.id;
    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /**
   * 获取输入内容
   */
  getTextContent: function (event) {
    let value = event.detail.value;
    this.setData({
      textContent: value
    });
  }
})