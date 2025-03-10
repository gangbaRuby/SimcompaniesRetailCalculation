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
    fetchDataAndInsertToSheet(sessionid, R1, realm_id, customEconomyState, customEconomyStateButton, sessionid_settings);

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
    fetchDataAndInsertToSheet(sessionid, R2, realm_id, customEconomyState, customEconomyStateButton, sessionid_settings);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

function fetchDataAndInsertToSheet(sessionid, realm, realm_id, customEconomyState, customEconomyStateButton, sessionid_settings) {//获取模型信息




  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "数据信息");
  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器");
  var profitSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "固定利润算成本");
  var speedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器（最大销售速度）");
  var optionSellPriceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "自定义售价");

  var defaultObject = {
    G: 1,
    A: 1,
    C: 1,
    2: 1,
    H: 1,
    B: 1,
    d: 1,
    r: 1,
    t: 1,
    u: 1
  };



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
    var headers1 = ["ID", "averagePrice", "marketSaturation", "quality"];
    var headers3 = ["building_wages"];
    var headers4 = ["buildingLevelsNeededPerUnitPerHour", "modeledProductionCostPerUnit", "modeledStoreWages", "modeledUnitsSoldAnHour"];

    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(realm + "数据信息");
    sheet.getRange(1, 1, 1, headers1.length).setValues([headers1]);  // 在第一行写入表头
    sheet.getRange(1, 5, 1, headers3.length).setValues([headers3]);  // 在第一行写入表头
    sheet.getRange(1, 6, 1, headers4.length).setValues([headers4]);  // 在第一行写入表头
  }

  // 清空表格中原有的数据
  var clear_range = sheet.getRange("A2:D");
  clear_range.clearContent();
  var clear_range2 = sheet.getRange("F2:I");
  clear_range2.clearContent();


  // 动态生成rowData1数组 物品id 饱和度 平均价格
  var rowData1 = [];
  var realm_resources_retail_info = "https://www.simcompanies.com/api/v4/" + realm_id + "/resources-retail-info/";
  var timestamp = new Date().getTime(); // 获取毫秒级时间戳
  var urlWithTimestamp = realm_resources_retail_info + "?timestamp=" + timestamp;
  var realm_resources_retail_info_response = UrlFetchApp.fetch(urlWithTimestamp);
  var realm_resources_retail_info_data = JSON.parse(realm_resources_retail_info_response.getContentText());

  realm_resources_retail_info_data.forEach(function (item) {
    var ID = item.dbLetter;
    var averagePrice = item.averagePrice;
    var saturation = item.saturation;
    var quality = item.quality;

    rowData1.push([ID, averagePrice, saturation, quality]);
  })

  // Logger.log(rowData1)

  // var idsToCheck = [146, 147, 148];
  // idsToCheck.forEach(function (id) {
  //   if (!rowData1.some(function (row) { return row[0] === id; })) {
  //     rowData1.push([id, '', '']); // 添加缺失的 ID，后面为空数据
  //   }
  // });

  // 动态生成rowData3数组
  var rowData3 = downloadAndExtractData(realm_id, economyState, calculatorSheet, profitSheet, speedSheet, optionSellPriceSheet, defaultObject);

  // Logger.log('rowData3' + rowData3)



  var updatedData1 = [];
  // 遍历 `rowData1`，并与 `rowData3` 数据匹配
  rowData1.forEach(function (row) {
    var updatedData1_id = row[0]; // 获取 `rowData1` 中的 `ID`
    var updatedData1_quality = row[3]; // 获取 `rowData1` 中的 `quality`

    // 根据 ID 查找 `rowData3` 中的数据
    let matchingData = rowData3[updatedData1_id];

    // Logger.log('updatedData1_id:' + updatedData1_id)
    // Logger.log('updatedData1_quality' + updatedData1_quality)


    if (updatedData1_quality == null) {
      if (matchingData) {
        updatedData1.push(row.concat(matchingData));
      } else {
        updatedData1.push(row.concat(['', '', '', '', '', '']));
      }
    } else
      if (matchingData) {
        updatedData1.push(row.concat(rowData3[updatedData1_id][updatedData1_quality]));
      } else {
        updatedData1.push(row.concat(['', '', '', '', '', '']));
      }
  });



  // 写入前3列
  var firstPart = updatedData1.map(function (row) {
    return row.slice(0, 4); // 取前3列
  });
  sheet.getRange(2, 1, firstPart.length, 4).setValues(firstPart);

  // 写入最后4列
  var secondPart = updatedData1.map(function (row) {
    return row.slice(-4); // 取最后4列
  });
  sheet.getRange(2, 6, secondPart.length, 4).setValues(secondPart);


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


  var row = 1;
  for (var key in defaultObject) {
    if (defaultObject.hasOwnProperty(key)) {
      // 将键名放入 V 列，将键值放入 W 列
      sessionid_settings.getRange("V" + row).setValue(key);
      sessionid_settings.getRange("W" + row).setValue(defaultObject[key]);
      row++;
    }
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






function get_economyState(sessionid) { //获取周期
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
    // Logger.log('Economy State: ' + economyState);

    // 你可以根据需要将 economyState 存储到工作表或执行其他操作
    return economyState;
  } else {
    return null;
  }

}


