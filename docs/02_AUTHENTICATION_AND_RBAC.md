# Authentication & Role-Based Access Control

Documentation for authentication flows, session handling, and role permissions.

---

## 1. Authentication Flow

Authentication uses session-based authentication backed by Redis.

```
Client -> POST /auth/signin -> ValidationPipe -> AuthService.signin()
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                            Verify Password                       Create Session
                            (Bcrypt cost 12)                  (express-session + Redis)
                                   │                                     │
                                   └──────────────────┬──────────────────┘
                                                      ▼
                                       Set-Cookie: connect.sid (HttpOnly)
                                       Return User Profile
```

### Endpoints

- `POST /auth/signup`: Registers a customer account (`identifier`, `password`, contact details).
- `POST /auth/signin`: Authenticates via username, email, or phone number and password. Returns user data and sets an HTTP-only session cookie.
- `POST /auth/signout`: Destroys the Redis session and clears the cookie.

---

## 2. Password Security

- **Algorithm**: Bcrypt with work factor `12`.
- **Legacy Verification**: Supports on-the-fly verification of PBKDF2 hashes for existing accounts, automatically upgrading them to Bcrypt upon successful signin.

---

## 3. Role-Based Access Control (RBAC)

### User Roles

```typescript
export enum RolesEnum {
  Customer = 'customer',
  Publisher = 'publisher',
  ContentManager = 'content_manager',
  InventoryManager = 'inventory_manager',
  OrderManager = 'order_manager',
  Admin = 'admin',
}
```

### Guard Usage

Protect endpoints using `@UseGuards` with `AuthGuard` and `RolesGuard`:

```typescript
@Post()
@UseGuards(AuthGuard, RolesGuard)
@RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
createTitle(@Body() dto: CreateTitleDto) {
  return this.titlesService.create(dto);
}
```

- **`AuthGuard`**: Ensures the request contains a valid, active session.
- **`RolesGuard`**: Checks that the authenticated user possesses at least one of the roles declared in `@RequiredRoles()`.
- **`SoftAuthGuard`**: Optional authentication. Injects `req.user` if a valid session exists, but allows the request to continue anonymously otherwise.

---

## 4. Cookie Configuration

Session cookies are configured in `src/main.ts`:
- `httpOnly: true` (prevents client-side script access)
- `secure: process.env.NODE_ENV === 'production'` (requires HTTPS in production)
- `sameSite: 'lax'` (CSRF mitigation)
- `maxAge: 15 days`
