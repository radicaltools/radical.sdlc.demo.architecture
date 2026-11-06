---
id: "2fd65ed4-2c8a-4820-b387-6e96d553e320"
type: "requirement"
label: "Carrier status unavailable"
action: "the orders service shall answer 503 and keep the order as it is, so the tracking can be read again later."
ears_type: "unwanted-behaviour"
rationale: "Set by the ticket issue-33: any answer from the Warehouse other than 200 with a carrier status of in-transit, out-for-delivery, delivered or lost, a 404 included, or no answer, means the status is unavailable. The answer is the same 503 as the other Warehouse calls that cannot be reached (see Carrier down keeps order paid)."
unwanted_condition: "the warehouse does not answer 200 with the carrier status of the delivery of a shipped order: a 404 answer, any other answer, or no answer"
---
