---
id: "8b5377c1-9807-4e33-b9fb-bd436da70723"
type: "adr"
label: "Quotes stay fast"
alternatives: "A budget per pull request: rejected, too noisy on shared CI machines."
consequences: "Pricing stays in memory and synchronous; no lookups while pricing. Measured nightly, not on each pull request, because timing on a busy machine is noisy."
context: "The cart re-prices on every change a customer makes; a slow quote makes the whole page feel slow."
date: "2026-11-02"
decision: "A quote of a 100-line cart takes under 2 microseconds, and no change makes it more than 20% slower than the median of the last seven nights."
status: "accepted"
---
