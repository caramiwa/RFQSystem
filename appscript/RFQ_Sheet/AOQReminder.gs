function sendEUAbstractReminder() { //no trigger yet, need to insert new columns in the RFQ Dropdown
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();
  const header = data[0];

  const bidNoCol = header.indexOf("BID NO.");
  const emailStatusCol = header.indexOf("EMAIL STATUS");
  const openingDateCol = header.indexOf("OPENING DATE");
  const withAbstractCol = header.indexOf("ABSTRACT");
  const euEmailCol = header.indexOf("EU EMAIL");

  const today = new Date();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const emailStatus = row[emailStatusCol];
    const withAbstract = row[withAbstractCol];
    const euEmail = row[euEmailCol];
    const bidNo = row[bidNoCol];

    // Safe date parsing
    const openingDateRaw = row[openingDateCol];
    const openingDate = openingDateRaw instanceof Date
      ? openingDateRaw
      : new Date(openingDateRaw);

    if (isNaN(openingDate)) {
      Logger.log(`⚠️ Invalid date in row ${i + 1}: ${openingDateRaw}`);
      continue;
    }

    const daysSinceOpening = Math.floor((today - openingDate) / (1000 * 60 * 60 * 24));

    const condition1 = emailStatus === 2;
    const condition2 = (withAbstract === "" || withAbstract === "NO");
    const condition3 = daysSinceOpening >= 5 && daysSinceOpening <= 8;

    if (condition1 && condition2 && condition3) {
      const subject = `Reminder: Endorsement of Abstract of Quotations for ${bidNo}`;
      const body =
        `Dear Sir/Maam,\n\n` +
        `Please be reminded that it has been ${daysSinceOpening} days since the opening of bids for ${bidNo}, and the  Procurement Section has yet to receive the Abstract of Quotation for processing.\n\n`+
        `We respectfully request that you submit the signed Abstract of Quotations the soonest possible time as we would not be accommodating the same beyond the period of seven (7) calendar days.\n`+
        `Thank you for your prompt attention to this matter.\n\n`+
        `Important: Please do not reply to this email. For any questions or further assistance, contact us directly at 991-2934 loc 105 or 09175914784. \n\n`+
        `Procurement Section`;

      if (euEmail) {
        MailApp.sendEmail(euEmail, subject, body);
        Logger.log(`📨 Reminder sent for BID NO. ${bidNo} to ${euEmail}`);
        sheet.getRange(i + 1, emailStatusCol + 1).setValue(3); // Set Email Status to 3
      } else {
        Logger.log(`⚠️ No EU email found for BID NO. ${bidNo} in row ${i + 1}`);
      }
    } else {
      Logger.log(`⏭️ Skipped row ${i + 1}: status=${emailStatus}, abstract=${withAbstract}, days=${daysSinceOpening}`);
    }
  }
}
