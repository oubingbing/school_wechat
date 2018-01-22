
const app = getApp();

Page({
  data: {
    result:[]
  },
  onLoad: function (option){
    let id = option.id;

    console.log(id);

    this.getResult(id);
  },
  /**
   * 获取匹配结果信息
   */
  getResult:function(id){

    let _this = this;

    app.http('get', `/match/${id}/result`, {}, res => {
      wx.hideLoading();
      console.log(res);

      _this.setData({
        result:res.data.data
      });

    });

  }
})