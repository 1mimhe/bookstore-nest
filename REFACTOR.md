# Architecture Refactoring Notes

Documentation of technical changes, considerations, and fixes applied to the Bookstore NestJS API.

---

## 1. Overview

The codebase was refactored to resolve architectural issues, security vulnerabilities, concurrency bugs, and lack of testing:

- **Security**: Upgraded password hashing, removed test backdoor, added security headers, CORS restrictions, and rate limiting.
- **Payment Integrity**: Replaced the client-trusted payment status with server-side payment verification through a provider-agnostic gateway abstraction.
- **Concurrency**: Replaced in-memory stock checks with atomic conditional SQL decrements.
- **Redis**: Replaced blocking `KEYS *` queries with non-blocking scans.
- **Structure**: Decomposed bloated controllers, resolved circular dependencies, and replaced inheritance with interceptor composition.
- **Event-Driven**: Decoupled staff audit logging from catalog services via `@nestjs/event-emitter`.
- **Reliability & DevOps**: Added database migrations, seed scripts, health probes, Docker Compose, GitHub Actions CI, and Supertest E2E tests.

---

## 2. Security & Authentication

### Previous State
- Passwords used custom PBKDF2 with 1,000 iterations.
- An unauthenticated admin signup endpoint (`/auth/signup-test-admin`) returned raw entity data without serialization.
- No HTTP security headers were set.
- Rate limiting was absent on sensitive endpoints.
- CORS allowed all origins with credentials.

### Considerations
- **Bcrypt vs. Argon2**: Bcrypt was chosen for native support and reliability across operating systems and Docker images.
- **Password Migration**: To avoid breaking existing user accounts, passwords are verified against PBKDF2 on login, re-hashed with Bcrypt (cost 12), and updated in the database.
- **Demo & Testing Endpoint**: Retained `/auth/signup-test-admin` for portfolio review and Swagger testing convenience, but hardened it: made it idempotent, hashed passwords with Bcrypt (cost 12), and enforced `@Serialize(UserResponseDto)` so password hashes are never exposed.

### Changes Implemented
- Hardened `/auth/signup-test-admin` with Bcrypt hashing, idempotency, and sanitized DTO serialization.
- Implemented Bcrypt hashing with automatic migration in `AuthService`.
- Added `helmet` middleware in `src/main.ts`.
- Added `@nestjs/throttler` (100 requests per minute limit).
- Configured CORS with explicit origins and credentials support.
- Configured global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).

---

## 3. Concurrency & Database Operations

### Previous State
- **Stock race condition**: In `OrdersService`, book inventory was read into memory, compared against requested quantity, and saved back. Concurrent requests could read the same initial stock and cause inventory underflow.
- **Blocking Redis commands**: Views tracking used Redis `KEYS *`, which blocks Redis operations during execution.
- **Unformatted SQL errors**: MySQL duplicate key (1062) and foreign key (1452) errors leaked raw SQL details or triggered unhandled 500 errors.

### Considerations
- **Concurrency control**: Evaluated distributed locking (Redlock) versus conditional SQL decrements. Selected conditional SQL (`UPDATE ... WHERE id = :id AND stock >= :qty`) because it avoids lock contention and relies on MySQL's row-level locking.

### Changes Implemented
- In `OrdersService.processOrder`, decrements are performed atomically:
  ```sql
  UPDATE books SET stock = stock - :quantity WHERE id = :id AND stock >= :quantity
  ```
  If no rows are affected, the transaction rolls back with a `400 Bad Request`.
- In `ViewsService`, replaced `KEYS` with `scanStream` and atomic `GETDEL`.
- Created `TypeOrmExceptionFilter` in `src/common/filters/` to translate:
  - Error 1062 (`ER_DUP_ENTRY`) ➔ HTTP 409 Conflict.
  - Error 1452 (`ER_NO_REFERENCED_ROW_2`) ➔ HTTP 404 / 400.

---

## 4. Modularization & Controller Decomposition

### Previous State
- `BooksController` was over 500 lines, handling books, titles, characters, bookmarks, and images in one class.
- Circular dependency existed between `BooksModule` and `TagsModule` using `forwardRef`.

