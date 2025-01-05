function getAdministration_overhead(sessionid) {
  var url_Administration_overhead = "https://www.simcompanies.com/api/v2/companies/me/administration-overhead/";
  var cookies = {
    "sessionid": sessionid
  };

  var options = {
    "headers": {
      "Cookie": Object.keys(cookies).map(function (key) {
        return key + "=" + cookies[key];
      }).join("; ")
    }
  };

  var retries = 3; // 最大重试次数
  var result;
  
  for (var attempt = 0; attempt < retries; attempt++) {
    // 发起请求
    var response = UrlFetchApp.fetch(url_Administration_overhead, options);
    result = response.getContentText();
    
    // 如果 result 是数字，跳出循环
    if (!isNaN(result)) {
      break;
    }
    
    // 如果不是数字，等待 5 秒后重试
    if (attempt < retries - 1) {
      Utilities.sleep(5000); // 等待 5 秒
    }
  }
  
  // 如果最终还是不是数字，返回错误或默认值
  if (isNaN(result)) {
    return "Error: Invalid result";
  }
  
  return result;
}
