---
id: "e6ebfcf2-e185-4fea-9959-c03b6d6b7907"
type: "requirement"
label: "Estimated date kept on order"
action: "the orders service shall keep on the order the estimated delivery date the warehouse answers for the dispatch of its reservation, as a date like 2026-11-20, exactly as the carrier gave it, and shall never change that date. The warehouse's dispatch answer shall carry this date next to the tracking number, as the carrier gives it when it books the delivery."
ears_type: "event-driven"
rationale: "A customer whose order has shipped wants to know when it will arrive. The carrier gives the date when it books the delivery, and it stays as the carrier gave it, so the orders service keeps it from the dispatch and does not read it again. Needs from the warehouse, not yet in the version pinned here: its dispatch answer carries the estimated delivery date of the booking."
trigger: "a paid order is shipped"
---
