# RTCtoBCS

Ceus Capital Full Stack Intern Technical Assessment

## Overview

**RTCtoBCS** (Real-Time Chat to Business Communication Service) is a full-stack real-time chat platform designed for seamless customer-business communication. It features a robust Fastify backend, a lightweight React widget frontend, and a PostgreSQL database managed via Prisma. The system supports real-time messaging, presence, typing indicators, authentication, and is designed for scalability and accessibility.

---

## Features

- **Real-time 1-to-1 and multi-agent chat** (WebSocket-first, SSE fallback)
- **Presence and typing indicators**
- **Unread message badges and offline notifications**
- **REST and WebSocket APIs (Fastify)**
- **PostgreSQL persistence (Prisma ORM)**
- **JWT authentication**
- **Rate-limiting and Redis pub/sub for scalability**
- **Accessible, themeable React widget**
- **Comprehensive test suite and CI pipeline**
- **Dockerized for easy deployment**

---

## Project Structure

```
.
├── src/            # Fastify backend (API, WebSocket, routes)
├── widgets/        # React frontend widget
├── prisma/         # Prisma schema and migrations
├── docs/           # Architecture, deployment, and retrospective docs
├── .github/        # GitHub Actions workflows (CI/CD)
├── Dockerfile      # Docker build for backend
├── docker-compose.yml
└── README.md
```

---

## Local Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-org/RTCtoBCS.git
   cd RTCtoBCS
   ```

2. **Install dependencies:**
   ```sh
   npm install
   cd widgets && npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your secrets.

4. **Run database migrations:**
   ```sh
   npx prisma migrate dev
   ```

5. **Start the backend:**
   ```sh
   npm run dev
   ```

6. **Start the frontend:**
   ```sh
   cd widgets
   npm run dev
   ```

---

## Scripts

- `npm run dev` — Start backend in development mode
- `npm run build` — Build backend for production
- `npm test` — Run backend tests
- `cd widgets && npm run dev` — Start frontend in development mode
- `cd widgets && npm run build` — Build frontend for production

---

## Deployment

See [`DEPLOY.md`](DEPLOY.md) for detailed deployment steps and CI/CD pipeline configuration.

---

## Widget Embed Example

```html
<!-- Example: Embed the chat widget in your site -->
<div id="servihub-chat"></div>
<script src="https://chat-demo.servihub.app/widget.js"></script>
<script>
  ServiHubChat.init({
    apiUrl: 'https://chat-api.onrender.com',
    businessId: 'your-business-id',
    theme: 'light'
  });
</script>
```

---

## Documentation

- [`architecture.md`](docs/architecture.md): System design and decisions
- [`DEPLOY.md`](DEPLOY.md): Deployment instructions
- [`RETROSPECTIVE.md`](RETROSPECTIVE.md): Project retrospective

---

## License

MIT

---

## Maintainers

- [Genson Low](genson.low@gmail.com)

