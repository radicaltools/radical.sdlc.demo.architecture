---
id: "3bccf1bf-6e43-4cf7-a8e9-12d1567e935a"
type: "adr"
label: "Payment waits for stock"
alternatives: "Reserve when the order is placed: rejected, abandoned carts would hold stock. Reserve after payment by an event: rejected, the customer would pay for goods that may be short, and the company would owe a refund. A copy of the stock in the shop: rejected, it is stale exactly when it matters."
consequences: "The warehouse being down stops payments, and the customer can try again. An order that is only placed holds nothing, so placing an order stays fast and needs no warehouse."
context: "A customer should not pay for goods the company does not have. The warehouse is another system, in another repository, and it can be down."
date: "2026-11-03"
decision: "Paying an order reserves its goods in the Warehouse in the same request, with the order's id as the idempotency key. No reservation, no payment. The shop keeps no copy of the stock."
status: "accepted"
---
