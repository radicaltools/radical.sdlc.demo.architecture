---
id: "46d5dbd2-4398-4577-8b43-58c204f4931d"
type: "scenario"
label: "Status without a date"
given: "reservation r-1 is dispatched with tracking number TRK-1 and no estimated delivery date, the dispatch service has not restarted since, and the carrier reports it in-transit"
then: "the answer is 200 with reservation r-1, tracking number TRK-1, status in-transit, estimatedDeliveryDate null and deliveredAt null, the carrier got no new booking from this request, and r-1 is still dispatched"
when: "a client asks for the carrier status of r-1"
---
