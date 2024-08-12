function onCheckboxClick(e) {
  var checkbox = e.range;
  var sheet = checkbox.getSheet();
  var sheetName = sheet.getName(); // 当前表名

Logger.log(checkbox);
Logger.log(sheet);
Logger.log(sheetName);

  
  if (sheetName == 'R1计算器' || sheetName == 'R2计算器' || sheetName == 'R1固定利润算成本' || sheetName == 'R2固定利润算成本' || sheetName == 'R1计算器（最大销售速度）' || sheetName == 'R2计算器（最大销售速度）') { // 限制使用表

    var value = checkbox.getValue();
    var checkboxesToSync = [];

    // 根据复选框的位置确定需要同步勾选的其他复选框的范围
    if (checkbox.getA1Notation() === 'L2') {
      checkboxesToSync = [sheet.getRange('M2:Q2')];
    } else if (checkbox.getA1Notation() === 'L4') {
      checkboxesToSync = [sheet.getRange('M4:N4')];
    } else if (checkbox.getA1Notation() === 'L6') {
      checkboxesToSync = [sheet.getRange('M6:T6')];
    } else if (checkbox.getA1Notation() === 'L9') {
      checkboxesToSync = [
        sheet.getRange('M8:T8'),
        sheet.getRange('M10:T10')
      ];
    } else if (checkbox.getA1Notation() === 'L12') {
      checkboxesToSync = [sheet.getRange('M12:R12')];
    } else if (checkbox.getA1Notation() === 'L14') {
      checkboxesToSync = [sheet.getRange('M14:Q14')];
    } else if (checkbox.getA1Notation() === 'L18') {
      checkboxesToSync = [
        sheet.getRange('M18:R18'),
        sheet.getRange('L20:R20')
      ];
    }

// 将其他复选框的值设置为与当前复选框相同
checkboxesToSync.forEach(range => range.setValue(value));

  }
}
