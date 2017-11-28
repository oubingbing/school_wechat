
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    array: genderArray,
    userImage:'',
    gender:'',
    hiddenSelectImage:false
  },
  onLoad: function () {

  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      gender: genderArray[e.detail.value]
    })
  },
  /**
   * 选择图片
   */
  selectImage:function(){

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
          hiddenSelectImage:true
        })
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
  removeImage:function(){
    console.log('移除图片');

    this.setData({
      hiddenSelectImage:false,
      userImage:''
    })
  }

})