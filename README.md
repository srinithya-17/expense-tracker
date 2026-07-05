# Pulse — Personal Expense Tracker

A full-stack MERN expense tracker with authentication, budgets, categories, income/expense tracking, transaction history, and analytics — built with a glassmorphism, premium UI.

## Stack

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios, Context API, Framer Motion, React Hook Form, React Hot Toast, React Icons, Recharts

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Auth, bcryptjs, Multer, Nodemailer, Express Validator, Helmet, CORS

## Features

- **Auth** — Register, login, JWT-protected routes, forgot/reset password (email or console-logged in dev), change password
- **Dashboard** — Balance, income, expenses, savings, budget progress, recent transactions, 6-month trend chart
- **Income & Expenses** — Full CRUD, search, filter, sort, pagination, categories, payment methods, receipt upload
- **Categories** — Default + custom categories with icons and colors
- **Budgets** — Monthly overall or per-category budgets with usage bars and over-budget alerts
- **Transactions** — Unified income + expense history with filters and CSV export
- **Analysis** — Bar, line, and pie charts for trends, category spending, weekly spend, and savings rate
- **Profile** — Edit details, avatar upload, currency/language/theme preferences, password change
- **Dark mode**, glassmorphism cards, animated stat cards, skeleton loaders, toast notifications

## Project Structure

```
expense-tracker/
├── backend/          # Express API (MVC)
│   ├── config/       # DB connection
│   ├── controllers/  # Route logic
│   ├── middleware/   # Auth, validation, upload, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── utils/        # Helpers (JWT, email, default categories)
│   └── server.js
└── frontend/         # React (Vite) app
    └── src/
        ├── components/  # Layout, UI, dashboard widgets
        ├── context/     # Auth + Theme providers
        ├── pages/       # Route-level pages
        ├── services/    # Axios API wrappers
        └── utils/       # Formatting helpers
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm install
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # starts on http://localhost:5173
```

Open http://localhost:5173, register a new account, and start tracking.

### Environment variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```
If SMTP variables are left blank, "forgot password" emails are logged to the backend console instead of sent — useful for local testing.

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment notes

- Backend: deploy to Render/Railway/Fly.io; set env vars, point `MONGO_URI` at Atlas, and set `CLIENT_URL` to your deployed frontend origin.
- Frontend: `npm run build` produces a `dist/` folder deployable to Vercel/Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL.
- Uploaded receipts/avatars are stored on local disk under `backend/uploads/` — for production, swap this for S3/Cloudinary storage.

## API Overview

All routes are prefixed with `/api`.

| Module | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password`, `PUT /auth/reset-password/:token` |
| Income | `GET/POST /income`, `GET/PUT/DELETE /income/:id` |
| Expenses | `GET/POST /expenses`, `GET/PUT/DELETE /expenses/:id` (multipart for receipts) |
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Budgets | `GET/POST /budgets`, `PUT/DELETE /budgets/:id`, `GET /budgets/history` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/analysis` |
| Transactions | `GET /transactions`, `GET /transactions/export/csv` |
| Users | `PUT /users/profile`, `PUT /users/avatar`, `PUT /users/change-password` |

All routes except register/login/forgot/reset require a `Bearer` JWT token.

## Notes

This build focuses on a fully working core product (all modules from the brief except the optional Admin panel). It's structured cleanly so an Admin module (user management, global stats) can be added following the same MVC pattern.
