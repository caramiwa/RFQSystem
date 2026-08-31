/*
 * RFQ System — Notification Layer
 * Standalone Google Apps Script called by AppSheet Automation.
 * IMPORTANT: This is a standalone project, so use SpreadsheetApp.openById().
 */

const SPREADSHEET_ID = '1VCryDviOFJzdNEYiVuWo76Q-uB4oOrJXrBMxLylsmzU';

const SECRETARIAT_RECIPIENTS = [
  'quotations.zcmc@gmail.com',
  'SECOND-VERIFIER-EMAIL-HERE'
].join(',');

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

function notifySecretariatNewRegistration(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');
  if (!supplierSheet) throw new Error('Supplier sheet not found.');

  const data = supplierSheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('SUPPLIER_ID');
  const nameCol = headers.indexOf('BUSINESS_TRADE_NAME');
  if (idCol === -1 || nameCol === -1) throw new Error('Required Supplier columns not found.');

  const row = data.slice(1).find(r => String(r[idCol]) === String(supplierId));
  if (!row) throw new Error('Supplier ID not found: ' + supplierId);

  const subject = 'RFQ System – New Supplier Registration';
  const body =
    'A new supplier registration has been received.\n\n' +
    'Supplier: ' + row[nameCol] + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the registration in the RFQ System.\n\n' +
    'RFQ System';
  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

function notifySecretariatDocumentUpdate(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');
  if (!supplierSheet) throw new Error('Supplier sheet not found.');

  const data = supplierSheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('SUPPLIER_ID');
  const nameCol = headers.indexOf('BUSINESS_TRADE_NAME');
  if (idCol === -1 || nameCol === -1) throw new Error('Required Supplier columns not found.');

  const row = data.slice(1).find(r => String(r[idCol]) === String(supplierId));
  if (!row) throw new Error('Supplier ID not found: ' + supplierId);

  const subject = 'RFQ System – Supplier Document Updated';
  const body =
    'A supplier registration document has been added or updated.\n\n' +
    'Supplier: ' + row[nameCol] + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the submitted document in the RFQ System.\n\n' +
    'RFQ System';
  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

function notifySecretariatContactUpdate(supplierId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const supplierSheet = ss.getSheetByName('Supplier');
  if (!supplierSheet) throw new Error('Supplier sheet not found.');

  const data = supplierSheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('SUPPLIER_ID');
  const nameCol = headers.indexOf('BUSINESS_TRADE_NAME');
  if (idCol === -1 || nameCol === -1) throw new Error('Required Supplier columns not found.');

  const row = data.slice(1).find(r => String(r[idCol]) === String(supplierId));
  if (!row) throw new Error('Supplier ID not found: ' + supplierId);

  const subject = 'RFQ System – Supplier Contact Updated';
  const body =
    'A supplier contact record has been added or updated.\n\n' +
    'Supplier: ' + row[nameCol] + '\n' +
    'Supplier ID: ' + supplierId + '\n\n' +
    'Please review the supplier contact information and nomination document in the RFQ System.\n\n' +
    'RFQ System';
  GmailApp.sendEmail(SECRETARIAT_RECIPIENTS, subject, body);
}

/**
 * Notification #3 — Supplier Verification
 * AppSheet parameter: [_THISROW].[SUPPLIER_ID]
 *
 * Recipient priority:
 * 1. Valid official contact EMAIL from Supplier Contact
 * 2. REGISTERED_EMAIL from Supplier (the AppSheet account email)
 * 3. Fail clearly if neither is available/valid
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
  const registeredEmailCol = supplierHeaders.indexOf('REGISTERED_EMAIL');

  if (
    supplierIdCol === -1 ||
    supplierNameCol === -1 ||
    statusCol === -1 ||
    remarksCol === -1 ||
    registeredEmailCol === -1
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
  const status = String(supplierRow[statusCol]).trim();
  const remarks = String(supplierRow[remarksCol] || '').trim();
  const registeredEmail = String(supplierRow[registeredEmailCol] || '').trim();

  if (!['Verified', 'Rejected'].includes(status)) {
    throw new Error('Invalid verification status: ' + status);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = email => emailPattern.test(String(email).trim());

  let contactEmail = '';

  const contactData = contactSheet.getDataRange().getValues();
  const contactHeaders = contactData[0];
  const contactSupplierIdCol = contactHeaders.indexOf('SUPPLIER_ID');
  const contactEmailCol = contactHeaders.indexOf('EMAIL');

  if (contactSupplierIdCol !== -1 && contactEmailCol !== -1) {
    const contactRows = contactData.slice(1).filter(
      row => String(row[contactSupplierIdCol]) === String(supplierId)
    );

    // Use the first valid contact email. Ignore blank or malformed addresses.
    const validContact = contactRows.find(
      row => isValidEmail(row[contactEmailCol])
    );

    if (validContact) {
      contactEmail = String(validContact[contactEmailCol]).trim();
    }
  }

  const recipient = contactEmail || (isValidEmail(registeredEmail) ? registeredEmail : '');

  if (!recipient) {
    throw new Error(
      'No valid recipient email found. Supplier Contact EMAIL is unavailable or invalid, and REGISTERED_EMAIL is also unavailable or invalid.'
    );
  }

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
  } else {
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
  }

  GmailApp.sendEmail(recipient, subject, body);
}
