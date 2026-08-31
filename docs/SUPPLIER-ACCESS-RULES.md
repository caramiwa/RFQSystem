# Supplier Access Rules

## Supplier Registration and RFQ Access

These rules apply to the supplier-facing side of the RFQ System.

### Registration List
- The Supplier Registration List is an internal/Secretariat view.
- Suppliers must **not** be able to view the Registration List or other suppliers' records.

### Supplier's Own Registration
- A supplier may access and update **only its own supplier registration data**.
- Supplier registration consists of Supplier Information, Registration Documents, and Official Contact.

### Unverified Supplier
- An unverified supplier may access the registration/update functions needed to complete or correct its registration.
- An unverified supplier may access the How-To / User Guide.
- An unverified supplier must not have access to SVP RFQs.

### Verified Supplier
- A verified supplier may access the How-To / User Guide.
- A verified supplier may access the SVP RFQ functions.
- RFQ access is gated by `VERIFICATION_STATUS = "Verified"`.

### Verification Boundary
- `VERIFICATION_STATUS` records the status of the supplier's registration review.
- Verification means that the BAC Secretariat has reviewed the submitted registration information/documents and found them in order.
- It does **not** mean that the supplier has been determined eligible to bid or eligible for award. Those determinations belong to the procurement process and are outside this supplier-registration system.
