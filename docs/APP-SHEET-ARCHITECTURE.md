# RFQ System — AppSheet Architecture Proposal

**Status:** Parked proposal / architecture notes
**Date:** 2026-08-19

## Purpose

Explore converting the existing RFQ System into an AppSheet-based procurement portal for Supplier Registration, RFQ publication, quotation submission, evaluation support, AOQ generation, and transparency.

## Proposed user areas

### 1. Supplier Registration

A supplier-accessible registration area where suppliers can:

- Register once and receive a Supplier Registration Number.
- Maintain/update their supplier profile.
- Upload and update eligibility/company documents.
- See document status/expiry information.

Only registered/active suppliers should appear in the supplier selection for quotation submission.

### 2. BAC Secretariat — RFQ Management

A restricted Secretariat area for:

- Uploading/creating RFQs.
- Identifying the procurement mode (SVP, EP, Lease of Venue, and other applicable modes other than Competitive Bidding).
- Setting submission deadlines and applicable requirements.
- Managing active, closed, opened, and completed RFQs.
- Uploading procurement results and related documents.

### 3. Supplier — Active RFQs and Submission

Registered suppliers can view active RFQs and submit quotations for projects they are eligible to participate in.

If a supplier does not appear in the supplier selection, the system should instruct the supplier to complete registration first.

## Quotation submission model

The proposed system should use a **dual-submission model**:

1. **Structured quotation data** encoded by the bidder for system processing and AOQ generation.
2. **Signed quotation file** uploaded by the bidder as the documentary/authoritative quotation submission.
3. **Compliance to Specifications** submitted by the bidder, together with any other mode-specific documentary requirements.

The structured quotation should capture item-level quantities, unit prices, amounts, and total quoted amount as required for AOQ generation.

The signed quotation remains necessary because suppliers may use their own quotation format or may write/sign directly on the RFQ.

## Sealed quotation / pre-opening confidentiality

A central design requirement is that the BAC Secretariat **must not be able to view the bidder's encoded quotation or quotation file before the prescribed opening**.

Before opening, authorized Secretariat users should see only submission metadata such as:

- Supplier
- RFQ
- Submission status
- Submission timestamp
- Sealed/locked status

Quotation contents and price data remain inaccessible until opening.

After opening, authorized users can access the structured quotation and signed quotation file.

The implementation must treat the underlying Google Drive/file permissions as part of the security architecture; hiding a file through an AppSheet view alone is not sufficient.

## Submission locking and audit trail

Upon final submission, the system should create a submission snapshot and lock the quotation.

Recommended fields include:

- Quotation ID
- RFQ No.
- Supplier Registration No.
- Supplier
- Submission Date/Time
- Submission Status
- Opening Date/Time
- Signed Quotation File
- File Hash (if technically feasible)
- Locked status
- Opened By
- Opened Date/Time

If withdrawal/resubmission is eventually allowed, each submission should remain in the audit trail and a new submission should receive a new timestamp/reference.

## Structured quotation validation

The system may validate arithmetic before final submission, such as:

- Quantity × Unit Price = Item Amount
- Sum of Item Amounts = Total Quotation

The system should flag discrepancies rather than silently alter a bidder's entered price.

## Signed quotation vs. encoded quotation

The system should compare the structured quotation against the uploaded signed quotation after opening.

If the encoded price and signed quotation differ, the system should flag a discrepancy rather than silently selecting one value.

Example:

> **DISCREPANCY:** Encoded quotation does not match uploaded signed quotation.

This preserves the signed quotation as the documentary reference while using structured data to make AOQ generation efficient.

## Opening workflow

Proposed workflow:

`Supplier Registration`
→ `Active RFQ`
→ `Quotation Encoding + Signed Quotation Upload + Compliance`
→ `Submit`
→ `Timestamp + Lock + Seal`
→ `Submission Deadline`
→ `Opening`
→ `Release to Authorized BAC Secretariat`
→ `End-User Evaluation`
→ `AOQ Generation`
→ `Procurement Result`
→ `Supplier Transparency View`

At opening, the system should automatically send the End-User the submitted quotations, together with the system-generated RFQ, as contemplated in the existing RFQ workflow.

## AOQ generation

After opening, GAS can generate the AOQ directly from the structured quotation data.

The AOQ can use:

- Supplier identity from the Supplier Registry.
- Item descriptions and quantities from the RFQ.
- Unit prices and totals from the sealed structured quotation.
- Compliance/evaluation results as applicable.

The uploaded signed quotation remains available for documentary verification and audit/reference.

## Transparency

After the procurement result is finalized, participating suppliers should be able to view the AOQ/result for a particular project in which they submitted a bid.

Access should be limited to suppliers who actually participated in that RFQ, unless a broader public-transparency mechanism is later adopted.

## Design principle

The system should separate:

- **Supplier-provided bid data** — structured quotation and signed quotation.
- **System-generated records** — timestamps, IDs, status, locks, audit trail, AOQ data extraction.
- **BAC Secretariat functions** — RFQ administration, opening access, AOQ generation, procurement results.
- **End-User functions** — evaluation of submitted requirements/specifications.
- **Transparency functions** — controlled release of AOQ/results after completion.

The key principle is that automation for AOQ generation should **not require giving the BAC Secretariat access to quotation contents before opening**.

## Parked decisions / future design work

The following are intentionally not finalized yet:

1. Exact AppSheet authentication model for external suppliers.
2. Google Drive/file storage and permission architecture for sealed quotations.
3. Exact opening trigger and authority to open/release quotations.
4. Whether withdrawal/resubmission will be permitted and under what controls.
5. Exact Supplier Registration document requirements.
6. Exact RFQ data model and mode-specific requirements.
7. AOQ template and GAS generation logic.
8. File hashing implementation and audit verification.
9. Supplier transparency scope and access rules.

This document is an architecture proposal only and is not yet an implementation specification.