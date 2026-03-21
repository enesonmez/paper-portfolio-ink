PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_locales` (
	`code` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "locales_code_lowercase_check" CHECK("__new_locales"."code" = lower("__new_locales"."code")),
	CONSTRAINT "locales_code_length_check" CHECK(length("__new_locales"."code") between 2 and 35),
	CONSTRAINT "locales_code_spacing_check" CHECK(instr("__new_locales"."code", ' ') = 0),
	CONSTRAINT "locales_code_dash_check" CHECK("__new_locales"."code" not like '-%' and "__new_locales"."code" not like '%-' and "__new_locales"."code" not like '%--%')
);
--> statement-breakpoint
INSERT INTO `__new_locales`("code", "label", "is_active", "is_default", "sort_order", "created_at", "updated_at") SELECT "code", "label", "is_active", "is_default", "sort_order", "created_at", "updated_at" FROM `locales`;--> statement-breakpoint
DROP TABLE `locales`;--> statement-breakpoint
ALTER TABLE `__new_locales` RENAME TO `locales`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `locales_is_active_idx` ON `locales` (`is_active`);--> statement-breakpoint
CREATE INDEX `locales_sort_order_idx` ON `locales` (`sort_order`);--> statement-breakpoint
CREATE TABLE `__new_translations` (
	`locale` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`locale`, `key`),
	FOREIGN KEY (`locale`) REFERENCES `locales`(`code`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_translations`("locale", "key", "value", "created_at", "updated_at") SELECT "locale", "key", "value", "created_at", "updated_at" FROM `translations`;--> statement-breakpoint
DROP TABLE `translations`;--> statement-breakpoint
ALTER TABLE `__new_translations` RENAME TO `translations`;--> statement-breakpoint
CREATE INDEX `translations_locale_idx` ON `translations` (`locale`);