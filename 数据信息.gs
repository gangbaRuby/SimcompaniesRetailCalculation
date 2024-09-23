function onEdit1(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算器”工作表中编辑了单元格 A5，并且值为 TRUE
  if ((sheet.getName() == "R1计算器" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R1固定利润算成本" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R1计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R1自定义售价" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true)) {
    // 调用 fetchDataAndInsertToSheet 函数
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B1").getValue();
    var customEconomyState = sheet.getRange("G5").getValue();
    var customEconomyStateButton = sheet.getRange("I5").getValue();
    var realm_id = 0;
    var R1 = 'R1';
    fetchDataAndInsertToSheet(sessionid, R1, realm_id, customEconomyState, customEconomyStateButton);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“R2计算器”工作表中编辑了单元格 A5，并且值为 TRUE
  if ((sheet.getName() == "R2计算器" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R2固定利润算成本" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R2计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R2自定义售价" && range.getRow() == 5 && range.getColumn() == 1 && range.getValue() == true)) {
    // 调用 fetchDataAndInsertToSheet 函数
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B2").getValue();
    var customEconomyState = sheet.getRange("G5").getValue();
    var customEconomyStateButton = sheet.getRange("I5").getValue();
    var realm_id = 1;
    var R2 = 'R2';
    fetchDataAndInsertToSheet(sessionid, R2, realm_id, customEconomyState, customEconomyStateButton);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

function fetchDataAndInsertToSheet(sessionid, realm, realm_id, customEconomyState, customEconomyStateButton) {//获取模型信息

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "数据信息");
  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器");
  var profitSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "固定利润算成本");
  var speedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器（最大销售速度）");
  var optionSellPriceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "自定义售价");



  //获取经济周期
  if (customEconomyStateButton) {
    if (customEconomyState == '萧条') {
      var economyState = 0
    } else if (customEconomyState == '平缓') {
      var economyState = 1
    } else if (customEconomyState == '景气') {
      var economyState = 2
    }
  } else {
    var economyState = get_economyState(sessionid)
  }

  // var economyState = 1


  // 如果数据表不存在，创建一个新表
  if (!sheet) {
    //表头
    var headers1 = ["ID", "averagePrice", "marketSaturation"];
    var headers3 = ["building_wages"];
    var headers4 = ["buildingLevelsNeededPerHour", "modeledProductionCostPerUnit", "modeledStoreWages", "modeledUnitsSoldAnHour"];

    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(realm + "数据信息");
    sheet.getRange(1, 1, 1, headers1.length).setValues([headers1]);  // 在第一行写入表头
    sheet.getRange(1, 4, 1, headers3.length).setValues([headers3]);  // 在第一行写入表头
    sheet.getRange(1, 5, 1, headers4.length).setValues([headers4]);  // 在第一行写入表头
  }

  // 清空表格中原有的数据
  var clear_range = sheet.getRange("A2:C");
  clear_range.clearContent();
  var clear_range2 = sheet.getRange("E2:H");
  clear_range2.clearContent();


  // 动态生成rowData1数组 物品id 饱和度 平均价格
  var rowData1 = [];
  var realm_resources_retail_info = "https://www.simcompanies.com/api/v4/" + realm_id + "/resources-retail-info/";
  var realm_resources_retail_info_response = UrlFetchApp.fetch(realm_resources_retail_info);
  var realm_resources_retail_info_data = JSON.parse(realm_resources_retail_info_response.getContentText());

  realm_resources_retail_info_data.forEach(function (item) {
    var ID = item.dbLetter;
    var averagePrice = item.averagePrice;
    var saturation = item.saturation;

    rowData1.push([ID, averagePrice, saturation]);
  })

  var idsToCheck = [146, 147, 148];
  idsToCheck.forEach(function (id) {
    if (!rowData1.some(function (row) { return row[0] === id; })) {
      rowData1.push([id, '', '']); // 添加缺失的 ID，后面为空数据
    }
  });

  // 动态生成rowData3数组
  var rowData3 = downloadAndExtractData(realm_id, economyState, calculatorSheet, profitSheet, speedSheet, optionSellPriceSheet);
  // Logger.log(rowData3)




  var updatedData1 = [];
  // 遍历 `rowData1`，并与 `rowData3` 数据匹配
  rowData1.forEach(function (row) {
    var id = row[0]; // 获取 `rowData1` 中的 `ID`

    // 根据 ID 查找 `rowData2` 中的数据
    var matchingData = rowData3[id];

    // 如果找到匹配的数据，则拼接；否则，将空数据追加
    if (matchingData) {
      updatedData1.push(row.concat(matchingData));
    } else {
      updatedData1.push(row.concat(['', '', '', '', '', '']));
    }
  });



  // 写入前3列
  var firstPart = updatedData1.map(function (row) {
    return row.slice(0, 3); // 取前3列
  });
  sheet.getRange(2, 1, firstPart.length, 3).setValues(firstPart);

  // 写入最后4列
  var secondPart = updatedData1.map(function (row) {
    return row.slice(-4); // 取最后4列
  });
  sheet.getRange(2, 5, secondPart.length, 4).setValues(secondPart);


  if (economyState == 0) {
    calculatorSheet.getRange(5, 7).setValue("萧条");
    profitSheet.getRange(5, 7).setValue("萧条");
    speedSheet.getRange(5, 7).setValue("萧条");
    optionSellPriceSheet.getRange(5, 7).setValue("萧条");
  } else if (economyState == 1) {
    calculatorSheet.getRange(5, 7).setValue("平缓");
    profitSheet.getRange(5, 7).setValue("平缓");
    speedSheet.getRange(5, 7).setValue("平缓");
    optionSellPriceSheet.getRange(5, 7).setValue("平缓");
  } else if (economyState == 2) {
    calculatorSheet.getRange(5, 7).setValue("景气");
    profitSheet.getRange(5, 7).setValue("景气");
    speedSheet.getRange(5, 7).setValue("景气");
    optionSellPriceSheet.getRange(5, 7).setValue("景气");
  }

  if (!customEconomyStateButton) {
    calculatorSheet.getRange(5, 9).setValue(false);
    profitSheet.getRange(5, 9).setValue(false);
    speedSheet.getRange(5, 9).setValue(false);
    optionSellPriceSheet.getRange(5, 9).setValue(false);
  } else {
    calculatorSheet.getRange(5, 9).setValue(true);
    profitSheet.getRange(5, 9).setValue(true);
    speedSheet.getRange(5, 9).setValue(true);
    optionSellPriceSheet.getRange(5, 9).setValue(true);
  }














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

  // 在 A6 单元格设置格式化时间
  calculatorSheet.getRange(6, 1).setValue(formattedTime);
  speedSheet.getRange(6, 1).setValue(formattedTime);
  profitSheet.getRange(6, 1).setValue(formattedTime);
  optionSellPriceSheet.getRange(6, 1).setValue(formattedTime);

}






