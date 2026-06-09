# NBS Management

A full-stack web application for managing sites, assets, and users with role-based access control.

<div align="left" style="padding-left:15px;">
  <img width="65%" src="https://cheeaiklim.dev/images/projects/nbs-management-home.png" />
</div>

## Live Demo

- **Frontend:** [nbs-management.vercel.app](https://nbs-management.vercel.app)
- **Backend API:** [nbs-management-api.vercel.app](https://nbs-management-api.vercel.app)

> **Demo credentials**
> <br/>Email: `admin@hotmail.com` <br/>Password: `AdminPass123`
> <br/><br/>Access is restricted to admins. Login your administrator for new user registration or password resets.


---

## Tech Stack

<img src="https://skillicons.dev/icons?i=react,ts,vite,nodejs,express,prisma,postgres,vercel" />

###

| Layer      |  Tools                                                                 |
|------------|----------------------------------------------------------------------|
| Frontend   | React, TypeScript, Vite, React Router                                |
| Backend    | Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon)              |
| Auth       | JWT (HTTP-only cookies)                                              |
| Deployment | Vercel (SPA + Serverless)     

---

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT authentication (cookie-based)
- Nodemailer (email)

### Deployment
- Frontend → Vercel (SPA)
- Backend → Vercel Serverless (`@vercel/node`)

---

## Features

- JWT authentication with HTTP-only cookies
- Role-based access control (`ADMIN` / `USER`)
- User management (admin only — register, reset password)
- Site and asset management
- Email notifications via Nodemailer
- Protected routes on both frontend and backend

---

## Project Structure

```
nbs-management/
├── frontend/         # React app
│   └── src/
├── backend/          # Express API
│   └── src/
│       ├── app.ts
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── lib/
│       └── types/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)

### 1. Clone the repo

```bash
git clone https://github.com/RestlessCoder/nbs-management.git
cd nbs-management
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```


### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```



