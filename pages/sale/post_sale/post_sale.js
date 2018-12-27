const http = require("./../../../utils/http.js");
const qiniuUtil = require("./../../../utils/qiniuToken.js");
const config = require("./../../../config.js");

const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    array: genderArray,
    userImage: '',
    name: '',
    major: '',
    gender: '',
    genderValue:'',
    expectation: '',
    introduce: false,
    attachments: [],
    imageArray: [],

    icon: {
      "width": "100rpx",
      "height": "100rpx",
      "path": ""
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

  onShow:function(){
    this.getQiNiuToken();
  },

  /**
   * 获取上传的图片
   */
  uploadSuccess: function (uploadData) {
    console.log("图片上传：")
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

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      gender: genderArray[e.detail.value],
      genderValue:e.detail.value
    })
  },

  getName: function (e) {
    let value = e.detail.value;
    this.setData({
      name: value
    });
  },

  getMajor: function (e) {
    let value = e.detail.value;
    this.setData({
      major: value
    });
  },

  getLike: function (e) {
    let value = e.detail.value;
    this.setData({
      expectation: value
    });
  },

  getContent: function (e) {
    let value = e.detail.value;
    this.setData({
      introduce: value
    });
  },

  /**
   * 
   * 提交数据
  */
  post: function () {
    let attachments = [];
    let name = this.data.name;
    let gender = this.data.genderValue;
    let major = this.data.major;
    let expectation = this.data.expectation;
    let introduce = this.data.introduce;

    this.data.imageArray.map(item => {
      attachments.push(item.uploadResult.key)
    })

    if (!name) {
      wx.showToast({
        title: '名字不能为空',
        icon: 'none'
      })
      return false;
    }

    if (!gender) {
      wx.showToast({
        title: '性别不能为空',
        icon: 'none'
      })
      return false;
    }

    if(attachments.length<=0){
      wx.showToast({
        title: '图片不能为空',
        icon: 'none'
      })
      return false;
    }

    wx.showLoading({
      title: '发送中',
    })
    http.post('/sale_friend', {
      attachments: attachments, 
      name: name, 
      gender: gender, 
      major: major, 
      expectation: expectation, 
      introduce: introduce
    }, res => {
      wx.hideLoading();
      if(res.data.error_code != 0){
        wx.showLoading({
          title: res.data.error_message,
        })
        setTimeout(res => {
          wx.hideLoading();
        }, 2000);
      }else{
        app.globalData.reloadSale = true;
        wx.navigateBack({ comeBack: true });
      }
    });
  },
})