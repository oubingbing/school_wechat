const app = getApp();
let gradeArray = ['大一', '大二', '大三', '大四','其他'];

Page({
  data: {
    showAvatar:false,
    showNIckname:false,
    againt:false,
    sendAgaint:false,
    showGetCode:true,
    showTime:false,
    time:90,
    userName:'',
    cardNo:'',
    grade:'',
    major:'',
    college:'',
    phone:'',
    code:'',
    array: gradeArray,
    gradeValue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getProfile();
  
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      grade: gradeArray[e.detail.value],
      gradeValue: e.detail.value
    })
  },
  getProfile:function(){
    let _this = this;

    app.http('GET', '/profile', {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code != 500) {
        let profile = res.data.data;
        if (profile){
          _this.setData({
            userName: profile.name,
            cardNo: profile.student_number,
            gradeValue: profile.grade,
            grade: gradeArray[profile.grade],
            major: profile.major,
            college: profile.college,
            phone: profile.phone
          })
        }
      }else{
        wx.showLoading({
          title: '网络出错！',
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500);
      }
    });


  },
  /**
 * 获取验证码
 */
  sendMessage: function () {

    let phone = this.data.phone;
    if (phone == '') {
      wx.showLoading({
        title: '请输入手机号码！',
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 1500);
      return false;
    }

    wx.showLoading({
      title: '发送中...',
    });

    let _this = this;

    app.http('GET', '/get_message_code?phone=' + phone, {}, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code == 500){

        wx.showLoading({
          title: '发送失败，请重试！',
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500);

      }else{

        _this.setData({
          againt: true,
          showTime: true,
          showGetCode: false,
        })

        wx.showLoading({
          title: '短信验证码已发送！',
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500);

        let time = _this.data.time;

        let interval = setInterval(function () {
          _this.setData({ time: time-- });
          if (time < 0) {
            clearInterval(interval);
            _this.setData({
              showTime: false,
              againt: false,
              sendAgaint: true,
            });
          }
        }, 1000)
      }
    });

  },
  /**
   * 提交资料
   */
  submit: function () {
    let code = this.data.code;

    if (code == '') {
      wx.showLoading({
        title: '验证码不能为空！',
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 1500);
      return false;
    }

    wx.showLoading({
      title: '提交中...',
    });

    app.http('POST', '/profile', {
      student_number: this.data.cardNo,
      grade: this.data.gradeValue,
      major: this.data.major,
      college: this.data.college,
      mobile: this.data.phone,
      code: this.data.code,
      username: this.data.userName
    }, res => {
      wx.hideLoading();
      console.log(res.data);
      if (res.data.error_code == 500) {
        wx.showLoading({
          title: res.data.error_message,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500);
      } else {
        wx.showLoading({
          title: '提交成功！',
        });
        setTimeout(function () {
          wx.navigateBack({ comeBack: true });
          wx.hideLoading();
        }, 1500);
      }
    });

  },
  getName: function (event){
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      userName: content
    })
  },
  getNumber: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      cardNo: content
    })
  },
  getMajor: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      major: content
    })
  },
  getGrade: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      grade: content
    })
  },
  getCollege: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      college: content
    })
  },
  getPhone: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      phone: content
    })
  },
  getCode: function (event) {
    console.log(event.detail.value);

    let content = event.detail.value;
    this.setData({
      code: content
    })
  },
})