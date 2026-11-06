---
id: "cd378e8c-8803-4243-9f08-26340dabef81"
type: "fitness-fn"
label: "Order crosses the systems"
cadence: "triggered"
characteristic: "reliability"
invocation: "automated"
max_age: "14d"
measure: "crosses"
metrics: "crosses.exit_code == 0"
scope: "holistic"
trigger: "pull-request"
---

The sensor crosses runs the repository it is in as it is and the other system as its main branch has it, talking over HTTP, with only the carrier standing in. An order with a delivery address is refused for short goods, then paid, shipped to that address, tracked and returned, and the date the carrier gave has to come out of the Shop. It fails on a call or a field the two sides do not agree on, in the pull request of either side.
