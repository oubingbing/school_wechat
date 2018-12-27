const config={
  alianceKey:"04rNbDIGuBoYcsQn",//后台分配的allianceKey
  dev:{//开发环境
    domain:"http://127.0.0.1:8000/api/wechat",//后台接口地址
    qiniuDomain:"http://image.kucaroom.com/",//七牛地址
    bgImage:"tmp/wx0f587d7c97a68e2b.o6zAJs3oh85Zb1lJE8oWix57vny0.91gGjMXALWNEf6b9dd803a7fe4bf5f75b6afd5705a73.jpg"//个人中心背景图片
  },
  prod:{//生产环境
    domain: "https://lianyan.kucaroom.com/api/wechat",
    qiniuDomain: "http://image.kucaroom.com/",
    bgImage: "tmp/wx0f587d7c97a68e2b.o6zAJs3oh85Zb1lJE8oWix57vny0.91gGjMXALWNEf6b9dd803a7fe4bf5f75b6afd5705a73.jpg"
  }
}

const domain = config.prod.domain;
//const domain = config.dev.domain;

const qiniuDomain = config.prod.qiniuDomain;
const bgImage = config.prod.qiniuDomain;
const alianceKey = config.alianceKey;
const region = 'SCN';

const TX_MAP_KEY = 'XCDBZ-EG7C6-2OIS6-MSJDG-OQ2FT-2EBED';//腾讯地图开发者ID

module.exports = {
  domain, qiniuDomain, bgImage, alianceKey, TX_MAP_KEY, region
}