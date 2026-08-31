/*
 * RFQ System — Notification Layer
 *
 * Standalone Google Apps Script called by AppSheet Automation.
 *
 * IMPORTANT:
 * - This project is standalone, so use SpreadsheetApp.openById().
 * - Do not use SpreadsheetApp.getActiveSpreadsheet().
 * - Recipient addresses below are the current Secretariat configuration.
 * - Verification notification is included as the current working draft;
 *   recipient fallback to REGISTERED_EMAIL is intentionally not yet implemented.
 */

const SPREADSHEET_ID = '1VCryDviOFJzdNEYiVuWo76Q-uB4oOrJXrBMxLylsmzU';

const SECRETARIAT_RECIPIENTS = [
  'quotations.zcmc@gmail.com',
  'SECOND-VERIFIER-EMAIL-HERE'
].join(',');

/**
 * Notification #1
 * Called by AppSheet after a new supplier registration.
 * AppSheet parameter: USEREMAIL()
 */
function sendSupplierRegistrationReceived(toEmail) {
  const subject = 'RFQ System – Supplier Registration Received';

  const body =
    'Dear Supplier,\n\n' +
    'Your supplier registration has been received.\n\n' +
    'Please complete your registration by uploading the required registration documents and nominating your official contact.\n\n' +
    'Your registration will remain Unverified until the required information and documents have been reviewed by the BAC Secretariat.\n\n' +
    'Thank you.\n\n' +
    'RFQ System';

  GmailApp.sendEmail(toEmail, subject, body);
}

/**
 * Notification #2A
 * Called by AppSheet after a new supplier registration.
 * AppSheet parameter: [_THISROW].[SUPPLIER_ID]
 */
