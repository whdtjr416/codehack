CREATE TABLE `notes` (
	`user_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`body` text NOT NULL,
	PRIMARY KEY(`user_id`, `challenge_id`)
);
--> statement-breakpoint
CREATE TABLE `solves` (
	`user_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`solved_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `challenge_id`)
);
--> statement-breakpoint
CREATE TABLE `weeks` (
	`user_id` text NOT NULL,
	`week` integer NOT NULL,
	PRIMARY KEY(`user_id`, `week`)
);
