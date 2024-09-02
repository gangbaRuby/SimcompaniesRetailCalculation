function onEdit5(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算利润”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() == "R1固定利润算成本" && range.getRow() == 5 && range.getColumn() == 3 && range.getValue() == true) {

    var R1 = 'R1';

    calculateOptimalCosts('R1固定利润算成本', R1);



    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“R2计算利润”工作表中编辑了单元格 C5，并且值为 TRUE
  if (sheet.getName() == "R2固定利润算成本" && range.getRow() == 5 && range.getColumn() == 3 && range.getValue() == true) {

    var R2 = 'R2';

    calculateOptimalCosts('R2固定利润算成本', R2);



    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

function calculateOptimalCosts(sheet, realm) { //计算指定时利润下,最大每小时销售/单位，最大成本

  // sheet = 'R1固定利润算成本'
  // realm = 'R1'

  var dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "数据信息");
  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);

  //清除数据
  range = calculatorSheet.getRange("A9:J");
  range.clearContent();

  // 获取数据信息表的数据范围
  var dataRange = dataSheet.getRange("A2:N" + dataSheet.getLastRow());
  var dataValues = dataRange.getValues();

  // 获取R1计算利润表中的A2,B2,C2单元格的值
  var A2Value = calculatorSheet.getRange("A2").getValue();
  var B2Value = calculatorSheet.getRange("B2").getValue();
  var C2Value = calculatorSheet.getRange("C2").getValue();
  var I1Value = calculatorSheet.getRange("I1").getValue();//固定利润
  var PROFIT_BASED_MODELING_WEIGHT = calculatorSheet.getRange("F6").getValue();
  var PROFIT_PER_BUILDING_LEVEL = calculatorSheet.getRange("H6").getValue();
  var RETAIL_MODELING_QUALITY_WEIGHT = calculatorSheet.getRange("J6").getValue();
  var acceleration_multiplier = calculatorSheet.getRange("F3").getValue();
  var upLimit = calculatorSheet.getRange("L1").getValue();
  var downlimit = calculatorSheet.getRange("L2").getValue();


  // 获取选中的物品ID
  var select_range = calculatorSheet.getRange("O1:V14");
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
  const replacedList = output.map(item => mapping[item]); //汉字转ID

  const reverseMapping = Object.entries(mapping).reduce((acc, [key, value]) => {//ID转汉字
    acc[value] = key;
    return acc;
  }, {});
  const getChineseItem = (number) => reverseMapping[number];


  // 获取选中的品质
  // 获取 M17:R20 范围
  var range1 = calculatorSheet.getRange("O17:T18");
  var quality_values1 = range1.getValues();
  // Logger.log(quality_values1)
  // 获取 L19:R20 范围
  var range2 = calculatorSheet.getRange("N19:T20");
  var quality_values2 = range2.getValues();
  // Logger.log(quality_values2)
  // 将两个范围的值合并为一个数组
  var quality_values = quality_values1.concat(quality_values2);
  var quality_output = [];
  for (var row = 1; row < quality_values.length; row++) { // 从第二行开始
    for (var col = 0; col < quality_values[row].length; col++) { // 从第1列开始
      if (quality_values[row][col] === true) { // 如果单元格的值为TRUE
        // 获取上一个单元格的内容并添加到输出数组中
        var previousCellContent = quality_values[row - 1][col];
        quality_output.push(previousCellContent);
      }
    }
  }

  // Logger.log(quality_output)

  const quality_mapping = {
    'Q0': 0,
    'Q1': 1,
    'Q2': 2,
    'Q3': 3,
    'Q4': 4,
    'Q5': 5,
    'Q6': 6,
    'Q7': 7,
    'Q8': 8,
    'Q9': 9,
    'Q10': 10,
    'Q11': 11,
    'Q12': 12
  }
  const quality_replacedList = quality_output.map(item => quality_mapping[item]); //汉字转ID



  var count = 0;









  // 在数据信息表中查找与当前行匹配的 ID
  for (var i = 0; i < replacedList.length; i++) {


    db_letter = replacedList[i] //获取要计算的物品ID

    for (var j = 0; j < dataValues.length; j++) {
      if (dataValues[j][0] == db_letter) {

        // 计算公式w 每级每小时利润
        var w = I1Value;

        // 计算每小时利润
        var profitPerHour = w * C2Value;

        var averagePrice = dataValues[j][1];
        var marketSaturation = dataValues[j][2];
        var building_wages = dataValues[j][3]
        var buildingLevelsNeededPerHour = dataValues[j][4]
        var modeledProductionCostPerUnit = dataValues[j][5]
        var modeledStoreWages = dataValues[j][6]
        var modeledUnitsSoldAnHour = dataValues[j][7]

        var n = building_wages * B2Value / 100;

        // 使用 while 循环来遍历范围
        for (k = 0; k < quality_replacedList.length; k++) {

          quality = quality_replacedList[k]; //获取要计算的物品品质

          var maxp = 0;
          var maxSalesPerUnitPerHour = 0;
          var optimalSellPrice = 0;



          // 将起始值和结束值保存为数字，而不是字符串
          // 将起始值和结束值保存为数字，而不是字符串
          if (downlimit < 0) {
            var downlimit1 = 0.1
            if (averagePrice - 8 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit1 / 0.01) * 0.01).toFixed(2));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(2));
            } else if (averagePrice - 2001 < 0) {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit1 / 0.1) * 0.1).toFixed(1));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(1));
            } else {
              var startSellPrice = parseFloat((Math.floor(averagePrice * downlimit1 / 1) * 1).toFixed(0));
              var endSellPrice = parseFloat((averagePrice * upLimit).toFixed(0));
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
            var vNr_l = quality / 12
            var vNr_d = 2 * PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerHour + 1) * (vNr_a / 2 * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
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
              if (sj_y >= 1 && sellPrice > averagePrice) {
                break;
              }

            } else {
              var sj_w = (sj_y * sj_f) / acceleration_multiplier / 1;
              var Jq_d = sj_w - sj_w * A2Value / 100
            }

            // Jq函数 Jq(A, ie, be, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
            var s = (100 * 3600 / Jq_d).toFixed(2)

            // 计算公式y
            var y = (s * sellPrice).toFixed(1);

            // 计算公式N
            // var n = building_wages * B2Value / 100;

            // 计算每小时销售/单位
            var salesPerUnitPerHour = (s * C2Value).toFixed(2);

            // 计算公式_
            var p = (((y - w) - n - building_wages) / s).toFixed(2);


            // 更新最大值及对应的成本价

            if (p - maxp > 0 && p <= 10 * modeledProductionCostPerUnit && p >= modeledProductionCostPerUnit) {
              maxp = p;
              maxSalesPerUnitPerHour = salesPerUnitPerHour;
              optimalSellPrice = sellPrice;
            }
            // 如果最大成本价相同，则比较销售速度
            // else if (p === maxp && p <= 2 * modeledProductionCostPerUnit && p >= modeledProductionCostPerUnit && salesPerUnitPerHour - maxSalesPerUnitPerHour > 0 ) {
            //   maxSalesPerUnitPerHour = salesPerUnitPerHour;
            //   optimalSellPrice = sellPrice;
            // }




            // 将 sellPrice 步进
            if (sellPrice - 8 < 0) {
              sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
            } else if (sellPrice - 2001 < 0) {
              sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
            } else {
              sellPrice = parseFloat((sellPrice + 1).toFixed(0));
            }


          }
          // 将ID放到计算利润表中
          calculatorSheet.getRange("A" + (count + 9)).setValue(getChineseItem(db_letter));

          //将品质放到计算利润表中
          calculatorSheet.getRange("B" + (count + 9)).setValue("Q" + quality);

          //将物品成本放到计算利润表中
          calculatorSheet.getRange("C" + (count + 9)).setValue(maxp);

          // 将售价放到计算利润表中
          calculatorSheet.getRange("D" + (count + 9)).setValue(optimalSellPrice);

          // 将每小时销售/单位放到计算利润表中
          calculatorSheet.getRange("E" + (count + 9)).setValue(maxSalesPerUnitPerHour);

          // 将每小时利润放到计算利润表中
          calculatorSheet.getRange("F" + (count + 9)).setValue(profitPerHour);

          var [optimalSellPrice1, maxSalesPerUnitPerHour1, maxProfitPerHour1] = calculateCostAllValues(maxp, averagePrice, marketSaturation, building_wages, quality, A2Value, B2Value, C2Value, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, buildingLevelsNeededPerHour, modeledProductionCostPerUnit, modeledStoreWages, modeledUnitsSoldAnHour, upLimit, downlimit);

          // 将售价放到计算器表中
          calculatorSheet.getRange("G" + (count + 9)).setValue(optimalSellPrice1);

          // 将每小时销售/单位放到计算器表中
          calculatorSheet.getRange("H" + (count + 9)).setValue(maxSalesPerUnitPerHour1);

          // 将每小时利润放到计算器表中
          calculatorSheet.getRange("I" + (count + 9)).setValue(maxProfitPerHour1);




          count++;
        }





        break;

      }
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

  // 在 C6 单元格设置格式化时间
  calculatorSheet.getRange(6, 3).setValue(formattedTime);
}