function get_economyState(sessionid) {
  var url = "https://www.simcompanies.com/api/v2/companies/me/";

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
  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());

  var temporals = data.temporals;
  if (temporals && temporals.hasOwnProperty('economyState')) {
    var economyState = temporals.economyState;
    Logger.log('Economy State: ' + economyState);

    // 你可以根据需要将 economyState 存储到工作表或执行其他操作
    return economyState;
  } else {
    return null;
  }

}


function downloadAndExtractData(realm_id, economyState, calculatorSheet, profitSheet, speedSheet, optionSellPriceSheet) {
  var url = fetchScriptUrl();
  var response = UrlFetchApp.fetch(url);
  var content = response.getContentText();

  var values = extractValuesFromJS(content);


  // 使用正则表达式提取所需内容
  var jsonDataString = extractJsonString(content);

  if (jsonDataString) {
    try {
      // 将提取的字符串转换为有效的 JSON 格式
      jsonDataString = convertToValidJson(jsonDataString);
      // Logger.log("转换后的 JSON 字符串: " + jsonDataString); // 调试日志
      var jsonData = JSON.parse(jsonDataString);

      // 导出数据 Google Sheet
      var extractedData = extractData(jsonData, realm_id, economyState);

      extractedData.PROFIT_PER_BUILDING_LEVEL = values.PROFIT_PER_BUILDING_LEVEL;
      extractedData.RETAIL_MODELING_QUALITY_WEIGHT = values.RETAIL_MODELING_QUALITY_WEIGHT;

      calculatorSheet.getRange(6, 8).setValue(extractedData.PROFIT_PER_BUILDING_LEVEL);
      profitSheet.getRange(6, 8).setValue(extractedData.PROFIT_PER_BUILDING_LEVEL);
      speedSheet.getRange(6, 8).setValue(extractedData.PROFIT_PER_BUILDING_LEVEL);
      optionSellPriceSheet.getRange(6, 8).setValue(extractedData.PROFIT_PER_BUILDING_LEVEL);


      calculatorSheet.getRange(6, 10).setValue(extractedData.RETAIL_MODELING_QUALITY_WEIGHT);
      profitSheet.getRange(6, 10).setValue(extractedData.RETAIL_MODELING_QUALITY_WEIGHT);
      speedSheet.getRange(6, 10).setValue(extractedData.RETAIL_MODELING_QUALITY_WEIGHT);
      optionSellPriceSheet.getRange(6, 10).setValue(extractedData.RETAIL_MODELING_QUALITY_WEIGHT);


      return extractedData;

    } catch (e) {
      Logger.log("JSON 解析错误: " + e.message);
    }
  } else {
    Logger.log("无法找到有效的 JSON 数据。");
  }



}