### Changes Implemented
- Split `BooksController` into four focused controllers:
  - `BooksController`: Physical book editions, pricing, inventory.
  - `TitlesController`: Titles, descriptions, author associations.
  - `CharactersController`: Character records.
  - `BookmarksController`: User bookmark management.
- Removed circular imports between `BooksModule` and `TagsModule` by injecting repositories directly.

---

## 5. Database Migrations & Seeds

### Previous State
- Schema management relied on `synchronize: true`.
- Seed scripts were placed inconsistently (`src/modules/languages/`, `src/modules/tags/`) and failed on foreign key constraints.

### Changes Implemented
- Created `src/data-source.ts` exposing `AppDataSource` for TypeORM CLI.
- Added migration scripts in `package.json` (`migration:generate`, `migration:run`, `migration:revert`).
- Centralized seeders in `src/database/seeds/`:
  - `admin.seed.ts`: Creates the initial admin account from environment variables.
  - `languages.seed.ts`: Seeds supported languages.
  - `tags.seed.ts`: Seeds category taxonomy.
  - `master.seed.ts`: Runs all seeders in relational dependency order (`npm run seed`).

---

## 6. DevOps & CI/CD

### Previous State
- No Docker Compose file for local multi-container development.
- No automated testing or build checks on pull requests.

### Changes Implemented
- Added `docker-compose.yml` defining `api`, `mysql` (8.0), and `redis` (7.0) with health checks and volume persistence.
- Added `.env.example` with full configuration keys.
- Added `.github/workflows/ci.yml` running linting, build, unit tests, and E2E tests against MySQL and Redis service containers.

---

## 7. Event-Driven Architecture

### Previous State
- `TitlesService` and `BooksService` directly injected `StaffsService` to log audit actions synchronously inside catalog transactions, creating tight module coupling.

### Changes Implemented
- Integrated `@nestjs/event-emitter`.
- Defined typed events in `src/common/events/`:
  - `TitleCreatedEvent`, `TitleUpdatedEvent`
  - `BookCreatedEvent`, `BookUpdatedEvent`
  - `OrderPlacedEvent`
- Defined central enum `EventNames` in `src/common/enums/event.names.ts`.
- Created `StaffAuditListener` (`src/modules/staffs/listeners/staff-audit.listener.ts`) using `@OnEvent(..., { async: true })` to persist audit records asynchronously.
- Removed `StaffsService` dependency from `BooksModule`.

---

## 8. Composition vs. Inheritance

### Previous State
- Eight controllers inherited from a shared `BaseController` to handle recent-views cookies. This forced route handlers to inject raw Express `@Req()` and `@Res()` objects.

### Changes Implemented
- Created `CookieService` in `src/common/services/cookie.service.ts`.
- Created `RecentViewsInterceptor` and `@TrackRecentView()` decorator in `src/common/`.
- Removed `extends BaseController` from all controllers and deleted `src/common/base.controller.ts`.
- Controllers now return standard DTOs without referencing Express request/response objects.

---

## 9. Health Checks & Response Envelope

### Previous State
- No readiness or liveness endpoints existed for container orchestration.
- API response formats differed across endpoints (some returned arrays, others raw objects).

### Changes Implemented
- Integrated `@nestjs/terminus` and added `HealthController` (`GET /health`) checking MySQL connection and memory limits.
- Created `TransformInterceptor` in `src/common/interceptors/` wrapping responses in `{ statusCode, timestamp, data }`.
- Created `@BypassTransform()` decorator to skip enveloping where necessary (e.g. `/health`).

---

---

## 10. Module Folder Structure & Organization

### Previous State
- Module roots contained an unstructured mix of controllers, services, entities, and DTOs.
- Inconsistent naming and scattered files made discovery and maintenance difficult.
- Seed scripts were mixed inside feature modules (`languages.seed.ts`, `tags.seed.ts`).

### Changes Implemented
- Standardized all 18 modules under `src/modules/<name>/` into clean subdirectories:
  - `controllers/`: Route handlers and HTTP transport concerns.
  - `services/`: Business logic, domain operations, and unit test specifications.
  - `entities/`: TypeORM entity definitions.
  - `dtos/`: Validation schemas and request/response transfer objects.
  - `types/`: Domain interfaces and enums.
  - `listeners/`: Domain event listeners (`StaffActionListener`).
