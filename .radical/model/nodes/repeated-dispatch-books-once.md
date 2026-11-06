---
id: "9bd4d36c-9692-4fd7-89fb-f1c02676c3dd"
type: "scenario"
label: "Repeated dispatch books once"
given: "5 grinders on hand, and reservation r-1 of 1 grinder with key K is held"
then: "both answers have the same tracking number, the carrier got one booking for r-1, and 4 are on hand with none held"
when: "two POST /dispatches with key K, reservationId r-1 and delivery address Dluga 1, Warsaw, 00-001, PL are sent at the same time"
---

Two dispatches of one held reservation, sent at the same time with the same idempotency key, book the carrier once and answer with the same tracking number. Found by exploration (F-0001).
