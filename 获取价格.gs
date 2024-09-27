function onEdit6(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“R1计算器”工作表中编辑了单元格 Q25，并且值为 TRUE
  if ((sheet.getName() == "R1计算器" && range.getRow() == 25 && range.getColumn() == 19 && range.getValue() == true) || (sheet.getName() == "R1计算器（最大销售速度）" && range.getRow() == 25 && range.getColumn() == 19 && range.getValue() == true)) {
    // 调用 get_price 函数 参数R1计算器
    var R1 = 0;
    get_price(sheet.getName(), R1);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“R2计算器”工作表中编辑了单元格 Q25，并且值为 TRUE
  if ((sheet.getName() == "R2计算器" && range.getRow() == 25 && range.getColumn() == 19 && range.getValue() == true) || (sheet.getName() == "R2计算器（最大销售速度）" && range.getRow() == 25 && range.getColumn() == 19 && range.getValue() == true)) {
    // 调用 get_price 函数 参数R1计算器
    var R2 = 1;
    get_price(sheet.getName(), R2);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}


function get_price(sheet, realm) {

  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
  var mpDiscount = calculatorSheet.getRange("U26").getValue();

  // 获取选中的物品ID
  var select_range = calculatorSheet.getRange("O1:V14");
  var values = select_range.getValues();
  var output = [];
  for (var row = 1; row < values.length; row++) { // 从第二行开始
    for (var col = 0; col < values[row].length; col++) { // 从第1列开始
      if (values[row][col] === true && !(row === 3 && col === 17)) { // 如果单元格的值为TRUE
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
    'Xmas ornament': 144,
    '南瓜': 146,
    '杰克灯笼': 147,
    '女巫服': 148
  };
  const replacedList = output.map(item => mapping[item]);

  // 创建一个字典用于存储每种 kind 和 quality 的最小价格
  var minPriceDict = {};

  // 遍历 replacedList 并查询 API 数据
  replacedList.forEach(function (itemID) {
    var url = "https://www.simcompanies.com/api/v3/market/all/" + realm + "/" + itemID + "/";

    // 发起 API 请求
    var response = UrlFetchApp.fetch(url);
    var data = JSON.parse(response.getContentText());

    // 遍历数据，查找相同 kind 和 quality 的最小价格
    data.forEach(function (item) {
      var kind = item.kind;
      var quality = item.quality;
      var price = item.price;

      // 使用 (kind, quality) 作为键
      var key = kind + "," + quality;

      // 如果这个 (kind, quality) 组合没有在字典中，或者价格更低，则更新字典
      if (!minPriceDict[key] || price < minPriceDict[key].price) {
        minPriceDict[key] = {
          kind: kind,
          quality: quality,
          price: price
        };
      }
    });
  });


  var headers = ["物品ID", "品质", "采购和退货", "mp-?%"];

  // 清除现有数据
  calculatorSheet.getRange("R27:U").clearContent();

  // 将计算出的最小价格数据写入 Google Sheets
  var filteredData = [];
  for (var key in minPriceDict) {
    if (minPriceDict.hasOwnProperty(key)) {
      var item = minPriceDict[key];
      filteredData.push([item.kind, item.quality, item.price, item.price * (1 - mpDiscount / 100)]);
    }
  }

  if (filteredData.length > 0) {
    calculatorSheet.getRange(27, 18, filteredData.length, headers.length).setValues(filteredData);
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

  // 在 R25 单元格设置格式化时间
  calculatorSheet.getRange(25, 20).setValue(formattedTime);



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