---
id: "9edf74bc-d0d2-4016-9e76-a6dca5f3b041"
type: "requirement"
label: "Carrier status not dispatched"
action: "the dispatch service shall answer 404 and change nothing."
ears_type: "event-driven"
trigger: "a client asks for the carrier status of a reservation that does not exist or has not been dispatched"
---

A reservation that does not exist, or that has not been dispatched, gets no carrier status. A dispatched reservation after a restart of the dispatch service is not this case: it answers 503, see Status after restart.
