function highlightRowsBasedOnOpeningDate() {
  const sheetId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4';
  const sheetName = 'Sheet1';
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const openingDateIndex = headers.indexOf('OPENING DATE');

  if (openingDateIndex === -1) throw new Error('"OPENING DATE" column not found.');

  // Get spreadsheet timezone
  const tz = spreadsheet.getSpreadsheetTimeZone();

  // Today's date at midnight in sheet timezone
  const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const today = new Date(todayStr + 'T00:00:00');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let openingDate = new Date(row[openingDateIndex]);

    if (isNaN(openingDate)) continue;

    // Convert openingDate to sheet timezone and strip time
    const openingDateStr = Utilities.formatDate(openingDate, tz, 'yyyy-MM-dd');
    openingDate = new Date(openingDateStr + 'T00:00:00');

    if (openingDate >= today) {
      sheet.getRange(i + 1, 1, 1, headers.length).setBackground('#D5F5E3');
    } else {
      sheet.getRange(i + 1, 1, 1, headers.length).setBackground(null);
    }
  }
}

