function addTriggers() {

    var triggers = ScriptApp.getProjectTriggers();

  // 遍历所有触发器并将其删除
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // 获取当前活动的 Google Sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // 创建一个新的基于编辑的触发器 onEdit1
  ScriptApp.newTrigger("onEdit1") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit2
  ScriptApp.newTrigger("onEdit2") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit3
  ScriptApp.newTrigger("onEdit3") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit4
  ScriptApp.newTrigger("onEdit4") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit5
  ScriptApp.newTrigger("onEdit5") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit6
  ScriptApp.newTrigger("onEdit6") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onEdit7
  ScriptApp.newTrigger("onEdit7") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

  // 创建一个新的基于编辑的触发器 onCheckboxClick
  ScriptApp.newTrigger("onCheckboxClick") // 指定要触发的函数名
    .forSpreadsheet(spreadsheet) // 绑定到特定的 Google Sheet
    .onEdit() // 基于编辑的触发器
    .create();

}

