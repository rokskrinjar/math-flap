# Move Math Flap into a Codex project

## Canonical current location

The current working checkout inside this Codex session is:

```text
/workspace/sites/math-flap
```

That Linux path exists inside the managed Codex environment. It is not a path on your Windows computer.

## Recommended Windows destination

Use:

```text
C:\CODEX\math-flap
```

## Best long-term setup: GitHub plus local clone

1. Create an empty GitHub repository, for example `rokskrinjar/math-flap`.
2. Export or copy this repository, including hidden files and the full `.git` history.
3. Add your GitHub repository as a second remote; keep the Sites remote until the hosting workflow is deliberately changed.
4. Push the current branch to GitHub.
5. Clone the GitHub repository into `C:\CODEX\math-flap`.
6. Open that folder in Codex. Codex will automatically use `AGENTS.md` as project guidance.
7. Install dependencies with `pnpm install --frozen-lockfile` and verify with `pnpm build`.

Example commands after the GitHub repository exists:

```bash
git remote rename origin sites
git remote add origin https://github.com/rokskrinjar/math-flap.git
git push -u origin main
```

Do not paste access tokens into Git remotes. Authenticate with GitHub CLI, Git Credential Manager, or the normal interactive GitHub flow.

## If using only a copied folder

Copy the entire repository, not just `public/game.html`. Include:

- `.git/` for history
- `.openai/hosting.json` for the existing Sites project link
- `app/`, `db/`, `drizzle/`, `public/`, and `scripts/`
- `package.json`, `pnpm-lock.yaml`, and the configuration files
- `README.md` and `AGENTS.md`

Do not copy generated directories such as `node_modules`, `dist`, `.next`, `.vinext`, `.wrangler`, or `.sites-runtime`.

## What moves and what does not

The repository contains the complete source code, assets, schema, and migrations. The hosted D1 database contents and the current production deployment remain attached to the Sites project. They are not embedded in Git.

Keeping `.openai/hosting.json` preserves the project identifier, but publishing to the existing Site still requires an authenticated Codex/Sites environment with permission to that project.

## First Codex prompt

After opening `C:\CODEX\math-flap`, a useful first instruction is:

> Read README.md, AGENTS.md, and docs/ARCHITECTURE.md. Inspect the project without changing anything, run the available verification commands, and report the current architecture, risks, and the next three sensible development tasks.

## Before making the game public

- Test gameplay on desktop and mobile.
- Confirm anonymous nickname persistence and leaderboard updates.
- Decide whether the daily reset should remain midnight UTC or use another timezone.
- Confirm privacy wording and whether lightweight analytics are needed.
- Explicitly change Site access from owner-only to public only when ready.
