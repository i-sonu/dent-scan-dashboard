# Aerosepct - Full Stack Setup

<img width="1851" height="1058" alt="dashboard" src="https://github.com/user-attachments/assets/53e4db6c-23e2-496a-9b87-ca9528cffb4a" />

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (http://localhost:3000)                     │
│  Next.js Frontend                                    │
│  • Stores JWT in httpOnly cookie                     │
│  • Middleware verifies JWT on every request          │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP (internal)
                   ▼
┌─────────────────────────────────────────────────────┐
│  Next.js API Routes (/api/auth/*)                    │
│  • /api/auth/login  → proxy to FastAPI + set cookie  │
│  • /api/auth/logout → clear cookie                   │
│  • /api/auth/me     → validate token with FastAPI    │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP REST
                   ▼
┌─────────────────────────────────────────────────────┐
│  Python FastAPI (http://localhost:8000)              │
│  • POST /auth/login  → validate credentials + JWT   │
│  • GET  /auth/me     → verify token + return user   │
│  • GET  /health      → health check                 │
│                                                      │
│  Credentials (hardcoded, bcrypt hashed):             │
│    Username : admin                                  │
│    Password : Admin@Aero#2025!                       │
└─────────────────────────────────────────────────────┘
```

## Running the Project

### Terminal 1 - Python Backend
```bash
cd aerosepct/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Next.js Frontend
```bash
cd aerosepct
npm install
npm run dev
```

Open http://localhost:3000

### Login Credentials
| Field    | Value             |
|----------|-------------------|
| Username | `admin`           |
| Password | `Admin@Aero#2025!`|

## API Documentation
FastAPI auto-generates docs at: http://localhost:8000/docs
