

**部署好后台之后，需要部署前端小程序项目**

#### 一、注册管理后台

**1、登录小情书站点进行注册：https://lianyan.kucaroom.com/**，这里换成你自己部署后的域名

**2、注册成功后会发送一封邮件到您的邮箱，进入邮箱访问接收到的地址即可激活账户。**

**3、登录账号会跳转到小程序的建立页面**

**4、如果提交没反应可以换个浏览器试试，因为选择学校的控制不匹配你的浏览器，改页面是有一个选择学校的搜索框的。**
<img src="http://article.qiuhuiyi.cn/FpYfEmcgT_M1KcRDWVCjRpkbkF0J" alt="">

小程序的名字必须和你微信注册的名称一模一样，然后选择你所在的学校，这个输入框是可以搜索的，要是没有您的学校您可以跟叶子说一下，叫他帮忙加上就可以了。填写完成之后提交就可以进入后台了。

注意：如果没有看到选择学校的输入框，请换另外一个浏览器试试，例如谷歌或者360浏览器。
<img src="http://article.qiuhuiyi.cn/FuxRaOWAbCI8c6TCLMcJ0QzMQFTJ" alt="">

生成的小程序需要审核通过才能获取到alliance_key和域名，叫叶子通过一下就可以了。管理后台就注册完成了。

#### 二、在微信小程序后台绑定小情书的域名
找到服务器域名配置，如下图
<img src="http://article.qiuhuiyi.cn/Fphrq_di6Jyw6FxtiXenpuRD8o4I" alt="">

    request合法域名
    
    https://lianyan.kucaroom.com //你的后台域名
    
    uploadFile合法域名
    
    https://up-z2.qbox.me
    
    https://lianyan.kucaroom.com
    
    downloadFile合法域名
    
    https://baldkf.bkt.clouddn.com 
    
    https://lianyan.kucaroom.com //你的后台域名

这样子微信小程序就和后台服务器绑定好了。

#### 三、拉取前端源码
前端代码存放在githubs上，地址是下面这个

https://github.com/oubingbing/school_wechat  //替换成你的后台域名

拉代码的时候顺便帮忙点一下start，哈哈。

有两种获取源码的方式

1、直接下载后解压
<img src="http://article.qiuhuiyi.cn/FtjNDjH3zWgf2-QV_I8t4X5JN-QV" alt="">

2、会使用git的最好用这种方式拉取，怎么拉取你应该是知道的，如果你会用，哈哈。

两种方式二选一都可以的。

#### 四、配置前端。
用微信开发者工具打开源码后在项目根目录的config.js进行如下配置。

<img src="http://article.qiuhuiyi.cn/FtRwlJcRloawY1HlF7kfpiT6ydR1" alt="">

只要替换好后台生成的alliance_key就可以了，然后dev事开发环境，prod是生产环境，进行相应的配置即可

到这里基本上配置就完成了

## 清除全部缓存，然后再点编译，项目应该就没问题了可以运行了。


### 觉得对你有帮助的话，可以打赏一下作者，谢谢啦。
<img src="http://article.qiuhuiyi.cn/hui_yi_15398317840008242" alt="">
