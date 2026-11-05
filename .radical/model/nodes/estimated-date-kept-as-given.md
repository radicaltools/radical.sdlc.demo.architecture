---
id: "3fac19bc-7538-443d-9abe-f2a44bfdcfb1"
type: "requirement"
label: "Estimated date kept as given"
action: "the dispatch service shall keep the estimated delivery date that the carrier gives when it books a reservation's parcel, exactly as the carrier gave it: the same characters, not converted to another format or time zone, and shall answer it unchanged. When the carrier gives no date, or null, it shall keep null and answer null."
ears_type: "ubiquitous"
rationale: "The customer is told the date the carrier booked, so the Warehouse passes it on and does not reformat it. A missing date stays missing: it is not replaced by a guess."
---

The dispatch service keeps the estimated delivery date the carrier gave when it booked a reservation, exactly as the carrier gave it.
