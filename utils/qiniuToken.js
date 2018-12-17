const http = require("./http.js");

const getQiniuToken = function(call){
  http.get("/upload_token", {}, res => {
    let resData = res.data;
    if (resData.error_code == 0) {
      call(resData.data.uptoken)
    }
  })
}

module.exports = {
  getQiniuToken
}