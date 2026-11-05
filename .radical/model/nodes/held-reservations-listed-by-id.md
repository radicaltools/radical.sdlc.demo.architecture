---
id: "67bfba73-d7d7-49ed-b669-8662d61365ec"
type: "scenario"
label: "Held reservations listed by id"
given: "GRN-1 has 20 on hand and MUG-1 has 4 on hand. Reservations are numbered in the order they are made. Reservation r-1 holds 2 of MUG-1 only. Reservation r-2 holds 2 of GRN-1. Reservation r-10 holds 3 of GRN-1. All are held."
then: "the answer is 200 with the entries r-2 quantity 2, then r-10 quantity 3, in that order"
when: "a client asks for the reservations holding GRN-1"
---
