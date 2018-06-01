
const app = getApp()

Page({
  data: {
    colleges: [],
    collegeName:null,
    showEmpty:false,
    objectType:1,
    list: [],
    showPost:false,
    showSale:false
  },
  onLoad: function (option) {
    let objType = option.type;

    if(objType == 1){
      this.setData({
        showPost: true,
        showSale: false
      });
    }else{
      this.setData({
        showPost: false,
        showSale: true
      });
    }

    this.setData({
      objectType: objType
    });
  },

  /**
   * 获取输入框的内容
   */
  getCollegeName:function(event){

    let value = event.detail.value;
    this.setData({
      collegeName:value
    });

  },

  /**
   * 搜索学校
   */
  searchCollege: function (event) {

    console.log(this.data.collegeName);

    if (this.data.collegeName == null || this.data.collegeName == '') {
      wx.showToast({
        title: '内容不能为空',
        icon: 'loading',
        duration: 1000
      })
      return;
    }

    let objName = this.data.collegeName;
    let _this = this;

    app.http('GET', `/search`, {
      'content': objName,
      'obj_type': this.data.objectType
    }, function (res) {

      console.log(res.data.data);

      if (res.data.data) {

          let posts = [];
          res.data.data.map(item => {
            posts.push(item);
          });

          _this.setData({
            list: posts
          });

          console.log();
      }

    });
  },
})