const app = getApp();
const qiniuUploader = require("../../utils/qiniuUploader");
const uploader = require("../../utils/uploadImage");

Page({
  data: {
    logs: [],
    imageArray: [],
    uploadToken: null,
    attachments: [],
    private: false,
    textContent: '',
    name: '',
    phone:''
  },
  onLoad: function () {

  },
  onShow: function () {
    //设置七牛上传token
    app.getUploadToken(token => {
      this.setData({
        uploadToken: token
      });
    });
  },

  /** 提交 */
  post: function () {

    console.log('post');
    console.log(this.data.attachments);

    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let privateValue = this.data.private;
    let username = this.data.name;
    let mobile = this.data.phone;

    if(content == '' && attachments == ''){
      wx.showLoading({
        title: '内容不能为空！',
      });
      setTimeout(function(){
        wx.hideLoading();
      },1500)
      return false;
    }
    wx.showLoading({
      title: '发送中..'
    });

    app.http('post', '/post', {
      content: content,
      attachments: attachments,
      private: privateValue,
      username: username,
      mobile:mobile
    }, res => {
      wx.hideLoading();
      console.log(res);
      if(res.data.error_code == 0){
        wx.navigateBack({ comeBack: true });
      }else{
        wx.showLoading({
          title: res.data.error_message,
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
   * 选择图片并且上传到七牛
   */
  selectImage: function () {

    console.log('select image');
    let _this = this;

    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        let temArray = _this.data.imageArray;
        let temUrlArray = _this.data.attachments;

        console.log('图片：'+res.tempFilePaths);

        var filePaths = res.tempFilePaths;

        let position = res.tempFilePaths.length - 1;

        wx.showLoading({
          title: '加载中',
        })

        filePaths.map((item, index) => {
          temArray.push(item);

          uploader.upload(item, key => {
            console.log(index);
            console.log(position);
            if (position == index) {
              wx.hideLoading();
            }

            let temAttachments = _this.data.attachments;

            if (key != '' || key != null) {
              temAttachments.push(key);
              _this.setData({
                attachments: temAttachments
              });
            }

            console.log(key);
          })

        });

        _this.setData({
          imageArray: temArray
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
  removeImage: function (event) {
    console.log(event.target.id);
    console.log(event);

    let id = event.target.id;
    let arr = this.data.imageArray;
    let newAttachments = this.data.attachments;

    console.log(id);

    let newArray = arr.filter((item, index) => {
      if (index != id) {
        return item;
      }
    });

    newAttachments = newAttachments.filter((item, index) => {
      if (index != id) {
        return item;
      }
    });

    this.setData({
      imageArray: newArray,
      attachments: newAttachments
    });

  },

  /**
   * 设置是否匿
   */
  setPrivate: function (event) {
    console.log(event.detail.value);

    this.setData({
      private: event.detail.value
    });

    console.log(this.data.private);
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