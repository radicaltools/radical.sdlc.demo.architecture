---
id: "5eac4132-7c62-45c2-b554-3f774aa95bff"
type: "requirement"
label: "Address in OpenAPI"
action: "the dispatch service's OpenAPI description shall describe the request body of POST /dispatches with the deliveryAddress object, its four fields street, city, postalCode and country, the country a two-letter code such as PL, next to reservationId; it shall remove and rename nothing in it."
ears_type: "ubiquitous"
rationale: "The orders service sends deliveryAddress and the Shop follows the Warehouse API, so the description the sensor checks must carry the field. An addition is a minor version."
---
