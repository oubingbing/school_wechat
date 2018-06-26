const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    jobs:[],
    baseImageUrl: app.globalData.imageUrl,
    showGeMoreLoadin:false,
    newMessageNumber: 0,
    select: 0,
    currentTime: '',
    profile:null
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中...',
    });
    this.helps();
    this.getProfile();

    //设置当前时间
    this.setData({
      currentTime: util.formatTime(new Date())
    });
  },
  onShow:function(){
    if (app.globalData.postHelp){
      this.setData({
        select: 6,
        pageNumber: this.data.initPageNumber,
        jobs: []
      });
      app.globalData.postHelp = false;
      this.helps();
    }else{
      this.newHelps();
    }
    this.getProfile();
  },
  detail:function(e){
    let id = e.currentTarget.dataset.obj;
    let entry = e.currentTarget.dataset.entry;
    let role = e.currentTarget.dataset.role;
    if(entry){
      wx.navigateTo({
        url: '/pages/help_detail/help_detail?id='+id+'&role='+role
      })
    }
  },
  /**
   * 获取个人资料
   */
  getProfile: function () {
    let _this = this;

    app.http('GET', '/profile', {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let profile = res.data.data;

        _this.setData({ profile: profile })
      }
    });
  },
  /**
   * 获取帖子
   */
  helps:function(){

    let order_by = 'created_at';
    let sort_by = 'desc';
    let objType = this.data.select;

    let _this = this;
    app.http('GET',
     `/helps?page_size=${_this.data.pageSize } & page_number=${_this.data.pageNumber } & order_by=${order_by } & sort_by=${sort_by } & type=${objType}`, {}, res => {
      wx.hideLoading();
      console.log(res);

      let jobs = _this.data.jobs;

      let data = res.data.data.page_data;
      data.map(item=>{
        jobs.push(item);
      })

      _this.setData({
        jobs:jobs,
        pageNumber: _this.data.pageNumber + 1 ,
        showGeMoreLoadin: false
      })
    });
  },
  newHelps:function(){

    let objType = this.data.select;
    let time = this.data.currentTime;

    let _this = this;
    app.http('GET',
      `/new_helps?type=${objType}&time=${time}`, {}, res => {
        
        let jobs = _this.data.jobs;


        if (res.data.data) {
          if (res.data.data.length > 0) {
            res.data.data.map(item => {
              let ifRepeat = false;

              for (let job of jobs) {
                if (job.id == item.id) {
                  ifRepeat = true;
                }
              }

              if (!ifRepeat) {
                jobs.unshift(item);
              }
            });

            _this.setData({
              jobs: jobs
            });

          }
        }
        

      });
  },
  /**
 * 上拉加载更多
 */
  onReachBottom: function () {

    console.log('到底了');

    let _this = this;

    this.setData({
      showGeMoreLoadin: true
    });

    this.helps();

  },
  /** 
 * 进入发表页面
 */
  post: function () {
    console.log('Post');

    if (this.data.profile == null) {
      if (profile == null) {
        wx.showLoading({
          title: '请先完善资料！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/set_profile/set_profile'
          })
        }, 2000);
      }

      return false;
    }

    wx.navigateTo({
      url: '/pages/post_help/post_help'
    })
  },
  /**
 * 获取具体类型的贴子
 */
  selected(e) {
    let objType = e.target.dataset.type;

    console.log(objType);

    this.setData({
      select: objType,
      jobs: []
    })

    this.setData({
      pageNumber: this.data.initPageNumber
    });

    let _this = this;

    _this.helps();

  },
  /**
   * 接单
   */
  order: function (e) {

    console.log(e);

    if(this.data.profile == null){
      if (profile == null) {
        wx.showLoading({
          title: '请先完善资料！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/set_profile/set_profile'
          })
        }, 2000);
      }

      return false;
    }

    let id = e.currentTarget.dataset.obj;
    let formId = e.detail.formId

    app.http('POST', '/receipt_order', {
      id: id,
      form_id: formId
    }, res => {
      console.log(res);
      if(res.data.error_code != 500){
        wx.showLoading({
          title: '接单成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/help_detail/help_detail?id='+id
          })
        }, 1500);
      }else{
        wx.showLoading({
          title: res.data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 2000);
      }
    });

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
 * 预览图片
 */
  previewMoreImage: function (event) {

    console.log(event.target.id);
    console.log(event.currentTarget.dataset.obj);

    let _this = this;

    let images = event.currentTarget.dataset.obj.map(item => {
      return _this.data.baseImageUrl + item;
    });

    console.log(images);

    let url = event.target.id;

    wx.previewImage({
      current: url,
      urls: images
    })
  },
});