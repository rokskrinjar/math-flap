import { getD1 } from "../../../db";
import { getOrCreatePlayer, jsonForPlayer } from "../../../db/leaderboard";

export async function POST(request: Request) {
  try {
    const player = await getOrCreatePlayer(request);
    const runId = crypto.randomUUID();
    await getD1()
      .prepare("INSERT INTO runs (id, player_id, started_at) VALUES (?, ?, ?)")
      .bind(runId, player.id, Date.now())
      .run();
    return jsonForPlayer(player, { runId, nickname: player.nickname }, 201);
  } catch (error) {
    console.error("run creation failed", error);
    return Response.json({ error: "A new run could not be started." }, { status: 503 });
  }
}
