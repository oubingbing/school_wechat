
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];

Page({
  data: {
    sales:[],
    baseImageUrl: app.globalData.imageUrl,
  },
  onLoad: function () {
    this.getList();
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

    app.http('get', '/sale_friends', {}, res => {
      
      console.log(res.data.data.page_data);

      let data = res.data.data.page_data.map((item,index)=>{

        item['gender'] = genderArray[index];

        return item;

      });

      _this.setData({
        sales:res.data.data.page_data
      });

      console.log(_this.data.sales);

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

    app.http('post', `/praise`, { obj_id: objId, obj_type: objType }, res => {
      console.log('点赞成功' + res);

    });

  }

})