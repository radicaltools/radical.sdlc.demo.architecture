---
id: "2cd02b5e-5263-4c7f-bf38-22dd3b99dfbe"
type: "requirement"
label: "Shipping fee"
action: "the shop shall add a shipping fee of 9.99 to a cart whose total is below 100.00, and no shipping fee to a cart whose total is 100.00 or more."
ears_type: "ubiquitous"
rationale: "Orders from 100 ship free; below that shipping costs 9.99."
---

A cart whose total, after any discount (the big-cart discount or a discount code), VAT and rounding to cents, is below 100.00 pays a shipping fee of 9.99. A cart whose total is 100.00 or more ships free. The fee carries no VAT.
