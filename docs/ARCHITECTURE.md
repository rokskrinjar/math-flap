# Architecture

## Runtime overview

1. `app/page.tsx` presents `public/game.html` in a full-screen iframe.
2. The game requests `POST /api/player` to restore or create an anonymous identity.
3. A new game requests `POST /api/run`; the server stores a run ID and start time.
4. On game over, the client sends the run ID and score to `POST /api/score`.
5. The server checks ownership, one-time submission, score bounds, and plausible elapsed time.
6. D1 stores the completed run and the API returns the updated daily leaderboard.

## Data model

### `players`

- `id`: UUID primary key
- `nickname`: unique generated display name
- `token_hash`: SHA-256 hash of the browser token
- `created_at`: Unix time in milliseconds

### `runs`

- `id`: UUID primary key
- `player_id`: owning player
- `started_at`: Unix time in milliseconds
- `completed_at`: set when a valid score is submitted
- `score`: integer score for the completed run

## Identity

The browser receives a 256-bit random token in the `math_flap_player` cookie. It is HttpOnly, SameSite=Lax, one-year duration, and Secure on HTTPS. The database stores only a SHA-256 hash. No email, password, or personally chosen nickname is required.

This identity is browser-specific. Clearing cookies, changing browser profiles, or changing devices creates another player and nickname.

## Daily ranking

The leaderboard window is midnight-to-midnight UTC. It uses the highest valid score per player, orders by score descending, and favors the earlier achievement when scores tie. The API returns the top ten plus the current player's position when outside the top ten.

## Difficulty progression

The game progressively:

- narrows the answer corridor from an intentionally forgiving starting size;
- increases horizontal speed up to a maximum; and
- expands arithmetic from very small addition to subtraction and multiplication.

The exact gameplay constants and score thresholds live in `public/game.html` and should be treated as tunable product parameters.

## Trust boundaries

The browser controls rendering and reports the score, so it cannot be fully trusted. The backend currently requires a server-created run, permits one submission, enforces a score range, and compares score with elapsed time. This blocks trivial submissions but is not tournament-grade anti-cheat.

## Hosting dependencies

Production uses a Cloudflare Worker-compatible build and a D1 binding named `DB`, declared in `.openai/hosting.json`. The production database belongs to the Sites project and is not copied merely by cloning the Git repository.
