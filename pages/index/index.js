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
    baseImageUrl: app.globalData.imageUrl,
    show:0,
    hidden:false,
    showCommentInput:false,
    showCommentInput:false
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

  /** 进入发表页面 */
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

  /** 显示评论控制面板 */
  showComment:function(event){

    this.setData({
      show:0
    });

    let id = event.target.id;
    let hidden = event.target.dataset.show;

    if(!hidden){
      this.setData({
        show:id,
        hidden:true
      });
    }else{
      this.setData({
        show:0,
        hidden:false
      });
    }

    console.log(hidden)
    console.log(event)
    console.log(id);
    
  },

  /** 触摸屏幕后移动触发一些隐藏操作 */
  hiddenComment:function(){
    console.log('inde-hiddenComment：触摸后移动');
    this.setData({
      show:0,
      hidden:false,
      showCommentInput:false
    });
  },

  /** 点赞 */
  praise:function(event){
    console.log('index-praise：点赞');

    let objId = event.target.dataset.obj;
    let objType = 1;
    console.log(objId);


    app.http('post', `/praise`, { obj_id: objId, obj_type: objType},res=>{
      console.log('点赞成功'+res);

    });

  },

  /** 激活评论框 */
  showCommentInput:function(event){
    console.log('index-showCommentInput：激活评论框');

    let objId = event.target.id;

    this.setData({
      show: 0,
      hidden: false,
      showCommentInput:true
    });
  },

  /** 提交评论 */
  sendComment:function(e){

  },

  /** 取消赞 */
  deletePraise:function(e){

  },

  /** 删除评论 */
  deleteComment:function(e){

  },

  /** 关注 */
  follow:function(e){

  },

  /** 取消关注 */
  cancelFollow:function(e){

  }
  

})