# RTCtoBCS
Ceus Capital Full Stack Intern Technical Assessment 

# ✅ ServiHub Real-Time Chat Service — Objective Checklist

## Core Features

* [ ] Real-time 1-to-1 chat (customerId ↔ businessId)
* [ ] Multi-agent support (any AGENT can reply in support room)
* [ ] Instant message delivery (WebSocket-first, SSE fallback)
* [ ] Presence indicators (online/offline)
* [ ] Typing indicators (“is typing...”)
* [ ] Unread message badges
* [ ] Offline notifications (store message, trigger e-mail/push if customer offline)
* [ ] *(Stretch)* Community broadcast/announcement room

## Backend

* [ ] Typed REST + WebSocket APIs (Fastify plugin)
* [ ] PostgreSQL persistence via Prisma (models, migrations)
* [ ] Authentication using ServiHub JWTs (verify JWT on WS upgrade)
* [ ] Rate-limiting (20 msgs / 5s, backed by Redis)
* [ ] Stateless nodes; Redis pub/sub for cross-node broadcast
* [ ] JSON logs; `/health` endpoint returns 200 OK
* [ ] WebSocket ping every 25s
* [ ] Data model matches assignment (User, Business, Conversation, Participant, Message, Attachment, Reaction)
* [ ] Soft-delete support (`deletedAt`)

## Frontend

* [ ] React + TypeScript widget (≤ 20 kB gzipped, UMD bundle)
* [ ] Responsive chat bubbles, file preview, unread badge, staff labels
* [ ] Accessible (WCAG 2.1 AA, ARIA live regions, keyboard navigation)
* [ ] Themeable via CSS variables

## Testing & CI

* [ ] Jest unit + integration tests (≥ 80% coverage, WS mocks)
* [ ] CI pipeline: lint, type-check, test, upload coverage badge

## DevOps & Docs

* [ ] Dockerfile & `docker-compose.yml` (App + Postgres + Redis)
* [ ] `.env.example` (JWT secret, DB URL, CORS origin, etc.)
* [ ] `README.md` (local setup, scripts, widget embed snippet)
* [ ] `DEPLOY.md` (deploy steps or CI pipeline config)
* [ ] `RETROSPECTIVE.md` (trade-offs, known issues, next steps)
* [ ] Public GitHub repo, tagged release `v0.1.0`
* [ ] Public demo URL (frontend & backend)
* [ ] `/health` endpoint works on backend

## Bonus / Stretch Goals

* [ ] End-to-end encryption demo
* [ ] Searchable history (Typesense)
* [ ] Voice-room POC
* [ ] Reaction table