function notifySecretariatNewRegistration(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');

  if (!supplierSheet) {
    throw new Error('Supplier sheet not found.');
  }

  const supplierData = supplierSheet.getDataRange().getValues();
  const supplierHeaders = supplierData[0];

  const supplierIdCol = supplierHeaders.indexOf('SUPPLIER_ID');
  const supplierNameCol = supplierHeaders.indexOf('BUSINESS_TRADE_NAME');

  if (supplierIdCol === -1 || supplierNameCol === -1) {
    throw new Error('Required Supplier columns not found.');
  }

  const supplierRow = supplierData.slice(1).find(
    row => String(row[supplierIdCol]) === String(supplierId)
  );

  if (!supplierRow) {
    throw new Error('Supplier ID not found: ' + supplierId);
  }

  const supplierName = supplierRow[supplierNameCol];

  const subject = 'RFQ System – New Supplier Registration';
  const body =
    'A new supplier registration has been received.\n\n' +
    'Supplier: ' + supplierName + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the registration in the RFQ System.\n\n' +
    'RFQ System';

  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

/**
 * Notification #2B
 * Called by AppSheet after a supplier document is added or updated.
 * AppSheet parameter: [_THISROW].[SUPPLIER_ID]
 */
function notifySecretariatDocumentUpdate(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');

  if (!supplierSheet) {
    throw new Error('Supplier sheet not found.');
  }

  const supplierData = supplierSheet.getDataRange().getValues();
  const supplierHeaders = supplierData[0];

  const supplierIdCol = supplierHeaders.indexOf('SUPPLIER_ID');
  const supplierNameCol = supplierHeaders.indexOf('BUSINESS_TRADE_NAME');

  if (supplierIdCol === -1 || supplierNameCol === -1) {
    throw new Error('Required Supplier columns not found.');
  }

  const supplierRow = supplierData.slice(1).find(
    row => String(row[supplierIdCol]) === String(supplierId)
  );

  if (!supplierRow) {
    throw new Error('Supplier ID not found: ' + supplierId);
  }

  const supplierName = supplierRow[supplierNameCol];

  const subject = 'RFQ System – Supplier Document Updated';
  const body =
    'A supplier registration document has been added or updated.\n\n' +
    'Supplier: ' + supplierName + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the submitted document in the RFQ System.\n\n' +
    'RFQ System';

  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

/**
 * Notification #2C
 * Called by AppSheet after supplier contact information or nomination
 * document is added or updated.
 * AppSheet parameter: [_THISROW].[SUPPLIER_ID]
 */
function notifySecretariatContactUpdate(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');

  if (!supplierSheet) {
    throw new Error('Supplier sheet not found.');
  }

  const supplierData = supplierSheet.getDataRange().getValues();
  const supplierHeaders = supplierData[0];

  const supplierIdCol = supplierHeaders.indexOf('SUPPLIER_ID');
  const supplierNameCol = supplierHeaders.indexOf('BUSINESS_TRADE_NAME');

  if (supplierIdCol === -1 || supplierNameCol === -1) {
    throw new Error('Required Supplier columns not found.');
  }

  const supplierRow = supplierData.slice(1).find(
    row => String(row[supplierIdCol]) === String(supplierId)
  );

  if (!supplierRow) {
    throw new Error('Supplier ID not found: ' + supplierId);
  }

  const supplierName = supplierRow[supplierNameCol];

  const subject = 'RFQ System – Supplier Contact Updated';
  const body =
    'A supplier contact record has been added or updated.\n\n' +
    'Supplier: ' + supplierName + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the supplier contact information and nomination document in the RFQ System.\n\n' +
    'RFQ System';

  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

/**
 * Notification #3 — current working draft
 * Called by AppSheet when VERIFICATION_STATUS changes to Verified or Rejected.
 * AppSheet parameter: [_THISROW].[SUPPLIER_ID]
 *
 * TODO: Before production use, recipient selection must be refactored to:
 *   1. valid Supplier Contact EMAIL; otherwise
 *   2. Supplier REGISTERED_EMAIL (AppSheet account email).
 */
function notifySupplierVerification(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const supplierSheet = ss.getSheetByName('Supplier');
  const contactSheet = ss.getSheetByName('Supplier Contact');

  if (!supplierSheet || !contactSheet) {
    throw new Error('Required sheet not found.');
  }

  const supplierData = supplierSheet.getDataRange().getValues();
  const supplierHeaders = supplierData[0];

  const supplierIdCol = supplierHeaders.indexOf('SUPPLIER_ID');
  const supplierNameCol = supplierHeaders.indexOf('BUSINESS_TRADE_NAME');
  const statusCol = supplierHeaders.indexOf('VERIFICATION_STATUS');
  const remarksCol = supplierHeaders.indexOf('VERIFICATION_REMARKS');

  if (
    supplierIdCol === -1 ||
    supplierNameCol === -1 ||
    statusCol === -1 ||
    remarksCol === -1
  ) {
    throw new Error('Required Supplier columns not found.');
  }

  const supplierRow = supplierData.slice(1).find(
    row => String(row[supplierIdCol]) === String(supplierId)
  );

  if (!supplierRow) {
    throw new Error('Supplier ID not found: ' + supplierId);
  }

  const supplierName = supplierRow[supplierNameCol];
  const status = supplierRow[statusCol];
  const remarks = supplierRow[remarksCol];

  const contactData = contactSheet.getDataRange().getValues();
  const contactHeaders = contactData[0];

  const contactSupplierIdCol = contactHeaders.indexOf('SUPPLIER_ID');
  const emailCol = contactHeaders.indexOf('EMAIL');

  if (contactSupplierIdCol === -1 || emailCol === -1) {
    throw new Error('Required Contact columns not found.');
  }

  const contactRow = contactData.slice(1).find(
    row =>
      String(row[contactSupplierIdCol]) === String(supplierId) &&
      row[emailCol]
  );

  if (!contactRow) {
    throw new Error('No supplier contact email found for Supplier ID: ' + supplierId);
  }

  const recipient = contactRow[emailCol];

  let subject;
  let body;

  if (status === 'Verified') {
    subject = 'RFQ System – Supplier Registration Verified';

    body =
      'Dear Supplier,\n\n' +
      'Your supplier registration for ' + supplierName +
      ' has been reviewed and verified by the BAC Secretariat.\n\n' +
      'Your registration is now eligible for access to the RFQ functions of the system.\n\n' +
      'Thank you.\n\n' +
      'RFQ System';
  } else if (status === 'Rejected') {
    subject = 'RFQ System – Supplier Registration Rejected';

    body =
      'Dear Supplier,\n\n' +
      'Your supplier registration for ' + supplierName +
      ' has been reviewed and was not approved for verification at this time.\n\n' +
      'Reason:\n' +
      remarks + '\n\n' +
      'Please review the reason above and update your registration as appropriate.\n\n' +
      'Thank you.\n\n' +
      'RFQ System';
  } else {
    throw new Error('Invalid verification status: ' + status);
  }

  GmailApp.sendEmail(recipient, subject, body);
}
