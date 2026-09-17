import { getD1 } from "../../../db";
import {
  getDailyLeaderboard,
  getOrCreatePlayer,
  jsonForPlayer,
} from "../../../db/leaderboard";

export async function POST(request: Request) {
  try {
    const player = await getOrCreatePlayer(request);
    const payload = (await request.json()) as { runId?: unknown; score?: unknown };
    const runId = typeof payload.runId === "string" ? payload.runId : "";
    const score = Number(payload.score);
    if (!runId || !Number.isInteger(score) || score < 0 || score > 500) {
      return jsonForPlayer(player, { error: "Invalid score submission." }, 400);
    }

    const db = getD1();
    const run = await db
      .prepare(
        "SELECT started_at FROM runs WHERE id = ? AND player_id = ? AND completed_at IS NULL LIMIT 1",
      )
      .bind(runId, player.id)
      .first<{ started_at: number }>();
    if (!run) return jsonForPlayer(player, { error: "This run is no longer active." }, 409);

    const completedAt = Date.now();
    const elapsed = completedAt - Number(run.started_at);
    const minimumPlausibleMs = Math.max(500, score * 1200);
    if (elapsed < minimumPlausibleMs || elapsed > 7_200_000) {
      return jsonForPlayer(player, { error: "This run could not be verified." }, 422);
    }

    const result = await db
      .prepare(
        "UPDATE runs SET completed_at = ?, score = ? WHERE id = ? AND player_id = ? AND completed_at IS NULL",
      )
      .bind(completedAt, score, runId, player.id)
      .run();
    if (!result.meta.changes) {
      return jsonForPlayer(player, { error: "This run was already submitted." }, 409);
    }

    const leaderboard = await getDailyLeaderboard(player.id);
    return jsonForPlayer(player, { nickname: player.nickname, ...leaderboard });
  } catch (error) {
    console.error("score submission failed", error);
    return Response.json({ error: "Your score could not be submitted." }, { status: 503 });
  }
}
