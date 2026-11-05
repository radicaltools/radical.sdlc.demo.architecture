---
id: "ea465e58-9ca0-468c-a087-17c1a063dacc"
type: "need"
label: "Return a shipped order"
kind: "brief"
source: "issue-20"
---

# shop: Returning a shipped order

radicaltools/radical.tools.sdlc.demo.2.shop#12 needs this from this repository, and waits until a version with it is pinned there.

This system needs the Warehouse to have an operation that puts the goods of a dispatched reservation back on the shelves. The Shop calls it when a customer returns a shipped order within 14 days of shipping; the Shop checks the 14 days itself. The brief does not say what the Warehouse should answer for a reservation that is not dispatched, or for one already returned. Those are for the Warehouse to decide. Note that the Warehouse's requirement "Dispatched stock stays gone" would conflict with such an operation, so it is for the Warehouse to settle.
