# Reward Aggregate Specification

RewardAggregate

Core Metadata

- id
- slug
- name
- subtitle
- description
- image_url
- gallery
- sponsor
- category
- campaign_slug

Operational

- cost
- featured
- priority
- reward_active
- redeem_limit
- redeem_per_user

Inventory

- stock
- reserved
- available
- low_stock

Voucher

- voucher_available
- voucher_used

Shipping

- need_shipping
- estimated_delivery

Analytics

- total_redeem
- popularity_score

All UI consumes RewardAggregate only.

UI must never manually join tables.