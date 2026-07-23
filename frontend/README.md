# Mandalay Hikers Frontend

React Router + TypeScript + Tailwind CSS + Vite frontend rebuilt from the provided `stitch_mandalay_hikers_community_platform.zip` designs.

## Stack

- React 19
- React Router 7
- TypeScript
- Tailwind CSS 4 via `@tailwindcss/vite`
- Vite 8
- pnpm
- ESLint
- Prettier

## Run Locally

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/hiking_web_app/frontend
pnpm install
pnpm dev
```

Open:

```text
http://127.0.0.1:5173/
```

If Vite chooses another port, use the URL shown in the terminal.

## Pages

- `/` home
- `/trails` trail discovery
- `/trails/yankin-ridge` trail detail
- `/events` event listing
- `/events/yankin-dawn` event detail
- `/community` community feed
- `/login` login
- `/register` register
- `/explorer-dashboard` explorer dashboard
- `/organizer/apply` organizer application
- `/organizer-dashboard` organizer dashboard
- `/organizer/events/new` create event
- `/admin` admin login entry

## Checks

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```

## Code Quality

```bash
pnpm lint        # Run ESLint
pnpm lint:fix    # Auto-fix ESLint issues where possible
pnpm lint:fast   # Optional oxlint quick scan
pnpm format      # Format source files with Prettier
pnpm format:check
```

## Notes

- Source entrypoint: `src/main.tsx`
- Main routed app: `src/App.tsx`
- Tailwind is loaded from `src/index.css` and wired in `vite.config.ts`
- Package manager lockfile: `pnpm-lock.yaml`
