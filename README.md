# RTCtoBCS
Ceus Capital Full Stack Intern Technical Assessment 

✅ ServiHub Real-Time Chat Service — Objective Checklist
Core Features
<input disabled="" type="checkbox"> Real-time 1-to-1 chat (customerId ↔ businessId)
<input disabled="" type="checkbox"> Multi-agent support (any AGENT can reply in support room)
<input disabled="" type="checkbox"> Instant message delivery (WebSocket-first, SSE fallback)
<input disabled="" type="checkbox"> Presence indicators (online/offline)
<input disabled="" type="checkbox"> Typing indicators (“is typing...”)
<input disabled="" type="checkbox"> Unread message badges
<input disabled="" type="checkbox"> Offline notifications (store message, trigger e-mail/push if customer offline)
<input disabled="" type="checkbox"> (Stretch) Community broadcast/announcement room
Backend
<input disabled="" type="checkbox"> Typed REST + WebSocket APIs (Fastify plugin)
<input disabled="" type="checkbox"> PostgreSQL persistence via Prisma (models, migrations)
<input disabled="" type="checkbox"> Authentication using ServiHub JWTs (verify JWT on WS upgrade)
<input disabled="" type="checkbox"> Rate-limiting (20 msgs / 5s, backed by Redis)
<input disabled="" type="checkbox"> Stateless nodes; Redis pub/sub for cross-node broadcast
<input disabled="" type="checkbox"> JSON logs; /health endpoint returns 200 OK
<input disabled="" type="checkbox"> WS ping every 25s
<input disabled="" type="checkbox"> Data model matches assignment (User, Business, Conversation, Participant, Message, Attachment, Reaction)
<input disabled="" type="checkbox"> Soft-delete support (deletedAt)
Frontend
<input disabled="" type="checkbox"> React + TypeScript widget (≤ 20 kB gzipped, UMD bundle)
<input disabled="" type="checkbox"> Responsive chat bubbles, file preview, unread badge, staff labels
<input disabled="" type="checkbox"> Accessible (WCAG 2.1 AA, ARIA live regions, keyboard navigation)
<input disabled="" type="checkbox"> Themeable via CSS variables
Testing & CI
<input disabled="" type="checkbox"> Jest unit + integration tests (≥ 80% coverage, WS mocks)
<input disabled="" type="checkbox"> CI pipeline: lint, type-check, test, upload coverage badge
DevOps & Docs
<input disabled="" type="checkbox"> Dockerfile & docker-compose.yml (App + Postgres + Redis)
<input disabled="" type="checkbox"> .env.example (JWT secret, DB URL, CORS origin, etc.)
<input disabled="" type="checkbox"> README.md (local setup, scripts, widget embed snippet)
<input disabled="" type="checkbox"> DEPLOY.md (deploy steps or CI pipeline config)
<input disabled="" type="checkbox"> RETROSPECTIVE.md (trade-offs, known issues, next steps)
<input disabled="" type="checkbox"> Public GitHub repo, tagged release v0.1.0
<input disabled="" type="checkbox"> Public demo URL (frontend & backend)
<input disabled="" type="checkbox"> /health endpoint works on backend
Bonus / Stretch
<input disabled="" type="checkbox"> End-to-end encryption demo
<input disabled="" type="checkbox"> Searchable history (Typesense)
<input disabled="" type="checkbox"> Voice-room POC
<input disabled="" type="checkbox"> Reaction table