---
id: "5eac4132-7c62-45c2-b554-3f774aa95bff"
type: "requirement"
label: "Address in OpenAPI"
action: "the dispatch service's OpenAPI description shall describe the request body of POST /dispatches with the deliveryAddress object, optional, its four fields street, city, postalCode and country as strings, the service passing country on to the carrier unchecked and without a pattern, next to the required reservationId; it shall remove and rename nothing in it."
ears_type: "ubiquitous"
rationale: "The orders service sends deliveryAddress, so the description of the request body must carry the field. The field is optional, so a client that does not send it yet is still described correctly."
---
