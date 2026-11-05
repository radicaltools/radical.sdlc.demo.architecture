---
id: "0df672f9-4134-41c6-b8bc-5cec52d39ce5"
type: "need"
label: "Booking with no date"
kind: "brief"
source: "issue-6"
---

# Carrier booking answer, and a booking with no date

The carrier answers a booking (`POST /parcels`) with 201 and `{ trackingNumber, estimatedDeliveryDate }`. The date may be missing.

A parcel the carrier has booked goes on. When the carrier gives no date, the dispatch still succeeds, and `estimatedDeliveryDate` is null in the dispatch service's answers and in the tracking of the order. The customer sees the status without a date.
