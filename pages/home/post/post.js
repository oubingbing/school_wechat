const app = getApp();
const http = require("./../../../utils/http.js");
const qiniuUtil = require("./../../../utils/qiniuToken.js");
const config = require("./../../../config.js");

Page({
  data: {
    logs: [],
    imageArray: [],
    attachments: [],
    private: false,
    textContent: '',
    name: '',
    phone:'',
    param: app.globalData.param,

    icon: {
      width: "100rpx",
      height: "100rpx",
      path: "/image/select-image.png",
      showImage:true
    },
    qiniu: {
      uploadNumber: 9,
      region: config.region,
      token: '',
      domain: config.qiniuDomain,
      returnAllImage: true
    },
    canPost:true
  },
  onLoad: function () {

  },
  onShow: function () {
    this.getQiNiuToken()    
  },

  /**
   * 获取上传的图片
   */
  uploadSuccess:function(uploadData){
    console.log(uploadData)
    this.setData({ imageArray:uploadData.detail})
  },

  /**
   * 获取删除后的图片
   */
  deleteSuccess:function(uploadData){
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
    this.setData({ canPost:false})
    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let privateValue = this.data.private;
    let username = this.data.name;
    let mobile = this.data.phone;

    //获取图片
    this.data.imageArray.map(item=>{
      attachments.push(item.uploadResult.key)
    })

    if(content == '' && attachments == ''){
      wx.showLoading({
        title: '内容不能为空！',
      });
      this.setData({ canPost: true })
      setTimeout(function(){
        wx.hideLoading();
      },1500)
      return false;
    }

    wx.showLoading({
      title: '发送中..'
    });

    http.post('/post', {
      content: content,
      attachments: attachments,
      private: privateValue,
      username: username,
      mobile:mobile
    }, res => {
      this.setData({ canPost: true })
      wx.hideLoading();
      console.log(res);
      if(res.data.error_code == 0){
        app.globalData.reloadHome = true;
        wx.navigateBack({ comeBack: true });
      }else{
        wx.showToast({
          title: res.data.error_message,
          icon:'none'
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500)
      }
    });

  },
  getName: function (event) {
    let value = event.detail.value;
    this.setData({
      name: value
    });
  },
  getPhone: function (event){
    let value = event.detail.value;
    this.setData({
      phone: value
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
   * 设置是否匿
   */
  setPrivate: function (event) {
    this.setData({
      private: event.detail.value
    });
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