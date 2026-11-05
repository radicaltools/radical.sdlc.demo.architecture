---
id: "418761d0-e97a-4671-90d8-e146f31da486"
type: "fitness-fn"
label: "Calls match the Warehouse API"
cadence: "triggered"
characteristic: "compatibility"
invocation: "automated"
max_age: "14d"
measure: "warehouse-contract"
metrics: "warehouse-contract.exit_code == 0"
scope: "atomic"
trigger: "pull-request"
---

The sensor warehouse-contract reads the OpenAPI descriptions of the Warehouse on its main branch and fails on a call of the Orders service they do not describe.
