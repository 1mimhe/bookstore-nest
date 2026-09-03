# Database & Data Model

Documentation for TypeORM entities, relationships, migrations, and concurrency controls.

---

## 1. Relational Entities Overview

The database uses MySQL 8.0 managed via TypeORM.

```
                  ┌──────────────┐
                  │    users     │
                  └──────┬───────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ contacts  │  │   roles   │  │ addresses │
    └───────────┘  └───────────┘  └───────────┘
          ▲
          │
    ┌───────────┐         ┌───────────┐
    │  orders   ├────────►│order_book │
    └───────────┘         └─────┬─────┘
                                │
                                ▼
    ┌───────────┐         ┌───────────┐
    │  titles   │◄────────┤   books   │
    └─────┬─────┘         └───────────┘
          │
    ┌─────┴─────┬─────────────┐
    ▼           ▼             ▼
┌───────┐ ┌───────────┐ ┌───────────┐
│authors│ │publishers │ │characters │
└───────┘ └───────────┘ └───────────┘
```

---

## 2. Core Entities

### User Domain
- **`User`**: Base identity (username, password hash, status).
- **`Contact`**: Email and phone numbers.
- **`Role`**: Role enum assignments.
- **`Address`**: Shipping and billing addresses.
- **`Staff`**: Employment records and administrative profiles.
- **`StaffAction`**: Audit trail records linked to staff actions.

### Catalog Domain
- **`Title`**: The literary work (title name, slug, summary).
- **`Book`**: Physical edition of a title (ISBN, quarto, cover, price, stock).
- **`Author`**: Author profiles with many-to-many relationships to titles and translations.
- **`Publisher`**: Publishing houses linked to physical book editions.
- **`Language`**: Supported language codes and names.
- **`Tag`**: Categorization tags organized by `TagType` and hierarchical root tags.
- **`Character`**: Characters associated with specific titles.
- **`Collection`**: Curated book lists created by staff or customers.

### E-Commerce & Content
- **`Order`**: Purchase orders with status tracking (`pending`, `processing`, `shipped`, `delivered`, `canceled`).
- **`OrderBook`**: Order line items capturing snapshot price and quantity.
- **`DiscountCode`**: Promotional codes supporting percentage or fixed amount discounts.
- **`Blog`**: Articles authored by staff or publishers.
- **`Review`**: Polymorphic reviews for books, blogs, authors, or publishers, supporting replies and reactions.
- **`Ticket`**: Customer support tickets.

---

## 3. Atomic Concurrency Control

To prevent overselling when multiple users purchase the same book edition simultaneously, inventory updates are performed atomically in `OrdersService`:

```sql
UPDATE books 
SET stock = stock - :quantity 
WHERE id = :id AND stock >= :quantity
```

If `affectedRows === 0`, the stock check fails, and the transaction rolls back with a `400 Bad Request`.

---

## 4. Migrations & Seeding

### Standalone DataSource (`src/data-source.ts`)

TypeORM CLI commands use `src/data-source.ts`, which reads environment variables via `dotenv`:

```bash
# Generate a migration from entity differences
npm run migration:generate -- src/database/migrations/NameOfMigration

# Run pending migrations
npm run migration:run

# Revert last applied migration
npm run migration:revert
```

### Seeding Pipeline

Seeders are located in `src/database/seeds/`:
- `languages.seed.ts`: Inserts standard language records.
- `tags.seed.ts`: Inserts default category and theme tags.
- `admin.seed.ts`: Creates the initial administrator account.
- `master.seed.ts`: Executes all seeders in sequence (`npm run seed`).
