---
id: "2d7b1d9a-7074-4a0c-84c5-ec3c3022ea73"
type: "scenario"
label: "Code does not lower threshold"
given: "a cart whose lines total 162.60 and a discount code that takes 20% off before VAT, capped at 50.00"
then: "the list total with VAT before the code is 200.00, so the cart qualifies for the bulk and big-cart discounts; the code gives 32.52, larger than the 10% of 16.26 and the 5% of 8.13, so neither comes off; the subtotal is 130.08, VAT 29.92, the total 160.00 with no shipping fee"
when: "the shop prices it"
---
