function onEdit7(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算器（最大销售速度）”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() === "R1计算器（最大销售速度）" && range.getRow() === 5 && range.getColumn() === 3 && range.getValue() === true) {
    // 调用 calculateSaleSpeed 函数 参数R1计算器（最大销售速度）
    var R1 = 'R1';
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B1").getValue();
    calculateSaleSpeed('R1计算器（最大销售速度）', R1, sessionid_settings, sessionid);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“R2计算器（最大销售速度）”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() === "R2计算器（最大销售速度）" && range.getRow() === 5 && range.getColumn() === 3 && range.getValue() === true) {
    // 调用 calculateSaleSpeed 函数 参数R2计算器（最大销售速度）
    var R2 = 'R2';
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B1").getValue();
    calculateSaleSpeed('R2计算器（最大销售速度）', R2, sessionid_settings, sessionid);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

function calculateSaleSpeed(sheet, realm, sessionid_settings, sessionid) { //计算最大时利润

  if (sessionid != null) {
    if (realm === 'R1') {
      sessionid_settings.getRange(1, 7).setValue(getAdministration_overhead(sessionid))
    }
    else if (realm === 'R2') {
      sessionid_settings.getRange(2, 7).setValue(getAdministration_overhead(sessionid))
    }
  }

  var inventorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "库存信息");
  var dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "数据信息");
  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);

  //清除数据
  range = calculatorSheet.getRange("A9:J");
  range.clearContent();

  const mapping = {
    '苹果': 3,
    '橘子': 4,
    '葡萄': 5,
    '牛排': 7,
    '香肠': 8,
    '鸡蛋': 9,
    '汽油': 11,
    '柴油': 12,
    '智能手机': 24,
    '平板电脑': 25,
    '笔记本电脑': 26,
    '显示器': 27,
    '电视机': 28,
    '经济电动车': 53,
    '豪华电动车': 54,
    '经济燃油车': 55,
    '豪华燃油车': 56,
    '卡车': 57,
    '内衣': 60,
    '手套': 61,
    '裙子': 62,
    '高跟鞋': 63,
    '手袋': 64,
    '运动鞋': 65,
    '圣诞爆竹': 67,
    '名牌手表': 70,
    '项链': 71,
    '无人机': 98,
    '砖块': 102,
    '水泥': 103,
    '木板': 108,
    '窗户': 109,
    '工具': 110,
    '咖啡粉': 119,
    '蔬菜': 120,
    '面包': 121,
    '芝士': 122,
    '苹果派': 123,
    '橙汁': 124,
    '苹果汁': 125,
    '姜汁汽水': 126,
    '披萨': 127,
    '面条': 128,
    '巧克力': 140,
    '圣诞装饰品': 144,
    '南瓜': 146,
    '杰克灯笼': 147,
    '女巫服': 148,
    '树': 150,
    'easter-bunny': 151,
    'ramadan-sweets': 152
  };


  // 获取库存信息表的数据范围
  var inventoryRange = inventorySheet.getRange("A2:K" + inventorySheet.getLastRow());
  var inventoryData = inventoryRange.getValues();

  // 获取数据信息表的数据范围
  var dataRange = dataSheet.getRange("A2:J" + dataSheet.getLastRow());
  var dataValues = dataRange.getValues();

  // 获取自定义库存信息
  var optionRange = calculatorSheet.getRange("N27:P" + calculatorSheet.getLastRow());
  var optionData = optionRange.getValues();

  // 将自定义库存信息物品名称转换为对应的物品ID，如果已经是ID则保持不变
  optionData = optionData.map(row => {
    if (isNaN(row[0])) {
      row[0] = mapping[row[0]] || row[0];
    }
    return row;
  });

  // 获取市场价格信息
  var marketRange = calculatorSheet.getRange("R27:T" + calculatorSheet.getLastRow());
  var marketData = marketRange.getValues();

  // 获取R1计算器（最大销售速度）表中的A2,B2,C2单元格的值
  var A2Value = calculatorSheet.getRange("A2").getValue(); //销售速度
  var B2Value = calculatorSheet.getRange("B2").getValue(); //管理费用
  var C2Value = calculatorSheet.getRange("C2").getValue(); //单销售建筑等级

  var PROFIT_PER_BUILDING_LEVEL = calculatorSheet.getRange("H6").getValue(); //core中的PROFIT_PER_BUILDING_LEVEL
  var RETAIL_MODELING_QUALITY_WEIGHT = calculatorSheet.getRange("J6").getValue(); //core中的RETAIL_MODELING_QUALITY_WEIGHT

  var acceleration_multiplier = calculatorSheet.getRange("F3").getValue(); //新手加速
  var upLimit = calculatorSheet.getRange("L1").getValue(); //遍历上限
  var downlimit = calculatorSheet.getRange("L2").getValue(); //遍历下限
  var saleAmount = calculatorSheet.getRange("K3").getValue(); //销售数量
  var mpDiscount = calculatorSheet.getRange("U26").getValue(); //mp-?%


  // 获取选中的物品ID
  var select_range = calculatorSheet.getRange("O1:AA14");
  var values = select_range.getValues();
  var output = [];
  for (var row = 1; row < values.length; row++) { // 从第二行开始
    for (var col = 0; col < values[row].length; col++) { // 从第1列开始
      if (values[row][col] === true && !(row === 1 && col === 9) && !(row === 3 && col === 9)) { // 如果单元格的值为TRUE
        // 获取上一个单元格的内容并添加到输出数组中
        var previousCellContent = values[row - 1][col];
        output.push(previousCellContent);
      }
    }
  }
  const replacedList = output.map(item => mapping[item]);

  const reverseMapping = Object.entries(mapping).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
  const getChineseItem = (number) => reverseMapping[number];

  var count = 0;
  // 遍历库存信息表中的每一行
  for (var i = 0; i < inventoryData.length; i++) {

    var db_letter = inventoryData[i][0];

    if (replacedList.includes(db_letter)) {

      var quality = inventoryData[i][1];
      var amount = inventoryData[i][2]; // 获取数量值
      var workers = inventoryData[i][3]; // 获取工人
      var admin = inventoryData[i][4]; // 获取管理费
      var material1 = inventoryData[i][5]; // 获取原料1
      var material2 = inventoryData[i][6]; // 获取原料2
      var material3 = inventoryData[i][7]; // 获取原料3
      var material4 = inventoryData[i][8]; // 获取原料4
      var material5 = inventoryData[i][9]; // 获取原料5
      var market = inventoryData[i][10]; // 获取采购和退货


      var maxProfitPerHour = 0;
      var maxSalesPerUnitPerHour = 0;
      var optimalSellPrice = 0;
      var spendTime = 0; // 销售花费时间
      var spendStore = 0; // 销售花费商店
      var totalProfit = 0; // 总利润


      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if ((dataValues[j][0] === db_letter && dataValues[j][3] === '') || (dataValues[j][0] === db_letter && dataValues[j][3] === quality)) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var modelQuality = dataValues[j][3]
          var building_wages = dataValues[j][4]
          var buildingLevelsNeededPerUnitPerHour = dataValues[j][5]
          var modeledProductionCostPerUnit = dataValues[j][6]
          var modeledStoreWages = dataValues[j][7]
          var modeledUnitsSoldAnHour = dataValues[j][8]
          var RETAIL_ADJUSTMENT = dataValues[j][9]

          var p = ((workers + admin + material1 + material2 + material3 + material4 + material5 + market) / amount);


          if (downlimit === -1) { // -1 成本价
            if (p - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((p * upLimit).toFixed(2));
            } else if (p - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((p * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(p / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((p * upLimit).toFixed(0));
            }
          } else {
            if (averagePrice - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(2));
            } else if (averagePrice - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(0));
            }
          }


          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算

            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = (modelQuality === '') ? quality / 12 : 0
            var vNr_d = PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerUnitPerHour * modeledUnitsSoldAnHour + 1) * ((v_RETAIL_ADJUSTMENT = RETAIL_ADJUSTMENT) != null ? v_RETAIL_ADJUSTMENT : 1) * (vNr_a / 2 * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s

            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = (amount * ((sellPrice - modeledProductionCostPerUnit) * 3600) - ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0)) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))
            if (sj_f <= 0) {
              if (sellPrice > averagePrice) {
                break;
              }
              if (sellPrice - 8 < 0) {
                sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
              } else if (sellPrice - 2001 < 0) {
                sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
              } else {
                sellPrice = parseFloat((sellPrice + 1).toFixed(0));
              }
              continue;
            } else {
              var sj_w = sj_f / acceleration_multiplier / C2Value;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // 成本
            var cogs = amount * p;

            // 工资
            var wagesTotal = Math.ceil(Jq_d * (building_wages * C2Value) * acceleration_multiplier * B2Value / 60 / 60)

            // 收入
            var revenue = amount * sellPrice

            // 总利润
            var profit = revenue - wagesTotal - cogs

            // 单建筑每小时销售/单位
            var salesPerUnitPerHour = (3600 / (Jq_d / amount));

            // 计算每小时利润
            var profitPerHour = profit / Jq_d * 3600;


            // 更新最大值及对应的sellPrice
            if (salesPerUnitPerHour - maxSalesPerUnitPerHour > 0 && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }
            // 如果最大销售速度相同，则比较时利润
            else if (salesPerUnitPerHour === maxSalesPerUnitPerHour && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }




            // 将 sellPrice 步进
            if (sellPrice - 8 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            } else if (sellPrice - 2001 < 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else {
              sellPrice = parseFloat((sellPrice + 1).toFixed(0));
            }

          }

          // var [sellTime, costStore] = convertToTime(amount, maxSalesPerUnitPerHour);

          // 将ID放到计算器表中
          calculatorSheet.getRange("A" + (count + 9)).setValue(getChineseItem(db_letter));

          //将品质放到计算器表中
          calculatorSheet.getRange("B" + (count + 9)).setValue("Q" + quality);

          //将物品数量放到计算器表中
          calculatorSheet.getRange("C" + (count + 9)).setValue(amount);

          //将物品成本放到计算器表中
          calculatorSheet.getRange("D" + (count + 9)).setValue(p);

          // 将售价放到计算器表中
          calculatorSheet.getRange("E" + (count + 9)).setValue(optimalSellPrice);

          // 将每小时销售/单位放到计算器表中
          calculatorSheet.getRange("F" + (count + 9)).setValue(maxSalesPerUnitPerHour);

          // 将每小时利润放到计算器表中
          calculatorSheet.getRange("G" + (count + 9)).setValue(maxProfitPerHour);

          // 将销售时间放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("H" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("H" + (count + 9)).setValue(spendTime).setNumberFormat("[hh]:mm:ss");
          }

          // 将使用商店数量(48小时)放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("I" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("I" + (count + 9)).setValue(spendStore);
          }

          // 将单品总利润放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("J" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("J" + (count + 9)).setValue(totalProfit);
          }

          count++;

          break;

        }
      }

    }

  }

  var optionButton = calculatorSheet.getRange("E5").getValue();
  if (optionButton) {
    count = optionSpeed(optionData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, upLimit, downlimit, saleAmount);
  }

  var marketButton = calculatorSheet.getRange("F5").getValue();
  if (marketButton) {
    if (realm === 'R1') {
      get_price(sheet, 0);
    } else if (realm === 'R2') {
      get_price(sheet, 1);
    }
    // 获取市场价格信息
    var marketRange = calculatorSheet.getRange("R27:T" + calculatorSheet.getLastRow());
    var marketData = marketRange.getValues();
    marketSpeed(marketData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, upLimit, downlimit, mpDiscount, saleAmount);
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

  // 在 C6 单元格设置格式化时间
  calculatorSheet.getRange(6, 3).setValue(formattedTime);
}


