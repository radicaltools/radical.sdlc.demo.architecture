---
id: "cd378e8c-8803-4243-9f08-26340dabef81"
type: "fitness-fn"
label: "Order crosses the systems"
cadence: "triggered"
characteristic: "reliability"
invocation: "automated"
max_age: "30d"
measure: "smoke"
metrics: "smoke.exit_code == 0"
scope: "holistic"
trigger: "deploy"
---

The sensor smoke (.radical/sensors/smoke.mjs) places, pays and ships an order through the running stacks of both systems, the Warehouse at its pinned version, and reads the notifications and the stock.
