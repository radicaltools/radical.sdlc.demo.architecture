---
id: "4563af73-3fb0-45bf-892d-2aed7b8c1a38"
type: "scenario"
label: "Shipped order returned on day 14"
given: "an order shipped at 2026-11-01T10:00:00Z, whose reservation r-1 holds 2 grinders, and 0 grinders on hand"
then: "the warehouse has put the 2 grinders back on its shelves under r-1 with the order's id as key, and the order is returned"
when: "a customer returns the order at 2026-11-15T10:00:00Z"
---
