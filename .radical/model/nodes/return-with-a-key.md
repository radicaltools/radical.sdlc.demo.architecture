---
id: "10ebcf12-8169-43e6-b912-8d1bf290c431"
type: "need"
label: "Return with a key"
kind: "brief"
source: "issue-26"
---

shop: Returning a shipped order

radicaltools/radical.tools.sdlc.demo.2.shop#12 needs this from this repository, and waits until a version with it is pinned there.

The shop needs the Warehouse to give dispatched goods back to the shelves in a way a client can safely repeat:

- A return operation for a dispatched reservation, for example `POST /reservations/{id}/return` on the stock service, that takes a required `Idempotency-Key` header, as `POST /reservations` and `POST /dispatches` already do.
- A repeat with the same key answers the same result and changes nothing. A key already seen with a different body is refused, as `/reservations` does with 422.
- The existing answers stay: 404 for no such reservation, and 409 when the reservation is not dispatched, held or released, or already returned, with nothing changed.

Once a Warehouse version with this is pinned here, the shop's `WAREHOUSE_CALLS` can list the call and the return requirement can be built.
