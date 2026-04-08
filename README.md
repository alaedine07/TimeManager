# TimeManager

A full-stack time management and project tracking application. Organize work into projects and sub-projects, break them down into tasks with checkpoints, and track time spent on each task with flexible session durations.

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | Angular 20, Tailwind CSS, TypeScript      |
| Backend    | ASP.NET Core 8 (C#), Entity Framework Core |
| Database   | SQLite (development), PostgreSQL (production) |
| Auth       | JWT Bearer tokens, BCrypt password hashing |
| DevOps     | Docker, Docker Compose                    |

## Features

- **User Authentication** — Register and login with JWT-based session management
- **Projects & Sub-Projects** — Hierarchical project structure with nested sub-projects
- **Tasks** — Create tasks with priority levels (high, medium, low) and completion tracking
- **Checkpoints** — Break tasks into smaller checkpoints to track progress
- **Time Tracking** — Start/pause timer sessions on tasks with configurable durations (30 min, 45 min, 1h, 1h 30, or unlimited)
- **Todo List** — Mark tasks across projects as "todo" for a unified task view
- **Per-Project Time Totals** — View aggregated time logged per task and project

## Project Structure

```
TimeManager/
├── backend/
│   └── TimeManagerApi/          # ASP.NET Core 8 Web API
│       ├── Controllers/         # API endpoints (Auth, Projects, TimeSessions, Checkpoints)
│       ├── Models/              # Entity models (Project, TaskItem, Checkpoint, User, TaskTimeSession)
│       ├── DTO/                 # Data transfer objects
│       ├── Repositories/        # Data access layer
│       ├── Services/            # Business logic layer
│       ├── Data/                # DbContext (SQLite + PostgreSQL)
│       └── Migrations/          # EF Core migrations (Postgres & SQLite)
├── frontend/
│   └── src/app/
│       ├── pages/               # Route pages (Projects, ProjectDetails, Todos, Login, Register)
│       ├── Components/          # Reusable components (TaskItem, TaskList, Checkpoints, NavBar, etc.)
│       ├── services/            # HTTP services (auth, project, timeSessions, checkpoint)
│       ├── models/              # TypeScript interfaces
│       ├── guards/              # Route guards (auth, redirect-if-authenticated)
│       └── utils/               # Utility functions
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

## API Endpoints

### Auth
| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| POST   | `/api/auth/register`   | Register new user |
| POST   | `/api/auth/login`      | Login, returns JWT |

### Projects
| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| GET    | `/api/projects`                     | List user's projects  |
| GET    | `/api/projects/:id`                 | Get project by ID     |
| POST   | `/api/projects`                     | Create project        |
| PUT    | `/api/projects/:id`                 | Update project        |
| DELETE | `/api/projects/:id`                 | Delete project        |
| POST   | `/api/projects/:id/subprojects`     | Create sub-project    |

### Time Sessions
| Method | Endpoint                                    | Description              |
| ------ | ------------------------------------------- | ------------------------ |
| POST   | `/api/timesession/start/:taskId`            | Start tracking time      |
| POST   | `/api/timesession/stop`                     | Stop active session      |
| GET    | `/api/timesession/active`                   | Get current session      |
| GET    | `/api/timesession/task/:taskId/total-time`  | Total time for a task    |
| GET    | `/api/timesession/project/:id/total-time`   | Total time for a project |

### Checkpoints
| Method | Endpoint                                                         | Description          |
| ------ | ---------------------------------------------------------------- | -------------------- |
| POST   | `/api/projects/:projectId/tasks/:taskId/checkpoints`             | Create checkpoint    |
| PUT    | `/api/projects/:projectId/tasks/:taskId/checkpoints/:id`         | Update checkpoint    |
| DELETE | `/api/projects/:projectId/tasks/:taskId/checkpoints/:id`         | Delete checkpoint    |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

Or for local development without Docker:
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 22+](https://nodejs.org/)

### Run with Docker (recommended)

**Development** (hot reload enabled):
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Frontend: http://localhost:4200
- Backend API: http://localhost:5052
- Swagger UI: http://localhost:5052/swagger

**Production**:
```bash
docker compose -f docker-compose.prod.yml up --build
```
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

### Run Locally (without Docker)

**Backend:**
```bash
cd backend/TimeManagerApi
dotnet restore
dotnet run
```
The API starts on port 5052 with SQLite in development mode.

**Frontend:**
```bash
cd frontend
npm install
npm start
```
The Angular dev server starts at http://localhost:4200.

## Environment Configuration

### Backend

Configuration is split across:
- `appsettings.json` — Base settings
- `appsettings.Development.json` — Dev settings (SQLite, debug logging)
- `appsettings.Production.json` — Production settings (PostgreSQL)
- `.env` — Environment variables for production Docker deployment

Key environment variables for production:
| Variable                | Description                  |
| ----------------------- | ---------------------------- |
| `DB_CONNECTION_STRING`  | PostgreSQL connection string  |
| `Jwt__Key`              | JWT signing key              |
| `Jwt__Issuer`           | JWT issuer name              |

### Frontend

API URL is configured in `src/environments/`:
- `environment.ts` — Development: `http://localhost:5052/api`
- `environment.prod.ts` — Production: configured per deployment

## License

This project is open.
