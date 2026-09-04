CREATE TABLE `dictionary` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`word` text NOT NULL,
	`translation` text NOT NULL,
	`part_of_speech` text,
	`synonyms` text DEFAULT '[]' NOT NULL,
	`example_sentence` text,
	`audio_ref` text,
	`grade_band_hint` text
);
