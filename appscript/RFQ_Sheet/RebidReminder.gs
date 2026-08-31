function sendNoBidsFollowUpReminder() {//No trigger yet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rfqSheet = ss.getSheetByName("Sheet1"); // This is the RFQ Dropdown sheet

  const data = rfqSheet.getDataRange().getValues();
  const headers = data[0];

  const bidNoCol = headers.indexOf("BID NO.");
  const endUserCol = headers.indexOf("EU EMAIL");
  const emailStatusCol = headers.indexOf("EMAIL STATUS");
  const abstractCol = headers.indexOf("ABSTRACT");
  const biddersCol = headers.indexOf("BIDDERS");
  const detailsCol = headers.indexOf("DETAILS");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const emailStatus = row[emailStatusCol];
    const abstract = row[abstractCol];
    const bidders = row[biddersCol];
    const endUserEmail = row[endUserCol];
    const bidNo = row[bidNoCol];
    const details = row[detailsCol];

    const abstractPending = abstract === "" || abstract === 0;
    const noBids = bidders.trim().toLowerCase() === "no bids received";

    if (emailStatus === 2 && abstractPending && noBids && endUserEmail) {
      const subject = `Reminder: Rebid Decision for RFQ No. ${bidNo}`;
      const message = `Dear End-user,\n\n` +
        `This is a gentle reminder regarding RFQ No. ${bidNo} (${details}). As previously communicated, no bids were received for this procurement. ` +
        `Kindly confirm whether you still wish to pursue this request via rebidding.\n\n` +
        `If we do not receive a response within seven (7) calendar days from the date of bid opening, ` +
        `it will be construed as non-pursuance of the procurement.\n\n` +
        `Thank you for your continued cooperation.\n\n` +
        `— Procurement Section`;

      MailApp.sendEmail(endUserEmail, subject, message);

      // Update EMAIL STATUS to 3
      rfqSheet.getRange(i + 1, emailStatusCol + 1).setValue(3);
    }
  }
}
