# Phase: Commerce Hardening and Admin Operations

## Scope

This phase stabilizes the current ecommerce surface before adding more growth features. The priority is that checkout, order records, fulfillment, and returns are reliable enough for production operations.

## Delivered

- Restored green server and client production builds.
- Fixed React hook ordering in the cart flow.
- Added order accounting fields for subtotal, shipping, discounts, loyalty redemption, gift card redemption, and paid total.
- Added Stripe webhook idempotency via persisted event ids.
- Moved discount usage increments to paid webhook fulfillment instead of checkout-session creation.
- Persisted selected shipping address and shipping rate onto paid orders.
- Added tracking number, carrier, and fulfillment timestamp fields for order operations.
- Added admin order detail view with payment summary, shipping address, items, status, and tracking controls.
- Added admin returns view with pending counts, approve/reject actions, refund estimates, and order links.
- Updated checkout to use Stripe coupons for combined discounts instead of negative line items.

## Follow-Up Candidates

- Switch manual interval subscriptions to Stripe Subscriptions if automatic recurring billing is required.
- Add product image upload and media management instead of raw image URLs.
- Add inventory planning with reorder thresholds and supplier notes.
- Add customer service notes on admin order/customer records.
- Add newsletter subscriber export and segmentation.
- Add end-to-end tests against a local Stripe webhook fixture.
