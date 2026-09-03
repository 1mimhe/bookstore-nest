<div align="center">

<img src="./public/Bookstore-Logo.png" alt="HamBaar Logo" width="200">
</br>
</br>

# Bookstore NestJS API

**A comprehensive, feature-rich, event-driven, and scalable bookstore API built with NestJS**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</br>

[![](https://img.shields.io/badge/Database%20Schema-8A2BE2?style=for-the-badge)](https://dbdiagram.io/d/hambaar-db-686b7b0cf413ba350893efca)
[![](https://img.shields.io/badge/Refactoring%20Report-00B4D8?style=for-the-badge)](./REFACTOR.md)

</div>

---

> [!IMPORTANT]
> ### 🚀 Comprehensive Architectural Modernization & Refactoring
> This codebase has undergone a full-scale enterprise architectural overhaul. The modernization addressed legacy technical debt, tightened security, resolved high-concurrency race conditions, decoupled monolithic controllers, and introduced an event-driven domain architecture.
> 
> **Key Modernization Highlights:**
> - **🔐 Security & Authentication**: Bcrypt (cost 12) with transparent PBKDF2 migration, removal of backdoor admin endpoints, Helmet HTTP security headers, CORS sanitization, and Throttler rate limiting (100 req/min).
> - **⚡ High-Concurrency Safety**: Atomic conditional SQL inventory deductions (`stock >= :quantity`) eliminating checkout overselling race conditions; non-blocking Redis `scanStream` iteration and atomic `GETDEL`.
> - **🧩 Decoupled Domain Architecture**: Decomposition of monolithic `BooksController` into dedicated REST resources (`Books`, `Titles`, `Characters`, `Bookmarks`); elimination of module circular dependencies.
> - **📡 Event-Driven Architecture (`@nestjs/event-emitter`)**: Typed domain events (`TitleCreatedEvent`, `BookCreatedEvent`, `OrderPlacedEvent`) with asynchronous out-of-band audit logging via `StaffAuditListener`.
> - **🎯 Controller Composition**: Elimination of the legacy `BaseController` inheritance anti-pattern in favor of idiomatic `RecentViewsInterceptor` and declarative `@TrackRecentView()` decorators.
> - **🩺 Cloud-Native Observability**: Standardized `@nestjs/terminus` health probes at `/health` (MySQL ping, heap, and RSS checks) and global API response envelopment (`TransformInterceptor`).
> - **🚢 DevOps & CI/CD**: Multi-container `docker-compose.yml` (MySQL 8 + Redis 7 + NestJS API), automated GitHub Actions CI pipeline, and TypeORM CLI migration support.
> - **🧪 Quality Assurance**: 100% passing Supertest E2E integration test suites and strict compiler verification (`tsc --noUnusedLocals`).
> 
> 📖 **Read the comprehensive deep-dive report: [REFACTOR.md](./REFACTOR.md)**

---

## ✨ Core Features

- **🔐 Authentication & Authorization** - Session-based and token auth with role-based access control and Bcrypt security
- **📖 Complete Book Management** - Titles, books, authors, publishers, and characters
- **🏷️ Tagging System** - Tags with different types and root tag management
- **📝 Content Management** - Blogs, reviews, and collections
- **🛒 E-commerce Integration** - Cart management, race-condition-safe atomic order processing, and discount codes
- **⭐ Review & Rating System** - Multi-entity reviews with reactions and replies
- **📊 Real-time Analytics** - Non-blocking Redis views tracking and trending content
- **🔖 Bookmark System** - Multi-type bookmarking for users (read, loved, library)
- **🎫 Support Ticket System** - For customer support inquiries and issue tracking
- **📡 Event-Driven Domain Processing** - Asynchronous domain events for out-of-band audit logging
- **🩺 Cloud-Native Health Probes** - Terminus `/health` endpoint for database and memory liveness/readiness
- **📦 Standardized API Envelope** - Uniform `{ statusCode, timestamp, data }` response formatting
- **📈 Redis-powered Performance** - Caching, cart storage, and session management

---

## 🗄️ Database Schema

### Key Tables Overview

| Schema | Table | Purpose |
|--------|--------|---------|
| **user** | `users` | Core user information and authentication |
|| `contacts` | User contact details (email, phone) |
|| `roles` | User role assignments (customer, admin, etc.) |
|| `addresses` | User shipping and billing addresses |
|| `staff` | Staff member details and employment info |
|| `staff_actions` | Audit log of all staff actions (populated via domain events) |
|| `bookmarks` | User bookmarks (read, loved, library) |
|| `orders` | Order management and tracking |
|| `order_book` | Order line items with price snapshots |
| **book** | `titles` | Literary titles (names, synopses) |
|| `books` | Physical editions (formats, ISBN, stock, price) |
|| `authors` | Author and translator information |
|| `publishers` | Publisher profiles |
|| `languages` | Supported languages |
|| `tags` | Categorization tags |
|| `characters` | Book characters |
|| `collections` | Curated book collections |
| **public** | `blogs` | Blog posts and articles |
|| `reviews` | User reviews and ratings |
|| `discount_codes` | Promotional discount codes |
|| `book_requests` | User book requests |

### Entity Relationships

#### User Management
- **Users** have multiple **contacts**, **roles**, **addresses**
- **Staff** extends users with employment details
- **Staff Actions** track all staff operations with an asynchronous audit trail

#### Book Structure
- **Titles** represent a literary work (e.g., *Crime and Punishment*)
- **Books** represent physical editions (publisher, language, format, stock)
- **Authors** write titles and translate books
- **Publishers** publish physical book editions and author blogs

#### Content & Reviews
- **Reviews** support nested replies and reactions
- **Blogs** can be linked to titles, authors, or publishers
- **Tags** categorize both titles and blogs with polymorphic types

#### E-commerce
- **Orders** contain multiple **order_book** items, decremented with atomic SQL updates
- **Discount codes** support percentage and fixed amount types
- **Bookmarks** allow users to categorize books (read/loved/library)

### Enums & Data Types

```sql
-- User Roles
ENUM rolesEnum {
  'customer', 'publisher', 'content_manager', 
  'inventory_manager', 'order_manager', 'admin'
}

-- Book Physical Properties
ENUM quartos {
  'vaziri', 'roqee', 'jibi', 'rahli', 
  'kheshti', 'paltoyi', 'sultani'
}

ENUM covers {
  'shoomiz', 'kaqazi', 'sakht', 'charmi'
}

-- Order Status Flow
ENUM orderStatuses {
  'pending' -> 'processing' -> 'shipped' -> 'delivered'
  'pending' -> 'canceled'
  'delivered' -> 'returned'
}

-- Review Reactions
ENUM reactionsEnum {
  'like', 'dislike', 'love', 'fire', 'tomato'
}

-- Tag Categories
ENUM tagType {
  'thematic_category', 'story_type', 'featured_books',
  'literature_award', 'age_group', 'mood_theme', etc.
}
```

---

## 🔧 Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: [MySQL](https://www.mysql.com/) 8.0 with [TypeORM](https://typeorm.io/)
- **Caching & Sessions**: [Redis](https://redis.io/) 7.0 via `ioredis` & `keyv`
- **Authentication**: Bcrypt (cost 12), PBKDF2 migration, secure cookies, and Redis sessions
- **Event Architecture**: `@nestjs/event-emitter`
- **Health Checks**: `@nestjs/terminus`
- **Security**: `@nestjs/throttler`, `helmet`, `class-validator`, `class-transformer`
- **Documentation**: Swagger / OpenAPI 3.0
- **Testing**: Jest, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions CI

---

## 📋 Prerequisites

- **Node.js** (v18 or higher; v20 LTS recommended)
- **MySQL** (v8.0 or higher)
- **Redis** (v6.0 or higher; v7.0 recommended)
- **Docker & Docker Compose** (optional, recommended for local dev)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/1mimhe/bookstore-nest
cd bookstore-nest
```

### 2. Environment Setup

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Review and customize configuration values as needed:

```env
# Application Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=mysql
DB_NAME=bookstore-db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_VIEWS_URL=redis://localhost:6379/1
REDIS_SESSION_URL=redis://localhost:6379/2

# Security & Secrets
JWT_ACCESS_SECRET_KEY=your-jwt-access-secret-key-min-32-chars
JWT_REFRESH_SECRET_KEY=your-jwt-refresh-secret-key-min-32-chars
SESSION_SECRET=your-session-secret-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-key-min-32-chars

# Initial Administrator Seed Credentials
ADMIN_EMAIL=admin@hambaar.local
ADMIN_PASSWORD=AdminSecurePassword123!
```

---

### 3. Installation & Setup

#### Option A: Docker Compose (Fastest & Recommended)
```bash
# Start MySQL 8, Redis 7, and the NestJS API container in one command
docker compose up -d

# Run the master database seeder (Languages, Tags, Admin user)
docker compose exec api npm run seed
```

The API is now running at `http://localhost:3000` and Swagger docs at `http://localhost:3000/docs`.

#### Option B: Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Run master database seeding (Languages, Tags, and Admin user)
npm run seed

# 3. Start the development server
npm run start:dev
```

---

## 📁 Project Structure

```
bookstore-nest/
├── 📁 .github/                       # GitHub Actions CI/CD workflows
│   └── 📁 workflows/
│       └── 📄 ci.yml
├── 📁 dist/                          # Compiled production output
├── 📁 src/                           # Application source code
│   ├── 📄 main.ts                    # Application bootstrap & middleware pipeline
│   ├── 📄 data-source.ts             # TypeORM standalone DataSource for CLI migrations
│   ├── 📁 common/                    # Shared core infrastructure
│   │   ├── 📁 decorators/            # @TrackRecentView, @CurrentUser, @Roles, etc.
│   │   ├── 📁 enums/                 # EventNames, ErrorMessages, DBErrors, etc.
│   │   ├── 📁 events/                # Centralized domain event declarations
│   │   ├── 📁 filters/               # TypeOrmExceptionFilter (MySQL 1062, 1452)
│   │   ├── 📁 interceptors/          # TransformInterceptor, RecentViewsInterceptor
│   │   ├── 📁 services/              # CookieService
│   │   ├── 📁 types/                 # RecentViewTypes, common interfaces
│   │   └── 📁 utilities/             # Helper functions, slug generation
│   ├── 📁 database/                  # Database seeds & migrations
│   │   ├── 📁 migrations/            # Version-controlled TypeORM migrations
│   │   └── 📁 seeds/                 # admin.seed.ts, master.seed.ts
│   └── 📁 modules/                   # Feature domain modules
│       ├── 📁 app/                   # App root module configuration
│       ├── 📁 auth/                  # Authentication, guards, Bcrypt hashing
│       ├── 📁 authors/               # Authors management
│       ├── 📁 blogs/                 # Blog articles and content
│       ├── 📁 books/                 # Books, Titles, Characters, Bookmarks
│       │   ├── 📁 dtos/              # Data transfer objects
│       │   ├── 📁 entities/          # Book, Title, Character, Bookmark entities
│       │   ├── 📄 books.controller.ts
│       │   ├── 📄 titles.controller.ts
│       │   ├── 📄 characters.controller.ts
│       │   └── 📄 bookmarks.controller.ts
│       ├── 📁 collections/           # Curated book collections
│       ├── 📁 discount-codes/        # Promo & discount codes
│       ├── 📁 health/                # Terminus liveness/readiness probes (/health)
│       ├── 📁 languages/             # Supported languages
│       ├── 📁 orders/                # Orders and atomic checkout processing
│       ├── 📁 publishers/            # Publishing house profiles
│       ├── 📁 reviews/               # Polymorphic review system
│       ├── 📁 staffs/                # Staff management & StaffAuditListener
│       ├── 📁 tags/                  # Categorization tags
│       ├── 📁 token/                 # Token verification utilities
│       ├── 📁 users/                 # User profiles, addresses, contacts
│       └── 📁 views/                 # Non-blocking Redis views tracking
├── 📁 test/                          # Comprehensive Supertest E2E test suites
│   ├── 📁 mocks/                     # Reusable repository & data source mocks
│   ├── 📄 auth.e2e-spec.ts           # Authentication & response envelope E2E
│   ├── 📄 catalog.e2e-spec.ts        # Catalog pagination & cookie view tracking E2E
│   ├── 📄 health.e2e-spec.ts         # Terminus health probe E2E
│   └── 📄 jest-e2e.json              # E2E Jest configuration
├── 📄 docker-compose.yml             # Local multi-service orchestration
├── 📄 Dockerfile                     # Container build manifest
├── 📄 REFACTOR.md                    # Deep-dive architectural refactoring report
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 🧪 Testing & Quality Assurance

The codebase includes both unit testing and end-to-end (E2E) integration test suites running against the live NestJS application pipeline:

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit test coverage report
npm run test:cov

# Run full Supertest E2E integration test suite
npm run test:e2e

# Run strict TypeScript static analysis (0 warnings / 0 unused locals)
npx tsc --noEmit --noUnusedLocals
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**: Public user registration (`/auth/signup`). Staff and Publisher accounts are provisioned securely by Administrators.
2. **Login (`/auth/signin`)**: Accepts identifier (email, username, or phone number) and password. Authenticates via Bcrypt (with automatic migration from legacy PBKDF2), establishes an HTTP-only secure cookie session backed by Redis.
3. **Logout (`/auth/signout`)**: Destroys the Redis session and clears the session cookie.

### Guard System

- **Auth Guard (`@UseGuards(AuthGuard)`)**: Enforces an active, authenticated session.
- **Role Guard (`@UseGuards(RolesGuard)` + `@RequiredRoles(...)`)**: Checks user role assignments against route requirements.
- **Soft Auth Guard (`@UseGuards(SoftAuthGuard)`)**: Optional authentication—injects the current user if authenticated, but allows anonymous access otherwise.

### Role Hierarchy

| Role | Key Permissions |
|------|----------------|
| **Customer** | Browse catalog, post reviews, bookmark, place orders, create collections |
| **Publisher** | Publish editions, manage book metadata, author blogs |
| **Content Manager** | Curate content, manage authors, collections, categories, tags |
| **Inventory Manager** | Update book inventory, prices, formats, discount codes |
| **Order Manager** | Manage order fulfillment, status transitions, shipments, refunds |
| **Admin** | Full system access, staff management, administrative oversight |

---

## 🔄 Redis Integration

### View Tracking Architecture

```
Redis Key Structure:
├── view/{entityType}/{entityId}/{viewerId}     # 24h deduplication per viewer
├── pending/{entityType}/{entityId}/views       # Non-blocking buffer for DB sync
├── daily/{entityType}/{entityId}/{date}        # Daily view counts (30 days)
└── trending/{entityType}/{period}              # Cached trending results
```

- **Non-blocking Iteration**: Uses `scanStream` cursors instead of blocking `KEYS *` commands.
- **Periodic Sync**: Cron job flushes buffered views from Redis to MySQL in batches.
- **Anonymous Tracking**: Supported through secure UUID-based visitor cookies.

---

## 🩺 Health Checks & Observability

The API provides standardized health probes at `/health`:

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

---

## 📝 API Documentation

Interactive Swagger / OpenAPI 3.0 documentation is available when running the application:

```
http://localhost:3000/docs
```

---

## 📦 Database Migrations & Seeding

```bash
# Generate a new migration from TypeORM entity changes
npm run migration:generate -- src/database/migrations/YourMigrationName

# Run pending migrations
npm run migration:run

# Revert the last applied migration
npm run migration:revert

# Seed all initial data (Languages, Tags, Admin user)
npm run seed

# Seed admin user independently (reads from ADMIN_EMAIL / ADMIN_PASSWORD)
npm run seed:admin
```

---

## 📞 Support & Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Implement AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with ❤️ by Mohammad Hosseini</b>
</div>