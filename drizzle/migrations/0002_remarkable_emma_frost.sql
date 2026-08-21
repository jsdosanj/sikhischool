CREATE TABLE `child_badges` (
	`id` text PRIMARY KEY NOT NULL,
	`child_profile_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`earned_at` integer NOT NULL,
	FOREIGN KEY (`child_profile_id`) REFERENCES `child_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE no action
);
