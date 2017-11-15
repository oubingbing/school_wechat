//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    school:'',
    posts:null,
    baseImageUrl: app.globalData.imageUrl
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {  
    
    let _this =this;

    let token = wx.getStorageSync('token');
    console.log('获取到token:'+token);

    this.getSchool(_this);

    this.getPost();

  },
  onShow:function(){
    console.log('on show');

    let _this = this;
    this.getSchool(_this);

    this.getPost();

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  post:function(){
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post/post'
    })
  },
  selectSchool:function(){
    console.log('select school');

    wx.navigateTo({
      url: '/pages/school/school'
    })
  },

  /** 获取学校 */
  getSchool:function(_this){
    console.log('get school');

    app.http('GET','/school',{},function(res){

      console.log(res.data);

      _this.setData({
        school:res.data.data
      });

    });
  },

  /** 获取贴子 */
  getPost:function(_this){

    console.log('function getPost');

    app.http('get','/post',{},res=>{

      this.setData({
        posts:res.data.data
      });

      console.log(res.data);

    });

  },
  /** 预览图片 */
  previewImage: function (event) {

    console.log(event.target.id);

    let url = event.target.id;

    wx.previewImage({
      current: '',
      urls: [url]
    })
  },
  

})