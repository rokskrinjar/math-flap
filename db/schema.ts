import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const players = sqliteTable(
  "players",
  {
    id: text("id").primaryKey(),
    nickname: text("nickname").notNull(),
    tokenHash: text("token_hash").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_players_nickname").on(table.nickname),
    uniqueIndex("idx_players_token_hash").on(table.tokenHash),
  ],
);

export const runs = sqliteTable(
  "runs",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id),
    startedAt: integer("started_at").notNull(),
    completedAt: integer("completed_at"),
    score: integer("score"),
  },
  (table) => [
    index("idx_runs_player_started").on(table.playerId, table.startedAt),
    index("idx_runs_completed_score").on(table.completedAt, table.score),
  ],
);
