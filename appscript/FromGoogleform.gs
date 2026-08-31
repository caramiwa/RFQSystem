function updateFormDropdown() {
  try {
    const formId = '11cRgipNBPxngohthLplTD50itud2STXa8-rpiX0RfyM'; // RFQ
    const sheetId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4'; // RFQ_Dropdown
    const sheetName = 'Sheet1';
    
    Logger.log('Opening form with ID: ' + formId);
    const form = FormApp.openById(formId);
    
    Logger.log('Opening spreadsheet with ID: ' + sheetId);
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();
  
    // Logging to understand the data retrieved from the spreadsheet
    Logger.log("Number of projects before filtering: " + data.length);
  
    // Filter projects based on POSTING DATE and OPENING DATE
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison
    const noonToday = new Date();
    noonToday.setHours(12, 0, 0, 0); // Set to today at 12:00 PM for comparison
  
    const validProjects = data.filter(row => {
      if (!row[0] || !row[1] || !row[2]) {
        Logger.log(`Skipping row due to missing values: ${row}`);
        return false;
      }
  
      const postingDate = new Date(row[1]); // Column B
      const openingDate = new Date(row[2]); // Column C
      if (isNaN(postingDate) || isNaN(openingDate)) {
        Logger.log(`Skipping row due to invalid date format: ${row}`);
        return false;
      }
  
      postingDate.setHours(0, 0, 0, 0); // Set to start of posting date for comparison
      openingDate.setHours(12, 0, 0, 0); // Set to 12:00 PM of the opening date for comparison
  
      // Check if the project is valid based on posting date and opening date
      if ((postingDate.getTime() <= today.getTime()) && (openingDate.getTime() > now.getTime() || (openingDate.toDateString() === today.toDateString() && now.getTime() <= noonToday.getTime()))) {
        return true;
      }
      return false;
    }).map(row => row[0].trim()); // Get only project names
  
    // Remove duplicate project names
    const uniqueProjects = Array.from(new Set(validProjects));
  
    // Logging to understand the filtered data
    Logger.log("Number of valid projects: " + uniqueProjects.length);
  
    // Update the dropdown options
    const dropdownItem = form.getItems(FormApp.ItemType.LIST)[0].asListItem(); // Assuming it's the first item
    if (uniqueProjects.length > 0) {
      dropdownItem.setChoiceValues(uniqueProjects);
    } else {
      // If no valid projects are found, set the dropdown to a default value
      dropdownItem.setChoiceValues(["No RFQs"]);
      Logger.log("No valid projects found for the dropdown. Dropdown set to 'No RFQs'.");
    }
  } catch (e) {
    Logger.log('Error: ' + e.message);
  }
}

/*function updateFormDropdown() {
  try {
    const formId = '11cRgipNBPxngohthLplTD50itud2STXa8-rpiX0RfyM'; // RFQ
    const sheetId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4'; // RFQ_Dropdown
    const sheetName = 'Sheet1';
    
    Logger.log('Opening form with ID: ' + formId);
    const form = FormApp.openById(formId);
    
    Logger.log('Opening spreadsheet with ID: ' + sheetId);
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();
  
    // Logging to understand the data retrieved from the spreadsheet
    Logger.log("Number of projects before filtering: " + data.length);
  
    // Filter projects based on POSTING DATE and OPENING DATE
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison
    const noonToday = new Date();
    noonToday.setHours(12, 0, 0, 0); // Set to today at 12:00 PM for comparison
  
    const validProjects = data.filter(row => {
      if (!row[0] || !row[1] || !row[2]) {
        Logger.log(`Skipping row due to missing values: ${row}`);
        return false;
      }
  
      const postingDate = new Date(row[1]); // Column B
      const openingDate = new Date(row[2]); // Column C
      if (isNaN(postingDate) || isNaN(openingDate)) {
        Logger.log(`Skipping row due to invalid date format: ${row}`);
        return false;
      }
  
      postingDate.setHours(0, 0, 0, 0); // Set to start of posting date for comparison
      openingDate.setHours(12, 0, 0, 0); // Set to 12:00 PM of the opening date for comparison
  
      // Check if the project is valid based on posting date and opening date
      if (postingDate.getTime() <= today.getTime() && (openingDate.getTime() > now.getTime() || openingDate.toDateString() !== today.toDateString())) {
        return true;
      } else if (openingDate.toDateString() === today.toDateString() && now.getTime() <= noonToday.getTime()) {
        return true;
      }
      return false;
    }).map(row => row[0].trim()); // Get only project names
  
    // Remove duplicate project names
    const uniqueProjects = Array.from(new Set(validProjects));
  
    // Logging to understand the filtered data
    Logger.log("Number of valid projects: " + uniqueProjects.length);
  
    // Update the dropdown options
    const dropdownItem = form.getItems(FormApp.ItemType.LIST)[0].asListItem(); // Assuming it's the first item
    if (uniqueProjects.length > 0) {
      dropdownItem.setChoiceValues(uniqueProjects);
    } else {
      // If no valid projects are found, set the dropdown to a default value
      dropdownItem.setChoiceValues(["No RFQs"]);
      Logger.log("No valid projects found for the dropdown. Dropdown set to 'No RFQs'.");
    }
  } catch (e) {
    Logger.log('Error: ' + e.message);
  }
}
*/
