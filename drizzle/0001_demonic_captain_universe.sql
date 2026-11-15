CREATE TABLE `checkpoints` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`choice` integer NOT NULL,
	`correct` integer NOT NULL,
	`attempts` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `question_id`)
);
