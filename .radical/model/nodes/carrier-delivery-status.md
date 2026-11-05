---
id: "682be3e1-92cf-4b15-abc6-36880de5d729"
type: "need"
label: "Carrier delivery status"
kind: "brief"
source: "issue-40"
---

# How the carrier reports a delivery

The carrier answers `GET /parcels/{trackingNumber}` with 200 and `{ "status": … }`, one of `in-transit`, `delivered` or `lost`. Any other answer, or none, means the carrier cannot be reached.

The dispatch service adds `GET /dispatches/{reservationId}` to its own OpenAPI description, as an additive change. It answers 200 with the tracking number and that status. A reservation that does not exist, or has not been dispatched, answers 404.
