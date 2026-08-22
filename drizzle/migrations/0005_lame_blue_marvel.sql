CREATE TABLE `scripture_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`source` text NOT NULL,
	`page_number` integer NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `scripture_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scripture_pages_source_page_number_unique` ON `scripture_pages` (`source`,`page_number`);