function extractJsonString(content) {
  // 使用正则表达式查找以 "{0:{1:{buildingLevelsNeededPerHour:" 开头，以 "}}}" 结尾的内容
  var jsonStringMatch = content.match(/\{0:\{1:\{buildingLevelsNeededPerHour:[\s\S]*?\}\}\}/);
  return jsonStringMatch ? jsonStringMatch[0] : null;
}

function convertToValidJson(jsonDataString) {
  // 替换属性名的引号
  jsonDataString = jsonDataString.replace(/([{,])(\s*)(\w+)(\s*):/g, '$1"$3":');

  // 替换以小数点开头的数字
  jsonDataString = jsonDataString.replace(/:\s*\.(\d+)/g, ': 0.$1');

  return jsonDataString;
}

function extractData(data, realm_id, economyState) {

  var rowData3 = [];

  if (data.hasOwnProperty(economyState)) {
    var economyData = data[economyState];

    // 遍历 economyData 下的所有 ID
    for (var id in economyData) {

      var modelData = economyData[id];

      // 提取数据
      var buildingLevelsNeededPerHour = modelData.buildingLevelsNeededPerHour;
      var modeledProductionCostPerUnit = modelData.modeledProductionCostPerUnit;
      var modeledStoreWages = modelData.modeledStoreWages;
      var modeledUnitsSoldAnHour = modelData.modeledUnitsSoldAnHour;

      // 将提取的数据存储在 rowData3 数组中，以 `id` 为键存储
      rowData3[id] = [buildingLevelsNeededPerHour, modeledProductionCostPerUnit, modeledStoreWages, modeledUnitsSoldAnHour];

    }
  }

  return rowData3;
}

function fetchScriptUrl() {
  const url = 'https://www.simcompanies.com';
  const response = UrlFetchApp.fetch(url);
  const html = response.getContentText();

  // Logger.log(html)

  // 使用更通用的正则表达式提取JavaScript文件的URL
  const srcMatch = html.match(/crossorigin src="([^"]+)"/);

  if (srcMatch && srcMatch[1]) {
    const srcUrl = srcMatch[1];
    // Logger.log(srcUrl)
    return srcUrl;
  }

}


function extractValuesFromJS(jsContent) {
  // 提取变量名
  var profitVarName = extractVariableName(jsContent, 'PROFIT_PER_BUILDING_LEVEL');
  var retailVarName = extractVariableName(jsContent, 'RETAIL_MODELING_QUALITY_WEIGHT');

  // 获取变量值
  var profitValue = extractVariableValue(jsContent, profitVarName);
  var retailValue = extractVariableValue(jsContent, retailVarName);

  return {
    PROFIT_PER_BUILDING_LEVEL: profitValue,
    RETAIL_MODELING_QUALITY_WEIGHT: retailValue
  };
}

function extractVariableName(jsContent, key) {
  // 使用正则表达式查找以 key 为值的变量赋值语句
  var regex = new RegExp(key + '\\s*:\\s*(\\w+),');
  var match = jsContent.match(regex);
  return match ? match[1] : null;
}

function extractVariableValue(jsContent, variableName) {
  if (!variableName) return null;

  // 使用正则表达式查找变量赋值
  var regex = new RegExp(variableName + '\\s*=\\s*([^,]+),');
  var match = jsContent.match(regex);
  return match ? match[1] : null;
}
