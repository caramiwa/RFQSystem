function populateEmailColumn() {
  const rfqDropdownId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4'; // RFQ_Dropdown Spreadsheet ID
  const rfqSheetName = 'Sheet1'; // RFQ sheet containing END-USER and EU EMAIL columns
  const userEmailSheetName = 'Sheet2'; // Sheet containing End-User and Email mappings

  // Open the spreadsheet and get the sheets
  const rfqSpreadsheet = SpreadsheetApp.openById(rfqDropdownId);
  const rfqSheet = rfqSpreadsheet.getSheetByName(rfqSheetName);
  const userEmailSheet = rfqSpreadsheet.getSheetByName(userEmailSheetName);

  // Validate sheets
  if (!rfqSheet) throw new Error(`Sheet "${rfqSheetName}" not found.`);
  if (!userEmailSheet) throw new Error(`Sheet "${userEmailSheetName}" not found.`);

  // Get data
  const rfqData = rfqSheet.getDataRange().getValues();
  const userEmailData = userEmailSheet.getDataRange().getValues();
  
  if (rfqData.length < 2 || userEmailData.length < 2) return; // Skip if no data

  // Get column indexes dynamically
  const endUserIndex = getColumnIndexByName(rfqData[0], 'END-USER');
  const euEmailIndex = getColumnIndexByName(rfqData[0], 'EU EMAIL');
  const userEndUserIndex = getColumnIndexByName(userEmailData[0], 'End-User');
  const userEmailIndex = getColumnIndexByName(userEmailData[0], 'Email');

  // Create End-User to Email mapping
  const endUserToEmail = new Map();
  for (let i = 1; i < userEmailData.length; i++) {
    const endUser = userEmailData[i][userEndUserIndex]?.toString().trim();
    const email = userEmailData[i][userEmailIndex]?.toString().trim();
    if (endUser && email) endUserToEmail.set(endUser, email);
  }

  // Apply updates
  let updates = [];
  for (let i = 1; i < rfqData.length; i++) {
    const endUser = rfqData[i][endUserIndex]?.toString().trim();
    const existingEmail = rfqData[i][euEmailIndex]?.toString().trim();
    const newEmail = endUserToEmail.get(endUser);

    // Update only if a valid email exists and it's different from the current value
    if (newEmail && existingEmail !== newEmail) {
      updates.push([i + 1, euEmailIndex + 1, newEmail]); // Store row, column, and value
    }
  }

  // Update the sheet
  updates.forEach(update => {
    rfqSheet.getRange(update[0], update[1]).setValue(update[2]);
  });
}

// Helper function to get column index by name
function getColumnIndexByName(headers, columnName) {
  const index = headers.findIndex(header => header.toString().trim() === columnName.trim());
  if (index === -1) throw new Error(`Column not found: ${columnName}`);
  return index;
}

