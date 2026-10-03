# 🗺️ Roadmap

Post-1.0.0 improvement ideas for the Bookstore NestJS API. Completed work is
tracked in [REFACTOR.md](./REFACTOR.md); current test status in
[COVERAGE.md](./COVERAGE.md).

## ✅ Completed — see [REFACTOR.md](./REFACTOR.md)

- Phases 1–10: security hardening, atomic inventory, module decomposition,
  migrations/seeds, DevOps, event-driven audit logging, health probes,
  standardized response envelope, module folder restructure, and full
  unit + E2E test suites.
- Phase 11: payment integrity (server-side payment verification via a
  provider-agnostic gateway), auth rate limits, environment validation,
  graceful shutdown, full CI pipeline, and project metadata/docs polish.

## 🎯 Next Steps

### 1. Real Payment Provider Integration
- [x] Signed webhook endpoint (`POST /payments/webhook`) with idempotent
  delivery handling — verification can now be pushed asynchronously in
  addition to pull-only `verifyPayment`.
- [x] `Payment` entity (paymentId, order, amount, provider, status,
  timestamps) with a migration for an auditable payment history.
- [ ] Replace `MockPaymentGateway` with a real PSP adapter (e.g. Zarinpal, IDPay,
  Stripe) behind the existing `PaymentGateway` interface — no order-logic
  changes required; just add a case to the `PAYMENT_PROVIDER` factory.

### 2. Order Lifecycle Expansion
- Expose `orderNumber` in a dedicated order-detail endpoint and support
  lookup-by-order-number for guest-style order tracking.
- Add cancel/return workflows with inventory restock events.
- Move per-order payment status polling to an outbox/saga if PSP latency makes
  synchronous verification unreliable.

### 3. Security Hardening (Continued)
- Move rate limiting to a Redis store so throttling survives horizontal
  scaling (currently in-memory per instance).
- Add per-account (not just per-IP) throttling on auth endpoints and
  exponential backoff on repeated failures.
- Rotate session/JWT secrets and add key-versioning for zero-downtime secret
  rotation.

### 4. Observability & Operations
- Structured JSON logging with request IDs (pino) and correlation headers.
- Prometheus `/metrics` endpoint (HTTP latency histograms, event-loop lag).
- Alerting hooks for the `/health` probes (Slack/email on failure).

### 5. Developer Experience
- Split CI into parallel jobs (lint/typecheck, unit, E2E) to cut pipeline time.
- Add OpenAPI schema coverage enforcement in CI (every route documented).
- Publish Docker images from CI on tagged releases.