- Relocated seeds to `src/database/seeds/` (`languages.seed.ts`, `tags.seed.ts`, `admin.seed.ts`, `master.seed.ts`).
- Standardized shared layers in `src/common/` (`interceptors/`, `middlewares/`, `filters/`, `services/`, `guards/`).
- Added backward-compatible barrel exports at module roots to ensure no external imports break.

---

## 11. Testing & Static Analysis

### Previous State
- 20+ empty boilerplate spec files generated by Nest CLI were unmaintained.
- Test coverage across services was low.
- E2E tests were limited.

### Changes Implemented
- Created unit test suites for all domain services, filters, and interceptors (22 test suites, 127 unit tests passing).
- Built E2E integration test suites using Supertest covering all key business workflows (8 test suites, 30 E2E tests passing):
  - `health`: Terminus probes and system diagnostics.
  - `auth`: Credentials validation, token issuance, refresh flows, and portfolio demo admin provisioning.
  - `catalog`: Book browsing, details, trending items, and view cookies.
  - `orders`: Cart operations, item adjustments, checkout initiation, and order history.
  - `reviews`: Multi-entity review creation, reactions, and deletions.
  - `collections`: Collection creation, public browsing, and management.
  - `tickets`: Support ticket submissions, status updates, and deletions.
  - `discounts`: Discount code eligibility validation, mathematical calculations, and CRUD.
- Created reusable test mocks in `test/mocks/` for TypeORM `Repository` and `DataSource`.
- Cleaned all unused imports; `npx tsc --noEmit --noUnusedLocals` passes with 0 errors.

---

## 12. Payment Integrity & Hardening

### Previous State
- **Payment spoofing vulnerability**: `POST /orders/submit` accepted a client-supplied `status: 'paid'` field — anyone with a valid token could finalize any pending order without paying.
- Order initiation returned no payment session data (a `TODO` placeholder).
- Auth endpoints had no rate limiting beyond the global 100 req/min throttle — credential-stuffing/brute-force friendly.
- Environment variables were never validated; a missing JWT secret would only surface at first request.
- `SIGTERM`/`SIGINT` were not handled; the session Redis client was never closed on shutdown.
- CI ran only a subset of unit tests and no E2E suite, contradicting project docs.

### Changes Implemented
- Introduced `PaymentsModule` with a provider-agnostic `PaymentGateway` interface (`PAYMENT_GATEWAY` token) and a deterministic `MockPaymentGateway` (`PAYMENT_PROVIDER=mock`; `fail`-prefixed references simulate rejection).
- `POST /orders` now returns a payment session (`paymentId` + `paymentUrl`) alongside the order, plus derived `orderNumber` (`ORD-<year>-<id8>`) and `payablePrice` (`finalPrice + shippingPrice`).
- `submitOrder` no longer accepts any client status: it verifies the payment reference server-side via `gateway.verifyPayment()` against the order total, finalizes only on success, and cancels the order (400) on failure/amount mismatch. The pending-order guard doubles as an idempotency check.
- Removed `status` from `SubmitOrderDto`; added `payment.gateway.spec.ts` (6 tests) and 5 new `submitOrder` unit tests (verification success, rejection, amount mismatch, client-status distrust, double-submit).
- Applied `@Throttle({ default: { limit: 5, ttl: 60000 } })` to the auth controller (5 attempts/min per IP).
- Added fail-fast Joi env validation in `AppModule` (DB, Redis, secrets, admin seed, `PAYMENT_PROVIDER`).
- Graceful shutdown: `app.enableShutdownHooks()` in `main.ts` + `AppModule implements OnApplicationShutdown` closing the session Redis client.
- CI pipeline now runs lint → build → strict TS check → full unit suite with coverage → full E2E suite, and uploads the coverage artifact.
- Project metadata: version 1.0.0, MIT license, description/keywords, `LICENSE` file, `PAYMENT_PROVIDER` in `.env.example`.

---

