# User Accounts + Authentication Setup

## Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` from `.env.example`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` from `.env.example`.

## Test URLs

Frontend:

```text
http://localhost:5173/register
http://localhost:5173/login
http://localhost:5173/my-orders
```

Backend:

```text
POST http://localhost:5000/api/users/register
POST http://localhost:5000/api/users/login
GET  http://localhost:5000/api/users/profile
```
