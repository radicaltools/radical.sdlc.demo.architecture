---
id: "08d49333-ae43-4d23-ae02-e22832625783"
type: "scenario"
label: "Estimated date kept at shipping"
given: "a paid order o-7, and the warehouse answers that dispatching its reservation books tracking number TRK-7 with estimated delivery 2026-11-20"
then: "order o-7 is shipped with tracking number TRK-7 and estimated delivery 2026-11-20, and no later read changes that date"
when: "order o-7 is shipped"
---
