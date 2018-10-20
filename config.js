const config={
  alianceKey:"04rNbDIGuBoYcsQn",//后台分配的allianceKey
  dev:{//开发环境
    domain:"http://127.0.0.1:8000/api/wechat",//后台接口地址
    qiniuDomain:"http://image.kucaroom.com/",//七牛地址
    bgImage:"http://image.kucaroom.com/30269a739a66831daa31ec93d28318af.jpg"//个人中心背景图片
  },
  prod:{//生产环境
    domain: "https://lianyan.kucaroom.com/api/wechat",
    qiniuDomain: "http://image.kucaroom.com/",
    bgImage: "http://image.kucaroom.com/30269a739a66831daa31ec93d28318af.jpg"
  }
}

//const domain = config.prod.domain;
const domain = config.dev.domain;

const qiniuDomain = config.prod.qiniuDomain;
const bgImage = config.prod.qiniuDomain;
const alianceKey = config.alianceKey;

module.exports = {
  domain, qiniuDomain, bgImage, alianceKey
}