# OptiLang Web Application

Interactive web interface for OptiLang - A Python-inspired interpreter with real-time code analysis and optimization suggestions.

## 🏗️ Architecture

Three-service architecture:

- **Frontend** (Port 3000): React + TypeScript + Vite
- **Backend** (Port 5000): Express.js + TypeScript + MongoDB
- **Interpreter Service** (Port 8000): FastAPI + Python + optilang library

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Interpreter: http://localhost:8000
- MongoDB: localhost:27017

### Option 2: Manual Setup

```bash
# 1. Start MongoDB
mongod

# 2. Start interpreter service (terminal 1)
cd interpreter-service
conda activate optilang-service
uvicorn app.main:app --reload

# 3. Start backend (terminal 2)
cd backend
pnpm dev

# 4. Start frontend (terminal 3)
cd frontend
pnpm dev
```

## 📁 Project Structure

```
optilang-web/
├── frontend/              # React + TypeScript
├── backend/               # Express + TypeScript
├── interpreter-service/   # FastAPI + Python
├── docker-compose.yml     # Docker orchestration
└── pnpm-workspace.yaml    # Workspace config
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start frontend & backend
pnpm dev

# Start all services with Docker
pnpm dev:all

# Build all
pnpm build

# Run tests
pnpm test
```

## 📚 API Documentation

- Backend API: http://localhost:5000
- Interpreter API: http://localhost:8000/docs (Swagger UI)

## 👥 Team

- Your Name - Lead Developer
- Team Member 2 - Developer
- Team Member 3 - Developer

**Institution**: Tribhuvan University, Nepal  
**Program**: BSc CSIT Final Year Project

## 📄 License

MIT License