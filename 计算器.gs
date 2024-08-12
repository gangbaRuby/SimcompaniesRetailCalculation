function onEdit3(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算器”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() == "R1计算器" && range.getRow() == 5 && range.getColumn() == 3 && range.getValue() == true) {
    // 调用 calculateAllValues 函数 参数R1计算器
    var R1 = 'R1';
    calculateAllValues('R1计算器', R1);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“R2计算器”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() == "R2计算器" && range.getRow() == 5 && range.getColumn() == 3 && range.getValue() == true) {
    // 调用 calculateAllValues 函数 参数R2计算器
    var R2 = 'R2';
    calculateAllValues('R2计算器', R2);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

function calculateAllValues(sheet, realm) { //计算最大时利润


  var inventorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "库存信息");
  var dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "数据信息");
  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);

  //清除数据
  range = calculatorSheet.getRange("A9:J");
  range.clearContent();


  // 获取库存信息表的数据范围
  var inventoryRange = inventorySheet.getRange("A2:K" + inventorySheet.getLastRow());
  var inventoryData = inventoryRange.getValues();

  // 获取数据信息表的数据范围
  var dataRange = dataSheet.getRange("A2:N" + dataSheet.getLastRow());
  var dataValues = dataRange.getValues();

  // 获取自定义库存信息
  var optionRange = calculatorSheet.getRange("L27:N" + calculatorSheet.getLastRow());
  var optionData = optionRange.getValues();

  // 获取市场价格信息
  var marketRange = calculatorSheet.getRange("P27:R" + calculatorSheet.getLastRow());
  var marketData = marketRange.getValues();

  // 获取R1计算器表中的A2,B2,C2单元格的值
  var A2Value = calculatorSheet.getRange("A2").getValue();
  var B2Value = calculatorSheet.getRange("B2").getValue();
  var C2Value = calculatorSheet.getRange("C2").getValue();
  var PROFIT_BASED_MODELING_WEIGHT = calculatorSheet.getRange("F6").getValue();
  var PROFIT_PER_BUILDING_LEVEL = calculatorSheet.getRange("H6").getValue();
  var RETAIL_MODELING_QUALITY_WEIGHT = calculatorSheet.getRange("J6").getValue();
  var acceleration_multiplier = calculatorSheet.getRange("F3").getValue();

  // 获取选中的物品ID
  var select_range = calculatorSheet.getRange("M1:T14");
  var values = select_range.getValues();
  var output = [];
  for (var row = 1; row < values.length; row++) { // 从第二行开始
    for (var col = 0; col < values[row].length; col++) { // 从第1列开始
      if (values[row][col] === true) { // 如果单元格的值为TRUE
        // 获取上一个单元格的内容并添加到输出数组中
        var previousCellContent = values[row - 1][col];
        output.push(previousCellContent);
      }
    }
  }
  Logger.log(output)
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
    '圣诞脆饼': 67,
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
    '姜汁啤酒': 126,
    '披萨': 127,
    '面条': 128,
    '巧克力': 140,
    'Xmas ornament': 144
  };
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

      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if (dataValues[j][0] == db_letter) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var marketSaturationDiv = dataValues[j][3];
          var power = dataValues[j][4];
          var xMultiplier = dataValues[j][5];
          var xOffsetBase = dataValues[j][6];
          var yMultiplier = dataValues[j][7];
          var yOffset = dataValues[j][8];
          var building_wages = dataValues[j][9]
          var buildingLevelsNeededPerHour = dataValues[j][10]
          var modeledProductionCostPerUnit = dataValues[j][11]
          var modeledStoreWages = dataValues[j][12]
          var modeledUnitsSoldAnHour = dataValues[j][13]

          // 将起始值和结束值保存为数字，而不是字符串
          if (averagePrice - 10 > 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(1));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(1));
          } else if (averagePrice - 10 <= 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(2));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(2));
          }


          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算
            // 计算p的值 物品成本


            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // sj函数 sj(A, ie, be, 100, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var sj_h = marketSaturation < 0.3 ? marketSaturation - 0.3 : marketSaturation
            var sj_p = Math.max(sj_h - quality * 0.24, 0.1 - 0.24 * 2)

            // yNr函数 g = yNr(ie, p, 100, G.averageRetailPrice),
            var sj_g = (Math.pow(sellPrice * xMultiplier + (xOffsetBase + (sj_p - 0.5) / marketSaturationDiv), power) * yMultiplier + yOffset) * 100

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = quality / 12
            var vNr_d = 2 * PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerHour + 1) * (vNr_a * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s 

            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = 100 * ((sellPrice - modeledProductionCostPerUnit) * 3600) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))
            var sj_y = PROFIT_BASED_MODELING_WEIGHT
            if (sj_f <= 0) {
              if (sj_y < 1) {
                var sj_w = sj_g * (1 + sj_y) / acceleration_multiplier / 1;
                var Jq_d = sj_w - sj_w * A2Value / 100
              }
            } else {
              var sj_w = (sj_y * sj_f + (1 - sj_y) * sj_g) / acceleration_multiplier / 1;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // Jq函数 Jq(A, ie, be, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var s = (100 * 3600 / Jq_d).toFixed(2)

            // fNr函数 fNr(A,   ie, be, h != null ? h : 0, G.averageRetailPrice, n, G.marketSaturation, p != null ? p : 0, G.storeBaseSalary, $ || 1, 1)
            // var ? = sellPrice - building_wages * (B2Value/100) / s

            var p = ((workers + admin + material1 + material2 + material3 + material4 + material5 + market) / amount).toFixed(3);



            // Logger.log('sellprice:' + sellPrice + ',s:' + s)

            // 计算公式y
            var y = (s * sellPrice).toFixed(1);
            // Logger.log('y:' + y)


            // Logger.log('sj_h:' + sj_h)
            // Logger.log('sj_p:' + sj_p)
            // Logger.log('sj_g:' + sj_g)
            // Logger.log('sj_w' + sj_w)
            // Logger.log('vNr_a:' + vNr_a)
            // Logger.log('vNr_s:' + vNr_s)
            // Logger.log('vNr_l:' + vNr_l)
            // Logger.log('vNr_d:' + vNr_d)
            // Logger.log('vNr_u:' + vNr_u)
            // Logger.log('vNr_a:' + xNr_a)
            // Logger.log('vNr_p:' + vNr_p)
            // Logger.log('Jq_d:' + Jq_d)
            // Logger.log('fNr_Jq:' + fNr_Jq)
            // Logger.log('profit:' + profit)





            // // 计算H的值
            // var h = (Math.pow(sellPrice.toFixed(2) * xMultiplier + (xOffsetBase + (Math.max(-.38, saturation - .24 * quality) - .5) / marketSaturationDiv), power) * yMultiplier + yOffset).toFixed(2);



            // // 计算公式y
            // var y = (s * sellPrice).toFixed(1);

            // // 计算公式N
            var n = building_wages * B2Value / 100;

            // // 计算p的值 物品成本
            // var p = ((workers + admin + material1 + material2 + material3 + material4 + material5 + market) / amount).toFixed(3);

            // // 计算公式_
            var underscore = p * s + building_wages + n;

            // // 计算公式w 每级每小时利润
            var w = y - underscore;

            // // 计算每小时销售/单位
            var salesPerUnitPerHour = (s * C2Value).toFixed(2);

            // // 计算收入
            // // var revenue = y * C2Value;

            // // 计算销售成本
            // // var salesCost = underscore * C2Value;

            // // 计算每小时利润
            var profitPerHour = w * C2Value;

            // 更新最大值及对应的sellPrice
            if (profitPerHour - maxProfitPerHour > 0) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }
            // 如果最大利润相同，则比较每单位每小时销售额
            else if (profitPerHour === maxProfitPerHour && salesPerUnitPerHour - maxSalesPerUnitPerHour > 0) {
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }

            // 将 sellPrice 增加 0.1
            if (sellPrice - 10 >= 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else if (sellPrice - 10 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            }

            // Logger.log('maxProfitPerHour:'+maxProfitPerHour+',maxSalesPerUnitPerHour:'+maxSalesPerUnitPerHour)


          }

          var [sellTime, costStore] = convertToTime(amount, maxSalesPerUnitPerHour);

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
          calculatorSheet.getRange("H" + (count + 9)).setValue(sellTime);

          // 将使用商店数量(48小时)放到计算器表中
          calculatorSheet.getRange("I" + (count + 9)).setValue(costStore);

          var singleGoodTotalProfit = (maxProfitPerHour / maxSalesPerUnitPerHour) * amount;
          // 将单品总利润放到计算器表中
          calculatorSheet.getRange("J" + (count + 9)).setValue(singleGoodTotalProfit);

          count++;

          break;

        }
      }

    }

  }

  var optionButton = calculatorSheet.getRange("E5").getValue();
  if (optionButton) {
    count = optionAllValues(optionData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier);
  }

  var marketButton = calculatorSheet.getRange("F5").getValue();
  if (marketButton) {
    marketAllValues(marketData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier);
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


function convertToTime(amount, maxSalesPerUnitPerHour) { // 返回销售时间(时:分)， 使用商店数量(48小时)
  // 计算总的销售时间（小时）
  var sellTimeHours = amount / maxSalesPerUnitPerHour;

  // 将小时转换为分钟
  var sellTimeMinutes = sellTimeHours * 60;

  // 分别获取小时和分钟部分
  var hours = Math.floor(sellTimeMinutes / 60);
  var minutes = Math.ceil(sellTimeMinutes % 60);

  // 格式化成时:分的样式
  var formattedTime = hours.toString() + ':' + minutes.toString().padStart(2, '0');

  var costStore = Math.ceil(Math.ceil(sellTimeHours) / 48);

  return [formattedTime, costStore];
}


function optionAllValues(optionData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier) {

  count++;

  for (var i = 0; i < optionData.length; i++) {

    var db_letter = optionData[i][0];

    if (replacedList.includes(db_letter)) {

      var quality = optionData[i][1];
      var market = optionData[i][2]; // 获取采购和退货


      var maxProfitPerHour = 0;
      var maxSalesPerUnitPerHour = 0;
      var optimalSellPrice = 0;

      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if (dataValues[j][0] == db_letter) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var marketSaturationDiv = dataValues[j][3];
          var power = dataValues[j][4];
          var xMultiplier = dataValues[j][5];
          var xOffsetBase = dataValues[j][6];
          var yMultiplier = dataValues[j][7];
          var yOffset = dataValues[j][8];
          var building_wages = dataValues[j][9]
          var buildingLevelsNeededPerHour = dataValues[j][10]
          var modeledProductionCostPerUnit = dataValues[j][11]
          var modeledStoreWages = dataValues[j][12]
          var modeledUnitsSoldAnHour = dataValues[j][13]

          // 将起始值和结束值保存为数字，而不是字符串
          if (averagePrice - 10 > 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(1));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(1));
          } else if (averagePrice - 10 <= 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(2));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(2));
          }

          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算

            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // sj函数 sj(A, ie, be, 100, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var sj_h = marketSaturation < 0.3 ? marketSaturation - 0.3 : marketSaturation
            var sj_p = Math.max(sj_h - quality * 0.24, 0.1 - 0.24 * 2)

            // yNr函数 g = yNr(ie, p, 100, G.averageRetailPrice),
            var sj_g = (Math.pow(sellPrice * xMultiplier + (xOffsetBase + (sj_p - 0.5) / marketSaturationDiv), power) * yMultiplier + yOffset) * 100

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = quality / 12
            var vNr_d = 2 * PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerHour + 1) * (vNr_a * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s 

            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = 100 * ((sellPrice - modeledProductionCostPerUnit) * 3600) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))
            var sj_y = PROFIT_BASED_MODELING_WEIGHT
            if (sj_f <= 0) {
              if (sj_y < 1) {
                var sj_w = sj_g * (1 + sj_y) / acceleration_multiplier / 1;
                var Jq_d = sj_w - sj_w * A2Value / 100
              }
            } else {
              var sj_w = (sj_y * sj_f + (1 - sj_y) * sj_g) / acceleration_multiplier / 1;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // Jq函数 Jq(A, ie, be, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var s = (100 * 3600 / Jq_d).toFixed(2)






            // 计算公式y
            var y = (s * sellPrice).toFixed(1);

            // 计算公式N
            var n = building_wages * B2Value / 100;

            // 计算p的值 物品成本
            var p = market;

            // 计算公式_
            var underscore = p * s + building_wages + n;

            // 计算公式w 每级每小时利润
            var w = y - underscore;

            // 计算每小时销售/单位
            var salesPerUnitPerHour = (s * C2Value).toFixed(2);

            // 计算每小时利润
            var profitPerHour = w * C2Value;

            // 更新最大值及对应的sellPrice
            if (profitPerHour - maxProfitPerHour > 0) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }
            // 如果最大利润相同，则比较每单位每小时销售额
            else if (profitPerHour === maxProfitPerHour && salesPerUnitPerHour - maxSalesPerUnitPerHour > 0) {
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }

            // 将 sellPrice 增加 0.1
            if (sellPrice - 10 >= 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else if (sellPrice - 10 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            }

            Logger.log(sellPrice)
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

          count++;

          break;

        }
      }

    }
  }

  return count;
}


