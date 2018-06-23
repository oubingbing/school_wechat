const app = getApp();

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
      grade: this.data.grade,
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