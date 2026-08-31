# RFQ System Roadmap

## Current milestone — Supplier Stage notifications

The Supplier Stage and its initial notification layer are functionally working and tested.

### Notification layer completed

1. **New Registration**
   - Supplier receives registration confirmation.
   - BAC Secretariat receives new-registration notification.

2. **Supplier Document Update**
   - Secretariat is notified when a supplier document is added or updated.

3. **Supplier Contact Update**
   - Secretariat is notified when supplier contact information / nomination documentation is added or updated.

4. **Verification Result**
   - Supplier is notified when verification status changes to `Verified` or `Rejected`.
   - Rejection notification includes `VERIFICATION_REMARKS`.
   - Recipient priority:
     1. valid Supplier Contact email;
     2. `REGISTERED_EMAIL` (the AppSheet account email captured at registration) when the contact email is unavailable or invalid.

### Supplier verification data

The `Supplier` table includes:

- `VERIFICATION_STATUS`
- `VERIFICATION_REMARKS`
- `VERIFIED_BY`
- `REGISTERED_EMAIL`

`REGISTERED_EMAIL` is the supplier's AppSheet account email captured at registration. It is an internal ownership/fallback field and should not be supplier-editable.

### Notification refinement parked for later

The notification functions are working. Content refinement is intentionally deferred until the functional workflow is complete. Later cleanup should:

- distinguish Add vs Update in Secretariat notifications;
- identify what document/contact information changed;
- standardize supplier-facing and Secretariat-facing email wording;
- review subjects and recipient handling;
- remove temporary/test configuration values.

## System stage architecture

The RFQ System is being developed as a staged workflow. A supplier must complete the Supplier Stage and reach `VERIFIED` before proceeding to the RFQ Stage.

```text
             SUPPLIER STAGE
                    │
                 VERIFIED
                    ↓
              RFQ STAGE
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
    Download RFQ        Submit Quotation
                                +
                    Documentary Requirements
```

### Supplier Stage

The Supplier Stage establishes and verifies the supplier's registration package:

- Supplier registration
- Registration documents
- Official contact
- Nomination document
- Verification by Secretariat
- Verified / Rejected status
- Verification remarks for rejection

Only suppliers reaching **VERIFIED** should progress to the RFQ Stage.

### RFQ Stage — planned

The RFQ Stage will eventually provide two principal supplier actions:

- **Download RFQ**
- **Submit Quotation + Documentary Requirements**

The quotation workflow is expected to support the RFQ-specific submission process and documentary requirements without mixing it with the Supplier Stage registration records.

### End-user layer — planned

An eventual **End-user layer** will sit alongside / above the RFQ workflow and will support the internal requestor/end-user side of the procurement process. The exact screens, permissions, and hand-offs will be designed after the Supplier and RFQ stages are established.

## Development principle

Build and validate each stage before moving to the next. Keep supplier registration/verification, RFQ participation, and end-user functions conceptually separated so that permissions, data ownership, and notifications remain clear.
