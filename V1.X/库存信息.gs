function onEdit2(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算器”工作表中编辑了单元格 B5，并且值为 TRUE
  if ((sheet.getName() == "R1计算器" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true) || (sheet.getName() == "R1固定利润算成本" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true) || (sheet.getName() == "R1计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true)) {
    // 调用 fetchDataWithCookies 函数 传入对应sessionid
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B1").getValue();
    var R1 = 'R1'
    fetchDataWithCookies(sessionid, R1);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  if ((sheet.getName() == "R2计算器" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true) || (sheet.getName() == "R2固定利润算成本" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true) || (sheet.getName() == "R2计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 2 && range.getValue() == true)) {
    // 调用 fetchDataWithCookies 函数 传入对应sessionid
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B2").getValue();
    var R2 = 'R2'
    fetchDataWithCookies(sessionid, R2);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}



function fetchDataWithCookies(sessionid, realm) {// 获取库存
  var me_url = "https://www.simcompanies.com/api/v2/companies/me/";
  

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

  // 发起请求 me 提取uid
  var me_response = UrlFetchApp.fetch(me_url, options);
  var me_data = JSON.parse(me_response.getContentText());
  var uid = me_data.authCompany.companyId.toFixed(0);

  // Logger.log(uid)

  // 发起请求
  var url = "https://www.simcompanies.com/api/v3/resources/" + uid + "/";
  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());

  // 提取符合条件的数据，并按照要求输出
  var filteredData = data.filter(function (item) {
    return item.kind;
  }).map(function (item) {
    return {
      "db_letter": item.kind,
      "quality": item.quality,
      "amount": item.amount,
      "workers": item.cost.workers,
      "admin": item.cost.admin,
      "material1": item.cost.material1,
      "material2": item.cost.material2,
      "material3": item.cost.material3,
      "material4": item.cost.material4,
      "material5": item.cost.material5,
      "market": item.cost.market
    };
  });

  var headers = ["物品ID", "品质", "数量", "工人", "管理费", "原料1", "原料2", "原料3", "原料4", "原料5", "采购和退货"];
  // 获取名为"库存信息"的工作表，如果不存在则创建

  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器");
  var profitSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "固定利润算成本");
  var speedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器（最大销售速度）");
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "库存信息");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(realm + "库存信息");
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // 写入数据到工作表
  var clear_range = sheet.getRange("A2:K");
  clear_range.clearContent(); // 清除工作表原有内容
  sheet.getRange(2, 1, filteredData.length, headers.length).setValues(filteredData.map(function (item) {
    return [item.db_letter, item.quality, item.amount, item.workers, item.admin, item.material1, item.material2, item.material3, item.material4, item.material5, item.market];
  }));

  // 创建一个新的 Date 对象，表示当前时间
  var now = new Date();

  // 获取当前日期
  var date = now.getDate();

  // 获取当前小时（24 小时制）
  var hours = now.getHours();

  // 获取当前分钟
  var minutes = now.getMinutes();

  // 将日期、小时和分钟格式化为两位数
  date = String(date).padStart(2, '0');
  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');

  // 将当前时间格式化为字符串
  var formattedTime = date + "日 " + hours + ":" + minutes;

  // 在 B6 单元格设置格式化时间
  calculatorSheet.getRange(6, 2).setValue(formattedTime);
  speedSheet.getRange(6, 2).setValue(formattedTime);
  profitSheet.getRange(6, 2).setValue(formattedTime);


}