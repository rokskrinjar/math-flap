CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_nickname` ON `players` (`nickname`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_token_hash` ON `players` (`token_hash`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`score` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_runs_player_started` ON `runs` (`player_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `idx_runs_completed_score` ON `runs` (`completed_at`,`score`);