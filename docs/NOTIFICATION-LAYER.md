# Notification Layer

## Current Architecture

The RFQ System remains on the AppSheet free tier. Supplier email notifications are therefore implemented through a standalone Google Apps Script called by an AppSheet Bot, rather than AppSheet's built-in Send an Email task.

### Notification 1 — Registration Received

Trigger:
- AppSheet Bot: `Supplier Registration Received`
- Event: `New Registration`
- Table: `SUPPLIER`
- Change type: Adds only

Task:
- Standalone Apps Script function: `sendSupplierRegistrationReceived(toEmail)`
- AppSheet parameter: `USEREMAIL()`
- Run asynchronously: OFF

Purpose:
- Confirm that registration was received.
- Remind the supplier to complete required documents and nominate an official contact.
- Advise that the registration remains `Unverified` until reviewed by the BAC Secretariat.

Status: Working and tested.

### Notification 2 — Secretariat: New Registration

The same `New Registration` event also calls a second standalone Apps Script function:

- Function: `notifySecretariatNewRegistration(supplierId)`
- AppSheet parameter: `[SUPPLIER_ID]`
- Purpose: notify the Secretariat that a new supplier registration is ready for review.

The standalone script must use `SpreadsheetApp.openById()` rather than `getActiveSpreadsheet()` because it is not container-bound to the spreadsheet.

Status: Working and tested.

## Remaining Notification 2 Triggers

The Secretariat must also be notified when a supplier:
- adds a registration document;
- updates/replaces an existing registration document;
- adds or updates the official contact information/nomination document.

These triggers have not yet been configured.

## Verification Notification

A later notification will be sent to the supplier when the Secretariat changes `SUPPLIER[VERIFICATION_STATUS]` to:
- `Verified`; or
- `Rejected`.

When rejected, `VERIFICATION_REMARKS` must contain the reason and will be included in the supplier notification.

## Data Model Decisions Supporting Notifications

- `VERIFICATION_STATUS` is stored only in `SUPPLIER`, because verification is a supplier-level registration decision.
- `VERIFICATION_REMARKS` is stored in `SUPPLIER` and will be required when status is `Rejected`.
- `SUPPLIER_DOCUMENT` does not carry its own verification status.
- `SUPPLIER_CONTACT` does not carry its own verification status.
- Supplier document type is unique per supplier. Duplicate `SUPPLIER_ID + DOCUMENT_TYPE` entries are prevented through `DOCUMENT_TYPE[Valid_If]`.
- Existing document records may be updated/replaced rather than creating duplicate document-type records.
- `SUPPLIER_CONTACT` uses `NOMINATION_DOCUMENT_ID` and `NOMINATION_DOCUMENT` (File) for the official contact's nomination/authorization evidence.
