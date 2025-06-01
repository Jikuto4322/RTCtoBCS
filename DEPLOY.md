# DEPLOY.md

## Deployment Guide

This document describes how to deploy the RTCtoBCS project (backend and frontend) to production.

---

## 1. Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional, recommended)
- PostgreSQL database (cloud or self-hosted)
- A cloud hosting provider (e.g., Render, Railway, Vercel, Netlify, Servihub)
- Access to your DNS provider for custom domains

---

## 2. Environment Variables

Create a `.env.production` file (or set these in your cloud provider):

```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
JWT_SECRET=your_production_secret
CORS_ORIGIN=https://chat-demo.servihub.app
```

---

## 3. Database Migration

Run migrations on your production database:

```sh
npx prisma migrate deploy
```

---

## 4. Build the Frontend

From the `widgets/` directory:

```sh
npm install
npm run build
```

This creates a `dist/` or `build/` folder with static files.

---

## 5. Deploy the Frontend

- **Option A: Static Host (Vercel, Netlify, Servihub)**
  1. Upload the contents of `dist/` or `build/` to your static host.
  2. Set the custom domain to `https://chat-demo.servihub.app`.
  3. Set environment variables if your frontend needs them (e.g., backend API URL).

- **Option B: Serve from Backend**
  1. Copy the frontend build output to your backend's static directory.
  2. Ensure Fastify serves static files using `@fastify/static`.

---

## 6. Deploy the Backend

- **Option A: Docker Compose**
  1. Edit `docker-compose.yml` with your production settings.
  2. Run:
     ```sh
     docker-compose up --build -d
     ```

- **Option B: Cloud Platform (Render, Railway, etc.)**
  1. Push your code to GitHub.
  2. Connect your repo to the platform.
  3. Set environment variables in the dashboard.
  4. Set the start command (e.g., `npm run build && npm start`).
  5. Deploy and note the public backend URL (e.g., `https://chat-api.onrender.com`).

---

## 7. Health Check

Verify the backend health endpoint:

```
GET https://chat-api.onrender.com/health
```
Should return `200 OK`.

**For questions, see the project README or contact the maintainers.**