const http = require("./../../../utils/http.js");
const app = getApp()

Page({
  data: {
    colleges: [],
    collegeName:null,
    showEmpty:false
  },
  onLoad: function () {

    let school = wx.getStorageSync('school')
    if(school <= 0 || school == undefined || school == ""){
      wx.setStorageSync('school', -1)
      wx.setNavigationBarTitle({
        title: '选择学校',
      })
    }else{
      wx.switchTab({
        url: '/pages/home/index/index'
      })
      return false
    }

    let _this = this;
    this.recommendSchool(_this);
  },

  //推荐学校
  recommendSchool:function(_this){
    http.get('/recommend_school',{},function(res){
      console.log(res.data);
      _this.setData({
        colleges:res.data.data
      });
    });
  },

  //获取更多学校信息
  moreColleges:function(){
    this.recommendSchool(this);
  },

  //选择学校
  selectCollege:function(event){
    let collegeId = event.target.id;
    wx.setStorageSync('school', collegeId)
    let _this = this;
    http.get(`/set/${collegeId}/college`,{},function(res){
      console.log(res.data);
      if(res.data.error_code == 5004){
        wx.showToast({
          title: '学校不存在',
          icon:"none"
        })
      }else{
        //wx.navigateBack();
        wx.setStorageSync('school', collegeId)
        wx.switchTab({
          url: '/pages/home/index/index'
        })
      }
    });
  },

  //获取输入框的内容
  getCollegeName:function(event){
    let value = event.detail.value;
    this.setData({
      collegeName:value
    });
  },

  //搜索学校
  searchCollege:function(event){
    if(this.data.collegeName == null || this.data.collegeName == ''){
      wx.showToast({
        title: '内容不能为空',
        icon: 'loading',
        duration: 2000
      })
      return;
    }

    let collegeName = this.data.collegeName;
    let _this = this;

    http.get(`/search_college?college=${collegeName}`,{},function(res){
      console.log(res.data);
      if(res.data.error_code){
        wx.showToast({
          title: res.data.error_message,
          icon: 'loading',
          duration: 2000
        })
      }

      if(res.data.data.length !== 0){
        console.log('not empty');
        _this.setData({
          colleges:res.data.data,
          showEmpty:false
        });
      }else{
        console.log('empty');
        _this.setData({
          colleges:null,
          showEmpty:true
        });
      }
    });

  }
})