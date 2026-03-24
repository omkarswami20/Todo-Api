# Todo API

A production-ready RESTful backend API for a Todo application, built with Node.js, Express.js, Prisma ORM, and MySQL. Features JWT-based authentication, role-ready architecture, and a microservices-style folder structure designed for scalability.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Database Schema](#3-database-schema)
4. [Authentication & JWT Flow](#4-authentication--jwt-flow)
5. [API Endpoints](#5-api-endpoints)
6. [How to Run Locally](#6-how-to-run-locally)
7. [Environment Variables](#7-environment-variables)

---

## 1. Project Overview

**Stack:** Node.js · Express.js · Prisma ORM · MySQL · JWT · Swagger UI

**Key Design Principles:**
- Clean separation of concerns — Routes → Controller → Service → Database
- No business logic inside Controllers
- Passwords are never stored in plain text (bcrypt hashing)
- Stateless authentication using JWT tokens
- Swagger UI for interactive API documentation

---

## 2. Architecture & Folder Structure

```
todo-api/
├── config/
│   ├── db.js                   # Prisma client & database connection
│   └── swagger.js              # Swagger UI setup
├── services/
│   ├── auth-service/
│   │   ├── controllers/
│   │   │   └── authController.js   # Handles HTTP request & response only
│   │   ├── services/
│   │   │   └── authService.js      # All business logic lives here
│   │   ├── routes/
│   │   │   └── authRoutes.js       # URL definitions & Swagger annotations
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT token verification
│   │   └── index.js                # Auth service entry point
│   └── todo-service/
│       ├── controllers/
│       │   └── todoController.js
│       ├── services/
│       │   └── todoService.js
│       ├── routes/
│       │   └── todoRoutes.js
│       └── index.js
├── prisma/
│   └── schema.prisma           # Database models
├── .env                        # Environment variables (never commit)
├── .gitignore
├── server.js                   # Application entry point
└── package.json
```

### Layer Responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Routes | `authRoutes.js` | Define URL paths, attach middleware |
| Controller | `authController.js` | Extract request data, validate, call service, send response |
| Service | `authService.js` | Business logic, database queries |
| Middleware | `authMiddleware.js` | Verify JWT before protected routes |
| Config | `db.js` | Single shared Prisma client instance |

### Request Lifecycle

Every incoming request follows this path:

```
HTTP Request
    ↓
server.js               — Express receives the request
    ↓
service/index.js        — Routes request to correct service
    ↓
routes.js               — Matches URL and HTTP method
    ↓
middleware (if any)     — Verifies JWT token on protected routes
    ↓
controller.js           — Extracts and validates request data
    ↓
service.js              — Executes business logic, queries database
    ↓
Prisma → MySQL          — Database operation
    ↓
HTTP Response           — JSON response sent back to client
```

---

## 3. Database Schema

Defined in `prisma/schema.prisma` and applied to MySQL via Prisma Migrate.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  phone     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Field Reference

| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `name` | String | Required | Full name of the user |
| `email` | String | Unique, Required | Used for login |
| `password` | String | Required | Stored as bcrypt hash |
| `phone` | String | Unique, Required | One account per phone number |
| `createdAt` | DateTime | Auto | Set automatically on creation |
| `updatedAt` | DateTime | Auto | Updated automatically on every change |

### Running Migrations

```bash
# Create and apply a new migration
npx prisma migrate dev --name your_migration_name

# Regenerate Prisma client after schema changes
npx prisma generate
```

---

## 4. Authentication & JWT Flow

### How Passwords Are Stored

Passwords are never saved in plain text. Before saving, they are hashed using `bcrypt` with a cost factor of 10.

```
Plain password: "omkar123"
      ↓
bcrypt.hash("omkar123", 10)
      ↓
Stored in DB: "$2b$10$eW5bZq3Lk..."   ← cannot be reversed
```

On login, `bcrypt.compare()` checks if the entered password matches the stored hash — without ever decrypting it.

### What is JWT?

A JSON Web Token is a compact, self-contained token that carries user identity. It has three parts separated by dots:

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9         ← Header  (algorithm used)
.eyJ1c2VySWQiOjF9             ← Payload (user data)
.SflKxwRJSMeKKF2QT4fw         ← Signature (tamper-proof seal)
```

The payload contains:
```json
{
  "userId": 1,
  "email": "omkar@gmail.com",
  "iat": 1742774400,
  "exp": 1742778000
}
```

### Signup Flow

```
Client → POST /api/auth/signup { name, email, password, phone }
    ↓
Check if email already exists → if yes, return 400 error
    ↓
Hash password with bcrypt (cost=10)
    ↓
Save user to MySQL via Prisma
    ↓
Generate JWT token signed with JWT_SECRET
    ↓
Return { user (without password), token }
```

### Login Flow

```
Client → POST /api/auth/login { email, password }
    ↓
Find user by email → if not found, return "Invalid credentials"
    ↓
Compare entered password with stored hash using bcrypt.compare()
    ↓
If mismatch → return "Invalid credentials"
    ↓
Generate JWT token
    ↓
Return { user (without password), token }
```

> **Security Note:** Both "email not found" and "wrong password" return the same error message — `Invalid credentials`. This prevents attackers from knowing which field is incorrect.

### How the Client Uses the Token

```
1. User logs in → receives JWT token in response
2. Client stores the token
3. For every protected request, client sends token in the header:

   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

4. Server middleware verifies the token
5. Valid   → request proceeds to controller
   Invalid → 401 Unauthorized is returned
```

### Middleware — JWT Verification

Applied to all protected routes (e.g., Todo routes). Not applied to `/signup` and `/login` since those are public.

```
Request reaches protected route
    ↓
authMiddleware runs
    ↓
Reads Authorization header → extracts token
    ↓
Verifies token with JWT_SECRET
    ↓
Valid?   → attaches decoded user to req.user → calls next()
Expired? → returns 401 Unauthorized
Tampered?→ returns 401 Unauthorized
```

---

## 5. API Endpoints

**Base URL:** `http://localhost:3000`
**Interactive Docs:** `http://localhost:3000/api-docs`

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Protected Endpoints (require Authorization header)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Get all todos for logged-in user |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/:id` | Update a todo |
| DELETE | `/api/todos/:id` | Delete a todo |

---

### POST /api/auth/signup

**Request Body:**
```json
{
  "name": "Omkar Swami",
  "email": "omkar@gmail.com",
  "password": "omkar123",
  "phone": "9167955436"
}
```

**Success — 201 Created:**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "user": {
      "id": 1,
      "name": "Omkar Swami",
      "email": "omkar@gmail.com",
      "phone": "9167955436",
      "createdAt": "2026-03-25T00:00:00.000Z",
      "updatedAt": "2026-03-25T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error — 400 Bad Request:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "omkar@gmail.com",
  "password": "omkar123"
}
```

**Success — 200 OK:**
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "user": {
      "id": 1,
      "name": "Omkar Swami",
      "email": "omkar@gmail.com",
      "phone": "9167955436",
      "createdAt": "2026-03-25T00:00:00.000Z",
      "updatedAt": "2026-03-25T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error — 400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 6. How to Run Locally

### Prerequisites

- Node.js v18 or higher
- MySQL running on port 3306 (XAMPP or any MySQL server)
- A MySQL database named `todo-api` created

### Installation

```bash
# Step 1 — Clone the repository
git clone https://github.com/omkarswami20/todo-api.git
cd todo-api

# Step 2 — Install dependencies
npm install

# Step 3 — Create your .env file
# Copy the variables from Section 7 below

# Step 4 — Generate Prisma client
npx prisma generate

# Step 5 — Run database migrations (creates all tables)
npx prisma migrate dev

# Step 6 — Start the development server
npm run dev
```

### Verify It's Running

You should see:
```
Server chal raha hai port 3000 pe
Database connected successfully!
Swagger docs available at: http://localhost:3000/api-docs
```

Open `http://localhost:3000/api-docs` in your browser to access the interactive API documentation.

---

## 7. Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=todo-api

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1h

# Prisma
DATABASE_URL="mysql://root:@localhost:3306/todo-api"
```

> **Important:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

*Built by Omkar Swami — March 2026*
