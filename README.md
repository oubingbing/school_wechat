**部署好后台之后，需要部署前端小程序项目**

后台源码在这里：https://github.com/oubingbing/wechatAlliance

有空点一下左上角的star,谢谢。

### 需要帮忙部署的可以加微信 bingbing_ou

#### 功能
- 表白墙
- 卖舍友
- 步数旅行
- 步数排行榜
- 情侣脸
- 漫画脸
- 个人主页
- 私信
- 站内消息
- 今日话题
- 评论点赞收藏

#### 效果图

![](https://dandan-1304667790.cos.ap-shenzhen-fsi.myqcloud.com/attachments/wechat-tmp.jpeg?imageMogr2/format/webp/thumbnail/1000x)


#### 一、注册管理后台

**1、登录小情书站点进行注册：https://love.qiuhuiyi.cn/，这里换成你自己部署后的域名**

**2、注册成功后会发送一封邮件到您的邮箱，进入邮箱访问接收到的地址即可激活账户。**

**3、登录账号会跳转到小程序的建立页面**

**4、如果提交没反应可以换个浏览器试试**
![](http://article.qiuhuiyi.cn/FpYfEmcgT_M1KcRDWVCjRpkbkF0J)

小程序的名字必须和你微信注册的名称一模一样，填写完成之后提交就可以进入后台了。

![](http://article.qiuhuiyi.cn/FuxRaOWAbCI8c6TCLMcJ0QzMQFTJ)


生成的小程序需要审核通过才能获取到alliance_key和域名，叫叶子通过一下就可以了。管理后台就注册完成了。

#### 二、在微信小程序后台绑定小情书的域名
找到服务器域名配置，如下图

![](http://article.qiuhuiyi.cn/Fphrq_di6Jyw6FxtiXenpuRD8o4I)

    request合法域名
    
    https://love.qiuhuiyi.cn //你的后台域名
    
    uploadFile合法域名
    
    https://up-z2.qbox.me
    
    https://love.qiuhuiyi.cn
    
    downloadFile合法域名
    
    https://baldkf.bkt.clouddn.com 
    
    https://love.qiuhuiyi.cn //你的后台域名

这样子微信小程序就和后台服务器绑定好了。

#### 三、拉取前端源码
前端代码存放在githubs上，地址是下面这个

https://github.com/oubingbing/school_wechat  //替换成你的后台域名

拉代码的时候顺便帮忙点一下start，哈哈。

有两种获取源码的方式

1、直接下载后解压
![](http://article.qiuhuiyi.cn/FtjNDjH3zWgf2-QV_I8t4X5JN-QV)

2、会使用git的最好用这种方式拉取，怎么拉取你应该是知道的，如果你会用，哈哈。

两种方式二选一都可以的。

#### 四、配置前端。
用微信开发者工具打开源码后在项目根目录的config.js进行如下配置。

![](http://article.qiuhuiyi.cn/FvZTN_-Liecbr1nalSlf1ZPPhjE2)

只要替换好后台生成的alliance_key以及在腾讯地图开放平台注册一个账号，把开发者ID粘贴到const TX_MAP_KEY = '';就可以了。

对比一下插件版本号，看看是否是最新的版本，如果不是就在app.json里面填上最新的版本号即可。

![](http://article.qiuhuiyi.cn/FhWpAp2c5gqlcISgqw1Nf-9nu8t1)

然后dev是开发环境，prod是生产环境，进行相应的配置即可。

到这里基本上配置就完成了

## 清除全部缓存，然后再点编译，项目应该就没问题了可以运行了。
