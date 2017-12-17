const util = require('../../utils/util.js')

Page({
  data: {
    grant_type:'password'
  },
  onLoad: function () {
    
  },
  login:function(){
    var options = {
      apiUrl: WebIM.config.apiURL,
      user: 'bingbing',
      pwd: 'bingbing',
      grant_type: that.data.grant_type,
      appKey: WebIM.config.appkey
  }
    WebIM.conn.open(options)
  },
  listen:function(){
    

    WebIM.conn.listen({
      onOpened: function (message) {
          WebIM.conn.setPresence()
      },
      onPresence: function (message) {

        console.log(message)

      },
      onRoster: function (message) {
        console.log(message)
      },

      onVideoMessage: function(message){
          console.log('onVideoMessage: ', message);
      },

      onAudioMessage: function (message) {
          console.log('onAudioMessage', message)
      },

      onLocationMessage: function (message) {
          console.log("Location message: ", message);
      },

      onTextMessage: function (message) {
        
        console.log(message);

      },
      onEmojiMessage: function (message) {

      },
      onPictureMessage: function (message) {
      },
      // 各种异常
      onError: function (error) {
        console.log(error);
      },
  })


  }
})
