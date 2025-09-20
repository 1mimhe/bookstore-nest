<div align="center">

<img src="./public/Bookstore-Logo.png" alt="HamBaar Logo" width="200">
</br>
</br>

# Bookstore NestJS API

**A comprehensive, feature-rich and scalable bookstore API built with NestJS**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</br>

[![](https://img.shields.io/badge/Database%20Schema-8A2BE2?style=for-the-badge)](https://dbdiagram.io/d/hambaar-db-686b7b0cf413ba350893efca)

</div>

---

## ✨ Core Features

- **🔐 Authentication & Authorization** - JWT-based auth with role-based access control
- **📖 Complete Book Management** - Titles, books, authors, publishers, and characters
- **🏷️ Tagging System** - Tags with different types and root tag management
- **📝 Content Management** - Blogs, reviews, and collections
- **🛒 E-commerce Integration** - Cart management, orders, and discount codes
- **⭐ Review & Rating System** - Multi-entity reviews with reactions and replies
- **📊 Real-time Analytics** - Views tracking and trending content
- **🔖 Bookmark System** - Multi-type bookmarking for users
- **🎫 Support Ticket System** - For customer support
- **📈 Redis-powered Performance** - Caching and session management

## 🗄️ Database Schema

### Key Tables Overview

| Schema | Table | Purpose |
|--------|--------|---------|
| **user** | `users` | Core user information and authentication |
|| `contacts` | User contact details (email, phone) |
|| `roles` | User role assignments (customer, admin, etc.) |
|| `addresses` | User shipping and billing addresses |
|| `staff` | Staff member details and employment info |
|| `staff_actions` | Audit log of all staff actions |
|| `bookmarks` | User bookmarks (read, loved, library) |
|| `orders` | Order management and tracking |
|| `order_book` | Order line items |
| **book** | `titles` | Book titles (names) |
|| `books` | Physical book editions |
|| `authors` | Author information |
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
- **Staff Actions** track all staff operations with audit trail

#### Book Structure
- **Titles** represent a specific book (e.g., Crime and Punishment)
- **Books** are specific editions (publisher, language, format)
- **Authors** can write titles and translate books
- **Publishers** publish books and create blogs

#### Content & Reviews
- **Reviews** support nested replies and reactions
- **Blogs** can be linked to titles, authors, or publishers
- **Tags** categorize both titles and blogs with types

#### E-commerce
- **Orders** contain multiple **order_book** items
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

## 🔧 Technology Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI
- **Validation and Serialization**: class-validator & class-transformer
- **Task Scheduling**: @nestjs/schedule (Cron)
- **Session Management**: express-session
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- Docker & Docker Compose (optional)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/1mimhe/bookstore-nest
cd bookstore-nest-api
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Application Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (DB_HOST and DB_PORT optional - uses defaults)
#DB_HOST=localhost
#DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=mysql
DB_NAME=bookstore-db

# Redis Configuration (Multiple databases for different purposes)
REDIS_URL=redis://:@localhost:6379/0
REDIS_VIEWS_URL=redis://:@localhost:6379/1
REDIS_SESSION_URL=redis://:@localhost:6379/2

# JWT & Security Configuration
JWT_ACCESS_SECRET_KEY=hX84hTxLXocJn7J1HCfpL6XLVPNw3X9i
JWT_REFRESH_SECRET_KEY=INCH3yhAx0ixMOHzXjHSlWrIKTG4UaDQ
SESSION_SECRET=Z3lp5qo3gYMNI85wUXYdtvkJByxUeTjC
COOKIE_SECRET=4i2MMy3piw8jIenh1l4XbltiHOOryDwj

# Optional Configuration (uncomment to customize)
# COOKIE_MAX_AGE=1296000000  # 15 days in milliseconds  
# CART_CACHE_TIME=604800     # 7 days in seconds
# MAX_RECENT_VIEWS=20        # Maximum recent views per user
```

### 3. Installation & Setup

```bash
# Install dependencies
npm install

# Run database seeders
npm run seen

# Start the development server
npm run start:dev
```

## 📁 Project Structure

```
bookstore-nest/
├── 📁 dist/                          # Compiled output
├── 📁 node_modules/                  # Dependencies
├── 📁 src/                           # Source code
│   ├── 📄 main.ts                    # Entry point
│   ├── 📁 common/                    # Shared utilities
│   │   ├── 📁 decorators/            # Custom decorators
│   │   ├── 📁 enums/                 # Shared enums
│   │   ├── 📁 types/                 # Type definitions
│   │   └── 📁 utilities/             # Helper functions
│   └── 📁 modules/                   # Feature modules
│       ├── 📁 app/                   # App configuration
│       ├── 📁 auth/                  # Authentication
│       │   ├── 📁 dtos/
│       │   └── 📁 guards/
│       ├── 📁 authors/               # Authors management
│       │   └── 📁 dtos/
│       ├── 📁 blogs/                 # Blog posts
│       │   └── 📁 dtos/
│       ├── 📁 books/                 # Books management
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       ├── 📁 collections/           # Book collections
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       ├── 📁 discount-codes/        # Discount codes
│       │   └── 📁 dtos/
│       ├── 📁 languages/             # Language management
│       ├── 📁 orders/                # Order management
│       │   ├── 📁 dto/
│       │   └── 📁 entities/
│       ├── 📁 publishers/            # Publishers
│       │   └── 📁 dtos/
│       ├── 📁 reviews/               # Reviews system
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       ├── 📁 staffs/                # Staff management
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       ├── 📁 tags/                  # Tags system
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       ├── 📁 token/                 # Token management
│       ├── 📁 users/                 # User management
│       │   ├── 📁 dtos/
│       │   └── 📁 entities/
│       └── 📁 views/                 # Views tracking
├── 📁 test/                          # E2E tests
├── 📄 Dockerfile
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**: Users sign up with email and password
  - Publishers and Staff should signed up by admin.
2. **Login**: Returns access token (15 minutes) and refresh token (15 days, stored in cookies)
3. **Token Refresh**: Automatic token refresh using refresh token
4. **Logout**: Clears tokens and session data

### Guard System

#### 1. Auth Guard (`@UseGuards(AuthGuard)`)
- Verifies access token
- Required for authenticated endpoints (At `/docs` you can see them)

#### 2. Role Guard (`@UseGuards(RoleGuard)` + `@Roles(Role.Admin)`)
- Checks user permissions

#### 3. Soft Guard (`@UseGuards(SoftGuard)`)
- Optional authentication
- Provides user context if authenticated
- Continues without user if not authenticated

### Role Capabilities

| Role | Key Permissions |
|------|----------------|
| **Customer** | Browse, review, bookmark, order, create collections |
| **Publisher** | Publish books, create blogs, manage own content |
| **Content Manager** | Manage all content, authors, collections, tags |
| **Inventory Manager** | Manage books, titles, discount codes |
| **Order Manager** | Manage all orders, shipping, payments |
| **Admin** | Full system access, staff management |

## 🔄 Redis Integration

### View Tracking System

```
Redis Key Structure:
├── view/{entityType}/{entityId}/{viewerId}     # Track unique views (24h expire)
├── pending/{entityType}/{entityId}/views       # Pending DB sync
├── daily/{entityType}/{entityId}/{date}        # Daily view counts (30 days)
└── trending/{entityType}/{period}              # Cached trending results
```

### Supported Entities
- **ViewEntityTypes**: title, author, publisher, blog, tag, collection
- **Periods**: day, week, month
- **Viewer Types**: authenticated users (`user_{userId}`) or anonymous (`anon_{uuid}`)

### Cart Management

```typescript
// Cart stored in Redis with user session
cart:{userId} = {
  books: {
    id: string;
    quantity: number;
  }[]
}
```

## 📊 Analytics & Trending

### View Tracking
- **Unique Views**: 24-hour deduplication per viewer
- **Real-time Sync**: Every 4 hours from Redis to MySQL
- **Anonymous Tracking**: UUID-based for non-authenticated users

### Trending Algorithm
```typescript
// Get trending books for the past week
GET /books/trending?period=week

Response: {
  data: [
    {
      id: "uuid",
      name: "The light nights",
      views: 1250,
      ...
    }
  ]
}
```

## 🎫 Support System
- Ticket Types
  - **Suggestions**
  - **Order Problems**
  - **System Bugs**

- Ticket Management


### Order Status Lifecycle
1. **Pending** → Initial order creation
2. **Unpaid** → Automated status after timeout
3. **Paid** → Payment confirmed
4. **Processing** → Order being prepared
5. **Shipped** → Order dispatched
6. **Delivered** → Order completed
7. **Returned** → Order returned
8. **Canceled** → Order canceled

## 📝 API Documentation
Access the API documentation at:
```
http://localhost:3000/docs
```

### Production Environment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Initial Setup & Admin User

```bash
# Create admin user (first-time setup)
POST /signup-test-admin
{
  "username": "admin",
  "password": "secure_password",
  "email": "admin@bookstore.com",
  "firstName": "Admin",
  "lastName": "User"
}
```

## 📈 Performance Optimizations

### Caching Strategy
- **Entity Views**: Redis-based with 4-hour sync
- **Trending Data**: Cached with period-based expiration
- **Cart Data**: Session-based Redis storage
- **Query Results**: Selective caching for expensive queries

### Database Optimizations
- **Indexes**: Strategic indexing on search fields
- **Pagination**: Limit-offset with cursor-based alternatives
- **Eager Loading**: Optimized relations loading
- **Query Builders**: Complex queries with TypeORM query builder

## 📞 Support & Contributing

### Getting Help
- **Documentation**: Check `/docs` for detailed endpoint information
- **Issues**: Report bugs via the issue tracker
- **Discussions**: Use discussions for questions and feature requests

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️**