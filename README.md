# Link Shortener (Full-Stack Architecture)

A URL Shortener application organized into `backend` and `frontend` workspaces, containerized with Docker and Docker Compose.

---

## 📁 Project Structure

```text
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   └── user.control.js       # Request controllers
│   ├── middleware/
│   │   ├── error.handeler.js     # Global error handling middleware
│   │   └── req.validation.js     # Input validation rules
│   ├── model/
│   │   ├── link.schema.js        # Link data model
│   │   └── user.schema.js        # User data model & auth methods
│   ├── routes/
│   │   └── user.route.js         # API routes
│   ├── services/
│   │   └── user.service.js       # Business logic services
│   ├── utils/
│   │   └── global.error.js       # Custom error class
│   ├── .dockerignore             # Docker build exclusions
│   ├── .env                      # Local environment variables
│   ├── .env.example              # Environment variables template
│   ├── .prettierignore           # Prettier ignore patterns
│   ├── .prettierrc               # Prettier configuration
│   ├── Dockerfile                # Multi-stage production container definition
│   ├── package.json              # NPM manifest & scripts
│   └── server.js                 # HTTP server entry point
├── frontend/                     # Client application (Vite / React / Next.js)
│   └── README.md
├── docker-compose.yml            # Production Docker Compose stack
├── docker-compose.dev.yml        # Development Docker Compose stack with live-reload
├── .gitignore                    # Git tracked exclusions
├── .prettierrc                   # Root Prettier configuration
└── .prettierignore               # Root Prettier exclusions
```

---

## ⚙️ Environment Variables

The backend uses environment variables. Copy `.env.example` in `backend/`:

```bash
cd backend
cp .env.example .env
```

| Variable     | Default                     | Description                                                  |
| ------------ | --------------------------- | ------------------------------------------------------------ |
| `PORT`       | `5000`                      | Application server port                                      |
| `NODE_ENV`   | `development`               | Environment mode (`development`, `production`)               |
| `MONGO_URI`  | `mongodb://127.0.0.1:27017` | MongoDB connection URI (`mongodb://mongodb:27017` in Docker) |
| `JWT_SECRET` | `your_jwt_secret_key_here`  | Secret key for signing and verifying JWT tokens              |

---

## 🐳 Running with Docker & Docker Compose

From the root directory:

### 1. Production Stack (Recommended)

Spins up the backend API and MongoDB container:

```bash
# Build and start services in detached mode
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

The API will be accessible at `http://localhost:5000`.

### 2. Development Stack (with Live Reload)

Mounts the `./backend` directory into the container for live reload on file changes:

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 3. Standalone Docker Container

```bash
# Build the Docker image from backend directory
docker build -t link-shortener-backend ./backend

# Run container
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI="mongodb://host.docker.internal:27017" \
  -e JWT_SECRET="your_jwt_secret_key" \
  link-shortener-backend
```

---

## 💻 Local Development (Without Docker)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Start development server with file watching
npm run dev

# Start production server
npm start
```

---

## 🧹 Code Formatting (Prettier)

In the `backend` directory:

```bash
# Check code formatting
npm run format:check

# Auto-format all files
npm run format
```

---

## 📡 Backend API Endpoints

### Health Check

- `GET /health` - Service health status & uptime

### User & Auth

- `POST /api/register` - Register a new user (`name`, `email`, `password`)
- `POST /api/login` - Authenticate user and receive JWT token
- `GET /api/profile` - Get logged-in user profile (requires Bearer token header)

### URL Management

- `POST /api/v1/newurl` - Shorten a URL (`url` in body, Bearer token header)
- `GET /api/v1/:redirectKey` - Redirect to original long URL
