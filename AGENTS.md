# Math Flap Codex instructions

## Product intent

Math Flap is a simple, immediately playable arithmetic game. Preserve the fast one-tap loop: see the equation, steer the owl through the correct answer, and restart quickly after failure.

## Source of truth

- `public/game.html` contains the game loop, physics, drawing, arithmetic progression, and game UI.
- `app/api/` and `db/` contain the anonymous-player and leaderboard backend.
- `.openai/hosting.json` links this checkout to the existing hosted Sites project. Do not replace its `project_id` unless the user explicitly wants a separate Site.
- Production access is owner-only until the user explicitly asks to change the audience.

## Working rules

- Keep the game usable with mouse, keyboard, and touch.
- Keep the owl horizontal; do not reintroduce rotation or spinning.
- Preserve generous early pipe gaps and gradual difficulty progression.
- Do not add a login requirement. Player identity must remain automatic and anonymous.
- Never expose the raw anonymous-player token to client JavaScript; keep it in an HttpOnly cookie.
- Treat client scores as untrusted and validate score submissions on the server.
- Daily rankings use UTC and each player's best score for the day.
- Preserve responsive full-screen behavior and avoid page scrolling around the game.
- Keep changes focused. Do not replace the game engine or framework without a concrete reason.

## Verification

For ordinary changes, run:

```bash
pnpm build
pnpm lint
```

For gameplay changes, also test at least one desktop viewport and one narrow mobile viewport. Verify starting a run, scoring, game over, restart, and leaderboard display.

For schema changes, generate and inspect a new Drizzle migration. Never rewrite an already-applied production migration.

## Hosting

This is an existing ChatGPT Sites project, not a new Site. Reuse the current project ID and existing checkout. Preserve the current access mode unless the user explicitly requests an audience change. Follow the Sites build, version, and deployment workflow for hosted updates.
