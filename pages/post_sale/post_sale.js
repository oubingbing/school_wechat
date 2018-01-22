
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];
const qiniuUploader = require("../../utils/qiniuUploader");
const uploader = require("../../utils/uploadImage");

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
    uploadToken: ''
  },
  onLoad: function () {

  },
  onShow:function(){

    //设置七牛上传token
    app.getUploadToken(token => {
      this.setData({
        uploadToken: token
      });
    });

  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      gender: genderArray[e.detail.value],
      genderValue:e.detail.value
    })
  },
  /**
   * 选择图片
   */
  selectImage: function () {

    let _this = this;

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;

        console.log(tempFilePaths[0]);

        _this.setData({
          userImage: tempFilePaths[0],
          hiddenSelectImage: true
        })

        wx.showLoading({
          title: '加载中',
        })

        uploader.upload(tempFilePaths[0], key => {

          wx.hideLoading();

          let temAttachments = _this.data.attachments;

          if (key != '' || key != null) {
            temAttachments.push(key);
            _this.setData({
              attachments: temAttachments
            });
          }

          console.log(key);

        },error=>{
          console.log(error);
        });

      }
    })
  },
  /** 
   * 预览图片
   */
  previewImage: function (event) {

    console.log(event.target.id);

    let url = event.target.id;

    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /**
   * 移除图片
   */
  removeImage: function () {
    console.log('移除图片');

    this.setData({
      hiddenSelectImage: false,
      userImage: ''
    })
  },
  getName: function (e) {
    let value = e.detail.value;
    this.setData({
      name: value
    });
    console.log(value);

  },
  getMajor: function (e) {
    let value = e.detail.value;
    this.setData({
      major: value
    });
    console.log(value);
  },
  getLike: function (e) {
    let value = e.detail.value;
    this.setData({
      expectation: value
    });
    console.log(value);
  },
  getContent: function (e) {
    let value = e.detail.value;
    this.setData({
      introduce: value
    });
    console.log(value);
  },
  /**
   * 提交数据
  */
  post: function () {
    console.log('提交数据');

    let _app = app;

    let attachments = this.data.attachments;
    let name = this.data.name;
    let gender = this.data.genderValue;
    let major = this.data.major;
    let expectation = this.data.expectation;
    let introduce = this.data.introduce;

    if (attachments.length == 0) {
      wx.showLoading({
        title: '图片不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 2000);
      return;
    }

    if (name == '') {
      wx.showLoading({
        title: '名字不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 1500);

      return;
    }

    if (gender == '') {
      wx.showLoading({
        title: '性别不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 1500);
      return;
    }

    if (major == '') {
      wx.showLoading({
        title: '专业不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 1500);

      return;
    }

    if (expectation == '') {
      wx.showLoading({
        title: '喜欢不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 1500);
      return;
    }

    if (introduce == '') {
      wx.showLoading({
        title: '介绍不能为空',
      })
      setTimeout(res => {
        wx.hideLoading();
      }, 1500);

      return;
    }

    let _this = this;


    wx.showLoading({
      title: '发送中',
    })

    app.http('post', '/sale_friend', {
      attachments: attachments, 
      name: name, 
      gender: gender, 
      major: major, 
      expectation: expectation, 
      introduce: introduce
    }, res => {
      wx.hideLoading();

      console.log(res.data.data.error_message)

      if(res.data.data.error_code){
        wx.showLoading({
          title: res.data.data.error_message,
        })
        setTimeout(res => {
          wx.hideLoading();
        }, 2000);
      }else{
        wx.navigateBack({ comeBack: true });
      }

    });

  },

})