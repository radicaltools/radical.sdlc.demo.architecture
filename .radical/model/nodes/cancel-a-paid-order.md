---
id: "3d22ee8d-dd27-4ecf-aac6-78b5506a3b9e"
type: "need"
label: "Cancel a paid order"
kind: "brief"
source: "issue-30"
---

A customer who paid but changed their mind can cancel the order, as long as it has not shipped.
- The goods go back to the Warehouse's shelves, and the order becomes cancelled.
- A shipped order cannot be cancelled; it can only be returned.

The agents asked whether a cancelled paid order should be refunded in full. Answer from tomasz-zajac-oss: "1 a": the full paid amount is refunded.

The agents asked whether a release with an Idempotency-Key already seen for a different reservation should be refused with 422 (as return does) or treated as a new key and release the reservation. Answer from tomasz-zajac-oss: "refuse with 422".
