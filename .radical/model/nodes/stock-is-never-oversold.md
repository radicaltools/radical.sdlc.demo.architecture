---
id: "6fde3e08-4d5a-4fba-85c9-2a1655fc2787"
type: "adr"
label: "Stock is never oversold"
alternatives: "Check, then hold in two calls: rejected, that is the race. Allow overselling and refund: rejected, it moves the problem to the customer."
consequences: "Stock service stays one process until there is a store with the same guarantee. Scaling it out is a decision of its own."
context: "Two clients can ask for the last item at the same moment, and a promise the warehouse cannot keep costs more than a refused order."
date: "2026-11-03"
decision: "Holding stock is one step in the stock service: it compares and holds in the same turn, with no await between them. Available never goes below zero, under any number of requests at once."
status: "accepted"
---
