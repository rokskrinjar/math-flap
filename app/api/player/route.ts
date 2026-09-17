import { getOrCreatePlayer, jsonForPlayer } from "../../../db/leaderboard";

export async function POST(request: Request) {
  try {
    const player = await getOrCreatePlayer(request);
    return jsonForPlayer(player, { nickname: player.nickname });
  } catch (error) {
    console.error("player initialization failed", error);
    return Response.json({ error: "Player identity is temporarily unavailable." }, { status: 503 });
  }
}
