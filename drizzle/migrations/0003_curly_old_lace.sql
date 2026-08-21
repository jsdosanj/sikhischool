CREATE TABLE `classroom_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`classroom_license_id` text NOT NULL,
	`child_profile_id` text NOT NULL,
	`enrolled_at` integer NOT NULL,
	FOREIGN KEY (`classroom_license_id`) REFERENCES `classroom_licenses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child_profile_id`) REFERENCES `child_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classroom_enrollments_classroom_license_id_child_profile_id_unique` ON `classroom_enrollments` (`classroom_license_id`,`child_profile_id`);--> statement-breakpoint
ALTER TABLE `classroom_licenses` ADD `join_code` text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE UNIQUE INDEX `classroom_licenses_join_code_unique` ON `classroom_licenses` (`join_code`);