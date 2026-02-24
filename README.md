# Studio Pro (Next.js + Prisma)

Premium photography site with role-based member system (customer / photographer / admin).

## Stack
- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL
- JWT cookie session (`jose`)
- S3/R2 presigned upload/download

## Local Setup
1. Install
```bash
npm install
```
2. Environment
```bash
cp .env.example .env
```
3. Prisma generate + migration
```bash
npm run prisma:generate
npm run prisma:migrate
```
4. Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Member Portals
- `/auth` login/register
- `/portal` customer dashboard
- `/photographer` photographer workspace
- `/admin` admin dashboard

## Role Hierarchy
- `super_admin` (L100): full access, including super admin role management.
- `admin` (L60): admin dashboard and operations, but cannot manage `super_admin`.
- `photographer` (L30): assigned-project operations, status update, asset upload flow.
- `customer` (L10): own-project viewing and download access.

## Bootstrap Super Admin
Use this once on a configured database to create/reset the top-level administrator:

```bash
BOOTSTRAP_ADMIN_EMAIL='your-admin-email@example.com' \
BOOTSTRAP_ADMIN_PASSWORD='your-strong-password' \
BOOTSTRAP_ADMIN_NAME='Your Admin Name' \
npm run auth:bootstrap-super-admin
```

## API (MVP)
- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Projects
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:id`
  - `PATCH /api/projects/:id/status`
  - `POST /api/projects/:id/members`
- Assets
  - `GET /api/projects/:id/assets`
  - `POST /api/projects/:id/assets`
  - `POST /api/projects/:id/assets/presign-upload`
  - `GET /api/assets/:id/presign-download`
- Admin
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:id/roles`
  - `GET /api/admin/audit-logs`
  - `GET /api/admin/kpi/overview`

## Prisma Schema
Database schema is in `prisma/schema.prisma`, including:
- users / roles / user_roles
- projects / project_members / project_status_logs
- shoot_schedules
- assets / deliveries / delivery_items
- audit_logs
