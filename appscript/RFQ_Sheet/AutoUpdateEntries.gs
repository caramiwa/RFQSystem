function populateBidData() {
  const sourceSpreadsheetId = '1xb76Hf1uV600UyCIuev1iBupolLWR9V2KVx9FffK3SU';
  const sourceSheetName = 'Data List';

  const targetSpreadsheetId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4';
  const targetSheetName = 'Sheet1';

  const validMethods = ["(RA 12009) Section 35.2: Emergency Cases", "(RA 12009) Section 34: Small Value Procurement"];
  const today = new Date();

  const sourceSheet = SpreadsheetApp.openById(sourceSpreadsheetId).getSheetByName(sourceSheetName);
  const targetSheet = SpreadsheetApp.openById(targetSpreadsheetId).getSheetByName(targetSheetName);

  if (!sourceSheet || !targetSheet) {
    throw new Error('One or both sheets not found.');
  }

  const sourceData = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceData[0];

  const targetData = targetSheet.getDataRange().getValues();
  const targetHeaders = targetData.length ? targetData[0] : [];

  // Source column indexes
  const projectIdIndex = sourceHeaders.indexOf('PROJECT ID');
  const endUserIndex = sourceHeaders.indexOf('END-USER');
  const projectTitleIndex = sourceHeaders.indexOf('PROJECT TITLE');
  const submissionDateIndex = sourceHeaders.indexOf('SUBMISSION OF BIDS');
  const postingDateIndex = sourceHeaders.indexOf('POSTING DATE');
  const procurementMethodIndex = sourceHeaders.indexOf('PROCUREMENT METHOD');
  const statusIndex = sourceHeaders.indexOf('STATUS');

  if ([projectIdIndex, endUserIndex, projectTitleIndex, submissionDateIndex, postingDateIndex, procurementMethodIndex, statusIndex].includes(-1)) {
    throw new Error('One or more required columns not found in source sheet.');
  }

  // Target column indexes
  const bidNoIndex = targetHeaders.indexOf('BID NO.');
  const targetEndUserIndex = targetHeaders.indexOf('END-USER');
  const detailsIndex = targetHeaders.indexOf('DETAILS');
  const openingDateIndex = targetHeaders.indexOf('OPENING DATE');
  const targetPostingDateIndex = targetHeaders.indexOf('POSTING DATE');

  if ([bidNoIndex, targetEndUserIndex, detailsIndex, openingDateIndex, targetPostingDateIndex].includes(-1)) {
    throw new Error('One or more required columns not found in target sheet.');
  }

  // Set of existing BID NO. values in the target sheet
  const existingBidNos = new Set(targetData.slice(1).map(row => row[bidNoIndex]));

  // Use a map to ensure only the first "Active" row per project is kept
  const projectMap = new Map();

  for (let i = 1; i < sourceData.length; i++) {
    const row = sourceData[i];
    const projectId = row[projectIdIndex];
    const extractedProjectId = extractBetweenParentheses(projectId);
    const status = row[statusIndex];

    if (status === "Active" && !projectMap.has(extractedProjectId)) {
      projectMap.set(extractedProjectId, row);
    }
  }

  const newEntries = [];

  for (let [extractedProjectId, row] of projectMap.entries()) {
    if (existingBidNos.has(extractedProjectId)) continue;

    const endUser = row[endUserIndex];
    const projectTitle = row[projectTitleIndex];
    let submissionDate = parseDate(row[submissionDateIndex]);
    let postingDate = parseDate(row[postingDateIndex]);
    const procurementMethod = row[procurementMethodIndex];
    const status = row[statusIndex];
    const projectId = row[projectIdIndex];

    // Skip if any required field is missing
    if (!projectId || !endUser || !projectTitle || !submissionDate || !postingDate || !procurementMethod || !status) continue;

    if (!validMethods.includes(procurementMethod)) continue;
    if (submissionDate < today) continue;
    // if (postingDate < today || submissionDate < today) continue;

    // Prepare new row
    const newRow = new Array(targetHeaders.length).fill("");
    newRow[bidNoIndex] = extractedProjectId;
    newRow[targetEndUserIndex] = endUser;
    newRow[detailsIndex] = projectTitle;
    newRow[openingDateIndex] = submissionDate;
    newRow[targetPostingDateIndex] = postingDate;

    newEntries.push(newRow);
  }

  if (newEntries.length > 0) {
    targetSheet.getRange(targetData.length + 1, 1, newEntries.length, targetHeaders.length).setValues(newEntries);
    Logger.log(`Added ${newEntries.length} new entries.`);
  } else {
    Logger.log('No new entries to add.');
  }

  populateEmailColumn();
}


function extractBetweenParentheses(text) {
  if (!text) return '';
  const match = text.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function parseDate(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return value;
  }
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
}


//-------EMAIL TO EU--------
// Function to populate the EU EMAIL column based on the END-USER column
function populateEmailColumn() {
  const rfqDropdownId = '1VoN9_lWLT81qIpRb0mbxxbdare6Dx7ZvCUvLtwD4Mgk'; // Spreadsheet ID of RFQ_Dropdown
//  const userEmailSheetName = ''; // Name of the sheet containing End-User and Email data

  // Open the spreadsheet and get the sheets
  const rfqDropdownSpreadsheet = SpreadsheetApp.openById(rfqDropdownId);
  const rfqDropdownSheet = rfqDropdownSpreadsheet.getSheetByName('Sheet1');
  const userEmailSheet = rfqDropdownSpreadsheet.getSheetByName('Sheet2');

  // Check if sheets are found
  if (!rfqDropdownSheet) {
    throw new Error('Sheet "Sheet1" not found in RFQ_Dropdown spreadsheet.');
  }
  if (!userEmailSheet) {
    throw new Error(`Sheet "Sheet 2" not found in RFQ_Dropdown spreadsheet.`);
  }

  // Get the data ranges
  const rfqDropdownData = rfqDropdownSheet.getDataRange().getValues();
  const userEmailData = userEmailSheet.getDataRange().getValues();

  // Find the column indices dynamically
  const endUserIndex = getColumnIndexByName(rfqDropdownData[0], 'END-USER');
  const euEmailIndex = getColumnIndexByName(rfqDropdownData[0], 'EU EMAIL');
  const userEndUserIndex = getColumnIndexByName(userEmailData[0], 'End-User');
  const userEmailIndex = getColumnIndexByName(userEmailData[0], 'Email');

  // Create a map of End-User to Email
  const endUserToEmail = {};
  for (let i = 1; i < userEmailData.length; i++) {
    const endUser = userEmailData[i][userEndUserIndex];
    const email = userEmailData[i][userEmailIndex];
    endUserToEmail[endUser] = email;
  }

  // Populate the EU EMAIL column
  for (let i = 1; i < rfqDropdownData.length; i++) {
    const endUser = rfqDropdownData[i][endUserIndex];
    const email = endUserToEmail[endUser];
    if (email) {
      rfqDropdownSheet.getRange(i + 1, euEmailIndex + 1).setValue(email);
    }
  }
}

// Helper function to get column index by name
function getColumnIndexByName(headers, columnName) {
  const index = headers.findIndex(header => header.toString().trim() === columnName.trim());
  if (index === -1) throw new Error(`Column not found: ${columnName}`);
  return index;
}
