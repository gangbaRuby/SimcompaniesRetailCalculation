function onCheckboxClick(e) {
  var checkbox = e.range;
  var sheet = checkbox.getSheet();
  var sheetName = sheet.getName(); // 当前表名

  // Logger.log(checkbox);
  // Logger.log(sheet);
  // Logger.log(sheetName);


  if (sheetName == 'R1计算器' || sheetName == 'R2计算器' || sheetName == 'R1固定利润算成本' || sheetName == 'R2固定利润算成本' || sheetName == 'R1计算器（最大销售速度）' || sheetName == 'R2计算器（最大销售速度）' ) { // 限制使用表

    var value = checkbox.getValue();
    var checkboxesToSync = [];

    // 根据复选框的位置确定需要同步勾选的其他复选框的范围
    if (checkbox.getA1Notation() === 'N2') { // 五金商店
      checkboxesToSync = [sheet.getRange('O2:S2')];
    } else if (checkbox.getA1Notation() === 'N4') { // 加油站
      checkboxesToSync = [sheet.getRange('O4:P4')];
    } else if (checkbox.getA1Notation() === 'N6') { // 时装商店
      checkboxesToSync = [sheet.getRange('O6:V6')];
    } else if (checkbox.getA1Notation() === 'N9') { // 生鲜商店
      checkboxesToSync = [
        sheet.getRange('O8:v8'),
        sheet.getRange('O10:v10')
      ];
    } else if (checkbox.getA1Notation() === 'N12') { // 电子产品商店
      checkboxesToSync = [sheet.getRange('O12:T12')];
    } else if (checkbox.getA1Notation() === 'N14') { // 车行
      checkboxesToSync = [sheet.getRange('O14:S14')];
    } else if (checkbox.getA1Notation() === 'N18') { // Q
      checkboxesToSync = [
        sheet.getRange('O18:T18'),
        sheet.getRange('N20:T20')
      ];
    } else if (checkbox.getA1Notation() === 'X2') { // 万圣节集市
      checkboxesToSync = [
        sheet.getRange('Y2:AA2')
      ];
    } else if (checkbox.getA1Notation() === 'X4') { // 圣诞节集市
      checkboxesToSync = [
        sheet.getRange('Y4:AA4')
      ];
    }

    // 将其他复选框的值设置为与当前复选框相同
    checkboxesToSync.forEach(range => range.setValue(value));

  }
}