function marketAllValues(marketData, replacedList, dataValues, count, calculatorSheet, A2Value, B2Value, C2Value, getChineseItem, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier) {

  count++;

  for (var i = 0; i < marketData.length; i++) {

    var db_letter = marketData[i][0];

    if (replacedList.includes(db_letter)) {

      var quality = marketData[i][1];
      var market = marketData[i][2]; // 获取采购和退货


      var maxProfitPerHour = 0;
      var maxSalesPerUnitPerHour = 0;
      var optimalSellPrice = 0;

      // 在数据信息表中查找与当前行匹配的 ID
      for (var j = 0; j < dataValues.length; j++) {
        if (dataValues[j][0] == db_letter) {
          // 计算公式H
          var averagePrice = dataValues[j][1];
          var marketSaturation = dataValues[j][2];
          var marketSaturationDiv = dataValues[j][3];
          var power = dataValues[j][4];
          var xMultiplier = dataValues[j][5];
          var xOffsetBase = dataValues[j][6];
          var yMultiplier = dataValues[j][7];
          var yOffset = dataValues[j][8];
          var building_wages = dataValues[j][9]
          var buildingLevelsNeededPerHour = dataValues[j][10]
          var modeledProductionCostPerUnit = dataValues[j][11]
          var modeledStoreWages = dataValues[j][12]
          var modeledUnitsSoldAnHour = dataValues[j][13]

          // 将起始值和结束值保存为数字，而不是字符串
          if (averagePrice - 10 > 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(1));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(1));
          } else if (averagePrice - 10 <= 0) {
            startSellPrice = parseFloat((averagePrice * 0.8).toFixed(2));
            endSellPrice = parseFloat((averagePrice * 1.2).toFixed(2));
          }

          // 初始化 sellPrice 为起始值
          var sellPrice = startSellPrice;

          // 使用 while 循环来遍历范围
          while (sellPrice <= endSellPrice) {
            // 在这里进行你的计算

            var g_modeledStoreWages, f_modeledStoreWages, y_modeledStoreWages, w_modeledStoreWages

            // sj函数 sj(A, ie, be, 100, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var sj_h = marketSaturation < 0.3 ? marketSaturation - 0.3 : marketSaturation
            var sj_p = Math.max(sj_h - quality * 0.24, 0.1 - 0.24 * 2)

            // yNr函数 g = yNr(ie, p, 100, G.averageRetailPrice),
            var sj_g = (Math.pow(sellPrice * xMultiplier + (xOffsetBase + (sj_p - 0.5) / marketSaturationDiv), power) * yMultiplier + yOffset) * 100

            // vNr函数 f = vNr(be, n, G.marketSaturation, 100, G.averageRetailPrice),
            var vNr_a = Math.min(Math.max(2 - marketSaturation, 0), 2)
            var vNr_s = vNr_a / 2 + 0.5
            var vNr_l = quality / 12
            var vNr_d = 2 * PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerHour + 1) * (vNr_a * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
            var vNr_u = modeledUnitsSoldAnHour * vNr_s 
          
            // bNr函数 bNr(d, be.modeledProductionCostPerUnit, u, (f = be.modeledStoreWages) != null ? f : 0)
            var vNr_h = modeledProductionCostPerUnit + (vNr_d + ((f_modeledStoreWages = modeledStoreWages) != null ? f_modeledStoreWages : 0)) / vNr_u

            // xNr函数 xNr(d, h, G.averageRetailPrice, (y = be.modeledStoreWages) != null ? y : 0, be.modeledProductionCostPerUnit)
            var xNr_a = (((y_modeledStoreWages = modeledStoreWages) != null ? y_modeledStoreWages : 0) + vNr_d) / ((vNr_h - modeledProductionCostPerUnit) * (vNr_h - modeledProductionCostPerUnit));
            var vNr_p = vNr_d - (sellPrice - vNr_h) * (sellPrice - vNr_h) * xNr_a

            // wNr函数 wNr(p, be.modeledProductionCostPerUnit, (w = be.modeledStoreWages) != null ? w : 0, G.averageRetailPrice, 100)
            var sj_f = 100 * ((sellPrice - modeledProductionCostPerUnit) * 3600) / (vNr_p + ((w_modeledStoreWages = modeledStoreWages) != null ? w_modeledStoreWages : 0))
            var sj_y = PROFIT_BASED_MODELING_WEIGHT
            if (sj_f <= 0) {
              if (sj_y < 1) {
                var sj_w = sj_g * (1 + sj_y) / acceleration_multiplier / 1;
                var Jq_d = sj_w - sj_w * A2Value / 100
              }
            } else {
              var sj_w = (sj_y * sj_f + (1 - sj_y) * sj_g) / acceleration_multiplier / 1;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // Jq函数 Jq(A, ie, be, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var s = (100 * 3600 / Jq_d).toFixed(2)

            // 计算公式y
            var y = (s * sellPrice).toFixed(1);

            // 计算公式N
            var n = building_wages * B2Value / 100;

            // 计算p的值 物品成本
            var p = market;

            // 计算公式_
            var underscore = p * s + building_wages + n;

            // 计算公式w 每级每小时利润
            var w = y - underscore;

            // 计算每小时销售/单位
            var salesPerUnitPerHour = (s * C2Value).toFixed(2);

            // 计算每小时利润
            var profitPerHour = w * C2Value;

            // 更新最大值及对应的sellPrice
            if (profitPerHour - maxProfitPerHour > 0) {
              maxProfitPerHour = profitPerHour;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }
            // 如果最大利润相同，则比较每单位每小时销售额
            else if (profitPerHour === maxProfitPerHour && salesPerUnitPerHour - maxSalesPerUnitPerHour > 0) {
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }

            // 将 sellPrice 增加 0.1
            if (sellPrice - 10 >= 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else if (sellPrice - 10 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            }

            Logger.log(sellPrice)
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

          count++;

          break;

        }
      }

    }
  }

}
