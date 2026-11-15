CREATE TABLE `exam_attempts` (
	`user_id` text NOT NULL,
	`attempt_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`mode` text NOT NULL,
	`choices` text NOT NULL,
	`started_at` text NOT NULL,
	`submitted_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `attempt_id`)
);
