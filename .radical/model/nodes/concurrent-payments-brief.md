---
id: "15d9726d-f855-4c3f-baec-c38835537031"
type: "need"
label: "Concurrent payments brief"
kind: "other"
source: "F-0017"
---

Title: Two payments of one placed order sent together: the second is answered 409 'A paid order cannot become paid', not the order as paid
Rule: Repeated payment reserves once: the orders service shall answer that the order is paid and hold nothing more in the warehouse

Steps:
1. place an order (status placed)
2. send POST /orders/{id}/pay twice at the same time

What differs:
Expected: both answers 200 with the order paid, one reservation
Actual: first 200 with reservationId r-6, second 409 {"error":"A paid order cannot become paid"}; a second run gave the same (order o-6, r-10)
Seen: 2 of 2
