const http = require("./../../utils/http.js");
const qiniuUtil = require("./../../utils/qiniuToken.js");
const config = require("./../../config.js");
const app = getApp()

Page({
  data: {
    baseImageUrl: app.globalData.imageUrl,
    showSelect:false,
    showBegin:true,
    showCancel:false,
    showReport: false,
    bindReport:false,
    showSubmit:false,
    tryAgant:false,
    imageLeft:'',
    imageRight:'',
    postImageLeft:'',
    postImageRight:'',
    rate:0,
    face:'',
    conclusion:'',
    icon: {
      width: "250rpx",
      height: "250rpx",
      path: "http://img.qiuhuiyi.cn/tmp/wx0f587d7c97a68e2b.o6zAJs3oh85Zb1lJE8oWix57vny0.LnBKkU9zx3EP4d2e331c723875767480754faf0248b7.png",
      showImage: true
    },
    qiniu: {
      uploadNumber: 1,
      region: config.region,
      token: '',
      domain: config.qiniuDomain
    },
  },
  onLoad: function (option) {
    this.hiddenSelect();
    this.getQiNiuToken();
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

  /**
 * 获取上传的图片
 */
  leftUploadSuccess: function (uploadData) {
    console.log(uploadData.detail[0].uploadResult.imageURL);
    this.setData({ postImageLeft: this.data.baseImageUrl +uploadData.detail[0].uploadResult.key})
    if (this.data.postImageLeft && this.data.postImageRight) {
      this.setData({ showSubmit: true })
    }
  },

  /**
  * 获取上传的图片
  */
  rightUploadSuccess: function (uploadData) {
    console.log(uploadData.detail[0].uploadResult.imageURL);
    this.setData({ postImageRight: this.data.baseImageUrl+uploadData.detail[0].uploadResult.key })
    if (this.data.postImageLeft && this.data.postImageRight) {
      this.setData({ showSubmit: true })
    }
  },

  showSelect:function(){
    this.setData({
      showSelect: true,
      showBegin: false,
      showCancel: true
    });
  },
  
  hiddenSelect:function(){
    this.setData({
      showSelect: false,
      showReport: false,
      bindReport: false
    });
  },

  cancelSelect:function(){
    this.setData({
      showSelect: false,
      showBegin: true,
      showCancel: false,
      bindReport: false
    });
  },

  selectLeft:function(){
    this.setData({ showReport: false })
  },

  selectRight:function(){
    this.setData({ showReport: false})

  },

  submit:function(){
    if (this.data.postImageLeft == ''){
      wx.showToast({
        title: '左图上传失败，请重试',
        icon: 'none'
      })
      return false;
    }

    if (this.data.postImageRight == '') {
      wx.showToast({
        title: '右图上传失败，请重试',
        icon: 'none'
      })
      return false;
    }

    wx.showLoading({
      title: '检测中',
    });

    http.post(`/compare_face`, { your_face: this.data.postImageLeft, his_face: this.data.postImageRight }, res => {
      wx.hideLoading();
      if (res.data.error_code){
        wx.showToast({
          title: res.data.error_message,
          icon: 'none'
        })
        setTimeout(function () {
          wx.hideLoading();
        }, 2000);

        return false;
      }
        let response = res.data;
          this.setData({
            rate: response.data.confidence,
            face: response.data.key_world,
            conclusion: response.data.message,
            showReport: true,
            bindReport: true,
          });
      });
  },

  tryAgant:function(){
    this.setData({
      rate: 0,
      face: '',
      conclusion: '',
      showReport: false,
      bindReport: false,
      showCancel: true,
      tryAgant: false,
      showBegin: false,
      showSubmit: false,
      postImageLeft: '',
      PostImageRight: '',
      imageLeft: '',
      imageRight: '',
    });
  },

  onShareAppMessage: function (res) {
    return {
      title: '喜欢ta，那就说出来吧',
      path: '/pages/index/index',
      imageUrl: 'http://img.qiuhuiyi.cn/compare_face.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})