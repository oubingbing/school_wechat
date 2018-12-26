
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
    private: false,
    textContent: '',
    name: '',
    profile:null,
    title:'',
    salary:0,

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

  onLoad: function () {
  },  

  onShow: function () {
    this.getQiNiuToken();
    this.getProfile();
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

  getProfile: function () {
    let _this = this;

    http.get('/profile', {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let profile = res.data.data;
        _this.setData({profile:profile})
        if(profile == null){
          wx.showLoading({
            title: '请先完善资料！',
          });
          setTimeout(function () {
            wx.hideLoading();
            wx.navigateTo({
              url: '/pages/personal/set_profile/set_profile'
            })
          }, 2000);
        }
      }
    });
  },

  /** 提交 */
  submit: function (e) {
    wx.showLoading({
      title: '发布中...',
    });
    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let title = this.data.title;
    let salary = this.data.salary;
    let formId = e.detail.formId;
    app.collectFormId(formId);

    //获取图片
    this.data.imageArray.map(item => {
      attachments.push(item.uploadResult.key)
    })

    http.post('/post_help', {
      content: content,
      attachments: attachments,
      title: title,
      salary: salary
    }, res => {
      console.log(res);
      wx.hideLoading();
      let data = res.data;
      if(data.error_code != 500){
        app.globalData.postHelp = true;
        wx.showLoading({
          title: '发布成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateBack({ comeBack: true });
        }, 1000);
      }else{
        wx.showLoading({
          title: data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1000);
      }
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
  },

  /**
   * 获取输入内容
   */
  getTitle: function (event) {
    let value = event.detail.value;
    this.setData({
      title: value
    });
  },
  
  /**
  * 获取输入内容
  */
    getSalary: function (event) {
      let value = event.detail.value;
      this.setData({
        salary: value
      });
    }
})