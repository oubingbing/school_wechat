var QQMapWX = require('./../../../utils/qqmap-wx-jssdk.js');
const distance = require('./../../../utils/dist');
const http = require("./../../../utils/http.js");
const config = require("./../../../config.js");
const app = getApp()
var qqmapsdk;

Page({
  data: {
    show_auth: app.globalData.show_auth,
    qrCode: '',
    imageUrl: app.globalData.imageUrl,
    todayStep: 0,
    totalStep: 0,
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    steps: [],
    user: '',
    showGeMoreLoadin: false,
    select:1,

    //旅行数据
    latitude: 0,
    longitude: 0,
    includePoints: [],
    markers: [],
    travelLogMarkers: [],
    notTravelLogMarkers: [],
    notLabelMarkers: [],
    labelMarkers: [],
    polyline: [{
      points: [],
      color: "#FF4500",
      width: 3,
      dottedLine: false
    }],
    logs: [],
    pageSize: 4,
    pageNumber: 1,
    initPageNumber: 1,
    plan: '',
    showPostPlan: false,
    avatar: '',
    showReport: false,
    showMap: true,
    showTravelLocation: true,
    showTravelLabel: true,
    report: '',
    mapView: 1,
    fullView: 'full-view',
    harfView: 'harf-view',
    showFinish: false,
    showGeMoreLoadin: false,
    showTips: false
    
  },

  onLoad: function (option) {
    this.setData({
      user: wx.getStorageSync('user'),
      todayStep: wx.getStorageSync('todayStep'),
      totalStep: wx.getStorageSync('totalStep')
    })
    this.statistic();
    this.steps();
    this.loginForRunData();

    let tips = wx.getStorageSync('tips');
    if (tips == '') {
      this.setData({
        showTips: true
      })
    }

    wx.showLoading({ title: '加载中' });
    this.plan();
    this.downLoadAvatar();
    qqmapsdk = new QQMapWX({
      key: config.TX_MAP_KEY
    });
    this.getLocation();
  },

  onReady: function (e) {
    this.travelLogs();
    this.getPersonalInfo();
  },

  onShow: function () {
    if (app.newTravelPlan == true) {
      wx.showLoading({ title: '加载中' });
      this.setData({
        includePoints: [],
        markers: [],
        travelLogMarkers: [],
        notTravelLogMarkers: [],
        notLabelMarkers: [],
        labelMarkers: [],
        polyline: [{
          points: [],
          color: "#FF4500",
          width: 3,
          dottedLine: false
        }],
        logs: [],
        pageSize: 4,
        pageNumber: 1,
        initPageNumber: 1,
        plan: '',
        showPostPlan: false,
        avatar: '',
        showReport: false,
        showMap: true,
        showTravelLocation: true,
        showTravelLabel: true,
        report: '',
        mapView: 1,
        fullView: 'full-view',
        harfView: 'harf-view',
        showFinish: false
      })

      this.plan();
      this.travelLogs();
      app.newTravelPlan = false;
    }
  },

  /**
 * 获取具体类型的贴子
 */
  selected(e) {
    let objType = e.currentTarget.dataset.type;
    this.setData({ select:objType})
  },

  /**
   * 获取个人信息
   */
  getPersonalInfo() {
    http.get(`/personal_info`, {}, res => {
      this.setData({
        user: res.data.data
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  /**
   * 登录获取微信步数
   */
  loginForRunData: function () {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.werun']) {
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              console.log("res.code:" + res.code);
              let code = res.code;
              wx.getWeRunData({
                success(res) {
                  const encryptedData = res.encryptedData;
                  const iv = res.iv;
                  that.postRunData(encryptedData, iv, code);
                }
              })
            }
          })
        } else {
          wx.authorize({
            scope: "scope.werun", success(res) {
              that.loginForRunData();
              that.getPersonalInfo();
            }
          })
        }
      }
    })
  },

  /**
   * 收集用户步数
   */
  postRunData: function (encryptedData, iv, code) {
    http.post(`/run_data`,
      {
        encrypted_data: encryptedData,
        iv: iv,
        code: code
      }, res => {
        wx.hideLoading();
        console.log(res);
        this.statistic();
        this.steps();
      });
  },


  /** 
   * 小程序的二维码
   */
  getQrCode: function (_this) {
    http.get('/qr_code', {}, res=> {
      this.setData({
        qrCode: res.data.data.qr_code
      })
    });
  },

  /**
   * 获取统计的数据
   */
  statistic: function () {
    http.get('/run_statistic', {}, res=>{
      wx.hideLoading();
      let todayStep = res.data.data.today_step != null ? res.data.data.today_step : 0;
      let totalStep = res.data.data.total_step != null ? res.data.data.total_step : 0;
      this.setData({
        todayStep: todayStep,
        totalStep: totalStep
      })
      wx.setStorageSync('todayStep', todayStep);
      wx.setStorageSync('totalStep', totalStep);
    });
  },

  /**
   * 获取步数列表
   */
  steps: function () {
    //wx.showLoading({ title: '加载中' });
    let order_by = 'run_at';
    let sort_by = 'desc';
    http.get(`/run_steps?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}&order_by=${order_by}&sort_by=${sort_by}`,
      {},
      res=> {
        wx.hideLoading();
        console.log(res);
        if (res.data.error_code == 0) {
          let steps = this.data.steps;
          let stepData = res.data.data.page_data;
          for (let step in stepData) {
            steps.push(stepData[step]);
          }
          this.setData({
            steps: steps,
            pageNumber: this.data.pageNumber + 1,
            showGeMoreLoadin: false
          })
        }
      });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    })
    this.steps();
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '说走就走，让步数带你去旅行吧',
      path: 'pages/index/index',
      imageUrl: '/image/share-pic.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },

  openTravelList: function () {
    wx.navigateTo({
      url: '/pages/travel_list/travel_list'
    })
  },

  //旅行代码
  hideTips: function () {
    wx.setStorageSync('tips', 'not show');
    this.setData({
      showTips: false
    })
  },

  helpMe: function () {
    this.setData({
      showTips: true
    })
  },

  changeView: function () {
    let mapView = this.data.mapView;
    if (mapView == 1) {
      this.setData({
        mapView: 2
      })
    } else {
      this.setData({
        mapView: 1
      })
    }
  },

  ifShowTravelLocation: function () {
    let show = this.data.showTravelLocation;
    this.setData({
      markers: []
    })
    if (!show) {
      this.setData({
        showTravelLocation: true,
        markers: this.data.travelLogMarkers
      })
    } else {
      this.setData({
        showTravelLocation: false,
        markers: this.data.notTravelLogMarkers
      })
    }
  },

  ifShowTravelLabel: function () {
    let show = this.data.showTravelLabel;
    this.setData({
      markers: []
    })
    console.log()
    if (!show) {
      this.setData({
        showTravelLabel: true,
        markers: this.data.labelMarkers
      })
    } else {
      this.setData({
        showTravelLabel: false,
        markers: this.data.notLabelMarkers
      })
    }
    console.log(this.data.markers)
  },

  getReport: function () {
    wx.showLoading({ title: '海报生成中' });
    let _this = this;
    http.get(`/travel_report/${this.data.plan.id}`, {}, function (res) {

      console.log(res.data.data);
      if (res.data.data != '') {
        _this.setData({
          report: res.data.data
        })
        _this.drawReport();
      }

    });
  },

  /**
   * 获取用户当前位置
   */
  getLocation: function () {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        let includePoints = _this.data.includePoints;
        includePoints.push({
          longitude: longitude,
          latitude: latitude
        })

        _this.setData({
          latitude: latitude,
          longitude: longitude,
          includePoints: includePoints
        })
      }
    })
  },

  /**
   * 下载用户头像
   */
  downLoadAvatar: function () {
    let _this = this;
    let avatarImage = _this.data.avatar;
    let user = wx.getStorageSync('user');
    if (avatarImage == '') {
      wx.downloadFile({
        url: user.avatar,
        success: function (res) {
          if (res.statusCode === 200) {
            wx.playVoice({
              filePath: res.tempFilePath
            })
            console.log(res);
            _this.setData({
              avatar: res.tempFilePath
            })
          }
        }
      })
    } else {
      _this.setData({
        avatar: avatarImage
      })
    }
  },

  /**
   * 隐藏报告
   */
  hideReport: function () {
    console.log('隐藏');
    this.setData({
      showReport: false,
      showMap: true
    })
  },

  /**
   * 绘制报告
   */
  drawReport: function () {
    wx.hideLoading();
    let user = wx.getStorageSync('user');
    let report = this.data.report;
    let plan = this.data.plan;

    let status = '旅行中';
    if (plan.status == 1) {
      status = '旅行中';
    } else {
      if (plan.status == 2) {
        status = '已终止';
      } else {
        status = '已完成';
      }
    }

    let start = '';
    let end = '';
    report.points.map(item => {
      if (item.type == 1) {
        start = item.name
      } else {
        if (item.type == 3) {
          end = item.name
        }
      }
    })

    this.setData({
      showReport: true,
      showMap: false
    })
    let avatarImage = this.data.avatar;
    console.log(wx.getSystemInfoSync().windowWidth);
    let windowWidth = (wx.getSystemInfoSync().windowWidth - 35);
    let windowHeight = wx.getSystemInfoSync().windowHeight;
    let avatar = this.data.avatar;

    console.log('头像：' + avatar);
    console.log(wx.getSystemInfoSync());
    console.log('高度：' + windowHeight);
    const ctx = wx.createCanvasContext('myCanvas')

    //ctx.setStrokeStyle('red')
    //ctx.moveTo(windowWidth / 2, 20)
    //ctx.lineTo(windowWidth / 2, 170)
    //ctx.stroke()

    ctx.drawImage('/image/bg-report.jpg', 0, 0, (windowWidth / 1), (windowHeight - (windowHeight / 8)));

    ctx.setFontSize(15)
    ctx.setFillStyle('#FFFFFF')
    ctx.setTextAlign('left')
    ctx.fillText(user.nickname, (windowWidth / 2), 80)
    ctx.fillText(status, (windowWidth / 2), 100)

    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('步数旅行者', windowWidth / 2, 30)

    ctx.setFontSize(15)

    ctx.fillText(start, windowWidth / 2, 155)
    ctx.drawImage('/image/jiantou.png', (windowWidth / 2) - (windowWidth / 30), 160, 20, 20);
    ctx.fillText(end, windowWidth / 2, 195)
    ctx.fillText(`旅行了 ${report.travel.province} 个省，${report.travel.city} 座城市`, windowWidth / 2, 240)
    ctx.fillText(`住了 ${report.poi.hotel} 个酒店`, windowWidth / 2, 270)
    ctx.fillText(`游玩了 ${report.poi.view} 个景点`, windowWidth / 2, 300)
    ctx.fillText(`下了 ${report.poi.food} 次馆子`, windowWidth / 2, 330)

    ctx.setFontSize(17)
    ctx.fillText(`行程：${report.travel.distance} 公里`, (windowWidth / 2) - 70, 360)
    ctx.fillText(`步数：${report.travel.step}`, (windowWidth / 2) + 70, 360)
    ctx.save();
    ctx.setFillStyle('#CD2626')
    ctx.drawImage('/image/qrcode.jpg', (windowWidth / 2) + (windowWidth / 4), (windowHeight - (windowHeight / 4)), 60, 60)
    ctx.drawImage(avatarImage, (windowWidth / 2) - 70, 55, 60, 60)
    ctx.draw();
  },

  /**
   * 保存报告
   */
  saveReport: function () {
    wx.authorize({
      scope: "scope.writePhotosAlbum", success(res) {
        console.log('授权获得微信运动数据');
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success: function success(res) {
            console.log(res.tempFilePath)
            let image = res.tempFilePath;
            wx.saveImageToPhotosAlbum({
              filePath: image,
              success(res) {
                console.log(res)
              }
            })
          },
          complete: function complete(e) {
            console.log(e.errMsg);
          }
        });
      }
    })
  },

  /**
   * 保存周边咨询
   */
  savePoi: function (logId, title, address, poiType) {
    http.post(`/create_poi`,
      {
        title: title,
        address: address,
        type: poiType,
        log_id: logId
      }, res => {
        console.log(res);
      });
  },

  /**
   * 获取计划
   */
  plan: function () {
    console.log('plan');
    let _this = this;
    http.get(`/plan`, {}, res => {
      wx.hideLoading();
      console.log(res.data.data);
      let resData = res.data.data;
      if (resData == null) {
        _this.setData({
          showPostPlan: true
        })
        return false;
      }

      if (res.data.error_code == 0) {
        let travelLogMarkers = _this.data.travelLogMarkers;
        let polyline = _this.data.polyline;
        let points = polyline[0].points;
        let planPoints = resData.points;
        planPoints.map(item => {
          points.push({
            longitude: item.longitude,
            latitude: item.latitude
          });
        })

        let travelLogs = resData.travel_logs;
        let finishPoint = [];
        travelLogs.map((item, key) => {
          //标记坐标点
          if (key == travelLogs.length - 1) {
            if (item.name != null) {
              travelLogMarkers.push({
                id: key,
                iconPath: '/image/traveling.png',
                latitude: item.latitude,
                longitude: item.longitude,
                width: 30,
                height: 30,
                label: {
                  content: item.name,
                  fontSize: 8,
                  bgColor: "#FF6347",
                  color: "#FFFFFF",
                  padding: 5,
                  borderRadius: 10
                }
              });
            } else {
              travelLogMarkers.push({
                id: key,
                iconPath: '/image/traveling.png',
                latitude: item.latitude,
                longitude: item.longitude,
                width: 30,
                height: 30
              });
            }

          } else {
            travelLogMarkers.push({
              id: key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 30,
              height: 30
            });
          }

          finishPoint.push({
            latitude: item.latitude,
            longitude: item.longitude,
          });
        })

        let linePoint = resData.points;
        let travelLogLength = travelLogs.lenght;
        let notTravelLogMarkers = _this.data.notTravelLogMarkers;
        let notLabelMarkers = _this.data.notLabelMarkers;
        linePoint.map((item, key) => {
          let icon = '';
          if (key == 0) {
            icon = '/image/start.png';
          } else {
            if (key == linePoint.length - 1) {
              icon = '/image/end.png';
            } else {
              icon = '/image/point.png';
            }
          }

          if (item.name != null) {
            travelLogMarkers.push({
              iconPath: icon,
              id: travelLogLength + key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 30,
              height: 30,
              label: {
                content: item.name,
                fontSize: 8,
                bgColor: "#FF6347",
                color: "#FFFFFF",
                padding: 5,
                borderRadius: 10
              }
            });

            notTravelLogMarkers.push({
              iconPath: icon,
              id: notTravelLogMarkers.length + key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 30,
              height: 30,
              label: {
                content: item.name,
                fontSize: 8,
                bgColor: "#FF6347",
                color: "#FFFFFF",
                padding: 5,
                borderRadius: 10
              }
            });
          } else {
            travelLogMarkers.push({
              iconPath: icon,
              id: travelLogLength + key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 30,
              height: 30
            });

            notTravelLogMarkers.push({
              iconPath: icon,
              id: notTravelLogMarkers.length + key,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 30,
              height: 30
            });
          }

          notLabelMarkers.push({
            iconPath: icon,
            id: notTravelLogMarkers.length + key,
            latitude: item.latitude,
            longitude: item.longitude,
            width: 30,
            height: 30
          })
        })
        if (travelLogs.length > 0) {
          console.log('这到底是啥：' + travelLogs[travelLogs.length - 1].name);
          //没有旅途点的标记
          notTravelLogMarkers.push({
            iconPath: '/image/traveling.png',
            id: travelLogLength + 1,
            latitude: travelLogs[travelLogs.length - 1].latitude,
            longitude: travelLogs[travelLogs.length - 1].longitude,
            width: 30,
            height: 30,
            label: {
              content: travelLogs[travelLogs.length - 1].name,
              fontSize: 8,
              bgColor: "#FF6347",
              color: "#FFFFFF",
              padding: 5,
              borderRadius: 10
            }
          });

          notLabelMarkers.push({
            iconPath: '/image/traveling.png',
            id: travelLogLength + 1,
            latitude: travelLogs[travelLogs.length - 1].latitude,
            longitude: travelLogs[travelLogs.length - 1].longitude,
            width: 30,
            height: 30
          })
        }

        let finishPolyline = {
          points: finishPoint,
          color: "#1296DB",
          width: 3,
          dottedLine: true,
          arrowLine: true
        };
        polyline.push(finishPolyline)

        //缩放地图
        let includePoints = _this.data.includePoints;
        if (travelLogs.length > 0) {
          includePoints.push({
            longitude: travelLogs[travelLogs.length - 1].longitude,
            latitude: travelLogs[travelLogs.length - 1].latitude
          })
        } else {
          includePoints.push({
            longitude: points[points.length - 1].longitude,
            latitude: points[points.length - 1].latitude
          })
        }


        //画线
        polyline[0].points = points;
        console.log('地图线路的数据：');
        console.log(polyline);
        let markers = travelLogMarkers;
        _this.setData({
          polyline: polyline,
          latitude: planPoints[0].latitude,
          longitude: planPoints[0].longitude,
          includePoints: includePoints,
          //markers: notTravelLogMarkers,
          markers: notLabelMarkers,
          planId: resData.id,
          plan: resData,
          travelLogMarkers: travelLogMarkers,
          notTravelLogMarkers: notTravelLogMarkers,
          labelMarkers: notTravelLogMarkers,
          notLabelMarkers: notLabelMarkers,
          showFinish: resData.status == 3 ? true : false
        })
      }
    });

  },

  /**
   * 获取旅行日志
   */
  travelLogs: function () {
    let _this = this;
    http.get(`/ravel_logs?page_size=${_this.data.pageSize}&page_number=${_this.data.pageNumber}`,
      {},
      function (res) {
        console.log(res.data.data);
        let logData = res.data.data.page_data;
        if (logData != null) {
          let logs = _this.data.logs;
          logData.map(item => {
            logs.push(item);
          })
          _this.setData({
            logs: logs,
            pageNumber: _this.data.pageNumber + 1,
            showGeMoreLoadin: false
          })
          _this.exchangeLocation(_this, logData);
          _this.getPoi(_this, logData);
        }
      });
  },

  /**
   * 获取地理名字
   */
  exchangeLocation: function (_this, logs) {
    logs.map(item => {
      if (item.name == '') {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: item.latitude,
            longitude: item.longitude
          },
          success: function (res) {
            console.log(res);
            if (res.status == 0) {
              let name = res.result.formatted_addresses.recommend
              let address = res.result.address
              let theLogs = _this.data.logs;
              let newLogs = theLogs.map(sub_item => {
                if (sub_item.id == item.id) {
                  sub_item.name = name;
                  sub_item.address = address;
                }
                return sub_item;
              })
              console.log('new logs' + newLogs);
              _this.setData({
                logs: newLogs
              })
              let ad_info = res.result.ad_info;
              let province = ad_info.province;
              let city = ad_info.city;
              let district = ad_info.district;
              _this.updateLog(item.id, name, address, province, city, district);
            }
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    })
  },

  /**
   * 更新日志的地理信息
   */
  updateLog: function (logId, name, address, province, city, district) {
    http.put(`/update_log`,
      {
        name: name,
        address: address,
        log_id: logId,
        province: province,
        district: district,
        city: city
      }, res => {

        console.log(res);

      });
  },

  /**
   * 获取附近的咨询
   */
  getPoi: function (_this, logs) {
    logs.map(item => {
      if (item.hotel == null) {
        _this.getPoiHotel(_this, item.id, item.latitude, item.longitude);
      }
      if (item.foods == '') {
        _this.getPoiFood(_this, item.id, item.latitude, item.longitude);
      }
      if (item.views == '') {
        _this.getPoiView(_this, item.id, item.latitude, item.longitude);
      }
    })
  },

  /**
   * 获取酒店信息
   */
  getPoiHotel: function (_this, id, latitude, longitude) {
    qqmapsdk.search({
      keyword: "酒店",
      page_size: 1,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let hotel = res.data[0].title
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.hotel = hotel;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })
          _this.savePoi(id, hotel, res.data[0].address, 1)
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 获取美食
   */
  getPoiFood: function (_this, id, latitude, longitude) {
    qqmapsdk.search({
      keyword: "美食",
      page_size: 5,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let foods = res.data;
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.foods = foods;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })

          foods.map(item => {
            _this.savePoi(id, item.title, item.address, 2)
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 获取景点
   */
  getPoiView: function (_this, id, latitude, longitude) {
    qqmapsdk.search({
      keyword: "景点",
      page_size: 5,
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        if (res.status == 0) {
          let views = res.data;
          let theLogs = _this.data.logs;
          let newLogs = theLogs.map(sub_item => {
            if (sub_item.id == id) {
              sub_item.views = views;
            }
            return sub_item;
          })
          console.log('new logs' + newLogs);
          _this.setData({
            logs: newLogs
          })
          views.map(item => {
            _this.savePoi(id, item.title, item.address, 3)
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 新建旅程
   */
  createTravel: function () {
    wx.navigateTo({
      url: '/pages/travel/create_travel/create_travel'
    })
  },

  /**
   * 分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '说走就走，让步数带你去旅行吧',
      path: 'pages/index/index',
      imageUrl: '/image/share-pic.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },

})