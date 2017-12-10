const util = require("../../utils/util.js");
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    sales:[],
    baseImageUrl: app.globalData.imageUrl,
    currentTime:'',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false
  },
  onLoad: function () {
    this.getList();

    //设置当前时间
    this.setData({
      currentTime: util.formatTime(new Date())
    });
    console.log('当前时间：' + this.data.currentTime);


  },
  onShow:function(){

    console.log('当前时间：' + this.data.currentTime);

    this.getMostNewData();

  },
  /**
   * 进入发表页面
   */
  post: function () {
    console.log('Post');

    wx.navigateTo({
      url: '/pages/post_sale/post_sale'
    })
  },

  /**
   * 进入品论页面
   */
  comment:function(e){
    
    let id = e.currentTarget.dataset.objid;

    wx.navigateTo({
      url: '/pages/comment_sale/comment_sale?id='+id
    })
  },

  /**
   * 获取贴子列表
   */
  getList:function(){

    let _this = this;

    app.http('get', '/sale_friends', {
      page_size: this.data.pageSize,
      page_number: this.data.pageNumber
    }, res => {

      this.setData({
        showGeMoreLoadin: false
      });
      
      console.log('返回的贴子数据');
      console.log(res.data.data.page_data);
      console.log('第几页' + this.data.pageNumber);

      let data = res.data.data.page_data;

      let sales = _this.data.sales;

      if (data.length > 0) {
        data.map(item => {
          sales.push(item);
        });

        this.setData({
          sales: sales,
          pageNumber: this.data.pageNumber + 1
        });
      } else {
        this.setData({
          notDataTips: true
        });
      }

    });

  },

  /**
* 下拉刷新，获取最新的贴子
*/
  onPullDownRefresh: function () {

    console.log('当前时间：' + this.data.currentTime);

    this.getMostNewData();
  },

  /**
 * 上拉加载跟多
 */
  onReachBottom: function () {

    console.log('到底了');

    let _this = this;

    this.setData({
      notDataTips: false
    });

    this.setData({
      showGeMoreLoadin: true
    });

    this.getList();

  },

  /**
   * 获取当前最新的贴子
   */
  getMostNewData:function(){

    let _this = this;

    let time = this.data.currentTime;

    app.http('get', '/most_new_sale_friend?time='+time, {}, res => {

      let sales = _this.data.sales;

      let data = 

      res.data.data.map(item => {

        let ifRepeat = false;
        for(let sale of sales){
          if(sale.id == item.id){
            ifRepeat = true;
          }
        }

        if(!ifRepeat){
          sales.unshift(item);
        }

      });

      _this.setData({
        sales:sales
        });

      wx.stopPullDownRefresh();

      console.log(res);

      _this.setData({
        currentTime: util.formatTime(new Date())
      });

    });

  },

  /**
   * 删除帖子
   */
  delete:function(e){
    console.log(e);

    let id = e.currentTarget.dataset.objid;
    let _this = this;

    app.http('delete',`/delete/${id}/sale_friend`,{},res=>{

      console.log(res);

      if(res.data.data){

        let oldSales = _this.data.sales;
        let sales = oldSales.filter(item=>{
          if(item.id != id){
            return item;
          }

        });
        
        _this.setData({
          sales:sales
        });

      }

    });
  },

  /**
   * 点赞
   */
  praise:function(e){
    console.log('点赞');
    let objId = e.currentTarget.dataset.objid;
    let objType = 2;
    console.log(objId);

    this.setData({
      show: 0,
      hidden: false,
      showCommentInput: false
    });

    let _this = this;

    app.http('post', `/praise`, {
       obj_id: objId, 
       obj_type: objType 
       }, res => {
      console.log('点赞成功' + res);

      let sales = _this.data.sales;
      let newSales = sales.map(item=>{
        if(item.id == objId){
          item.praise_number += 1;
        }

        return item;
      });

      _this.setData({
        sales:newSales
      });

    });

  }

})