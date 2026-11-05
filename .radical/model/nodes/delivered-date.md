---
id: "33da304a-128e-48cb-aef7-cafd41b2e83b"
type: "need"
label: "Delivered date"
kind: "brief"
source: "issue-17"
---

# Delivered date

A customer whose order has been delivered wants to see when.

The tracking of a delivered order should say the date and time of delivery, as the carrier reports it, like 2026-11-21T10:30:00Z. An order that is not delivered yet has none.

## Answer from the carrier side

The carrier answers GET /parcels/{trackingNumber} with 200 and `{ "status": "delivered", "deliveredAt": "2026-11-21T10:30:00Z" }`. The field `deliveredAt` is there only when the status is delivered; when it is missing, the delivery time is null.
