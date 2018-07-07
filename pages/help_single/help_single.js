const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    job: '',
    id:'',
    baseImageUrl: app.globalData.imageUrl,
    showGeMoreLoadin: false,
    newMessageNumber: 0,
    currentTime: '',
    profile: null,
    filter: ''
  },

  onLoad: function (option) {
    wx.showLoading({
      title: '加载中...',
    });

    this.setData({
      id: option.id
    });

    this.partTimeJob();
    this.getProfile();
  },

  onShow: function () {
    this.getProfile();
  },

  /**
 * 获取兼职详情
 */
  partTimeJob: function () {
    let _this = this;

    console.log('id是啥：'+_this.data.id);

    app.http('GET', '/job_detail/' + _this.data.id, {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let job = res.data.data;
        _this.setData({
          job: job
        })

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
  detail: function (e) {

    let id = e.currentTarget.dataset.obj;
    let entry = e.currentTarget.dataset.entry;
    let role = e.currentTarget.dataset.role;

    let formId = e.detail.formId;
    app.collectFormId(formId);

    if (entry) {
      wx.navigateTo({
        url: '/pages/help_detail/help_detail?id=' + id + '&role=' + role
      })
    }
  },

  hadStop: function (e) {
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
  helps: function () {

    let order_by = 'created_at';
    let sort_by = 'desc';
    let objType = this.data.select;
    let filter = this.data.filter;

    if (objType == 0 || objType == 1) {
      order_by = 'created_at';
    } else {
      order_by = 'updated_at';
    }

    let _this = this;
    app.http('GET',
      `/helps?page_size=${_this.data.pageSize} & page_number=${_this.data.pageNumber} & order_by=${order_by} & sort_by=${sort_by} & type=${objType} & filter=${filter}`, {}, res => {
        wx.hideLoading();
        console.log(res);

        let jobs = _this.data.jobs;

        let data = res.data.data.page_data;
        data.map(item => {
          jobs.push(item);
        })

        _this.setData({
          jobs: jobs,
          pageNumber: _this.data.pageNumber + 1,
          showGeMoreLoadin: false
        })
      });
  },

  /**
   * 接单
   */
  order: function (e) {

    console.log(e);

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
        }, 1500);
      }

      return false;
    }

    let id = e.currentTarget.dataset.obj;
    let formId = e.detail.formId;
    app.collectFormId(formId);

    app.http('POST', '/receipt_order', {
      id: id
    }, res => {
      console.log(res);
      if (res.data.error_code != 500) {
        wx.showLoading({
          title: '接单成功！',
        });
        setTimeout(function () {
          wx.hideLoading();
          app.globalData.postHelp = true;
          wx.navigateTo({
            url: '/pages/help_detail/help_detail?id=' + id
          })
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
  }
});