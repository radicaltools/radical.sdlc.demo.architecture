---
id: "2b967c60-1e72-41fd-af35-282a22b990a3"
type: "need"
label: "Tracking after restart"
kind: "brief"
source: "issue-43"
---

# Tracking numbers after a restart

A dispatched reservation's tracking number is kept in the dispatch process, as the idempotency keys are. After the process restarts, asking for the status of a reservation dispatched before the restart answers 503, because there is no tracking number to ask the carrier with. The reservation stays as it is.
