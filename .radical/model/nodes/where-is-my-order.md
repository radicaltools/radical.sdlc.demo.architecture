---
id: "18f1383c-956a-47f7-907f-2694cabf5a22"
type: "need"
label: "Where is my order"
kind: "brief"
source: "issue-27"
---

# Where is my order

A customer whose order has shipped wants to know where it is.

Add `GET /orders/{id}/tracking` to the orders service. For a shipped order it answers 200 with the tracking number and the carrier's status of that delivery, one of `in-transit`, `delivered` or `lost`. The status comes from the Warehouse, which books the carrier.

- An order that has not shipped: 409.
- An unknown order: 404.
