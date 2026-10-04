# Test Execution & Coverage Report

Test results and code coverage metrics for the Bookstore NestJS API.

---

## 1. Summary

| Test Suite | Framework | Total Suites | Total Tests | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Unit Tests** | Jest | 31 | 170 | **100% PASSED** |
| **End-to-End (E2E) Tests** | Supertest + Jest | 8 | 33 | **100% PASSED** |
| **Static Analysis** | TypeScript Compiler | 1 | Full Codebase | **0 Errors / 0 Warnings** |
| **Total Test Execution** | — | **39 Suites** | **203 Tests** | **100% PASS** |

---

## 2. Unit Test Results

Executed via `npm run test:cov`:

```text
Test Suites: 31 passed, 31 total
Tests:       170 passed, 170 total
Snapshots:   0 total
```

### Module Service Coverage

| Module / Component | Service / Filter / Interceptor | Tests | Status |
| :--- | :--- | :---: | :---: |
| `common/filters` | `TypeOrmExceptionFilter` | 6 | PASS |
| `common/interceptors` | `RecentViewsInterceptor` | 3 | PASS |
| `common/interceptors` | `SerializeInterceptor` | 3 | PASS |
| `common/interceptors` | `TransformInterceptor` | 3 | PASS |
| `common/services` | `CookieService` | 6 | PASS |
| `common/logging` | `JsonLogger` | 4 | PASS |
| `common/middlewares` | `RequestIdMiddleware` | 2 | PASS |
| `auth` | `AuthService` | 8 | PASS |
| `authors` | `AuthorsService` | 7 | PASS |
| `blogs` | `BlogsService` | 5 | PASS |
| `books` | `BooksService` | 5 | PASS |
| `books` | `TitlesService` | 4 | PASS |
| `collections` | `CollectionsService` | 6 | PASS |
| `discount-codes` | `DiscountCodesService` | 8 | PASS |
| `languages` | `LanguagesService` | 4 | PASS |
| `health` | `HealthAlertService` | 4 | PASS |
| `metrics` | `MetricsService` | 2 | PASS |
| `metrics` | `MetricsInterceptor` | 3 | PASS |
| `metrics` | `MetricsController` | 1 | PASS |
| `orders` | `OrdersService` | 19 | PASS |
| `payments` | `MockPaymentGateway` | 6 | PASS |
| `payments` | `PaymentsService` | 3 | PASS |
| `payments` | `PaymentsController` (webhook) | 3 | PASS |
| `publishers` | `PublishersService` | 6 | PASS |
| `reviews` | `ReviewsService` | 7 | PASS |
| `staffs` | `StaffsService` | 4 | PASS |
| `tags` | `TagsService` | 6 | PASS |
| `tickets` | `TicketsService` | 6 | PASS |
| `token` | `TokenService` | 6 | PASS |
| `users` | `UsersService` | 8 | PASS |
| `views` | `ViewsService` | 8 | PASS |

---

## 3. End-to-End (E2E) Test Results

Executed via `npm run test:e2e` against NestJS HTTP instances using Supertest:

```text
PASS test/health.e2e-spec.ts
PASS test/auth.e2e-spec.ts
PASS test/collections.e2e-spec.ts
PASS test/reviews.e2e-spec.ts
PASS test/catalog.e2e-spec.ts
PASS test/orders.e2e-spec.ts
PASS test/discounts.e2e-spec.ts
PASS test/tickets.e2e-spec.ts

Test Suites: 8 passed, 8 total
Tests:       33 passed, 33 total
Snapshots:   0 total
```

### Key Scenarios Covered
- **Health Probes (`test/health.e2e-spec.ts`)**: Terminus system health monitoring, database ping, memory heap, and memory RSS validation.
- **Authentication (`test/auth.e2e-spec.ts`)**: Signin validation, credential verification, JWT cookie dispatch, refresh flows, and portfolio demo admin provisioning.
- **Catalog Browsing (`test/catalog.e2e-spec.ts`)**: Books pagination, detail lookups, trending entities, and view cookie attachment.
- **Cart & Orders (`test/orders.e2e-spec.ts`)**: Adding books to cart, inventory tracking, removing items, checkout initiation, server-side payment verification on submit, order history, lookup by order number, pending-order cancel, and delivered-order return.
- **Payment Gateway (`src/modules/payments/payment.gateway.spec.ts`)**: Payment session creation, amount-bound verification, rejection handling (`fail` prefix), unknown-reference rejection, and amount-mismatch detection.
- **Reviews & Feedback (`test/reviews.e2e-spec.ts`)**: Review creation, polymorphic target linking, reactions (like/love), and review deletion.
- **Curated Collections (`test/collections.e2e-spec.ts`)**: Collection creation, public listing, slug lookups, and deletion.
- **Customer Support Tickets (`test/tickets.e2e-spec.ts`)**: Support ticket creation, query filtering, staff status updates, and soft deletion.
- **Discount Codes (`test/discounts.e2e-spec.ts`)**: Code eligibility check, mathematical discount application, code creation, and listing.

---

## 4. Test Commands

```bash
# Run unit tests
npm test

# Run unit tests with coverage report
npm run test:cov

# Run Supertest E2E integration test suite
npm run test:e2e

# Run TypeScript static check for unused variables and imports
npx tsc --noEmit --noUnusedLocals

# Run ESLint across source and test files
npm run lint
```
