# ORNITH Community Network

ORNITH is a campus-first network for nearby needs, offers, rides, plans, marketplace intents, and services. Discovery, AI matching, reputation, chat, and safety controls all work from the same intent model.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`, set `POSTGRES_PRISMA_DATABASE_URL` to a PostgreSQL connection string, and set a private `JWT_SECRET`.
3. Run `npm ci`.
4. Run `npx prisma db push` to create/update the PostgreSQL schema.
5. Run `npm run db:seed` only against a disposable development database when you want to reset it and reload the demo data. The seed script deletes existing records first. Demo accounts use `password123`.
6. Run `npm run dev` and open `http://localhost:3000`.

The app also supports ordinary account creation and sign-in at `/auth`. New accounts remain unverified until an administrator updates their verification state.

## Production deployment notes

- Set `JWT_SECRET` to a unique, stable random value and `NEXT_PUBLIC_APP_URL` to the public HTTPS origin.
- Prisma uses PostgreSQL through `POSTGRES_PRISMA_DATABASE_URL`. For Vercel, connect the Prisma Postgres storage resource with the `POSTGRES` prefix and keep the generated `POSTGRES_PRISMA_DATABASE_URL` variable in Production and Preview deployments.
- The build command runs `prisma db push` before the Next.js build so new deployments create or update the schema. Never run the demo seed command against production; it clears existing records.
- The Android wrapper loads the hosted Next.js app. Set `CAPACITOR_SERVER_URL` to the public HTTPS origin before syncing/building the final APK. When the URL uses HTTPS, the wrapper disables cleartext traffic. The default `10.0.2.2` URL is only for a local Android emulator.

PowerShell example for the final Android sync:

```powershell
$env:CAPACITOR_SERVER_URL = "https://your-app.example"
npx cap sync android
```

## Main flows

- Nearby Radar with text search, type filters, and visibility radius.
- Natural-language intent extraction, explainable risk indicators, and compatible-post matching.
- Post lifecycle, express-interest and accept/reject actions, chat, reports, and blocking.
- Rides, route matching, plans, group membership, shared-expense calculations, and manual settlements.
- Marketplace intents, notifications, profile XP/trust, opportunity eligibility, and moderator report review.
- Responsive web UI and Capacitor Android shell using the ORNITH charcoal, coral, sage, sand, and lavender palette.
