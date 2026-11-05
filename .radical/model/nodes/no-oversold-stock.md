---
id: "6693260d-4d80-491e-b10e-23f468920ea4"
type: "fitness-fn"
label: "No oversold stock"
cadence: "triggered"
characteristic: "reliability"
invocation: "automated"
max_age: "3d"
measure: "oversell"
metrics: "stock.oversold_items == 0"
scope: "atomic"
trigger: "nightly"
---

The sensor oversell (.radical/sensors/oversell.mjs) sends 200 reservations at once for 50 items and writes how many items more than 50 were held.
