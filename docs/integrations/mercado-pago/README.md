# Mercado Pago Integration Knowledge Base

Status: **ASTRA WORK v1**
Repository: `thradexIT/bookcars`
Purpose: preserve the engineering knowledge learned in MitoS and expose it as a reusable payment-integration pattern.

## Scope

This directory is intentionally outside `docs/mitos/`.

It contains two different kinds of knowledge:

1. **Generic integration contract** — rules that can be reused by another product, booking flow, ecommerce flow, SaaS product or transactional application.
2. **MitoS provenance** — the concrete defects, tests and provider evidence that led to those rules.

The generic contract must not inherit MitoS-specific domain assumptions such as car rental, reservation status names, UI structure or pricing policy.

## Core engineering position

```text
Browser
  = user intent + provider-tokenized payment data

Application backend
  = business identity + authoritative amount/currency + idempotency + domain state

Mercado Pago
  = provider transaction truth

Webhook + reconciliation
  = synchronization mechanisms
```

A browser redirect, callback, rendered success screen or client-side status is never sufficient evidence that a payment is approved.

## Documents

- [GENERIC_INTEGRATION_PLAYBOOK_v1.0.md](./GENERIC_INTEGRATION_PLAYBOOK_v1.0.md)
  - provider boundary
  - backend authority
  - payment state model
  - idempotency
  - distributed concurrency
  - webhook verification
  - reconciliation
  - secrets
  - certification gates
  - provider-adapter abstraction

- [MITOS_LESSONS_AND_EVIDENCE_v1.0.md](./MITOS_LESSONS_AND_EVIDENCE_v1.0.md)
  - where these rules came from
  - defects discovered in MitoS
  - what was actually certified
  - what remained unproven

- [ASTRA_WORK_HANDOFF_v1.0.md](./ASTRA_WORK_HANDOFF_v1.0.md)
  - compact execution contract for applying this knowledge to another product quickly

## Current Mercado Pago references

Official references used to refresh this knowledge package:

- Checkout Bricks common initialization:
  https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks/common-initialization
- Payment Brick:
  https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks/payment-brick/introduction
- Payment submission / cards:
  https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks/payment-brick/payment-submission/cards
- Webhook validation:
  https://www.mercadopago.com.pe/developers/es/docs/links-and-debts/additional-content/your-integrations/notifications/webhooks
- SDK overview:
  https://www.mercadopago.com.pe/developers/es/docs/sdks-library/overview

## Non-goals

This package does **not**:

- contain production credentials;
- prescribe MitoS-specific routes or schemas;
- treat a frontend callback as payment authority;
- assume a single application instance;
- assume webhook delivery is perfect;
- require Docker;
- require Payment Brick specifically;
- claim production readiness merely because a sandbox payment succeeded.

## Reuse rule

A future implementation may change framework, database, UI and domain language while preserving the invariants in the generic playbook.

The invariants are more important than the exact MitoS source code.
