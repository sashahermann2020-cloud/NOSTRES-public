CREATE TABLE `issue_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_id` text NOT NULL,
	`method_id` text,
	`step_index` integer,
	`source_id` text,
	`issue_type` text NOT NULL,
	`attempt_id` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_issue_reports_status_created` ON `issue_reports` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `product_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_name` text NOT NULL,
	`route_id` text NOT NULL,
	`method_id` text,
	`element_id` text,
	`step_index` integer,
	`problem_code` text,
	`attempt_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_product_events_route_event_created` ON `product_events` (`route_id`,`event_name`,`created_at`);