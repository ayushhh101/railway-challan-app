# RailChallan – Digital Railway Challan Platform

A full‑stack MERN application for issuing and managing railway challans (penalties) digitally. Roles supported: Admin, Ticket Collector (TTE / TC), Passenger. Admins manage users and audits; TCs issue challans; Passengers view and (future) pay fines.

Live API Docs: https://ayushhh101.github.io/railway-challan-api-docs/

---

## Tech Stack

**Frontend:** React + Vite, TailwindCSS, react-hot-toast, lucide-react  
**Backend:** Node.js, Express, Mongoose (MongoDB)  
**Other:** JWT Auth, Swagger (OpenAPI), Audit Logging, Seed script, C4 Architecture Diagrams  
**Planned / In‑progress:** Offline challan queue + later sync
---

## Architecture (High Level)

```
+---------------------------+        +----------------------------+
|        Frontend SPA       | <----> |        Backend API         |
|  React (Vite)             |  HTTPS |  Express / Node.js         |
|  Auth flows, dashboards   |        |  Auth, Challans, Reports   |
+-------------+-------------+        +---------------+------------+
              |                                      |
              v                                      v
      Local Storage (JWT)                    MongoDB (Users, Challans,
                                             Passengers, Audits, Anomalies)
```

Key backend layers:
- routes/ → maps HTTP paths
- controllers/ → business logic
- middleware/ → auth, validation, uploads
- models/ → Mongoose schemas
- utils/ → audit logger, pdf, error helpers

Refer to /docs (C4 diagrams) for deeper component & context views.

---

## Notable Features

### Core
1. Digital Challan Issuing (multi‑step wizard: passenger details → offense → fine/payment meta → signature → proof upload).
2. Offline Challan Drafting & Deferred Sync  
   - TTE can fill challan steps when connectivity is poor.  
   - Draft kept locally (localStorage / in‑memory) until network returns.  
   - Pending drafts are marked and can be retried (prevents data loss in the field).  
   - On successful sync, local draft is cleared and standard audit events are recorded.  
3. Challan Management: filter, search, view detail, verify.
4. Passenger Onboarding & separate passenger auth flow.
5. PDF generation & download for each challan.
6. Proof image upload (file middleware + stored in /uploads/proofs).
7. Role-based auth (Admin / TTE / Passenger) with protected routes.
8. Admin Analytics: monthly trends, heatmap, top TTEs, reason distribution, recovery stats.
9. Audit Logging & Anomaly Tracking (suspicious or outlier activity surfaced to admins).
10. Partial Profile Field Updates (per‑field save for TTE profiles).
11. Station seeding script for fast setup.
12. Validation layer (shared middleware) and structured error responses.
13. Reusable UI components (modals, charts, inputs, signature pad).
14. Swagger OpenAPI documentation (public URL).

### Why the Offline Capability Matters (Resume Angle)
- Demonstrates resilience: maintains workflow in low connectivity (common in transit environments).
- Improves data integrity: avoids losing issued challans mid‑entry.
- Showcases forethought in UX + operational constraints.

---

## Monorepo Layout

```
railway-challan-app/
  backend/
  railway-challan-frontend/
  docker-compose.yml
  README.md
```

...