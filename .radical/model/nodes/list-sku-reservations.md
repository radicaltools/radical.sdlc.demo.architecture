---
id: "6eccca0f-8df7-4773-b21d-fa924d0ab559"
type: "need"
label: "List SKU reservations"
kind: "brief"
source: "issue-29"
---

# List the reservations holding a SKU

People on the floor want to see what is holding a SKU before they move goods.

Add `GET /stock/{sku}/reservations` to the Stock service. It answers 200 with the reservations that hold this SKU now, each with its id and the quantity of this SKU it holds, sorted by reservation id.

- A SKU the warehouse knows, with nothing held: 200 and an empty list.
- A SKU the warehouse does not know: 404.
- Released and dispatched reservations hold nothing, so they are not listed.

It only reads, so it changes no stock and takes no idempotency key.
