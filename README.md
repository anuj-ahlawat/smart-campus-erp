## Smart Campus ERP

Smart Campus is a CAMU-like reference implementation that ships a **custom JWT + refresh token auth system**, role-isolated layouts, invite-only onboarding, QR powered outpasses, Socket.io notifications, an Emergency Security Alert feature, and full Express/Mongoose backend—no Clerk, Docker, or Redis required.

### Stack at a Glance

- **Frontend**: Next.js 16 App Router · TypeScript · Tailwind CSS · shadcn/ui refinements · Recharts
- **Auth**: Email-password with bcrypt hashing, invite validation, email verification tokens, short-lived JWT access token + HttpOnly refresh cookie
- **Backend**: Node.js + Express + Zod validations + Socket.io + Nodemailer + Cloudinary/S3 upload helper (FastAPI stub included for parity)
- **Database**: MongoDB + Mongoose models with indexes for every collection listed in the spec
- **Realtime & Notifications**: Socket.io (`attendanceMarked`, `outpassStatusChanged`, `newAnnouncement`, `menuPublished`) + email templates for invites, verification, reset, outpass status, and result publish
- **Testing & CI**: Jest unit test for `/api/outpass/apply`, Cypress E2E for “student apply outpass”, GitHub Actions workflow, Vercel config

### Project Tree

```
smart-campus/
├── app/                        # Next.js App Router (public + auth + role portals)
├── components/                 # Layouts, UI primitives, QR utilities, notifications
├── hooks/                      # useAuth, useAuthRole, useRoleGuard, useApi, useInvite, useSocket
├── providers/                  # AuthProvider + SocketProvider contexts
├── src/lib/                    # Routes, middleware helpers, CSV/date utils, QR helpers
├── types/                      # Shared role enums + nav metadata
├── backend/                    # Express API (controllers, routes, models, sockets, tests, scripts)
├── cypress/                    # E2E spec for student outpass application
├── .github/workflows/ci.yml    # Lint + test + build pipeline
├── vercel.json                 # Vercel deployment hints
└── env.example                 # Required environment variables
```

### Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `backend/.env` (API):

```
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5050

# Backend
PORT=5050
MONGODB_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=replace-me
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-me-again
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_VERIFY_URL=http://localhost:3000/auth/verify-email
FRONTEND_URL=http://localhost:3000
QR_SIGNING_SECRET=qr-signing-secret
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123
CLOUDINARY_API_SECRET=abc
AWS_S3_BUCKET=optional
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
MAILER_FROM=notifications@smart-campus.dev
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
SOCKET_CORS=http://localhost:3000
```

#### Emergency Security Alert – SMTP / Gmail Setup

The Emergency Security Alert feature sends emails to security staff with the student's details and live location. To enable email delivery:

- Backend reads SMTP config from `backend/.env` via `backend/src/config/env.ts`.
- For **Gmail SMTP**, configure:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com              # Gmail account used to send alerts
SMTP_PASS=your_gmail_app_password          # 16-char App Password (not normal password)
MAILER_FROM="Smart Campus <yourgmail@gmail.com>"
SECURITY_ALERT_EMAIL=security-team@yourcollege.com
```

Steps for Gmail App Password:

1. Turn on 2-Step Verification for the Gmail account.
2. In Google Account → Security → App passwords, create an app password for **Mail**.
3. Copy the 16-character value (without spaces) into `SMTP_PASS`.
4. Restart the backend (`cd backend && npm run dev`).

You can also point `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` to any other SMTP provider (e.g. Mailtrap, SendGrid).

### Getting Started

```bash
# install root + backend deps
npm install
npm install --workspace backend

# run Next.js (port 3000 by default)
npm run dev

# run Express API (port 5050)
cd backend && npm run dev

# lint + tests
npm run lint
npm run -w backend test
npm run cy:open   # or npm run cy:run
```

### Auth & Onboarding Flow

1. **College Admin registration** (`/auth/college-register` → `POST /api/auth/college-register`): creates college, admin, email verification token, and sends the verification email.
2. **Email verification** (`/auth/verify-email?token=` → `GET /api/auth/verify-email`): unlocks `/admin/onboarding`.
3. **Onboarding workspace** (`/admin/onboarding`): admin configures settings, generates invite codes, uploads CSVs, or emails invites (`POST /api/auth/invite/create`).
4. **Invite-based self registration** (`/auth/register?code=` → `POST /api/auth/invite/register`): validates invite, pre-fills role/department/hostel data, marks invite as used.
5. **Login + tokens** (`/auth/login` → `POST /api/auth/login`): returns short-lived JWT access token + HttpOnly refresh cookie. `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/request-password-reset`, `/api/auth/reset-password` complete the lifecycle.

The Next.js `middleware.ts` reads `campus_role`/`campus_authenticated` cookies (set by `AuthProvider`) to protect role routes while Express middleware validates JWTs on every API request.

### Key Backend Endpoints

- **Auth & Invites**: `/api/auth/college-register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/verify-email`, `/api/auth/invite/create`, `/api/auth/invite/validate`, `/api/auth/invite/register`, `/api/auth/request-password-reset`, `/api/auth/reset-password`
- **Users (admin)**: `POST /api/users`, `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `PUT /api/users/:id/role`, `DELETE /api/users/:id`
- **Attendance**: `POST /api/attendance/mark`, `GET /api/attendance/student/:studentId`, `GET /api/attendance/class/:classSection`, `PUT /api/attendance/:id`
- **Outpass & QR**: `POST /api/outpass/apply`, approval endpoints for parent/warden/admin override, `POST /api/outpass/:id/scan`, `PUT /api/outpass/:id/cancel`, `GET /api/qr/outpass/:outpassId`
- **Cafeteria**: `GET/POST /api/cafeteria/menu`, `POST /api/cafeteria/scan`, `GET /api/cafeteria/logs`
- **Academic Content**: `/api/results/upload`, `/api/results/student/:id`, `/api/notes/upload`, `/api/notes/subject/:id`
- **Scheduling & Communication**: Timetable/Holiday/Event CRUD (`/api/timetable`, `/api/holidays`, `/api/events`), `/api/notifications/send`, `/api/upload`
- **Emergency Security Alert**: `POST /api/emergency-alerts` – authenticated students send GPS coordinates; backend stores an `EmergencyAlert` record and emails all `security` role users plus `SECURITY_ALERT_EMAIL` with a Google Maps link.

Every controller returns structured errors `{ status, code, message, details? }`, logs admin actions, validates payloads with Zod, and emits Socket.io events when relevant.

### Testing & QA

- **Unit**: `backend/src/tests/outpass.controller.test.ts` (Jest) verifies the `/api/outpass/apply` workflow.
- **E2E**: `cypress/e2e/apply-outpass.cy.ts` bootstraps a mock student session, opens the student dashboard, and walks through the apply modal.

```bash
npm run -w backend test
npm run cy:run
```

### Deployment Notes

- **Frontend**: Deploy to Vercel using `vercel.json`. `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL` must point at your API origin.
- **Backend**: Deploy `backend/` to any Node 20+ host (PM2, systemd, Fly.io, Railway). Run `npm install && npm run build && npm start`.
- **CI/CD**: `.github/workflows/ci.yml` caches npm modules, runs lint, executes backend tests, and builds the Next app. Extend it with deploy steps as needed.
- **Migrations**: `backend/scripts/import-invites.ts` imports CSV invite codes (Usage: `ts-node scripts/import-invites.ts invites.csv <collegeId> [adminId]`).