function calculateCostAllValues(cost, averagePrice, marketSaturation, building_wages, quality, A2Value, B2Value, C2Value, PROFIT_BASED_MODELING_WEIGHT, PROFIT_PER_BUILDING_LEVEL, RETAIL_MODELING_QUALITY_WEIGHT, acceleration_multiplier, buildingLevelsNeededPerHour, modeledProductionCostPerUnit, modeledStoreWages, modeledUnitsSoldAnHour, upLimit, downlimit) { //根据算出的成本计算最大时利润

  var maxProfitPerHour = 0;
  var maxSalesPerUnitPerHour = 0;
  var optimalSellPrice = 0;

  var p = cost;
  var n = building_wages * B2Value / 100;

  if (downlimit = -1) { // -1 成本价
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
    var vNr_l = quality / 12
    var vNr_d = 2 * PROFIT_PER_BUILDING_LEVEL * (buildingLevelsNeededPerHour + 1) * (vNr_a / 2 * (1 + vNr_l * RETAIL_MODELING_QUALITY_WEIGHT)) + ((g_modeledStoreWages = modeledStoreWages) != null ? g_modeledStoreWages : 0)
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
      if (sj_y >= 1 && sellPrice > averagePrice) {
        break;
      }

    } else {
      var sj_w = (sj_y * sj_f) / acceleration_multiplier / 1;
      var Jq_d = sj_w - sj_w * A2Value / 100
    }

    // Jq函数 Jq(A, ie, be, h, G.averageRetailPrice, n, G.marketSaturation, $, 1)
    var s = (100 * 3600 / Jq_d).toFixed(2)

    // 计算公式y
    var y = (s * sellPrice).toFixed(1);



    // // 计算公式_
    var underscore = p * s + building_wages + n;

    // // 计算公式w 每级每小时利润
    var w = y - underscore;

    // // 计算每小时销售/单位
    var salesPerUnitPerHour = (s * C2Value).toFixed(2);

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

    // 将 sellPrice 步进
    if (sellPrice - 8 < 0) {
      sellPrice = parseFloat((sellPrice + 0.01).toFixed(2));
    } else if (sellPrice - 2001 < 0) {
      sellPrice = parseFloat((sellPrice + 0.1).toFixed(1));
    } else {
      sellPrice = parseFloat((sellPrice + 1).toFixed(0));
    }
  }

  return [optimalSellPrice, maxSalesPerUnitPerHour, maxProfitPerHour];


}

