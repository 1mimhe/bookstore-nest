# API Design & Standards

Documentation for REST conventions, response formatting, and error handling standards.

---

## 1. Standard Response Envelope

All API endpoints wrap successful responses in a standard structure via `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "timestamp": "2026-09-03T23:20:00.000Z",
  "data": {
    "id": "7b0d2d3a-2a4b-4ec2-8874-a690e75a02e1",
    "name": "Crime and Punishment"
  }
}
```

### Bypassing Response Envelope

Endpoints that return non-JSON content or require custom status formats (such as Terminus health checks) use `@BypassTransform()`:

```typescript
@Get('health')
@BypassTransform()
@HealthCheck()
check() {
  return this.health.check([...]);
}
```

---

## 2. Error Response Standards

Errors return standardized error objects:

```json
{
  "statusCode": 400,
  "timestamp": "2026-09-03T23:20:00.000Z",
  "message": [
    "name should not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Database Error Translation (`TypeOrmExceptionFilter`)

Uncaught TypeORM database exceptions are translated to standard HTTP status codes:
- **MySQL 1062 (`ER_DUP_ENTRY`)**: HTTP `409 Conflict` (e.g. unique constraint violations on email, slug, or ISBN).
- **MySQL 1452 (`ER_NO_REFERENCED_ROW_2`)**: HTTP `404 Not Found` or `400 Bad Request` (e.g. invalid foreign key references).

---

## 3. Pagination & Query Parameters

List endpoints use standardized pagination parameters:
- `page` (default: `1`, minimum: `1`)
- `limit` (default: `10`, maximum: `50`)

Swagger decorators `ApiQueryPagination` and `ApiQueryArray` standardize documentation across all controller endpoints.
