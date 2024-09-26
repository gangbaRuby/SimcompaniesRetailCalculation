function getAdministration_overhead(sessionid) {


  var url_Administration_overhead = "https://www.simcompanies.com/api/v2/companies/me/administration-overhead/"

  // 设置 cookies
  var cookies = {
    "sessionid": sessionid
    // 添加更多的 cookies，如果有的话
  };

    // 构建 options 对象
  var options = {
    "headers": {
      "Cookie": Object.keys(cookies).map(function (key) {
        return key + "=" + cookies[key];
      }).join("; ")
    }
  };

    // 发起请求
  var response = UrlFetchApp.fetch(url_Administration_overhead, options);
  var result = response.getContentText();
  
  // Logger.log(result)
  // Logger.log(result - 1 )
  // Logger.log( (result - 1) * 100 )
  // Logger.log( ((result - 1) * 100).toFixed(2) )
  return ((result - 1) * 100).toFixed(2)
}
