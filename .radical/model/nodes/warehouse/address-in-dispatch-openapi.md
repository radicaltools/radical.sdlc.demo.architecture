---
id: "69658c50-a6dc-44c0-ac54-3ab7670523c8"
type: "scenario"
label: "Address in dispatch OpenAPI"
given: "the dispatch service's OpenAPI description on its main branch"
then: "the body has reservationId and a deliveryAddress object with street, city, postalCode and country"
when: "the warehouse-contract check reads the request body of POST /dispatches"
---
