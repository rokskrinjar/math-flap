import {
  getDailyLeaderboard,
  getOrCreatePlayer,
  jsonForPlayer,
} from "../../../db/leaderboard";

export async function GET(request: Request) {
  try {
    const player = await getOrCreatePlayer(request);
    const leaderboard = await getDailyLeaderboard(player.id);
    return jsonForPlayer(player, { nickname: player.nickname, ...leaderboard });
  } catch (error) {
    console.error("leaderboard load failed", error);
    return Response.json({ error: "The daily leaderboard is temporarily unavailable." }, { status: 503 });
  }
}
