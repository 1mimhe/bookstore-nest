# Redis & Caching System

Documentation for Redis databases, view tracking, and shopping cart cache management.

---

## 1. Redis Databases

The application utilizes Redis 7 for three distinct purposes across multiple logical databases:

| Database index | Environment Variable | Purpose |
| :--- | :--- | :--- |
| `db 0` | `REDIS_URL` | General application cache & Keyv stores |
| `db 1` | `REDIS_VIEWS_URL` | View tracking buffers and trending counters |
| `db 2` | `REDIS_SESSION_URL` | User session storage (`connect-redis`) |

---

## 2. View Tracking Architecture

The view tracking system tracks unique visits to books, authors, publishers, and blogs without performing synchronous database writes on every page load.

### Key Schema

```
view/{entityType}/{entityId}/{viewerId}     # Deduplication key (24h TTL)
pending/{entityType}/{entityId}/views       # Buffer counter for pending DB sync
daily/{entityType}/{entityId}/{date}        # Daily view aggregate
trending/{entityType}/{period}              # Cached trending results
```

### View Recording Flow

1. Incoming request arrives with `@TrackRecentView(RecentViewTypes.Book)`.
2. Interceptor extracts `entityId` and `viewerId` (from user session or anonymous UUID cookie).
3. Redis checks `view/{entityType}/{entityId}/{viewerId}`:
   - If key exists: View is ignored (already counted in last 24h).
   - If key does not exist: Sets key with 24h TTL and increments `pending/{entityType}/{entityId}/views`.

### Non-Blocking Database Synchronization

A scheduled cron task in `ViewsService` periodically synchronizes view counters from Redis to MySQL:
- Uses Redis `scanStream` to iterate keys in batches without blocking the Redis event loop.
- Atomically reads and deletes pending counts using `GETDEL`.
- Updates MySQL view totals in batch transactions.

---

## 3. Shopping Cart Management

User shopping carts are stored in Redis (`cart:{userId}`):

```typescript
interface CartData {
  items: {
    bookId: string;
    quantity: number;
    price: number;
  }[];
  updatedAt: string;
}
```

Cart data is stored with an expiration TTL (configurable via `CART_CACHE_TIME`, default 7 days). On checkout, items are loaded from Redis, stock is validated atomically, and the cart key is cleared.