// function convertToTime(amount, maxSalesPerUnitPerHour) { // 返回销售时间(时:分)， 使用商店数量(48小时)
//   // 计算总的销售时间（小时）
//   var sellTimeHours = amount / maxSalesPerUnitPerHour;

//   // 将小时转换为分钟
//   var sellTimeMinutes = sellTimeHours * 60;

//   // 分别获取小时和分钟部分
//   var hours = Math.floor(sellTimeMinutes / 60);
//   var minutes = Math.ceil(sellTimeMinutes % 60);

//   // 格式化成时:分的样式
//   var formattedTime = hours.toString() + ':' + minutes.toString().padStart(2, '0');

//   var costStore = Math.ceil(Math.ceil(sellTimeHours) / 48);

//   return [formattedTime, costStore];
// }


function optionSpeed(optionData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, upLimit, downlimit, saleAmount) {

  count++;

  for (var i = 0; i < optionData.length; i++) {

    var db_letter = optionData[i][0];

    if (replacedList.includes(db_letter)) {

      var quality = optionData[i][1];
      var market = optionData[i][2]; // 获取采购和退货


      var maxProfitPerHour = 0; // 最大时利润
      var maxSalesPerUnitPerHour = 0; // 最大时销售速度 
      var optimalSellPrice = 0; // 售价
      var spendTime = 0; // 销售花费时间
      var spendStore = 0; // 销售花费商店
      var totalProfit = 0; // 总利润

      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if ((dataValues[j][0] === db_letter && dataValues[j][3] === '') || (dataValues[j][0] === db_letter && dataValues[j][3] === quality)) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var modelQuality = dataValues[j][3]
          var building_wages = dataValues[j][4]
          var buildingLevelsNeededPerUnitPerHour = dataValues[j][5]
          var modeledProductionCostPerUnit = dataValues[j][6]
          var modeledStoreWages = dataValues[j][7]
          var modeledUnitsSoldAnHour = dataValues[j][8]
          var RETAIL_ADJUSTMENT = dataValues[j][9]

          var p = market;


          if (downlimit === -1) { // -1 成本价
            if (p - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((p * upLimit).toFixed(2));
            } else if (p - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((p * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(p / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((p * upLimit).toFixed(0));
            }
          } else {
            if (averagePrice - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(2));
            } else if (averagePrice - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(0));
            }
          }

          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算

            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = (modelQuality === '') ? quality / 12 : 0
            var vNr_d = PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerUnitPerHour * modeledUnitsSoldAnHour + 1) * ((v_RETAIL_ADJUSTMENT = RETAIL_ADJUSTMENT) != null ? v_RETAIL_ADJUSTMENT : 1) * (vNr_a / 2 * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s

            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = (saleAmount * ((sellPrice - modeledProductionCostPerUnit) * 3600) - ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0)) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))

            if (sj_f <= 0) {
              if (sellPrice > averagePrice) {
                break;
              }
              if (sellPrice - 8 < 0) {
                sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
              } else if (sellPrice - 2001 < 0) {
                sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
              } else {
                sellPrice = parseFloat((sellPrice + 1).toFixed(0));
              }
              continue;
            } else {
              var sj_w = sj_f / acceleration_multiplier / C2Value;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // 成本
            var cogs = saleAmount * p;

            // 工资
            var wagesTotal = Math.ceil(Jq_d * (building_wages * C2Value) * acceleration_multiplier * B2Value / 60 / 60)

            // 收入
            var revenue = saleAmount * sellPrice

            // 总利润
            var profit = revenue - wagesTotal - cogs

            // 单建筑每小时销售/单位
            var salesPerUnitPerHour = (3600 / (Jq_d / saleAmount));

            // 计算每小时利润
            var profitPerHour = profit / Jq_d * 3600;

            // 更新最大值及对应的sellPrice
            if (salesPerUnitPerHour - maxSalesPerUnitPerHour > 0 && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }
            // 如果最大销售速度相同，则比较时利润
            else if (salesPerUnitPerHour === maxSalesPerUnitPerHour && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }

            // 将 sellPrice 步进
            if (sellPrice - 8 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            } else if (sellPrice - 2001 < 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else {
              sellPrice = parseFloat((sellPrice + 1).toFixed(0));
            }

            // Logger.log(sellPrice)
          }

          // 将ID放到计算器表中
          calculatorSheet.getRange("A" + (count + 9)).setValue(getChineseItem(db_letter));

          //将品质放到计算器表中
          calculatorSheet.getRange("B" + (count + 9)).setValue("Q" + quality);

          //将物品数量放到计算器表中
          calculatorSheet.getRange("C" + (count + 9)).setValue(1);

          //将物品成本放到计算器表中
          calculatorSheet.getRange("D" + (count + 9)).setValue(p);

          // 将售价放到计算器表中
          calculatorSheet.getRange("E" + (count + 9)).setValue(optimalSellPrice);

          // 将每小时销售/单位放到计算器表中
          calculatorSheet.getRange("F" + (count + 9)).setValue(maxSalesPerUnitPerHour);

          // 将每小时利润放到计算器表中
          calculatorSheet.getRange("G" + (count + 9)).setValue(maxProfitPerHour);

          // 将销售时间放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("H" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("H" + (count + 9)).setValue(spendTime).setNumberFormat("[hh]:mm:ss");
          }


          // 将使用商店数量(48小时)放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("I" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("I" + (count + 9)).setValue(spendStore);
          }

          // 将单品总利润放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("J" + (count + 9)).setValue(0);
          } else {

            calculatorSheet.getRange("J" + (count + 9)).setValue(totalProfit);
          }

          count++;

          break;

        }
      }

    }
  }

  return count;
}


