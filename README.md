# ZUT Resource Library — Full-Stack Final Project

**Zambia University of Technology** — Full-Stack Web Development course project.

A university **digital resource library** where students and staff can upload, search, download, edit, and delete shared documents (PDF, Word, PowerPoint).

## Assignment requirements covered

| Requirement | Implementation |
|-------------|----------------|
| React.js frontend | `client/` — Vite + React, responsive UI |
| Express.js backend | `server/` — REST API |
| PostgreSQL database | `users` and `documents` tables |
| User authentication | Register, login, JWT sessions |
| CRUD operations | Create/read/update/delete documents |
| File upload | Multer — `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx` (max 25 MB) |
| Responsive design | Mobile-friendly CSS |

## Problem statement

Students and lecturers need a central place to share lecture notes, assignments, and presentations instead of scattered WhatsApp or email attachments.

## Tech stack

- **Frontend:** React 19, React Router, Vite
- **Backend:** Express.js, JWT, bcrypt, Multer
- **Database:** PostgreSQL

## Setup

### 1. PostgreSQL

Create a database:

```sql
CREATE DATABASE zut_library;
```

Copy environment file and edit credentials:

```bash
copy .env.example .env
```

Set `DATABASE_URL` in `.env`, for example:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/zut_library
JWT_SECRET=your-long-random-secret
```

### 2. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Initialize database tables

```bash
cd server
npm run db:init
```

### 4. Run the application

From the project root:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:5000  

Register an account, then use **Upload document** to add files.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/documents` | List documents (`?q=` `?category=`) |
| POST | `/api/documents` | Upload (multipart: `file`, `title`, …) |
| PUT | `/api/documents/:id` | Update metadata / replace file |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/:id/download` | Download file |

## Production build

```bash
cd client && npm run build
cd ../server && npm start
```

Serve the built React app from Express on port 5000.

## Submission

Deadline: **29 May 2026**

Present: login, upload, search, edit, delete, and download a sample document.
