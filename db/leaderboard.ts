import { getD1 } from "./index";

const COOKIE_NAME = "math_flap_player";
const ADJECTIVES = [
  "Azure", "Brave", "Bright", "Calm", "Clever", "Cosmic", "Daring", "Golden",
  "Happy", "Jolly", "Kind", "Lucky", "Mighty", "Nimble", "Quick", "Silver",
  "Smart", "Sunny", "Swift", "Wise",
];
const ANIMALS = [
  "Badger", "Bear", "Dolphin", "Falcon", "Fox", "Hare", "Koala", "Lynx",
  "Otter", "Owl", "Panda", "Raven", "Seal", "Tiger", "Turtle", "Wolf",
];

export type AnonymousPlayer = {
  id: string;
  nickname: string;
  setCookie: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  nickname: string;
  score: number;
  isYou: boolean;
};

function parseCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function nicknameCandidate() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${adjective}${animal}${number}`;
}

export async function getOrCreatePlayer(request: Request): Promise<AnonymousPlayer> {
  const db = getD1();
  const existingToken = parseCookie(request, COOKIE_NAME);
  if (existingToken && /^[a-f0-9]{64}$/.test(existingToken)) {
    const tokenHash = await hashToken(existingToken);
    const existing = await db
      .prepare("SELECT id, nickname FROM players WHERE token_hash = ? LIMIT 1")
      .bind(tokenHash)
      .first<{ id: string; nickname: string }>();
    if (existing) return { ...existing, setCookie: null };
  }

  const token = randomToken();
  const tokenHash = await hashToken(token);
  const id = crypto.randomUUID();
  const createdAt = Date.now();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const nickname = nicknameCandidate();
    try {
      await db
        .prepare(
          "INSERT INTO players (id, nickname, token_hash, created_at) VALUES (?, ?, ?, ?)",
        )
        .bind(id, nickname, tokenHash, createdAt)
        .run();
      return {
        id,
        nickname,
        setCookie: `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=31536000; HttpOnly${new URL(request.url).protocol === "https:" ? "; Secure" : ""}; SameSite=Lax`,
      };
    } catch (error) {
      if (!String(error).toLowerCase().includes("unique")) throw error;
    }
  }
  throw new Error("Could not allocate a unique anonymous nickname.");
}

export function jsonForPlayer(player: AnonymousPlayer, body: unknown, status = 200) {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  if (player.setCookie) headers.set("set-cookie", player.setCookie);
  return new Response(JSON.stringify(body), { status, headers });
}

export function utcDayStart(now = Date.now()) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function getDailyLeaderboard(playerId: string) {
  const dayStart = utcDayStart();
  const dayEnd = dayStart + 86_400_000;
  const rows = await getD1()
    .prepare(
      `WITH best AS (
        SELECT p.id AS player_id, p.nickname AS nickname, MAX(r.score) AS score,
               MIN(r.completed_at) AS achieved_at
        FROM runs r
        JOIN players p ON p.id = r.player_id
        WHERE r.completed_at >= ? AND r.completed_at < ? AND r.score IS NOT NULL
        GROUP BY p.id, p.nickname
      ), ranked AS (
        SELECT player_id, nickname, score,
               ROW_NUMBER() OVER (ORDER BY score DESC, achieved_at ASC) AS rank
        FROM best
      )
      SELECT player_id, nickname, score, rank
      FROM ranked
      WHERE rank <= 10 OR player_id = ?
      ORDER BY rank ASC`,
    )
    .bind(dayStart, dayEnd, playerId)
    .all<{ player_id: string; nickname: string; score: number; rank: number }>();

  const entries = rows.results.map((row) => ({
    rank: Number(row.rank),
    nickname: row.nickname,
    score: Number(row.score),
    isYou: row.player_id === playerId,
  }));
  return {
    entries: entries.filter((entry) => entry.rank <= 10),
    you: entries.find((entry) => entry.isYou) ?? null,
    resetsAt: dayEnd,
  };
}
