const app = getApp();
let gradeArray = ['大一', '大二', '大三', '大四', '其他'];

Page({
  data: {
    job:'',
    profile:null,
    role:'',
    id:'',
    roleProfile:null,
    profileTitle:'',
    grade: gradeArray,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    employeeJobs:[],
    baseImageUrl: app.globalData.imageUrl,
    showGeMoreLoadin:false,
    missionStatus:'',
    test:0
  },

  onLoad: function (option) {
    this.setData({
      role: option.role,
      id: option.id,
      job:''
    })

    if(option.role == 'boss'){
      this.setData({
        profileTitle: '赏金猎人信息'
      })
    }else{
      this.setData({
        profileTitle: '悬赏人信息'
      })
    }

    wx.showLoading({
      title: '加载中...',
    });
    this.partTimeJob();
  },

  onShow:function(){
    this.getProfile();
    this.partTimeJob();

    this.setData({
      missionStatus: '',
      pageNumber: 1,
      initPageNumber: 1,
      employeeJobs: []
    })

    this.employeeMissionRecord();
  },

  /**
  * 跳转到私信
  */
  letter: function (e) {
    let id = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/letter/letter?friend_id=' + id + '&can_chat=0'
    })
  },

  /**
   * 确认完成任务
   */
  confirmOrder:function(e){

    let job = this.data.job;
    let _this = this;
    let formId = e.detail.formId

    app.collectFormId(formId);

    app.http('post', `/finish/${job.id}/job`, {
      form_id: formId
    }, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let job = res.data.data;
        let role = _this.data.role;

        let roleProfile = '';
        if (role == 'boss') {
          roleProfile = job.employee_profile;
        } else {
          roleProfile = job.boss_profile;
        }

        _this.setData({
          job: job,
          roleProfile: roleProfile
        })

        wx.showLoading({
          title: '确认成功！',
        });
        app.globalData.postHelp = true;
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/comment_mission/comment_mission?id=' + _this.data.id
          })
        }, 1000);

      }
    });
  },

  /**
  * 重新发布任务
  */
  restart: function (e) {

    let job = this.data.job;
    let _this = this;
    let formId = e.detail.formId;

    app.collectFormId(formId);

    app.http('PUT', `/restart/${job.id}/job`,
     {
       form_id:formId
     },
     res => {
      
      if (res.data.error_code != 500) {
        wx.showLoading({
          title: '操作成功！',
        });
        app.globalData.postHelp = true;
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateBack({ comeBack: true });
        }, 1000)
      }else{
        wx.showLoading({
          title:res.data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1000)
      }
      
    });
  },

  /**
   * 进入评论页面
   */
  comment:function(){
    wx.navigateTo({
      url: '/pages/comment_mission/comment_mission?id=' + this.data.id
    })
  },

  /**
   * 获取兼职详情
   */
  partTimeJob:function(){
    let _this = this;
    app.http('GET', '/job_detail/'+this.data.id, {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let job = res.data.data;
        let role = _this.data.role;
    
        let roleProfile = '';
        if (role == 'boss') {
          roleProfile = job.employee_profile;
        } else {
          roleProfile = job.boss_profile;
        }

        _this.setData({
           job: job,
           roleProfile: roleProfile
        })

      }
    });
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

        if (profile == null) {
          wx.showLoading({
            title: '请先完善资料！',
          });
          setTimeout(function () {
            wx.hideLoading();
            wx.navigateTo({
              url: '/pages/set_profile/set_profile'
            })
          }, 1500);

        }
      }
    });
  },

  selectMssionType:function(e){

    let status = e.currentTarget.dataset.obj;
    this.setData({
      missionStatus:status,
      pageNumber: 1,
      initPageNumber: 1,
      employeeJobs: []
    })
    wx.showLoading({
      title: '加载中...',
    });
  },

  /**
   * 获取猎人悬赏记录
   */
  employeeMissionRecord:function(){
    let _this = this;

    console.log('employee');

    app.http('GET', `/job/${_this.data.id}/mission_record?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}&status=${_this.data.missionStatus}`, {}, res => {
      wx.hideLoading();
      console.log(res.data);
      let data = res.data;
      if(data.error_code == 0){
        let pageData = data.data.page_data;
        let jobs = _this.data.employeeJobs;
        pageData.map(item=>{
          jobs.push(item)
        });
        _this.setData({
           employeeJobs:jobs,
           pageNumber: _this.data.pageNumber + 1,
        })
      }

      _this.setData({
        showGeMoreLoadin: false
      })
      
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

    this.employeeMissionRecord();

  },

  /** 
  * 进入发表页面
  */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_help/post_help'
    })
  },

  /**
  * 拨打电话 
  */
  callPhone:function(e){

    let phone = e.currentTarget.dataset.phone;

    wx.makePhoneCall({
      phoneNumber: phone 
    })
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