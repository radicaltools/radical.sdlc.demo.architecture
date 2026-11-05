---
id: "18bff412-316e-4d5a-913b-e98827ba88c0"
type: "fitness-fn"
label: "Quote speed"
cadence: "triggered"
characteristic: "performance-efficiency"
invocation: "automated"
max_age: "3d"
measure: "quote-speed"
metrics: |
  pricing.quote_us{cart=100-lines} <= 100 us
  pricing.quote_us{cart=100-lines} <= baseline + 50%
scope: "atomic"
trigger: "nightly"
---

The sensor quote-speed (.radical/sensors/quote-speed.ts) prices a 100-line cart 31 000 times and writes the median time of one quote, in microseconds.
