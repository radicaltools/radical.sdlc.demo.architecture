---
id: "4cd17d23-8c04-4b34-a713-f768dc437581"
type: "need"
label: "Order of SKU reservations"
kind: "brief"
source: "issue-32"
---

# Order of the reservations holding a SKU

The list of reservations holding a SKU is sorted by reservation id, and two things about that are not settled in the model.

- Sort by the number in the id, so `r-2` comes before `r-10`.
- The ledger numbers reservations in the order they are made, so `r-1` is always made first. The scenario "Held reservations listed by id" says `r-2` was made first, which cannot happen. Correct it so that it can happen and shows `r-2` listed before `r-10`.
