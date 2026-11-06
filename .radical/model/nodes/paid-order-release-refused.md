---
id: "c8643ea0-3330-496f-87f2-3d3f3fcd485e"
type: "requirement"
label: "Paid order release refused"
action: "the orders service shall answer 409 when the warehouse refuses the release, whether with 409, 422 or 404, and 503 when it cannot be reached; the order stays paid, and nothing is refunded."
ears_type: "unwanted-behaviour"
rationale: "The warehouse refuses a release of dispatched goods with 409, and refuses a release whose key it has seen for another reservation with 422; in both the goods are not back on the shelves, so the order cannot be cancelled. Paying reserves the goods with the order's id as key (ADR Payment waits for stock), so a paid order always holds a reservation: a 404 for it means the warehouse has lost it. That is answered as a refusal too, the simplest reading, since the goods are not back on the shelves. All refusals are answered 409, as a refusal. Mirrors the other Warehouse calls: 409 for a refusal, 503 for no answer."
unwanted_condition: "a customer cancels an order that is paid, while the warehouse refuses the release of its reservation (409; 422 for a key it has already seen for another reservation; 404 for a reservation it does not know) or cannot be reached"
---
