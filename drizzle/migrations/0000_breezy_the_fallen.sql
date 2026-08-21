CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`classroom_license_id` text,
	`author_teacher_account_id` text,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`classroom_license_id`) REFERENCES `classroom_licenses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_teacher_account_id`) REFERENCES `teacher_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`tier` text NOT NULL,
	`icon_ref` text,
	`criteria` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `badges_key_unique` ON `badges` (`key`);--> statement-breakpoint
CREATE TABLE `child_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_account_id` text NOT NULL,
	`display_name` text NOT NULL,
	`grade_level` text NOT NULL,
	`avatar_config` text,
	FOREIGN KEY (`parent_account_id`) REFERENCES `parent_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `classroom_licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_account_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`teacher_account_id`) REFERENCES `teacher_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`grade_level` text NOT NULL,
	`grade_band` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`wa_standard_refs` text DEFAULT '[]' NOT NULL,
	`shell_assignment` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`detail` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grade_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`child_profile_id` text NOT NULL,
	`node_id` text NOT NULL,
	`override_score` integer,
	`set_by_teacher_account_id` text,
	`set_at` integer,
	FOREIGN KEY (`child_profile_id`) REFERENCES `child_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`set_by_teacher_account_id`) REFERENCES `teacher_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gurbani_glossary` (
	`id` text PRIMARY KEY NOT NULL,
	`term` text NOT NULL,
	`definition` text NOT NULL,
	`section_refs` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`order` integer NOT NULL,
	`day_of_week` integer,
	`title` text NOT NULL,
	`grade_level` text NOT NULL,
	`subject` text NOT NULL,
	`standard_tags` text DEFAULT '[]' NOT NULL,
	`content_blocks` text DEFAULT '[]' NOT NULL,
	`activity_refs` text DEFAULT '[]' NOT NULL,
	`mastery_quiz_id` text,
	`mastery_points_familiar` integer DEFAULT 50 NOT NULL,
	`mastery_points_proficient` integer DEFAULT 80 NOT NULL,
	`mastery_points_mastered` integer DEFAULT 100 NOT NULL,
	`ai_generated` integer DEFAULT false NOT NULL,
	`ai_review_status` text DEFAULT 'pending' NOT NULL,
	`citations` text DEFAULT '[]' NOT NULL,
	`enrichment_links` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pacing_guides` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`week_by_week_sequence` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parent_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parent_accounts_email_unique` ON `parent_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `punjabi_dictionary` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`translation` text NOT NULL,
	`part_of_speech` text,
	`example_sentence` text,
	`audio_ref` text
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text NOT NULL,
	`questions` text DEFAULT '[]' NOT NULL,
	`mastery_weight` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scripture_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`stage_id` text NOT NULL,
	`order` integer NOT NULL,
	`title` text NOT NULL,
	`text_ref` text NOT NULL,
	`audio_ref` text,
	`padched_larivaar_support` integer DEFAULT false NOT NULL,
	`glossary_refs` text DEFAULT '[]' NOT NULL,
	`mastery_quiz_id` text,
	FOREIGN KEY (`stage_id`) REFERENCES `scripture_stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `scripture_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`order` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`recommended_grade_band` text
);
--> statement-breakpoint
CREATE TABLE `sikhi_school_teachers` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_account_id` text NOT NULL,
	`classroom_license_id` text NOT NULL,
	`grade_level` text,
	FOREIGN KEY (`teacher_account_id`) REFERENCES `teacher_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_license_id`) REFERENCES `classroom_licenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`child_profile_id` text NOT NULL,
	`node_id` text NOT NULL,
	`status` text DEFAULT 'not-started' NOT NULL,
	`mastery_points` integer DEFAULT 0 NOT NULL,
	`last_practiced_at` integer,
	`decay_scheduled_at` integer,
	FOREIGN KEY (`child_profile_id`) REFERENCES `child_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teacher_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teacher_accounts_email_unique` ON `teacher_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `teacher_guides` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`objectives` text DEFAULT '[]' NOT NULL,
	`materials_needed` text DEFAULT '[]' NOT NULL,
	`facilitation_script` text NOT NULL,
	`differentiation_tips` text DEFAULT '[]' NOT NULL,
	`estimated_minutes` integer,
	`answer_key` text,
	`standards_rationale` text,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transfer_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`account_type` text NOT NULL,
	`account_id` text NOT NULL,
	`target_email` text NOT NULL,
	`status` text DEFAULT 'pending_teacher' NOT NULL,
	`requested_at` integer NOT NULL,
	`teacher_approver_id` text,
	`teacher_approved_at` integer,
	`admin_activator_id` text,
	`activated_at` integer,
	FOREIGN KEY (`teacher_approver_id`) REFERENCES `teacher_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`order` integer NOT NULL,
	`title` text NOT NULL,
	`week_of_year` integer,
	`standard_tags` text DEFAULT '[]' NOT NULL,
	`unit_test_id` text,
	`badge_id` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `worksheets` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text,
	`scripture_section_id` text,
	`title` text NOT NULL,
	`pdf_asset_ref` text,
	`generation_template_key` text,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scripture_section_id`) REFERENCES `scripture_sections`(`id`) ON UPDATE no action ON DELETE no action
);
