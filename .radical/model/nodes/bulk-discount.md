---
id: "84694d8d-a58c-47b7-bd2b-1516a3e6678e"
type: "requirement"
label: "Bulk discount"
action: "the shop shall take 10% off the subtotal before VAT, rounded to cents, and where the big-cart discount or a discount code also applies, give the customer only the largest of the three."
ears_type: "event-driven"
rationale: "Customers who buy in bulk pay 10% less. The brief gives no amount for bulk; the answer to its question 1 (a) is read as the same measure and amount as the 200 rule, so the cart qualifies on its total with VAT before any code. Under that reading the 10% is always larger than the 5% big-cart discount, so the 5% never gives the largest share. The 10% is on the subtotal before VAT, as the 5% is, so the two work on the same base."
trigger: "a customer prices a cart whose total with VAT, before any discount code, is 200.00 or more"
---

Customers who buy in bulk pay 10% less. Assumption: the threshold is the 200 rule's amount, measured on the total with VAT before any code (the brief's answer 1a gives no amount).
