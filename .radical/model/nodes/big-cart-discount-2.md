---
id: "cdcbf267-664c-4370-be1a-fd350a63b034"
type: "requirement"
label: "Big cart discount"
action: "the shop shall take 5% off the subtotal before VAT, rounded to cents, and where the bulk discount or a discount code also applies, give the customer only the largest of the 5%, the bulk 10% and the code's share."
ears_type: "event-driven"
rationale: "Carts from 200 get 5% off. The 200 is measured on the cart's total with VAT before any code (the sum of its lines plus 23% VAT, rounded to cents, no shipping), so a cart at 200 qualifies even with a code. The 5% does not stack with the bulk discount or a code: the customer gets only the largest of them."
trigger: "a customer prices a cart whose total with VAT, before any discount code, is 200.00 or more"
---
