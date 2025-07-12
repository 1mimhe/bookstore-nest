<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Bookstore API with <a href="nestjs.com">NestJS</a></p>
    <p align="center">
<a href="https://dbdiagram.io/d/bookstore-db-6750c08ce9daa85acab153d5" target="_blank"><img src="https://img.shields.io/badge/Database%20Diagram-8A2BE2" alt="NPM Version" /></a>

## Overview

This project is a comprehensive book management system designed to streamline bookstore operations with a focus on scalability, security, and performance.

Built using TypeScript, NestJS, and TypeORM, the system supports entities for books, users, orders, publishers, and more, with normalized relationships to ensure data integrity and efficient querying.
The system implements a Role-Based Access Control (RBAC) system with distinct roles:
- Customer
- Admin
- Content Manager
- Inventory Manager
- Order Manage
- Publisher

defined to manage permissions effectively.

Key functionalities include book catalog management, user authentication with JWT-based access and refresh tokens, order processing, and inventory tracking.

Redis is integrated for caching and session management to enhance performance, while ElasticSearch powers efficient full-text search across book titles, authors, and descriptions.

Additional features include user reviews, bookmarks, collections, discount codes, and book request submissions, catering to a diverse range of bookstore needs. This project is a reverse-engineered implementation of the [IranKetab](www.iranketab.ir) platform.

This project is currently being implemented, and the README detailing project setup, features, and structure will be added in the future.