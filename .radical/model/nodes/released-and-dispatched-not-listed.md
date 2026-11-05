---
id: "414f0388-9620-416f-93d6-2f5abadd1893"
type: "scenario"
label: "Released and dispatched not listed"
given: "GRN-1 has 10 on hand. Reservation r-1 of 3 GRN-1 was released. Reservation r-2 of 1 GRN-1 was dispatched. Reservation r-3 of 2 GRN-1 is held. Then GRN-1 has 9 on hand and 2 held."
then: "the answer is 200 with only the entry r-3 quantity 2"
when: "a client asks for the reservations holding GRN-1"
---
