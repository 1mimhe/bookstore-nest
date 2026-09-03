<div align="center">

<img src="./public/Bookstore-Logo.png" alt="HamBaar Logo" width="200">
</br>
</br>

# Bookstore NestJS API

**A modular, event-driven bookstore and e-commerce API built with NestJS**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</br>

[![](https://img.shields.io/badge/Database%20Schema-8A2BE2?style=for-the-badge)](https://dbdiagram.io/d/hambaar-db-686b7b0cf413ba350893efca)
[![](https://img.shields.io/badge/Refactoring%20Notes-00B4D8?style=for-the-badge)](./REFACTOR.md)
[![](https://img.shields.io/badge/Test%20Coverage-2EA44F?style=for-the-badge)](./COVERAGE.md)

</div>

---

> [!NOTE]
> ### 📋 Project Documentation & Refactoring Notes
> - **Architecture & Refactoring Decisions**: Documented in [REFACTOR.md](./REFACTOR.md).
> - **Test Results & Coverage**: Documented in [COVERAGE.md](./COVERAGE.md).
> - **Developer Guides**: See the complete [Documentation Index](#-documentation).

---

## 📚 Documentation

Technical guides for developing, testing, and running the Bookstore API:

- [System Architecture](./docs/01_SYSTEM_ARCHITECTURE.md) - Architecture diagrams, module layout, and request lifecycle.
- [Authentication & RBAC](./docs/02_AUTHENTICATION_AND_RBAC.md) - Session management, Bcrypt hashing, and role permissions.
- [Database & Data Model](./docs/03_DATABASE_AND_DATA_MODEL.md) - Entities, relationships, atomic inventory operations, and migrations.
- [Redis & Caching System](./docs/04_REDIS_AND_CACHE_SYSTEM.md) - View tracking, non-blocking scan streams, and cart storage.
- [API Design & Standards](./docs/05_API_DESIGN_AND_STANDARDS.md) - REST conventions, standardized response envelopes, and error mapping.
- [Event-Driven Architecture](./docs/06_EVENT_DRIVEN_ARCHITECTURE.md) - Domain events, event names constants, and asynchronous listeners.
- [Testing Guide](./docs/07_TESTING_GUIDE.md) - Unit tests, Supertest E2E tests, and mock infrastructure.
- [DevOps & Deployment](./docs/08_DEVOPS_AND_DEPLOYMENT.md) - Docker Compose, environment variables, health probes, and CI/CD.

---

## ✨ Core Features

- **🔐 Authentication & Authorization** - Session-based authentication with role-based access control (RBAC) and Bcrypt password security
- **📖 Book Management** - Titles, physical book editions, authors, publishers, and characters
- **🏷️ Tagging System** - Hierarchical category tags with root tag management
- **📝 Content Management** - Blogs, reviews, and curated collections
- **🛒 E-commerce** - Cart management, race-condition-safe atomic order processing, and discount codes
- **⭐ Review System** - Multi-entity reviews with replies and emoji reactions
- **📊 Real-time Analytics** - Non-blocking Redis view tracking and trending content
- **🔖 Bookmarks** - User bookmarks (reading lists, favorites, personal libraries)
- **🎫 Support Tickets** - Customer support inquiry handling
- **📡 Event-Driven Processing** - Asynchronous domain events for decoupled audit logging
- **🩺 Health Probes** - Terminus `/health` endpoint checking MySQL and memory thresholds
- **📦 Standard Response Envelope** - Uniform `{ statusCode, timestamp, data }` responses

---

## 🗄️ Database Schema

### Key Tables Overview

| Schema | Table | Purpose |
|--------|--------|---------|
| **user** | `users` | Core user credentials and status |
|| `contacts` | User contact details (email, phone) |
|| `roles` | User role assignments (customer, admin, etc.) |
|| `addresses` | User shipping and billing addresses |
|| `staff` | Staff profiles and employment details |
|| `staff_actions` | Audit log populated via domain events |
|| `bookmarks` | User bookmarks (read, loved, library) |
|| `orders` | Order management and tracking |
|| `order_book` | Order line items with price snapshots |
| **book** | `titles` | Literary titles (names, synopses) |
|| `books` | Physical editions (formats, ISBN, stock, price) |
|| `authors` | Author and translator records |
|| `publishers` | Publisher profiles |
|| `languages` | Supported languages |
|| `tags` | Categorization tags |
|| `characters` | Book characters |
|| `collections` | Curated collections |
| **public** | `blogs` | Blog articles |
|| `reviews` | User reviews and ratings |
|| `discount_codes` | Promotional discount vouchers |
|| `book_requests` | Customer book requests |

### Entity Relationships

#### User Management
- **Users** have multiple **contacts**, **roles**, and **addresses**.
- **Staff** extends users with employment metadata.
- **Staff Actions** record administrative operations asynchronously via domain events.

#### Book Structure
- **Titles** represent the literary work.
- **Books** represent physical editions (formats, ISBN, stock, price).
- **Authors** write titles and translate editions.
- **Publishers** release editions and publish blog posts.

#### Content & Reviews
- **Reviews** support replies and reactions.
- **Blogs** link to titles, authors, or publishers.
- **Tags** categorize titles and blogs.

#### E-commerce
- **Orders** contain multiple **order_book** items, decremented with atomic conditional SQL statements.
- **Discount codes** support percentage and fixed amount types.

---

## 🔧 Technology Stack

- **Framework**: NestJS v11
- **Database**: MySQL 8.0 with TypeORM
- **Cache & Sessions**: Redis 7.0 via `ioredis` & `keyv`
- **Authentication**: Bcrypt (cost 12), secure HTTP-only cookies, Redis sessions
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
- **Docker & Docker Compose** (optional, recommended for local setup)

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

Review and adjust configuration values as needed.

### 3. Installation & Setup

#### Option A: Docker Compose (Recommended)
```bash
# Start MySQL 8, Redis 7, and NestJS API containers
docker compose up -d

# Run master database seeder (Languages, Tags, Admin user)
docker compose exec api npm run seed
```

The API is accessible at `http://localhost:3000` and Swagger documentation at `http://localhost:3000/docs`.

#### Option B: Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Run database seeders
npm run seed

# 3. Start development server
npm run start:dev
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run code coverage report
npm run test:cov

# Run Supertest E2E integration test suite
npm run test:e2e

# Run strict TypeScript compiler verification
npx tsc --noEmit --noUnusedLocals
```

Full test metrics and passing test suites are documented in [COVERAGE.md](./COVERAGE.md).

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration (`POST /auth/signup`)**: Creates customer account. Staff and Publisher accounts are provisioned by Administrators.
2. **Login (`POST /auth/signin`)**: Authenticates via identifier and password, establishing an HTTP-only secure cookie session backed by Redis.
3. **Logout (`POST /auth/signout`)**: Destroys the session and clears the cookie.

### Guard System

- **`AuthGuard`**: Enforces an active, authenticated session.
- **`RolesGuard`**: Checks user roles against route requirements declared with `@RequiredRoles(...)`.
- **`SoftAuthGuard`**: Optional authentication that injects current user context when available.

---

## 🩺 Health Checks & Observability

Standardized Terminus health probes are exposed at `/health`:

```bash
curl http://localhost:3000/health
```

Monitors:
- Database connectivity (`TypeOrmHealthIndicator`)
- Memory heap limit (`MemoryHealthIndicator`)
- Memory RSS limit (`MemoryHealthIndicator`)

---

## 📝 API Documentation

Interactive Swagger documentation is available when running the application:

```
http://localhost:3000/docs
```

---

## 📦 Database Migrations & Seeding

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/YourMigrationName

# Run pending migrations
npm run migration:run

# Revert last applied migration
npm run migration:revert

# Run full database seed pipeline (Languages, Tags, Admin)
npm run seed

# Seed admin user independently
npm run seed:admin
```

---

## 📞 Support & Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/name`)
3. Commit your changes (`git commit -m "Implement feature"`)
4. Push to the branch (`git push origin feature/name`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built by Mohammad Hosseini</b>
</div>