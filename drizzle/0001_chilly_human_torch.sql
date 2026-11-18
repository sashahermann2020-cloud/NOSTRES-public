CREATE TABLE `route_feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_id` text NOT NULL,
	`method_id` text,
	`outcome` text,
	`clarity_rating` integer NOT NULL,
	`next_action_status` text NOT NULL,
	`official_action_status` text NOT NULL,
	`blocker_code` text DEFAULT 'none' NOT NULL,
	`attempt_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_route_feedback_route_created` ON `route_feedback` (`route_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
