---
id: "4410806a-56ef-42c4-b4a5-365989aeb4a6"
type: "need"
label: "Read carrier status"
kind: "brief"
source: "issue-36"
---

shop: Please add a read of the carrier status of a dispatched reservation to the dispatch service, in its OpenAPI description, at a new version pinned here:

- Input: the reservation id, as the Shop holds it from `POST /dispatches`.
- `200`: the tracking number of that reservation and the carrier's status of its delivery, one of `in-transit`, `delivered` or `lost`, as the carrier reports it. It changes nothing.
- `404`: no such reservation.
- `503`: the carrier cannot be reached. The reservation stays as it is.

The Shop's requirements are `Tracking of a shipped order` and `Carrier status unavailable`, both derived from the need `Where is my order` (issue-27). Once a version with this read is pinned, the coding agent can start again on the change.
