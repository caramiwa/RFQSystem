function updateBidderColumnAndSendEmails() {/// SENDS EMAIL DURING OPENING DATE
  const rfqDropdownId = '1l4BJk6PnHJYPnyYyQPBnMq2jRcHH6KnzSJzo3VCH6p4'; // Spreadsheet ID of RFQ_Dropdown
  const rfqResponsesId = '17-v_sJVixDSDpPRgMDuGSyzCC6c4ENgKIJpPbvzeNI4'; // Spreadsheet ID of RFQ_Responses

  // Open the spreadsheets
  const rfqDropdownSpreadsheet = SpreadsheetApp.openById(rfqDropdownId);
  const rfqResponsesSpreadsheet = SpreadsheetApp.openById(rfqResponsesId);

  // Get the sheets
  const rfqDropdownSheet = rfqDropdownSpreadsheet.getSheetByName('Sheet1');
  const rfqResponsesSheet = rfqResponsesSpreadsheet.getSheetByName('Form Responses 1');

  // Check if sheets are found
  if (!rfqDropdownSheet) {
    throw new Error('Sheet "Sheet1" not found in RFQ_Dropdown spreadsheet.');
  }
  if (!rfqResponsesSheet) {
    throw new Error('Sheet "Form Responses 1" not found in RFQ_Responses spreadsheet.');
  }

  // Get the data ranges
  const rfqDropdownData = rfqDropdownSheet.getDataRange().getValues();
  const rfqResponsesData = rfqResponsesSheet.getDataRange().getValues();

  // Log the headers to identify the exact issue
  Logger.log('RFQ Responses Headers: ' + rfqResponsesData[0]);

  // Find the column indices dynamically
  const bidNoIndex = getColumnIndexByName(rfqDropdownData[0], 'BID NO.');
  const biddersIndex = getColumnIndexByName(rfqDropdownData[0], 'BIDDERS');
  const emailStatusIndex = getColumnIndexByName(rfqDropdownData[0], 'EMAIL STATUS');
  const euEmailIndex = getColumnIndexByName(rfqDropdownData[0], 'EU EMAIL');
  const detailsIndex = getColumnIndexByName(rfqDropdownData[0], 'DETAILS');
  const postingDateIndex = getColumnIndexByName(rfqDropdownData[0], 'POSTING DATE');
  const openingDateIndex = getColumnIndexByName(rfqDropdownData[0], 'OPENING DATE');
  const rfqNoIndex = getColumnIndexByName(rfqResponsesData[0], 'RFQ No.');
  const supplierIndex = getColumnIndexByName(rfqResponsesData[0], 'Supplier Name');

  // Define the exact case-sensitive column names for attachments
  const attachmentColumns = [
    'Quotations',
    'PhilGEPS No.',
    'Authority of the Representative',
    'Mayor\'s Permit',
    'Valid License to Operate',
    'Annual Income Tax',
    'Valid Certificates of Product Registration',
    'Supply Chain Role',
    // 'Others'
  ];

  // Get indices for attachment columns
  const attachmentIndices = attachmentColumns.map(col => getColumnIndexByName(rfqResponsesData[0], col));

  // Create a map of RFQ No. to Supplier names and their attachment links
  const rfqToSuppliers = {};
  for (let i = 1; i < rfqResponsesData.length; i++) {
    const rfqNo = rfqResponsesData[i][rfqNoIndex];
    const supplierName = rfqResponsesData[i][supplierIndex];
    const attachments = attachmentIndices.map(index => rfqResponsesData[i][index]);
    Logger.log(`Processing Supplier: ${supplierName}, Attachments: ${attachments.join(', ')}`);
    if (!rfqToSuppliers[rfqNo]) {
      rfqToSuppliers[rfqNo] = [];
    }
    rfqToSuppliers[rfqNo].push({ supplierName, attachments });
  }

  // Update the Bidders column in RFQ_Dropdown and send emails
  for (let i = 1; i < rfqDropdownData.length; i++) {
    const bidNo = rfqDropdownData[i][bidNoIndex];
    const emailStatus = String(rfqDropdownData[i][emailStatusIndex]).trim();
    const euEmail = rfqDropdownData[i][euEmailIndex];
    const details = rfqDropdownData[i][detailsIndex];
    const postingDate = new Date(rfqDropdownData[i][postingDateIndex]);
    
    const openingDate = new Date(rfqDropdownData[i][openingDateIndex]); //Updated on June 22, 2026 to email EU at exactly 1:00 PM after opening - ORIGINAL
    //const openingDate = new Date(rfqDropdownData[i][openingDateIndex]);// Updated on June 22, 2026 to email EU at exactly 1:00 PM after opening 1ST ATTEMP
   //openingDate.setHours(13, 0, 0, 0); // 1:00 PM Updated on June 22, 2026 to email EU at exactly 1:00 PM after opening 1ST ATTEMPT
  //  const now = new Date();
  //  const today1PM = new Date();
  // today1PM.setHours(13, 0, 0, 0);


    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure today has no time component for comparison


    // Check if email should be sent based on the posting date
    if (!emailStatus && (postingDate <= today && openingDate > today)) { // MADE CHANGES ON JULY 3 FROM openingDate >= today TO openingDate > today
      if (euEmail.trim() !== '') {
        Logger.log(`Sending first email to ${euEmail} for BID NO: ${bidNo}`);
        const emailSubject = `RFQ Posting Notification: ${bidNo}`;
        const emailBody = `Good Day,<br>This is to inform you that the Request for Quotations for the ${details} has been succesfully posted at the PhilGEPS portal. The details are as follows: <br>
        <ul>
          <li><b>RFQ No:</b> ${bidNo}</li>
          <li><b>Posting Date:</b> ${postingDate.toDateString()}</li>
          <li><b>Closing Date:</b> ${openingDate.toDateString()}</li>
        </ul>
        This update is provided to keep you informed of the current status of your request.
        <br><br>To ensure the success of this procurement, we encourage you to actively inform potential bidders about the opportunity. While it is important to maintain fairness and transparency as mandated by the government procurement law, your proactive involvement can help facilitate better participation from qualified bidders.
        <br><br>Important: Please do not reply to this email. For any questions or further assistance, contact us directly at 991-2934 loc 105 or 09175914784. Your prompt attention to this matter is appreciated.<br>
        <br>Thank you.<br><br>Procurement Section`;
        MailApp.sendEmail({
          to: euEmail,
          subject: emailSubject,
          htmlBody: emailBody
        });

        // Update the EMAIL STATUS column to "1"
        rfqDropdownSheet.getRange(i + 1, emailStatusIndex + 1).setValue('1');
      } else {
        Logger.log(`No valid EU EMAIL for BID NO: ${bidNo}`);
      }
   } 

   else if (emailStatus === '1' && openingDate < today) { // Updated on June 22, 2026 to email EU at exactly 1:00 PM after opening ORIGINAL
   //else if (emailStatus === '1' && new Date() >= openingDate) { //- Updated on June 22, 2026 to email EU at exactly 1:00 PM after opening - 1ST ATTEMP ATTEMP

   //else if (emailStatus === '1' && now >= today1PM){
      Logger.log(`Processing BID NO: ${bidNo}, EU EMAIL: ${euEmail}, EMAIL STATUS: ${emailStatus}, DETAILS: ${details}`);

      const suppliers = rfqToSuppliers[bidNo];
      if (suppliers && suppliers.length > 0) {
        const supplierNames = suppliers.map(supplier => supplier.supplierName).join('\n');
        const formattedSuppliers = suppliers.map(supplier => {
          const formattedAttachments = supplier.attachments.map((attachment, index) => `
            <tr>
              <td>${attachmentColumns[index]}</td>
              <td>${attachment}</td>
            </tr>`).join('');
          return `<b>${supplier.supplierName}</b>
                  <table border="1" style="border-collapse: collapse;">
                    <tr>
                      <th>Documents</th>
                      <th>Link</th>
                    </tr>
                    ${formattedAttachments}
                  </table>`;
        }).join('<br><br>');

        // Update the BIDDERS column with supplier names
        Logger.log(`Writing supplier names to BIDDERS column for BID NO: ${bidNo}`);
        rfqDropdownSheet.getRange(i + 1, biddersIndex + 1).setValue(supplierNames);

        // Send email with bidder details and attachments
        if (euEmail && euEmail.trim() !== '') {
          Logger.log(`Sending second email to ${euEmail} for BID NO: ${bidNo}`);
          const emailSubject = `Procurement Result of ${bidNo} - ${details}`;
          const emailBody = `Good Day,<br><br>Herein are the list of Bidders who responded to the Request for Quotations with Bid No: ${bidNo}:<br><br>${formattedSuppliers}<br><br>In this regard, please prepare the Abstract of Quotations and the Bid Evaluation and endorse the same, including all the attachments provided in the link, to the Procurement Section within 5 calendar days from receipt of this email. Late submission will not be accommodated.<br><br>The forms/templates are available for download at bit.ly/proc_sf.<br><br>Thank you.<br><br>Important: Please do not reply to this email. For any questions or further assistance, contact us directly at 991-2934 loc 105 or 09175914784. Your prompt attention to this matter is appreciated.<br><br>Procurement Section`;
          MailApp.sendEmail({
            to: euEmail,
            subject: emailSubject,
            htmlBody: emailBody
          });

          // Update the EMAIL STATUS column to "2"
          rfqDropdownSheet.getRange(i + 1, emailStatusIndex + 1).setValue('2');
        } else {
          Logger.log(`No valid EU EMAIL for BID NO: ${bidNo}`);
        }
      } else {
        Logger.log(`No bids received for BID NO: ${bidNo}`);
        rfqDropdownSheet.getRange(i + 1, biddersIndex + 1).setValue('No Bids Received');

        // Send email with no bids message
        if (euEmail && euEmail.trim() !== '') {
          Logger.log(`Sending second email to ${euEmail} for BID NO: ${bidNo}`);
          const emailSubject = `Procurement Result of ${bidNo}: FAILURE OF BIDDING - ${details}`;
          const emailBody = `Good Day,<br><br>We regret to inform you that no responses were received for the Request for Quotations with Bid No: ${bidNo}.<br><br>To address this, we recommend conducting a market study to understand the possible reasons for the lack of participation. Please engage with potential suppliers to identify any concerns or issues they may have had with the bidding process.<br><br>Once you have reviewed and ensured that the specifications and terms of reference are clear, complete, and free from any ambiguities, we kindly request that you provide a written note or feedback indicating your review and request for rebidding. This will be necessary before we proceed to repost the Request for Quotations. Your feedback should include confirmation that all specifications are aligned with market standards and are realistic and attainable. <br><br>Please note that due to the volume of requests we receive, we will no longer facilitate reposting after the third failure. Your commitment to ensuring the success of this procurement is crucial.<br><br>Thank you.<br><br>Important: Please do not reply to this email. For any questions or further assistance, contact us directly at 991-2934 loc 105 or 09175914784. Your prompt attention to this matter is appreciated.<br><br>Procurement Section`;
          MailApp.sendEmail({
            to: euEmail,
            subject: emailSubject,
            htmlBody: emailBody
          });

          // Update the EMAIL STATUS column to "2"
          rfqDropdownSheet.getRange(i + 1, emailStatusIndex + 1).setValue('2');
        } else {
          Logger.log(`No valid EU EMAIL for BID NO: ${bidNo}`);
        }
      }
    }
  }
}

// Helper function to get column index by name
function getColumnIndexByName(headers, columnName) {
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toString().trim() === columnName.trim()) {
      return i;
    }
  }
  throw new Error('Column not found: ' + columnName);
}

