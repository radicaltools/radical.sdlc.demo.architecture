---
id: "d1d673a7-7b0e-4d39-8329-7b5d8ca649e9"
type: "scenario"
label: "OpenAPI adds carrier status"
given: "the dispatch service's OpenAPI description at the version pinned by the shop, which has no GET /dispatches/{reservationId}"
then: "GET /dispatches/{reservationId} is described with 200 holding reservationId, trackingNumber, estimatedDeliveryDate, status and deliveredAt, and 404 and 503 answers, and no path or operation of the pinned description is removed or renamed"
when: "the description at the new version is compared with it"
---
