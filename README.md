# Math Flap

Math Flap is a one-tap browser game that combines Flappy Bird-style navigation with quick arithmetic. The player guides a flying owl through the corridor containing the correct answer. After each run, the game shows a daily top-10 leaderboard.

Production: https://math-flap.rok-skrinjar.chatgpt.site

> The production Site is currently owner-only. Making it public is a separate access-control change.

## Current product

- Responsive browser game for desktop and mobile
- Addition, subtraction, and multiplication with progressive difficulty
- Wider early gaps that narrow as the score increases
- Increasing horizontal speed with a capped maximum
- Automatically generated anonymous nicknames
- Persistent identity through an HttpOnly cookie; no player login
- Daily top-10 leaderboard, reset at midnight UTC
- Basic server-side score plausibility checks
- Cloudflare D1 persistence through ChatGPT Sites

## Technology

- TypeScript, React 19, Next.js-compatible routing via Vinext
- Vite and Cloudflare Workers
- Cloudflare D1 with Drizzle ORM
- pnpm 11 and Node.js 22.13+
- ChatGPT Sites for Git-backed hosting and deployment

## Repository layout

| Path | Purpose |
| --- | --- |
| `public/game.html` | Main game, rendering, physics, arithmetic, UI, and client API calls |
| `public/math-owl.png` | Owl game sprite |
| `app/page.tsx` | Full-screen shell that loads the game |
| `app/api/player/route.ts` | Creates or restores an anonymous player |
| `app/api/run/route.ts` | Starts a server-tracked game run |
| `app/api/score/route.ts` | Validates and saves a completed run |
| `app/api/leaderboard/route.ts` | Returns the current daily leaderboard |
| `db/schema.ts` | Drizzle schema for players and runs |
| `db/leaderboard.ts` | Nickname, cookie, and leaderboard logic |
| `drizzle/` | D1 database migrations |
| `.openai/hosting.json` | Sites project and D1 binding configuration |
| `AGENTS.md` | Working instructions automatically read by Codex |
| `docs/ARCHITECTURE.md` | Runtime flow and important implementation details |
| `docs/MOVE_TO_CODEX.md` | Exact handoff steps for a local or GitHub-backed Codex project |

## Local setup

Prerequisites:

- Node.js 22.13 or newer
- pnpm 11.25 or newer
- Git

Install and build:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Start the development server:

```bash
pnpm dev
```

The frontend can load without production data, but the leaderboard requires a local D1 database. Build first, then apply the migration:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cool_sally_floyd.sql
```

To preview the built Worker with the local D1 state:

```bash
pnpm start
```

## Useful commands

```bash
pnpm dev          # development server
pnpm build        # production build
pnpm start        # local Cloudflare Worker preview
pnpm lint         # lint the project
pnpm db:generate  # generate a migration after schema changes
```

## Anonymous identity and leaderboard

The server assigns a nickname such as `CleverOtter42` on first use. A random token is stored in the browser as an HttpOnly, SameSite=Lax cookie; only its SHA-256 hash is stored in D1. Clearing cookies or using another browser creates a new anonymous player.

The leaderboard records each player's best score for the current UTC day. Ties favor the score achieved earlier. A submitted score must belong to an active server-created run and pass basic elapsed-time checks.

## Deployment

This checkout is linked to the existing Sites project through `.openai/hosting.json`:

```json
{
  "project_id": "appgprj_6aabc04fbf94819194c3f9a72222b493",
  "d1": "DB",
  "r2": null
}
```

Keep that file when moving the project if the intention is to continue updating the same hosted game. Publishing requires authenticated Sites tooling; a normal `git push` to an unrelated GitHub repository does not update the live Site.

See `docs/MOVE_TO_CODEX.md` for the recommended handoff procedure.

## Product status

The core game, anonymous identity, score submission, and daily leaderboard are working. Sensible next tasks include public launch, real-user playtesting, sound controls, analytics, accessibility improvements, and stronger anti-cheat checks. These are future enhancements, not prerequisites for running the current game.
