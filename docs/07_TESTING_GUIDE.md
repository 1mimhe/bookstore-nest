# Testing Guide

Instructions for running unit tests, integration tests, and static checks.

---

## 1. Test Architecture

The testing setup consists of two layers:
1. **Unit Tests** (`*.service.spec.ts`): Fast, isolated tests mocking TypeORM repositories and external dependencies using helpers in `test/mocks/`.
2. **End-to-End (E2E) Tests** (`test/*.e2e-spec.ts`): Integration tests running against the live NestJS application pipeline with Supertest and an in-memory database.

---

## 2. Test Execution Commands

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run code coverage analysis
npm run test:cov

# Run full Supertest E2E suite
npm run test:e2e

# Run strict TypeScript compiler verification (checks for unused imports/variables)
npx tsc --noEmit --noUnusedLocals
```

---

## 3. Test Mocks

Located in `test/mocks/`:
- **`createMockRepository()`**: Returns a typed mock repository with stubbed methods (`findOne`, `save`, `delete`, `createQueryBuilder`).
- **`createMockDataSource()`**: Returns a mock DataSource providing a transactional `QueryRunner`.

---

## 4. Test Results & Metrics

Detailed test output, pass rates, and coverage metrics are documented in [COVERAGE.md](../COVERAGE.md).
