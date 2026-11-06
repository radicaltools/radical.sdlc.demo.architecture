---
id: "be88bfd9-c5ae-4b01-a0b3-b4a4aeefec5f"
type: "requirement"
label: "Paid order released"
action: "the orders service shall have the warehouse release the reservation of the order, with the order's id as the idempotency key, and mark the order cancelled only once the warehouse has put the goods back on its shelves."
ears_type: "event-driven"
rationale: "The goods go back to the Warehouse's shelves when a paid order is cancelled. The Warehouse's release of a held reservation does that."
trigger: "a customer cancels an order that is paid and not yet shipped"
---
