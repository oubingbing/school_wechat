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
      width: "170rpx",
      height: "170rpx",
      path: "http://image.qiuhuiyi.cn/face-select.png",
      showImage: true
    },
    anime_icon: {
      width: "500rpx",
      height: "700rpx",
      path: "/image/v2/anime-select.png",
      showImage: true
    },
    qiniu: {
      uploadNumber: 1,
      region: config.region,
      token: '',
      domain: config.qiniuDomain
    },
    select:1,
    animeUrl:"",
    base64Image:"",
    animeResult:"",
    showSelectAnime:true
  },
  onLoad: function (option) {
    this.hiddenSelect();
    this.getQiNiuToken();
  },

    /**
   * 获取具体类型的贴子
   */
  selected(e) {
    let objType = e.currentTarget.dataset.type;
    this.setData({ select: objType})
  },

  // 保存本地图片 
  downLoadAnime(){
    var aa = wx.getFileSystemManager();
    let that = this
    let nameTime = Date.now()
    aa.writeFile({
      filePath:wx.env.USER_DATA_PATH+'/anime_face_'+nameTime+'.png',
      data: that.data.animeResult.slice(22),
      encoding:'base64',
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/anime_face_'+nameTime+'.png',
          success: function (res) {
            wx.showToast({
              title: '保存成功',
            })
          },
          fail: function (err) {
            console.log(err)
          }
        })
        console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
  },

  /**
   * 获取上传的图片
   */
  getAnimeUrl: function (uploadData) {
    this.setData({ animeUrl: this.data.baseImageUrl +uploadData.detail[0].uploadResult.key})
  },

  getAnimeAgant:function() {
      this.setData({showSelectAnime:true})
  },

  getAnime:function() {
    wx.showLoading({
      title: '转化中',
    });

    if(!this.data.animeUrl){
      wx.showToast({
        title: '请上传图片！',
        icon: 'none'
      })
      return false;
    }

    http.post(`/anime_face`, { image: this.data.animeUrl}, res => {
      wx.hideLoading();
      if (res.data.error_code){
        wx.showToast({
          title: res.data.error_message,
          icon: 'none'
        })
        setTimeout(function () {
          wx.hideLoading();
        }, 3000);
        return false;
      }
      this.setData({
        animeResult: "data:image/png;base64,"+res.data.data,
        showSelectAnime:false,
        base64Image:res.data.data
      });
    });
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

  hiddenReport:function() {
    this.setData({ showReport: false,showSelect:true })
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
            showSelect:false
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
      path: '/pages/home/index_2/index_2',
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