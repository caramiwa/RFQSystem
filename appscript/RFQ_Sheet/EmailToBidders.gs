function sendBidderRemindersAfterEndorsement() {//no trigger yet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dropdownSheet = ss.getSheetByName('Sheet1');
  const responseSheet = SpreadsheetApp.openById('17-v_sJVixDSDpPRgMDuGSyzCC6c4ENgKIJpPbvzeNI4').getSheets()[0]; // assumes first sheet

  const dropdownData = dropdownSheet.getDataRange().getValues();
  const responseData = responseSheet.getDataRange().getValues();

  const headersDropdown = dropdownData[0];
  const bidNoIndex = headersDropdown.indexOf('BID NO.');
  const emailStatusIndex = headersDropdown.indexOf('EMAIL STATUS');
  const bidderEmailStatusIndex = headersDropdown.indexOf('BIDDER EMAIL STATUS');

  const headersResponse = responseData[0];
  const rfqNoIndex = headersResponse.indexOf('RFQ No.');
  const supplierNameIndex = headersResponse.indexOf('Supplier Name');
  const supplierEmailIndex = headersResponse.indexOf('Email Address');

  for (let i = 1; i < dropdownData.length; i++) {
    const emailStatus = String(dropdownData[i][emailStatusIndex]).trim();
    const bidderEmailStatus = String(dropdownData[i][bidderEmailStatusIndex]).trim();
    const bidNo = String(dropdownData[i][bidNoIndex]).trim();

    if (emailStatus === '2' && bidderEmailStatus === '') {
      // Match responses for this BID NO
      const matchingResponses = responseData.filter((row, idx) => {
        if (idx === 0) return false; // skip header
        return String(row[rfqNoIndex]).trim() === bidNo;
      });

      let emailsSent = 0;

      matchingResponses.forEach(response => {
        const supplierName = response[supplierNameIndex];
        const supplierEmail = response[supplierEmailIndex];

        if (supplierEmail) {
          const subject = `Reminder: Your Quotation for RFQ No. ${bidNo}`;
          const body = `Dear ${supplierName},\n\nThis is to inform you that your quotation for RFQ No. ${bidNo} has been endorsed to the End-User for evaluation. We will notify you of the result after the evaluation has been completed.\n\nThank you for your continued participation.\n\nBest regards,\nProcurement Team`;

          MailApp.sendEmail({
            to: supplierEmail,
            subject,
            body,
          });

          emailsSent++;
        }
      });

      // Update BIDDER EMAIL STATUS to 1 if any emails were sent
      if (emailsSent > 0) {
        dropdownSheet.getRange(i + 1, bidderEmailStatusIndex + 1).setValue(1);
        Logger.log(`📧 Sent ${emailsSent} reminder(s) for BID NO. ${bidNo}`);
      } else {
        Logger.log(`⚠️ No bidder emails found for BID NO. ${bidNo}`);
      }
    }
  }
}
