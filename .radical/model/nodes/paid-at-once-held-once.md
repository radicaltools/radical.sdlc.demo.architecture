---
id: "482ea253-a6bc-42f8-8ef5-dbf52bbb569c"
type: "scenario"
label: "Paid at once, held once"
given: "a placed order of 2 mugs and 2 mugs available"
then: "both answers are 200 with the order paid, and the warehouse is asked once to hold 2 mugs under the order's id"
when: "the customer sends two payments of the order at the same time"
---
