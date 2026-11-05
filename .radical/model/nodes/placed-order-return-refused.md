---
id: "455590b4-e050-4ff5-b41f-6945cc53eeb7"
type: "scenario"
label: "Placed order return refused"
given: "a placed order that has not been paid or shipped"
then: "the answer is 409, the order stays placed, and the warehouse is not asked to return anything"
when: "a customer returns the order"
---
