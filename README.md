# ShortLink Engine

A high-performance, minimalist, privacy-first URL shortening and link management platform. Built with a full-stack architecture combining a reactive React frontend with a high-throughput Express, MongoDB, and Redis backend.

---

## 🌟 Key Highlights & Features

- **Ultra-Fast Redirections & Redis Caching**:
  - In-memory route resolution via Redis for sub-millisecond 302 redirects.
  - Automatic cache-aside pattern: links are cached on first hit with a 24-hour TTL and invalidated automatically on link updates or deletions.
  - Atomic Redis counters (`INCR`) for click tracking without database bottlenecks.

- **Real-Time Click Synchronization**:
  - Live metric synchronization refreshing link click counts every 5 seconds.
  - Dedicated lightweight polling avoids expensive database queries while keeping dashboard and analytics displays accurate.

- **Deep Link Inspection & Security Analysis**:
  - Built-in link analyzer dissecting destination hostnames, protocols (HTTP vs. HTTPS encryption), path components, and query parameter counts.
  - Dynamically generated SVG/PNG QR codes for every shortened link with one-click download.

- **Guest Links & Smooth Onboarding**:
  - Instant URL shortening for anonymous/guest users without requiring immediate sign-up.
  - Seamless account claiming: guest links created in a session can be claimed and saved permanently to a user's dashboard upon registration or login.

- **Personal Account Management**:
  - User profile settings to update username handles, contact email addresses, and full names.
  - Secure credential management supporting password updates with existing password verification and bcrypt hashing.

- **Restrained & Accessible User Interface**:
  - Clean typography and distraction-free design with native Dark and Light themes.
  - Custom non-intrusive toast notifications and accessible modal confirmations for destructive actions (link deletion, sign out).
  - Paginated link overview with offset controls and search filtering.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Remixicon |
| **Backend API** | Node.js, Express, Express-Validator |
| **Primary Database** | MongoDB & Mongoose (data persistence & relations) |
| **In-Memory Cache** | Redis & ioredis (sub-millisecond redirects & atomic counters) |
| **Authentication** | JSON Web Tokens (JWT) & bcrypt |
| **DevOps & Containers** | Docker, Docker Compose (multi-stage builds) |

---

## 📁 Project Structure

```text
.
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── redis.js              # Redis client connection & caching helpers
│   ├── controllers/
│   │   └── user.control.js       # Core business logic & request handling
│   ├── middleware/
│   │   ├── error.handeler.js     # Global error handling middleware
│   │   └── req.validation.js     # Express-validator input schemas
│   ├── model/
│   │   ├── link.schema.js        # Link data schema, indexes & validation
│   │   └── user.schema.js        # User model, password hashing & JWT helpers
│   ├── routes/
│   │   └── user.route.js         # HTTP routing definitions
│   ├── services/
│   │   └── user.service.js       # Database queries, Redis caching & link operations
│   ├── utils/
│   │   └── global.error.js       # Centralized application error class
│   ├── Dockerfile                # Multi-stage production container definition
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express server initialization & lifecycle
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/            # Atomic UI elements (Buttons, ThemeToggle)
│   │   │   ├── molecules/        # Composite components (CopyButton, EmptyState)
│   │   │   └── organisms/        # Views (Dashboard, Inspect, Profile, Home, Navbar)
│   │   ├── context/              # React contexts (Auth, Toast, Confirm)
│   │   ├── App.jsx               # Root application router & layout
│   │   └── main.jsx              # React DOM mounting
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite configuration & development proxy
│
├── docker-compose.yml            # Production multi-container Docker stack
├── docker-compose.dev.yml        # Development Docker stack with volume mounts
└── README.md
```

---

## 📋 Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js**: `v18.x` or later (LTS recommended)
- **npm**: `v9.x` or later
- **MongoDB**: `v6.0+` running locally or accessible via network
- **Redis Server**: `v6.0+` running locally or accessible via network
- **Docker & Docker Compose** *(Optional, for containerized execution)*

---

## ⚙️ Configuration & Environment Setup

### 1. Backend Configuration

Navigate into the `backend` directory and create your `.env` configuration file:

```bash
cd backend
cp .env.example .env
```

Configure the following variables in `backend/.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | HTTP port the Express server listens on |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/LinkShortener` | MongoDB connection string |
| `JWT_SECRET` | `your_secret_key_here` | Secret key used for signing and verifying JWT tokens |
| `REDIS_HOST` | `127.0.0.1` | Hostname or IP address of the Redis instance |
| `REDIS_PORT` | `6379` | Port number of the Redis instance |
| `REDIS_PASSWORD` | *(Optional)* | Password for Redis authentication if configured |

---

## 🚀 Getting Started (Local Setup)

### Step 1: Start Supporting Services

Ensure your local MongoDB and Redis instances are running:

```bash
# Check Redis status
redis-cli ping
# Expected output: PONG

# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

### Step 2: Set Up & Run Backend

In a terminal, navigate to the `backend/` folder:

```bash
cd backend

# Install dependencies
npm install

# Run backend development server with live reload
npm run dev
```

The backend server will start on `http://localhost:5001` (or your configured `PORT`).

### Step 3: Set Up & Run Frontend

In a separate terminal, navigate to the `frontend/` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend client will be available at `http://localhost:5173`. The Vite dev server is pre-configured to proxy `/api` requests directly to the backend.

---

## 🐳 Running with Docker

You can run the entire environment using Docker Compose without manually installing Node.js, Redis, or MongoDB locally.

### Start All Services

From the project root:

```bash
# Build and launch containers in background
docker compose up --build -d

# Follow container logs
docker compose logs -f

# Shut down containers
docker compose down
```

---

## 🛠️ Available Development Scripts

### Backend (`/backend`)

- `npm run dev`: Starts the backend server with Node.js `--watch` for automatic reloads on changes.
- `npm start`: Starts the production server.
- `npm run format`: Formats backend codebase using Prettier.
- `npm run format:check`: Validates formatting compliance.

### Frontend (`/frontend`)

- `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles and bundles the production assets into `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code standard violations.

---

## 👤 Author & Contact

**Mohit Dev**
- Email: [mohitdevx@proton.me](mailto:mohitdevx@proton.me)
- Portfolio: [portfolio.h4x.co.in](https://portfolio.h4x.co.in)
- GitHub: [@mohitdevx](https://github.com/mohitdevx)
- LinkedIn: [linkedin.com/in/mohitdevx](https://linkedin.com/in/mohitdevx)
