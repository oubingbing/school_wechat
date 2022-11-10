const uploader = require("../../utils/uploadImage");
Component({

  /**
   * 页面的初始数据
   */
  data: {
    imageArray:[],
    iconInfo: {},
    qiniuInfo:{},
    hiddenIcon:false
  },
  properties: {
    iconInfo: {
        type: JSON,
        value: {},
        observer: function (newData, oldData) {

          if (newData.width == '' || newData.width == undefined) {
            newData.width = '130rpx';
          }

          if (newData.height == '' || newData.height == undefined) {
            newData.height = '130rpx';
          }

          if (newData.path == '' || newData.path == undefined){
            newData.path = '/image/select-image.png';
          }

          if (newData.showImage == undefined){
            newData.showImage = true;
          }

          this.setData({
            iconInfo:newData
          })
        }
    },
    qiniuInfo: {
      type: JSON,
      value: {},
      observer: function (newData, oldData) {

        if (newData.uploadNumber == '' || newData.uploadNumber == undefined){
          newData.uploadNumber = 9;
        }

        if (newData.region == '' || newData.region == undefined) {
          console.error("qiniu.region不能为空");
          return false;
        }

        if (newData.domain == '' || newData.domain == undefined) {
          console.error("qiniu.domain不能为空");
          return false;
        }


        if (newData.returnAllImage == undefined) {
          newData.returnAllImage = true;
        }

        this.setData({
          qiniuInfo: newData
        })
      }
    }
  },

  methods:{
    configQiniu: function() {
      let qiniuData = this.data.qiniuInfo;
      if (qiniuData.region == ''){
        console.error('七牛存储区域不能为空');
        return false;
      }

      if (qiniuData.token == '') {
        console.error('七牛授权token不能为空');
        return false;
      }

      if (qiniuData.domain == '') {
        console.error('七牛域名不能为空');
        return false;
      }

      return this.data.qiniuInfo;
    },

    /**
    * 选择图片并且上传到七牛
    */
    selectImage: function () {
      let configs = this.configQiniu();
      let limitNumber = this.data.qiniuInfo.uploadNumber;
      let imageLength = this.data.imageArray.length;

      wx.chooseImage({
        count: (limitNumber - imageLength), // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res=> {

          let temArray = this.data.imageArray;
          var filePaths = res.tempFilePaths;
          let position = res.tempFilePaths.length - 1;
          let temArrayLength = temArray.length;
          let imagePosition = 0;
          if (temArrayLength == 0) {
            imagePosition = 0;
          } else {
            imagePosition = temArrayLength - 1;
          }

          if ((imageLength + filePaths.length) >= limitNumber) {
            this.setData({ hiddenIcon: true })
          }

          wx.showLoading({
            title: '加载中',
          })

          filePaths.map((item, index) => {
            temArray.push({ "localPath": item });
            uploader.upload(configs, item, res => {
              if (position == index) {
                wx.hideLoading();
              }

              if (res.error == undefined) {
                if (this.data.qiniuInfo.returnAllImage == true){
                  temArray[temArrayLength + index].uploadResult = res;
                  this.setData({
                    imageArray: temArray
                  });
                  this.triggerEvent("success", temArray);
                }else{
                  this.triggerEvent("success", res);
                }

              } else {
                //上传失败
                this.triggerEvent("error", res);
                console.error("上传失败:" + JSON.stringify(res));
              }
            })

          });

          this.setData({
            imageArray: temArray
          });

        }
      })

    },

    /**
     * 移除图片
     */
    removeImage: function (event) {
      let id = event.target.id;
      let arr = this.data.imageArray;

      let newArray = arr.filter((item, index) => {
        if (index != id) {
          return item;
        }
      });

      let hidden = true;
      if(newArray.length < this.data.qiniuInfo.uploadNumber){
         hidden = false;
      }

      this.setData({
        imageArray: newArray,
        hiddenIcon: hidden
      });

      this.triggerEvent("delete", newArray);
    }
  },
})