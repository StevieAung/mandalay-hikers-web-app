# Mandalay Hiking Community Web App

Full-stack university MVP for a Mandalay-focused hiking community platform.

## Stack

- Backend: Laravel REST API, Sanctum token auth, MySQL
- Frontend: React + Vite SPA
- Roles: explorer, organizer, admin

## Project Structure

```text
backend/   Laravel API, migrations, seeders, feature tests
frontend/  React SPA with public, explorer, organizer, and admin routes
```

## Backend Setup

Create a MySQL database in XAMPP named `hiking_web_app`, then run:

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The API runs at `http://localhost:8000/api`.

Seeded accounts all use password `password`:

- `admin@mandalayhikes.test`
- `verified.organizer@mandalayhikes.test`
- `explorer.min@mandalayhikes.test`

## Frontend Setup

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

The frontend runs at `http://localhost:5173`.

## Implemented MVP

- Register, login, logout, profile update
- Role-based navigation and protected routes
- Trail browse, search, filter, details, favorite, rating, condition report
- Event listing, join/leave, organizer event creation, participant management API
- Community posts and comments
- Organizer application submission and admin approval
- Admin dashboard, users, organizer applications, events, reports, posts APIs
- Seeded Mandalay-region demo trails, events, posts, and users

## Verification

Backend:

```bash
cd backend
php artisan test
```

Frontend:

```bash
cd frontend
pnpm lint
pnpm build
```
