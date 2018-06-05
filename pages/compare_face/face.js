
const app = getApp()

Page({
  data: {
    showSelect:false,
    showBegin:true,
    showCancel:false,
    showReport: false,
    bindReport:false
  },
  onLoad: function (option) {
    this.hiddenSelect();
  },
  showSelect:function(){
    this.setData({
      showSelect: true,
      showBegin: false,
      showCancel: true,
      showReport: true,
      bindReport: true
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
      showReport: false,
      bindReport: false
    });
  }

})