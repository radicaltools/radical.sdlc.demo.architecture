---
id: "6ef298ce-4568-470b-898f-2e02d8aa0217"
type: "container"
label: "Stock service"
technology: "Node.js, Fastify"
---

HTTP service. Holds what is on the shelves and what is reserved: POST /reservations, GET /reservations/{id}, POST /reservations/{id}/release, /dispatch and /return, GET /stock/{sku}, GET /stock/{sku}/reservations, POST /stock/receipts.
