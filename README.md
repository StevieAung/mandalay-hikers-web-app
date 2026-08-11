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

Every screen reads and writes real MySQL data through the API — there is no mock
data layer left in the frontend.

- Register, login, logout, profile update with avatar and cover uploads
- Role-based navigation and protected routes
- Home and discovery pages driven by live trails, events, and posts, with
  server-side trail search and difficulty filtering
- Trail details with gallery, map, ratings, favorite toggle, and condition reports
- Event listing, detail, join and leave, organizer event creation, participant
  roster, and attendance marking
- Community posts, comments, and delete-your-own moderation
- Organizer application submitted to the API and approved from the admin queue,
  which promotes the account to organizer
- Admin dashboard, users, organizer applications, trails, events, reports, posts
- Seeded Mandalay-region demo data covering every one of those screens

Content typed by admins and organizers is stored as entered. The Myanmar language
toggle translates the interface chrome; trail and event names render in whatever
language they were saved in.

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
