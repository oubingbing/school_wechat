const qiniuUploader = require("../../utils/qiniuUploader");
const uploader = require("../../utils/uploadImage");

const app = getApp()

Page({
  data: {
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
    PostImageRight:'',
    rate:0,
    face:'',
    conclusion:''
  },
  onLoad: function (option) {
    this.hiddenSelect();

    //设置七牛上传token
    app.getUploadToken(token => {
      this.setData({
        uploadToken: token
      });
    });

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

    let _this = this;
    wx.chooseImage({
      count: 1, 
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        console.log('图片：' + res.tempFilePaths);

        var tempFilePaths = res.tempFilePaths;

        _this.setData({
          imageLeft: tempFilePaths[0]
        });

        wx.showLoading({
          title: '加载中',
        });

        uploader.upload(tempFilePaths[0], key => {

          wx.hideLoading();

          console.log(key);
          _this.setData({
            postImageLeft: app.globalData.imageUrl+key
          });

          if (_this.postImageLeft != '' && _this.PostImageRight != ''){
            _this.setData({
              showBegin: false,
              showCancel: true,
              showSubmit: true,
              tryAgant: false
            });
          }

        })

      }
    })
  },
  selectRight:function(){

    this.setData({ showReport: false})

    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        console.log('图片：' + res.tempFilePaths);

        var tempFilePaths = res.tempFilePaths;

        _this.setData({
          imageRight: tempFilePaths[0]
        });

        wx.showLoading({
          title: '加载中',
        });

        uploader.upload(tempFilePaths[0], key => {

          wx.hideLoading();

          console.log(key);
          _this.setData({
            PostImageRight: app.globalData.imageUrl+key
          });


          if (_this.postImageLeft != '' && _this.PostImageRight != '') {
            _this.setData({
              showBegin: false,
              showCancel: true,
              showSubmit: true,
              tryAgant: false,
            });
          }
        })

      }
    })
  },
  submit:function(){
    console.log(this.data.PostImageRight);
    console.log(this.data.postImageLeft);

    if (this.data.postImageLeft == ''){
      wx.showLoading({
        title: '左图上传失败，请重试',
      });
      setTimeout(function(){
        wx.hideLoading();
      },1500);
      return false;
    }

    if (this.data.PostImageRight == '') {
      wx.showLoading({
        title: '右图上传失败，请重试',
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 1500);
      return false;
    }

    wx.showLoading({
      title: '检测中',
    });

    app.http('post', `/compare_face`, { your_face: this.data.postImageLeft, his_face: this.data.PostImageRight }, res => {

      wx.hideLoading();

      console.log('数据：' + JSON.stringify(res.data));

      if (res.data.error_code){
        wx.showLoading({
          title: res.data.error_message,
        });
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
            //postImageLeft: '',
            //PostImageRight: '',
            //tryAgant:true
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
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '喜欢ta，那就说出来吧',
      path: '/pages/index/index',
      imageUrl: 'http://image.kucaroom.com/compare_face.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})