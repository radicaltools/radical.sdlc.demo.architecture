---
id: "4b02588d-fc02-479c-966f-2a94142b1d2d"
type: "scenario"
label: "Listing changes no stock"
given: "GRN-1 has 10 on hand. Reservation r-1 holds 3 of GRN-1 and is held. So 3 are held."
then: "the answer is 200 with the entry r-1 quantity 3, and GRN-1 still has 10 on hand and 3 held"
when: "a client asks for the reservations holding GRN-1 with no Idempotency-Key header"
---
