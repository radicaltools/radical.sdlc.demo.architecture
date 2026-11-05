---
id: "ac403ea1-8456-4115-9ec3-c7fb27ab9ce1"
type: "adr"
label: "Shop follows the Warehouse API"
alternatives: "A version of the Warehouse pinned in the Shop: rejected, the one model already orders the work, so a pin would only make the Shop wait for a tag. A shared client package: rejected, services share only their contracts."
consequences: "A change of the Warehouse API reaches the Warehouse first, and the Shop builds on it afterwards. A Warehouse pull request that breaks what the Shop's main branch calls or reads is red in its own gate, so a rename goes in steps: add the new name, move the Shop, then remove the old one. Removing an operation the Shop calls turns the next Shop pull request red as well."
context: "The orders service calls the Warehouse over HTTP. The two are built in different repositories, so a call can drift from what the Warehouse describes without either side noticing."
date: "2026-11-05"
decision: "Every call of the orders service to the Warehouse is described in the OpenAPI description of the Warehouse service it calls, as that repository has it on its main branch, and a write takes an Idempotency-Key."
status: "accepted"
---
