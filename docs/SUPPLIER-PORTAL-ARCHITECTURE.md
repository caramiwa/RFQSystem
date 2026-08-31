# Supplier Portal Architecture

## Current status

The Supplier-facing entry flow is now configured and tested.

### Starting View

The AppSheet Starting View uses a conditional expression to route the signed-in user according to role and registration state:

1. **Editor** → `Registered Suppliers`
2. **Existing supplier account** → `My Account`
3. **New supplier account** → `New Registration`

Conceptually:

```text
                         USER LOGS IN
                              │
              ┌───────────────┴───────────────┐
              │                               │
          EDITOR?                         SUPPLIER
              │                               │
              ↓                     ┌─────────┴─────────┐
   Registered Suppliers              │                   │
                              Supplier record?       No record?
                                    │                   │
                                    ↓                   ↓
                               My Account        New Registration
```

## Views

### Registered Suppliers

- View type: Deck
- Position: First
- Secretariat/editor-facing
- Hidden from suppliers using `Show_If`
- The editor accounts are currently identified by their approved email addresses.

### My Account

- View type: Deck
- Supplier-facing
- Shows the supplier's own Supplier record.
- `Show_If` checks whether a Supplier record exists for the current `USEREMAIL()` through `REGISTERED_EMAIL`.
- Search box has been removed from the view. Minor filter UI behavior is intentionally parked for later cleanup.

Current visibility logic:

```appsheet
COUNT(
  SELECT(
    Supplier[SUPPLIER_ID],
    [REGISTERED_EMAIL] = USEREMAIL()
  )
) > 0
```

### New Registration

- View type: Form
- Supplier-facing
- Used only by accounts that do not yet have a Supplier record.
- Saving the form creates the Supplier row and therefore triggers the existing Supplier Registration notifications.

Current visibility logic:

```appsheet
COUNT(
  SELECT(
    Supplier[SUPPLIER_ID],
    [REGISTERED_EMAIL] = USEREMAIL()
  )
) = 0
```

## Important design decision

A separate `APP USER` table is **not** part of the RFQ System architecture. That table belongs to the separate PurView/PO-PR monitoring project and should not be introduced into RFQ System merely to solve navigation.

Likewise, a dedicated Supplier Home dashboard is currently unnecessary. The conditional Starting View provides the required portal entry behavior without adding another table or dashboard layer.

## Supplier lifecycle

```text
NEW ACCOUNT
    ↓
New Registration
    ↓ Save
Supplier record created
    ↓
Unverified / Rejected / Verified
    ↓
My Account
    ↓
VERIFIED
    ↓
RFQ STAGE
```

Verification status determines progression to the RFQ Stage; registration state determines the initial landing view.

## Next build stage

The next major development stage is the **RFQ Layer**, visible to verified suppliers.

Planned supplier RFQ functions:

- View/download available RFQs
- Submit quotation
- Submit required documentary requirements
- Track the supplier's own RFQ submissions

The RFQ layer must remain inaccessible to suppliers who are not `Verified`.
