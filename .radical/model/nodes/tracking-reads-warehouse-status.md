---
id: "551806db-e560-496d-bbfb-c5063623e719"
type: "need"
label: "Tracking reads Warehouse status"
kind: "brief"
source: "issue-33"
---

# Tracking reads the Warehouse's status

The Warehouse now answers the status: `GET /dispatches/{reservationId}` gives the tracking number and the carrier's status. Correct what the model says about it not being there yet.

Any answer from the Warehouse other than 200 with that status, a 404 included, or no answer, means the status is unavailable: the orders service answers 503 and the order stays as it is.
