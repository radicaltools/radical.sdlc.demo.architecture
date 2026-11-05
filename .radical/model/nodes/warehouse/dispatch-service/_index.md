---
id: "a3739b2d-e64e-4363-b010-c9482f4d06c5"
type: "container"
label: "Dispatch service"
technology: "Node.js, Fastify"
---

HTTP service. POST /dispatches books the carrier for a held reservation and tells the stock service it left. Also reads the carrier's status of a dispatched reservation, by its reservation id.
