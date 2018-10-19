
const app = getApp();
const http = require("./../../../utils/http.js");

Page({
  data: {
    result:[]
  },
  onLoad: function (option){
    let id = option.id;
    this.getResult(id);
  },
  /**
   * 获取匹配结果信息
   */
  getResult:function(id){
    let _this = this;
    http.get(`/match/${id}/result`, {}, res => {
      wx.hideLoading();
      console.log(res);
      _this.setData({
        result:res.data.data
      });

    });

  }
})