function marketSpeed(marketData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, upLimit, downlimit, mpDiscount, saleAmount) {//市场价

  count++;

  for (var i = 0; i < marketData.length; i++) {

    var db_letter = marketData[i][0];

    if (replacedList.includes(db_letter)) {

      var quality = marketData[i][1];
      var market = marketData[i][2] * (1 - mpDiscount / 100); // 获取采购和退货


      var maxProfitPerHour = 0; // 最大时利润
      var maxSalesPerUnitPerHour = 0; // 最大时销售速度 
      var optimalSellPrice = 0; // 售价
      var spendTime = 0; // 销售花费时间
      var spendStore = 0; // 销售花费商店
      var totalProfit = 0; // 总利润

      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if ((dataValues[j][0] === db_letter && dataValues[j][3] === '') || (dataValues[j][0] === db_letter && dataValues[j][3] === quality)) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var modelQuality = dataValues[j][3]
          var building_wages = dataValues[j][4]
          var buildingLevelsNeededPerUnitPerHour = dataValues[j][5]
          var modeledProductionCostPerUnit = dataValues[j][6]
          var modeledStoreWages = dataValues[j][7]
          var modeledUnitsSoldAnHour = dataValues[j][8]
          var RETAIL_ADJUSTMENT = dataValues[j][9]

          var p = market;


          if (downlimit === -1) { // -1 成本价
            if (p - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((p * upLimit).toFixed(2));
            } else if (p - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(p / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((p * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(p / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((p * upLimit).toFixed(0));
            }
          } else {
            if (averagePrice - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(2));
            } else if (averagePrice - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(0));
            }
          }

          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算

            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = (modelQuality === '') ? quality / 12 : 0
            var vNr_d = PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerUnitPerHour * modeledUnitsSoldAnHour + 1) * ((v_RETAIL_ADJUSTMENT = RETAIL_ADJUSTMENT) != null ? v_RETAIL_ADJUSTMENT : 1) * (vNr_a / 2 * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s

            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = (saleAmount * ((sellPrice - modeledProductionCostPerUnit) * 3600) - ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0)) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))

            if (sj_f <= 0) {
              if (sellPrice > averagePrice) {
                break;
              }
              if (sellPrice - 8 < 0) {
                sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
              } else if (sellPrice - 2001 < 0) {
                sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
              } else {
                sellPrice = parseFloat((sellPrice + 1).toFixed(0));
              }
              continue;
            } else {
              var sj_w = sj_f / acceleration_multiplier / C2Value;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // 成本
            var cogs = saleAmount * p;

            // 工资
            var wagesTotal = Math.ceil(Jq_d * (building_wages * C2Value) * acceleration_multiplier * B2Value / 60 / 60)

            // 收入
            var revenue = saleAmount * sellPrice

            // 总利润
            var profit = revenue - wagesTotal - cogs

            // 单建筑每小时销售/单位
            var salesPerUnitPerHour = (3600 / (Jq_d / saleAmount));

            // 计算每小时利润
            var profitPerHour = profit / Jq_d * 3600;

            // 更新最大值及对应的sellPrice
            if (salesPerUnitPerHour - maxSalesPerUnitPerHour > 0 && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }
            // 如果最大销售速度相同，则比较时利润
            else if (salesPerUnitPerHour === maxSalesPerUnitPerHour && profitPerHour > maxProfitPerHour) {
              maxProfitPerHour = profitPerHour;
              optimalSellPrice = sellPrice;
              spendTime = Jq_d / 86400; // 销售花费时间
              spendStore = Math.ceil(Jq_d / (86400 * 2)); // 销售花费商店
              totalProfit = profit; // 总利润
            }

            // 将 sellPrice 步进
            if (sellPrice - 8 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            } else if (sellPrice - 2001 < 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else {
              sellPrice = parseFloat((sellPrice + 1).toFixed(0));
            }

            // Logger.log(sellPrice)
          }

          // 将ID放到计算器表中
          calculatorSheet.getRange("A" + (count + 9)).setValue(getChineseItem(db_letter));

          //将品质放到计算器表中
          calculatorSheet.getRange("B" + (count + 9)).setValue("Q" + quality);

          //将物品数量放到计算器表中
          calculatorSheet.getRange("C" + (count + 9)).setValue(1);

          //将物品成本放到计算器表中
          calculatorSheet.getRange("D" + (count + 9)).setValue(p);

          // 将售价放到计算器表中
          calculatorSheet.getRange("E" + (count + 9)).setValue(optimalSellPrice);

          // 将每小时销售/单位放到计算器表中
          calculatorSheet.getRange("F" + (count + 9)).setValue(maxSalesPerUnitPerHour);

          // 将每小时利润放到计算器表中
          calculatorSheet.getRange("G" + (count + 9)).setValue(maxProfitPerHour);

          // 将销售时间放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("H" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("H" + (count + 9)).setValue(spendTime).setNumberFormat("[hh]:mm:ss");
          }


          // 将使用商店数量(48小时)放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("I" + (count + 9)).setValue(0);
          } else {
            calculatorSheet.getRange("I" + (count + 9)).setValue(spendStore);
          }

          // 将单品总利润放到计算器表中
          if (maxProfitPerHour === 0) {
            calculatorSheet.getRange("J" + (count + 9)).setValue(0);
          } else {

            calculatorSheet.getRange("J" + (count + 9)).setValue(totalProfit);
          }

          count++;

          break;

        }
      }

    }
  }

}