## 13. Async Payment Webhook & Auditable History

### Previous State
- Payment verification was pull-only (`verifyPayment` in `submitOrder`); a PSP pushing outcomes asynchronously had no endpoint.
- No persisted payment history — verification attempts left no auditable trail.

### Changes Implemented
- Added `Payment` entity (`paymentId` unique, `orderId` indexed, `amount`, `provider`, `status` pending/succeeded/failed, `rawPayload`) with migration `1762100000000-CreatePaymentsTable`.
- Added `POST /payments/webhook` (30 req/min): verifies `x-payment-signature` HMAC-SHA256 over the JSON body with `PAYMENT_WEBHOOK_SECRET` via `timingSafeEqual`, persists idempotently by `paymentId` through `PaymentsService`, and emits `payment.succeeded` / `payment.failed` so order finalization can react without a `PaymentsModule` ↔ `OrdersModule` cycle.
- `OrdersService` pull flow untouched (no new dependencies, no spec breakage); webhook is the additive push path.
- Env: `PAYMENT_WEBHOOK_SECRET` in Joi schema + `.env.example`.
- Tests: `payments.service.spec.ts` (3) + `payments.controller.spec.ts` (3) covering upsert, idempotent retry, lookup, valid/forged/missing signatures.

---

## 14. Summary Matrix

| Area | Before | After |
| :--- | :--- | :--- |
| **Password Hashing** | PBKDF2 (1,000 iterations) | Bcrypt (cost 12) + lazy migration |
| **Admin Provisioning** | Insecure CLI-only alternative | CLI seed script (`npm run seed:admin`) |
| **Demo Admin Testing** | Unserialized test endpoint leaking hash | Idempotent, sanitized `@Serialize(UserResponseDto)` with Bcrypt |
| **HTTP Security** | No helmet, open CORS, no rate limit | Helmet, parameterized CORS, Throttler (100 req/min) |
| **Inventory Check** | In-memory comparison + save | Atomic conditional SQL decrement |
| **Redis Keyspace** | Synchronous `KEYS *` | Non-blocking `scanStream` + atomic `GETDEL` |
| **Database Errors** | Unhandled 500 / leaked SQL errors | `TypeOrmExceptionFilter` (409, 404, 400) |
| **Books Controller** | 500-line monolithic controller | 4 focused controllers (Books, Titles, Characters, Bookmarks) |
| **Module Coupling** | `BooksModule` 🔁 `TagsModule` circular dependency | Clean unidirectional module dependencies |
| **Audit Logging** | Synchronous cross-module calls | Asynchronous domain events (`@nestjs/event-emitter`) |
| **View Tracking** | Base class inheritance (`BaseController`) | Declarative `@TrackRecentView()` interceptor |
| **Folder Layout** | Flat, unstructured module folders | Standardized subdirectories (`controllers/`, `services/`, `entities/`, etc.) |
| **Schema Management**| `synchronize: true` | TypeORM migrations + unified master seed |
| **Health Probes** | None | Terminus `/health` (DB, memory heap, RSS) |
| **Response Format** | Inconsistent JSON formats | Standard envelope `{ statusCode, timestamp, data }` |
| **DevOps** | None | `docker-compose.yml` + GitHub Actions CI |
| **Unit Tests** | Broken boilerplate specs | 25 suites / 145 passing unit tests |
| **E2E Tests** | None | 8 suites / 30 passing Supertest E2E tests |
| **Unused Imports** | 30+ unused imports/locals | 0 warnings (`tsc --noUnusedLocals`) |
| **Payment Flow** | Client-supplied `status` (spoofable) | Server-side gateway verification + payment sessions + signed webhook |
| **Payment History** | None | `payments` table, idempotent by `paymentId`, push + pull paths |
| **Auth Rate Limits** | Global throttle only (100 req/min) | 5 req/min on all auth endpoints |
| **Env Validation** | None (runtime failures) | Fail-fast Joi schema at boot |
| **Graceful Shutdown** | No signal handling | `enableShutdownHooks` + Redis client cleanup |
| **CI Pipeline** | Partial unit tests only | lint → build → strict check → unit+coverage → E2E |
