---
id: "017b2e7d-d32f-4ab2-848c-9e8472557f9b"
type: "requirement"
label: "Release a reservation"
action: "the stock service shall make the quantities of the reservation available again, the release taking an Idempotency-Key; a repeated release with a key already seen for this reservation shall answer the same released reservation and change nothing."
ears_type: "event-driven"
trigger: "a client releases a held reservation"
---
