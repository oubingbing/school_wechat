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
    grade: gradeArray
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
  },
  /**
   * 确认完成任务
   */
  confirmOrder:function(){

    let job = this.data.job;
    let _this = this;

    app.http('post', `/finish/${job.id}/job`, {}, res => {
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
        setTimeout(function () {
          wx.hideLoading();
          wx.navigateTo({
            url: '/pages/comment_mission/comment_mission?id=' + _this.data.id
          })
        }, 1000);

      }
    });
  },
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
          }, 2000);

        }
      }
    });
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
 * 获取具体类型的贴子
 */
  selected(e) {

  },
  callPhone:function(e){

    let phone = e.currentTarget.dataset.phone;

    wx.makePhoneCall({
      phoneNumber: phone 
    })
  }
});