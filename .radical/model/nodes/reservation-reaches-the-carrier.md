---
id: "d85c656b-559e-4999-8394-66c1eee50773"
type: "fitness-fn"
label: "Reservation reaches the carrier"
cadence: "triggered"
characteristic: "reliability"
invocation: "automated"
max_age: "30d"
measure: "smoke"
metrics: "smoke.exit_code == 0"
scope: "holistic"
trigger: "deploy"
---

The sensor smoke reserves and dispatches through the running stack, with a delivery address and a stand-in for the carrier.
