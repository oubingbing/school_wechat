
const app = getApp()

Page({
  data: {
    colleges: [],
    collegeName:null,
    showEmpty:false
  },
  onLoad: function () {
    console.log('post loading');
    let _this = this;

    this.recommendSchool(_this);
  },

  /**
   * 推荐学校
   */
  recommendSchool:function(_this){
    console.log('recommmend school');

    app.http('GET','/recommend_school',{},function(res){
      console.log(res.data);

      if(res.data.data.length !== 0){
        _this.setData({
          colleges:res.data.data,
          showEmpty:false
        });
      }else{
        _this.setData({
          colleges:res.data.data,
          showEmpty:true
        });
      }

    });
  },

  /**
   * 获取更多学校信息
   * 
  */
  moreColleges:function(){
    this.recommendSchool(this);
  },

  /**
   * 选择学校
   */
  selectCollege:function(event){

    console.log(event.target.id);
    
    let collegeId = event.target.id;
    let _this = this;

    app.http('PATCH',`/set/${collegeId}/college`,{},function(res){
      console.log(res.data);

      if(res.data.error_message || res.data.error_code == 5004){
        console.log(学校不存在);
      }else{
        console.log('选择学校成功返回主页面');
        app.globalData.changeSchoolPost = true;
        app.globalData.changeSchoolSale = true;
        app.globalData.changeSchoolMatch = true;
        wx.navigateBack();
      }

    });
  },

  /**
   * 获取输入框的内容
   */
  getCollegeName:function(event){

    let value = event.detail.value;
    this.setData({
      collegeName:value
    });

  },

  /**
   * 搜索学校
   */
  searchCollege:function(event){
    
    console.log(this.data.collegeName);

    if(this.data.collegeName == null || this.data.collegeName == ''){
      wx.showToast({
        title: '内容不能为空',
        icon: 'loading',
        duration: 1000
      })
      return;
    }

    let collegeName = this.data.collegeName;
    let _this = this;

    app.http('get',`/search/${collegeName}/college`,{},function(res){
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
  },
  /**
   * 选择所有学校
   */
  clearSchool:function(){
    app.http('patch', `/clear_school`, {}, function (res) {
      app.globalData.changeSchoolPost = true;
      app.globalData.changeSchoolSale = true;
      app.globalData.changeSchoolMatch = true;
      wx.navigateBack();
    })
  }
})