function downloadAndExtractData(realm_id, economyState, calculatorSheet, profitSheet, speedSheet, optionSellPriceSheet, defaultObject) {
  var url = fetchScriptUrl();
  var response = UrlFetchApp.fetch(url);
  var content = response.getContentText(); // JS文件字符串
  //Logger.log(content)
  var values = extractValuesFromJS(content, defaultObject);


  // 直接根据周期取新零售模型数据
  var jsonDataString = extractJsonString(content, economyState);
  // Logger.log('jsonDataString:' + jsonDataString)


  if (jsonDataString) {
    try {

      // 导出数据 Google Sheet
      var extractedData = extractData(jsonDataString, realm_id, economyState);

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
    Logger.log("无法找到有效的 新零售JSON 数据。");
  }



}

function extractJsonString(content, economyState) {

  if (economyState === 0) {
    var jsonStringMatch = content.match(/0:\s*JSON\.parse\('([\s\S]*?)'\)/);
  } else if (economyState === 1) {
    var jsonStringMatch = content.match(/1:\s*JSON\.parse\('([\s\S]*?)'\)/);
  } else if (economyState === 2) {
    var jsonStringMatch = content.match(/2:\s*JSON\.parse\('([\s\S]*?)'\)/);
  }

  return jsonStringMatch ? jsonStringMatch[1] : null;
}

function extractData(data, realm_id, economyState) { //提取四个模型参数

  var rowData3 = [];

// 解析 JSON 字符串
var parsedData = JSON.parse(data); 

for (var id in parsedData) {
    var modelData = parsedData[id]; // 直接访问解析后的对象

    // 检查是否存在 quality 属性
    var quality = modelData.hasOwnProperty('quality') ? modelData.quality : null;

    if (quality) {
        // 如果 quality 存在，遍历 quality 数组
        rowData3[id] = []; // 初始化该 ID 对应的数组
        for (var qIndex in quality) {
            var qData = quality[qIndex];

            // 将 quality 下的数据存储到数组中
            rowData3[id].push([
                qData.buildingLevelsNeededPerUnitPerHour,
                qData.modeledProductionCostPerUnit,
                qData.modeledStoreWages,
                qData.modeledUnitsSoldAnHour
            ]);
        }
    } else {
        // 如果没有 quality，使用原始 modelData 的数据
        rowData3[id] = [
            modelData.buildingLevelsNeededPerUnitPerHour,
            modelData.modeledProductionCostPerUnit,
            modelData.modeledStoreWages,
            modelData.modeledUnitsSoldAnHour
        ];
    }
}



  return rowData3;
}

function fetchScriptUrl() { //获取js文件
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


function extractValuesFromJS(jsContent, defaultObject) {
  // 提取变量名
  var profitVarName = extractVariableName(jsContent, 'PROFIT_PER_BUILDING_LEVEL');
  // Logger.log(profitVarName)
  var retailVarName = extractVariableName(jsContent, 'RETAIL_MODELING_QUALITY_WEIGHT');
  var adjustmentName = extractVariableName(jsContent, 'RETAIL_ADJUSTMENT');


  // 获取变量值
  var profitValue = extractVariableValue(jsContent, profitVarName);
  // Logger.log(profitValue)
  var retailValue = extractVariableValue(jsContent, retailVarName);

  // 获取 RETAIL_ADJUSTMENT 对象中的数值数组
  var adjustmentValue = extractadjustmentValue(jsContent, adjustmentName);
  // Logger.log(adjustmentValue)

  updateObjectWithAdjustment(defaultObject, adjustmentValue);


  return {
    PROFIT_PER_BUILDING_LEVEL: profitValue,
    RETAIL_MODELING_QUALITY_WEIGHT: retailValue
  };
}

function extractVariableName(jsContent, key) {
  // 使用正则表达式查找以 key 为值的变量赋值语句
  var regex = new RegExp(key + '\\s*:\\s*([\\w$]+)');
  var match = jsContent.match(regex);
  return match ? match[1] : null;
}

function extractVariableValue(jsContent, variableName) {
  if (!variableName) return null;

  // 使用正则表达式查找变量赋值
  var regex = new RegExp(variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*([^,]+),');
  var match = jsContent.match(regex);
  return match ? match[1] : null;
}

function extractadjustmentValue(jsContent, variableName) {
  if (!variableName) return null;

  // 使用正则表达式查找变量赋值
  var regex = new RegExp(variableName + '\\s*=\\s*(\\{[^}]*\\})');
  var match = jsContent.match(regex);

  // 如果找到匹配的字符串
  if (match) {
    var adjustmentString = match[1];

    // 使用 eval 将对象字面量字符串转换为对象
    try {
      var adjustmentValue = eval('(' + adjustmentString + ')'); // 注意：eval()括号必须加上
      return adjustmentValue;
    } catch (e) {
      Logger.log('Error parsing string: ' + e.message);
    }
  }

  return null;



}


function updateObjectWithAdjustment(obj, adjustment) {
  for (let key in adjustment) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = adjustment[key];
      console.log(`Updated ${key} to ${adjustment[key]}`);
    }
  }
}
