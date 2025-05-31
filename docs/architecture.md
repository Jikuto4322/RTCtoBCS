# Project Architecture

## Overview

This document describes the high-level architecture and key design decisions for the RTCtoBCS project. The system is designed to provide a real-time chat platform with robust backend and frontend separation, scalable data management, and modern development practices.

---

## 1. Technology Stack

- **Frontend:** React (TypeScript), Vite, @testing-library/react
- **Backend:** Node.js, Fastify, TypeScript
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time Communication:** WebSockets (Fastify WebSocket plugin)
- **Testing:** Jest, Supertest, @testing-library/react
- **DevOps:** Docker, GitHub Actions (CI/CD)

---

## 2. System Architecture

- **Monorepo Structure:**  
  The project is organized as a monorepo with clear separation between backend (`src/`), frontend (`widgets/`), and shared resources (`prisma/`, `docs/`).

- **Backend:**  
  - Fastify server exposes RESTful APIs and WebSocket endpoints.
  - Prisma ORM manages database access and migrations.
  - JWT-based authentication secures API and WebSocket connections.
  - Modular route definitions for scalability and maintainability.

- **Frontend:**  
  - React components for chat UI, login, and presence.
  - State management via React hooks.
  - WebSocket client for real-time updates.
  - CSS modules for scoped styling.

---

## 3. Key Design Choices

- **Type Safety:**  
  TypeScript is used throughout the stack for safer, more maintainable code.

- **Real-time Communication:**  
  WebSockets are used for instant message delivery and presence updates, ensuring a responsive chat experience.

- **Database Modeling:**  
  Prisma schema uses enums for roles, message types, and conversation types, improving data integrity and code readability.

- **Authentication:**  
  JWT tokens are used for stateless, scalable authentication across REST and WebSocket endpoints.

- **Testing:**  
  Comprehensive unit and integration tests for both backend and frontend, using Jest and Supertest.

- **Separation of Concerns:**  
  Clear separation between API logic, business logic, and presentation/UI logic.

---

## 4. Scalability & Maintainability

- **Modular Codebase:**  
  Each feature (e.g., chat, presence, authentication) is implemented as a separate module or component.

- **Environment Configuration:**  
  Sensitive data and environment-specific settings are managed via environment variables.

- **Extensibility:**  
  The architecture supports adding new features (e.g., new message types, notification channels) with minimal changes to existing code.

---

## 5. Security Considerations

- **Input Validation:**  
  All API endpoints validate input data to prevent injection attacks.

- **Authentication & Authorization:**  
  JWT tokens are validated on every request; role-based access control is enforced where necessary.

- **Error Handling:**  
  Consistent error handling and logging for easier debugging and monitoring.

---

## 6. Deployment

- **Dockerized Services:**  
  The backend and database can be run in containers for local development and production.

- **CI/CD:**  
  Automated testing and deployment pipelines via GitHub Actions.

---

## 7. Diagram

```mermaid
flowchart LR
    subgraph Frontend
        A[React App<br/>(widgets/)]
    end

    subgraph Backend
        B[Fastify Server<br/>(src/)]
        C[WebSocket Handler]
        D[REST API Routes]
    end

    subgraph Database
        E[(PostgreSQL<br/>Prisma ORM)]
    end

    A -- REST API / WebSocket --> B
    B -- WebSocket --> C
    B -- REST API --> D
    D -- Prisma --> E
    C -- Prisma --> E
    A -- JWT Auth --> B
```

- **Frontend** communicates with the **Backend** via REST API and WebSocket.
- **Backend** handles both REST and WebSocket connections, authenticates via JWT, and interacts with the **Database** using Prisma ORM.
- **Database** stores all persistent data (users, messages, conversations, etc.).

---

## 8. Future Improvements

- Add support for group chats and media messages.
- Implement rate limiting and monitoring.
- Enhance frontend accessibility and mobile responsiveness.