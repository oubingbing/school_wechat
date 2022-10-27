const util = require('./../../../utils/util.js');
const http = require("./../../../utils/http.js");
const app = getApp();

Page({
  data: {
    objType:0,
    pageSize: 15,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
    userId:0,
    list: [],
  },
  onLoad: function (option) {
    let id = option.id
    let objType = option.objType

    if(objType == 1){
      wx.setNavigationBarTitle({ title: "关注列表"});
    }else{
      wx.setNavigationBarTitle({ title: "粉丝列表"});
    }

    this.setData({userId:id,objType:objType})
    this.getList()
  },

  openUserInfo:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personal/user_info/personal?id=' + id
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    });
    this.getList();
  },

  /**
   * 获取贴子列表
   */
  getList:function(){
    http.get(`/follow/page?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&type=${this.data.objType}&user_id=${this.data.userId}`,{},res => {
      wx.hideLoading();
      this.setData({
        showGeMoreLoadin: false
      })
      let list = this.data.list;
      if(res.data.data){
        if (res.data.data.page_data.length > 0) {
          res.data.data.page_data.map(item => {
            list.push(item);
          });
          this.setData({
            list: list,
            pageNumber: this.data.pageNumber + 1              
          });
        } else {
          this.setData({
            notDataTips: true
          });
        }
      }
    });
  },

})
