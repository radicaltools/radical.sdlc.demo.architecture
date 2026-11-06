---
id: "c8643ea0-3330-496f-87f2-3d3f3fcd485e"
type: "requirement"
label: "Paid order release refused"
action: "the orders service shall answer 409 when the warehouse refuses the release, and 503 when it cannot be reached; the order stays paid, and nothing is refunded."
ears_type: "unwanted-behaviour"
rationale: "The warehouse refuses a release of dispatched goods with 409, and the goods are not back on the shelves, so the order cannot be cancelled. Mirrors the other Warehouse calls: 409 for a refusal, 503 for no answer."
unwanted_condition: "a customer cancels an order that is paid, while the warehouse refuses the release of its reservation or cannot be reached"
---
