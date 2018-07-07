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
    profile:null,
    showSearch:true,
    filter:'',
    newMessage: false,
    newMessageNumber: 0,
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

    let _this = this;
    let type = 0;
    app.getNewInbox(type, function (res) {
      console.log("新消息数量：" + res.data.data);
      if (res.data.data != 0 && res.data.data != null && res.data.data != '') {
        _this.setData({
          newMessage: true,
          newMessageNumber: res.data.data
        });
      } else {
        _this.setData({
          newMessage: false,
          newMessageNumber: 0
        });
      }
    });
  },

  /**
  * 跳转到私信
  */
  letter: function (e) {

    let formId = e.detail.formId;
    app.collectFormId(formId);

    let id = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id + '&can_chat=0'
    })
  },

  /**
   * 详情
   */
  detail:function(e){

    let id = e.currentTarget.dataset.obj;
    let entry = e.currentTarget.dataset.entry;
    let role = e.currentTarget.dataset.role;

    let formId = e.detail.formId;
    app.collectFormId(formId);

    if(entry){
      wx.navigateTo({
        url: '/pages/help_detail/help_detail?id='+id+'&role='+role
      })
    }
  },

  hadStop:function(e){
    let formId = e.detail.formId;
    app.collectFormId(formId);
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
    let filter = this.data.filter;

    if(objType == 0 || objType == 1){
      order_by = 'created_at';
    }else{
      order_by = 'updated_at';
    }

    let _this = this;
    app.http('GET',
      `/helps?page_size=${_this.data.pageSize} & page_number=${_this.data.pageNumber} & order_by=${order_by} & sort_by=${sort_by} & type=${objType} & filter=${filter}`, {}, res => {
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

  /**
   * 进入新消息列表
   */
  openMessage: function () {
    wx.navigateTo({
      url: '/pages/message/message?type=0&new_message=1'
    })
  },

  /**
   * 搜索
   */
  search:function(){
    this.setData({
      select: 0,
      jobs: []
    })

    this.setData({
      pageNumber: this.data.initPageNumber
    });

    let _this = this;

    wx.showLoading({
      title: '搜索中...',
    });

    _this.helps();
  },
  /**
   * 获取搜索框的内容
   */
  getFilter: function (event) {
    let content = event.detail.value;
    this.setData({
      filter: content
    })
  },

  /**
   * 最新帖子
   */
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
        wx.showLoading({
          title: '请先完善资料！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/set_profile/set_profile'
          })
        }, 1500);
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

    if(objType == 0){
      this.setData({
        showSearch:true
      })
    }else{
      this.setData({
        showSearch: false
      })
    }

    this.setData({
      pageNumber: this.data.initPageNumber,
      select: objType,
      jobs: [],
      filter: ''
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
        wx.showLoading({
          title: '请先完善资料！',
        });
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/set_profile/set_profile'
          })
        }, 1500);

      return false;
    }

    let id = e.currentTarget.dataset.obj;
    let formId = e.detail.formId;
    app.collectFormId(formId);

    app.http('POST', '/receipt_order', {
      id: id
    }, res => {
      console.log(res);
      if(res.data.error_code != 500){
        wx.showLoading({
          title: '接单成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          app.globalData.postHelp = true;
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
        }, 1500);
      }
    });

  },

  /**
  * 终止悬赏
  */
  stop: function (e) {

    let id = e.currentTarget.dataset.obj;
    let formId = e.detail.formId;
    let _this = this;

    app.collectFormId(formId);

    app.http('PUT', `/stop/${id}/job`, {
      form_id: formId
    }, res => {
      console.log(res);
      if (res.data.error_code != 500) {
        wx.showLoading({
          title: '操作成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          _this.setData({
            select: 6,
            pageNumber: _this.data.initPageNumber,
            jobs: []
          });
          app.globalData.postHelp = false;
          _this.helps();
        }, 1500);
      } else {
        wx.showLoading({
          title: res.data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500);
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

  /**
   * 删除帖子
   */
  deleteHelp:function(e){
    let objId = e.currentTarget.dataset.objid;
    let _this = this;

    wx.showModal({
      title: '提示',
      content: '确定删除吗?',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');

          app.http('delete', `/delete/${objId}/job`, {}, res => {

            console.log(res.data);
            let result = res.data.data;

            if (result == 1) {
              console.log('删除成功');

              let newJobs = _this.data.jobs.filter((item, index) => {
                if (item.id != objId) {
                  return item;
                }
              });

              _this.setData({
                jobs: newJobs
              });

            } else {
              console.log('删除失败');
            }

          });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});