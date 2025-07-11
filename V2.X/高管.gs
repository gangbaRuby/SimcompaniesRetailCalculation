function onEdit4(e) {
  var range = e.range;
  var sheet = range.getSheet();

  // 检查是否在“高管”工作表中编辑了单元格 B5，并且值为 TRUE
  if ((sheet.getName() == "R1高管" && range.getRow() == 1 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R1计算器" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R1固定利润算成本" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R1计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R1自定义售价" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true)) {
    // 调用 fetchDataWithCookies 函数
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B1").getValue();
    var R1 = 'R1'
    executives(sessionid, R1);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }

  // 检查是否在“高管”工作表中编辑了单元格 B5，并且值为 TRUE
  if ((sheet.getName() == "R2高管" && range.getRow() == 1 && range.getColumn() == 1 && range.getValue() == true) || (sheet.getName() == "R2计算器" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R2固定利润算成本" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R2计算器（最大销售速度）" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true) || (sheet.getName() == "R2自定义售价" && range.getRow() == 5 && range.getColumn() == 4 && range.getValue() == true)) {
    // 调用 fetchDataWithCookies 函数
    var sessionid_settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("使用说明");
    var sessionid = sessionid_settings.getRange("B2").getValue();
    var R2 = 'R2'
    executives(sessionid, R2);

    // 将复选框的值重置为 FALSE，以便下次触发
    range.setValue(false);
  }
}

const positionMap = {
  "coo": "o",
  "cfo": "f",
  "cmo": "m",
  "cto": "t",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "COO_Apprentice": "v",
  "CFO_Apprentice": "x",
  "CMO_Apprentice": "y",
  "CTO_Apprentice": "z"
};

// 根据职位过滤员工信息并转换格式
function getEmployeesByPosition(data, positionKey) {
  const positionCode = positionMap[positionKey];
  return data.filter(function (employee) {
    return employee.currentWorkHistory?.position === positionCode;
  }).map(function (employee) {
    var startTime = new Date(employee.currentWorkHistory.start);
    var currentTime = new Date();
    var timeDifference = currentTime - startTime;

    var isNewlyAssigned = timeDifference <= 3 * 60 * 60 * 1000 && timeDifference >= 0;
    var isTrainingActive = employee.currentTraining;
    var isStrikeOver = !employee.strikeUntil;
    var resetSkills = isNewlyAssigned || isTrainingActive || !isStrikeOver;

    return {
      "name": employee.name,
      "age": employee.age,
      "salary": employee.salary,
      "coo": resetSkills ? 0 : (employee.skills?.coo || 0),
      "cfo": resetSkills ? 0 : (employee.skills?.cfo || 0),
      "cmo": resetSkills ? 0 : (employee.skills?.cmo || 0),
      "cto": resetSkills ? 0 : (employee.skills?.cto || 0)
    };
  });
}

// 将员工信息填入表格并返回下一个起始行数
function fillEmployeesToSheet(sheet, employees, startRow, startColumn) {
  if (employees.length > 0) {
    sheet.getRange(startRow, startColumn, employees.length, 7).setValues(employees.map(function (employee) {
      return [employee.name, employee.age, employee.salary, employee.coo, employee.cfo, employee.cmo, employee.cto];
    }));
    return startRow + employees.length;
  }
  return startRow;
}

// 主要功能函数
function executives(sessionid, realm) {
  // 发送请求获取员工信息
  var url = "https://www.simcompanies.com/api/v3/companies/me/executives/";
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
  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());
  var executives = data.executives;  // 从data里取executives数组

  // 获取不同职位的员工信息
  var coo = getEmployeesByPosition(executives, "coo");
  var cfo = getEmployeesByPosition(executives, "cfo");
  var cmo = getEmployeesByPosition(executives, "cmo");
  var cto = getEmployeesByPosition(executives, "cto");
  var COO_Apprentice = getEmployeesByPosition(executives, "COO_Apprentice");
  var CFO_Apprentice = getEmployeesByPosition(executives, "CFO_Apprentice"); 
  var CMO_Apprentice = getEmployeesByPosition(executives, "CMO_Apprentice"); 
  var CTO_Apprentice = getEmployeesByPosition(executives, "CTO_Apprentice"); 

  // 存储不同位置的员工信息
  var gEmployees = {};

  var calculatorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器");
  var profitSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "固定利润算成本");
  var speedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "计算器（最大销售速度）");
  var optionSellPriceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "自定义售价");


  // 获取当前表格并清空内容
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(realm + "高管");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(realm + "高管");
  }
  var clearRange = sheet.getRange("B2:H10");
  clearRange.clearContent();


  row = fillEmployeesToSheet(sheet, coo, 2, 2);
  row = fillEmployeesToSheet(sheet, cfo, 3, 2);
  row = fillEmployeesToSheet(sheet, cmo, 4, 2);
  row = fillEmployeesToSheet(sheet, cto, 5, 2);
  row = fillEmployeesToSheet(sheet, COO_Apprentice, 11, 2);
  row = fillEmployeesToSheet(sheet, CFO_Apprentice, 12, 2);
  row = fillEmployeesToSheet(sheet, CMO_Apprentice, 13, 2);
  row = fillEmployeesToSheet(sheet, CTO_Apprentice, 14, 2);
  

  // 填入其他位置的员工信息
  for (var i = 1; i <= 5; i++) {
    var position = i;
    var employees = getEmployeesByPosition(executives, position);

    if (employees.length === 0) {
      continue;
    }

    gEmployees[position] = employees;
  }

  // 再次从第6行开始填入表格
  var row = 6;
  for (var i = 1; i <= 5; i++) {
    var position = i;
    var employees = gEmployees[position];

    if (employees) {
      var validEmployees = employees.filter(function (employee) {
        return employee.name;
      });

      if (validEmployees.length > 0) {
        row = fillEmployeesToSheet(sheet, validEmployees, row, 2);
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

  // 在计算器表 D6 单元格设置格式化时间
  calculatorSheet.getRange(6, 4).setValue(formattedTime);
  profitSheet.getRange(6, 4).setValue(formattedTime);
  speedSheet.getRange(6, 4).setValue(formattedTime);
  optionSellPriceSheet.getRange(6, 4).setValue(formattedTime);

  // 在高管表 A11 单元格设置格式化时间
  sheet.getRange(15, 1).setValue(formattedTime);


}

