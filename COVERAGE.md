# Test Execution & Coverage Report

Test results and code coverage metrics for the Bookstore NestJS API.

---

## 1. Summary

| Test Suite | Framework | Total Suites | Total Tests | Status | Execution Time |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Unit Tests** | Jest | 2 | 11 | **PASSED** | ~11s |
| **End-to-End (E2E) Tests** | Supertest + Jest | 3 | 7 | **PASSED** | ~11s |
| **Static Analysis** | TypeScript Compiler | 1 | Full Codebase | **0 Errors / 0 Warnings** | ~8s |
| **Total Test Execution** | — | **5 Suites** | **18 Tests** | **100% PASS** | — |

---

## 2. Unit Test Results

Executed via `npm test` using Jest:

```text
PASS src/modules/orders/orders.service.spec.ts
  OrdersService
    processOrder
      √ should successfully process order with atomic inventory deduction (18 ms)
      √ should rollback and throw BadRequestException when book has insufficient stock (3 ms)
      √ should rollback and throw NotFoundException when book does not exist (2 ms)
      √ should calculate order total with percentage discount code correctly (3 ms)
      √ should calculate order total with fixed amount discount code correctly (2 ms)
      √ should throw BadRequestException when user has no active cart (2 ms)

PASS src/modules/auth/auth.service.spec.ts
  AuthService
    signin
      √ should authenticate and return user with Bcrypt hash (15 ms)
      √ should authenticate, migrate legacy PBKDF2 hash to Bcrypt, and save user (12 ms)
      √ should throw UnauthorizedException on invalid password (8 ms)
      √ should throw UnauthorizedException when user not found (2 ms)
    signup
      √ should hash password with Bcrypt and create user (14 ms)

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        11.412 s
```

### Key Scenarios Covered
- **Atomic Stock Deduction**: Validates atomic conditional decrement in SQL transaction and verifies rollback when `affectedRows === 0`.
- **Discount Code Calculation**: Validates percent vs fixed calculations and floor boundaries.
- **Bcrypt & PBKDF2 Migration**: Validates standard Bcrypt authentication as well as transparent on-the-fly migration from legacy PBKDF2 to Bcrypt (cost 12).

---

## 3. End-to-End (E2E) Test Results

Executed via `npm run test:e2e` against live NestJS HTTP instances using Supertest and an in-memory database:

```text
PASS test/health.e2e-spec.ts
  Health (e2e)
    GET /health
      √ should return 200 with status ok and bypass transform envelope (48 ms)

PASS test/auth.e2e-spec.ts
  Auth (e2e)
    Authentication Flow
      √ POST /auth/signin should fail with 400 for empty payload (52 ms)
      √ POST /auth/signin should return 401 for non-existent user (18 ms)
      √ POST /auth/signin responses should match standardized envelope (14 ms)

PASS test/catalog.e2e-spec.ts
  Catalog (e2e)
    Book Catalog
      √ GET /books should return paginated books wrapped in standardized envelope (32 ms)
      √ GET /titles/:id should set recent view cookie (24 ms)
      √ GET /books/trending should accept period query param (18 ms)

Test Suites: 3 passed, 3 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        11.46 s
```

### Key Scenarios Covered
- **Terminus Health Probes**: Validates `/health` returns `{ status: 'ok', info: { database: ..., memory_heap: ..., memory_rss: ... } }` and verifies that `@BypassTransform()` correctly bypasses the global response envelope.
- **Payload Validation & Security**: Verifies global `ValidationPipe` rejects malformed input with HTTP 400 and invalid credentials with HTTP 401.
- **Response Envelope**: Asserts that successful API responses follow `{ statusCode, timestamp, data }`.
- **Declarative View Tracking**: Asserts that `@TrackRecentView()` interceptor sets the expected tracking cookie on entity lookups.

---

## 4. Test Commands

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit test coverage analysis
npm run test:cov

# Run Supertest E2E integration test suite
npm run test:e2e

# Run TypeScript static check for unused variables and imports
npx tsc --noEmit --noUnusedLocals
```

---

## 5. Continuous Integration (CI)

All unit tests, E2E tests, and static analysis checks are automated via GitHub Actions (`.github/workflows/ci.yml`). Every commit and pull request must pass all 18 tests before merging.
