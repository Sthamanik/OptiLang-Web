# Contributing to OptiLang Web

Thank you for considering contributing to OptiLang Web! This document covers everything you need to get started.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Development Process](#development-process)
- [Service-Specific Guidelines](#service-specific-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Questions](#questions)

---

## Project Structure

This repository contains three independent services that work together:

```
optilang-web/
├── frontend/              # React + TypeScript (Port 3000)
├── backend/               # Express.js + TypeScript (Port 5000)
├── interpreter-service/   # FastAPI + Python (Port 8000)
└── docker-compose.yml     # Orchestrates all services
```

Each service has its own dependencies, tooling, and test suite. Changes to one service should not require changes to the others unless you are updating a shared API contract.

---

## Development Setup

### Prerequisites

- Node.js 24.13.0+
- pnpm 10.28.1+
- Python 3.14.2+
- Docker 29.1.3+ and Docker Compose 5.0.1+
- A MongoDB Atlas account (free tier is fine)

### First-Time Setup

**1. Clone the repository**

```bash
git clone https://github.com/optilang-project/optilang-web.git
cd optilang-web
```

**2. Set up environment variables**

```bash
cp .env.example .env
# Edit .env and fill in your MONGODB_URI and JWT_SECRET
```

**3. Choose your setup method**

**Option A — Docker (recommended, runs everything at once):**

```bash
docker-compose up
```

**Option B — Manual (better for active development on a specific service):**

```bash
# Terminal 1 — Interpreter Service
cd interpreter-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
pnpm install
pnpm dev

# Terminal 3 — Frontend
cd frontend
pnpm install
pnpm dev
```

**4. Verify everything is running**

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- Interpreter: http://localhost:8000/health
- Interpreter API docs: http://localhost:8000/docs

---

## Development Process

1. **Fork** the repository on GitHub
2. **Create a branch** from `develop` (not `main`):
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — see [Service-Specific Guidelines](#service-specific-guidelines) below
4. **Write or update tests** for your changes
5. **Run tests** and make sure everything passes
6. **Commit** following the [commit message convention](#commit-messages)
7. **Push** your branch and open a Pull Request against `develop`

### Branch Naming

```
feature/short-description      # New features
fix/short-description          # Bug fixes
docs/short-description         # Documentation only
refactor/short-description     # Refactoring, no behaviour change
test/short-description         # Tests only
```

---

## Service-Specific Guidelines

### Frontend (`frontend/`)

**Stack:** React 18, TypeScript 5, Vite 6, Monaco Editor, Chart.js, Axios

**Running:**
```bash
cd frontend
pnpm dev        # Start dev server (port 3000)
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm lint       # ESLint
```

**Key rules:**
- All new components go in `src/components/` under the relevant subdirectory
- Use the custom hooks in `src/hooks/` for API calls — do not call `api.ts` directly from components
- All API response types must be defined in `src/types/` — no inline `any`
- Use TypeScript strictly — no `@ts-ignore` without a comment explaining why

### Backend (`backend/`)

**Stack:** Express.js 5, TypeScript 5, Mongoose 9, JWT, Winston, Zod

**Running:**
```bash
cd backend
pnpm dev        # Start with nodemon (port 5000)
pnpm build      # Compile TypeScript
pnpm test       # Run Jest tests
pnpm lint       # ESLint + Prettier check
```

**Key rules:**
- All routes must go through the corresponding controller — no logic in route files
- All request bodies must be validated with Zod before reaching the controller
- Use `asyncHandler` wrapper for all async route handlers to avoid unhandled rejections
- Use `ApiError` and `ApiResponse` utilities for consistent response shapes
- Never log sensitive data (passwords, tokens, MongoDB URIs)

### Interpreter Service (`interpreter-service/`)

**Stack:** FastAPI 0.115, Python 3.14, Pydantic 2, optilang library, Motor (async MongoDB)

**Running:**
```bash
cd interpreter-service
pip install -r requirements.txt
uvicorn app.main:app --reload   # Start dev server (port 8000)
pytest                          # Run tests
```

**Key rules:**
- This service wraps the `optilang` library — keep business logic minimal here
- PyLite errors (syntax, runtime) are **not** HTTP errors — return them in the `errors[]` field with `success: false`
- Only unexpected Python-level exceptions should raise `HTTPException 500`
- All request/response shapes must use the Pydantic schemas in `app/schemas/`
- Field names in response schemas must exactly match what `optilang` library methods return

---

## Code Style

### TypeScript / JavaScript (Frontend + Backend)

- **Formatter:** Prettier (config in `.prettierrc`)
- **Linter:** ESLint (config in `eslint.config.js`)
- Run both before committing:
  ```bash
  pnpm lint
  pnpm format
  ```
- Use `const` by default, `let` only when reassignment is needed
- Prefer `async/await` over `.then()` chains
- All exported functions and classes must have JSDoc comments

### Python (Interpreter Service)

- **Formatter:** Black (`black app/`)
- **Linter:** Flake8 (`flake8 app/`)
- **Type checker:** Mypy (`mypy app/`)
- All public functions must have type hints and docstrings
- Follow PEP 8 — Black handles most of this automatically

---

## Testing

### Frontend

```bash
cd frontend
pnpm test           # Run Vitest tests
pnpm test:coverage  # With coverage report
```

- Write tests for all custom hooks
- Write tests for utility functions in `src/utils/`
- Component tests are not required but appreciated for complex components
- Target: **70%+ coverage**

### Backend

```bash
cd backend
pnpm test           # Run Jest tests
pnpm test:coverage  # With coverage report
```

- Write tests for all controllers using `supertest`
- Mock the interpreter service HTTP client in controller tests
- Write unit tests for all service-layer functions
- Target: **70%+ coverage**

### Interpreter Service

```bash
cd interpreter-service
pytest                          # Run all tests
pytest --cov=app -v             # With coverage report
pytest tests/test_execution.py  # Run specific test file
```

- Write tests for both happy path and error cases on every route
- Test that PyLite errors return `success: false`, not HTTP 500
- Target: **75%+ coverage**

### Running All Tests

```bash
# From the repo root
pnpm test          # Frontend + Backend
cd interpreter-service && pytest   # Interpreter service
```

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `refactor` | Code change with no behaviour change |
| `perf` | Performance improvement |
| `chore` | Build, tooling, dependency updates |

**Scopes** (optional but helpful):

| Scope | Meaning |
|---|---|
| `frontend` | Changes to the React app |
| `backend` | Changes to the Express server |
| `interpreter` | Changes to the FastAPI service |
| `docker` | Changes to Docker/Compose config |
| `deps` | Dependency updates |

**Examples:**

```
feat(frontend): add Chart.js profiling visualizations
fix(backend): handle expired JWT tokens in auth middleware
test(interpreter): add tests for execute route error cases
docs: update CONTRIBUTING with interpreter service guidelines
chore(deps): update mongoose to 9.2.0
```

---

## Pull Request Guidelines

- PRs must target the `develop` branch, not `main`
- Every PR needs a clear description of **what** changed and **why**
- Link any related issues with `Closes #123` or `Relates to #123`
- All CI checks must pass before a PR can be merged
- At least one team member must review and approve before merging
- Keep PRs focused — one feature or fix per PR makes review much easier
- If your PR touches the API contract between services, update the relevant schema files in all affected services

### PR Description Template

```markdown
## What does this PR do?
Brief description of the change.

## Why?
Motivation or problem being solved.

## How to test?
Steps to verify the change works.

## Checklist
- [ ] Tests written and passing
- [ ] Code formatted (Prettier / Black)
- [ ] No sensitive data logged or committed
- [ ] API schema changes reflected in all affected services
```

---

## Questions?

- Open a [GitHub Issue](https://github.com/optilang-project/optilang-web/issues) for bugs or feature requests
- For general questions, reach out to the team:
  - **Manik Kumar Shrestha** — [GitHub](https://github.com/Sthamanik)
  - **Om Shree Mahat** — [GitHub](https://github.com/itsomshree)
  - **Aashish Rimal** — [GitHub](https://github.com/aashishrimal22)