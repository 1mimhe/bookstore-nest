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
- Post-1.0.0: async payment webhook with auditable `Payment` history,
  order lifecycle (lookup by order number, cancel, return with restock),
  and dependency vulnerability triage (prod audit 23 → 2, rest deferred to
  the Nest 12 line).

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
- [x] Expose `orderNumber` in a dedicated order-detail endpoint with
  owner-scoped lookup-by-order-number (`GET /orders/number/:orderNumber`,
  derived match — no migration, no cross-user disclosure).
- [x] Cancel/return workflows with inventory restock events (`POST
  /orders/cancel` for unpaid `Pending` orders; `POST /orders/return` for
  `Delivered` orders with atomic restock + `order.returned` event).

### 3. Security Hardening (Continued)
- Move rate limiting to a Redis store so throttling survives horizontal
  scaling (currently in-memory per instance).
- Add per-account (not just per-IP) throttling on auth endpoints and
  exponential backoff on repeated failures.
- Rotate session/JWT secrets and add key-versioning for zero-downtime secret
  rotation.

### 4. Observability & Operations
- [x] Structured JSON logging with request IDs (built-in `JsonLogger`, no new
  dependency) and correlation headers (`x-request-id` echo/generate via
  `RequestIdMiddleware` + `AsyncLocalStorage` context).
- [x] Prometheus `/metrics` endpoint (public, handler-level latency
  histograms, 5xx counters, event-loop lag, uptime — hand-rolled exposition,
  no `prom-client`).
- [x] Alerting hooks for the `/health` probes (minutely `HealthAlertService`
  poller: structured error log + `health.degraded` event on failure; deduped
  until recovery).
- [ ] Actual Slack/email delivery on `health.degraded` (subscriber not yet
  implemented).

### 5. Developer Experience
- Split CI into parallel jobs (lint/typecheck, unit, E2E) to cut pipeline time.
- Add OpenAPI schema coverage enforcement in CI (every route documented).
- Publish Docker images from CI on tagged releases.
