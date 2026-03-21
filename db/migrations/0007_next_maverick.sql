CREATE TABLE `locales` (
	`code` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `locales_is_active_idx` ON `locales` (`is_active`);--> statement-breakpoint
CREATE INDEX `locales_sort_order_idx` ON `locales` (`sort_order`);--> statement-breakpoint
INSERT INTO `locales` (`code`, `label`, `is_active`, `is_default`, `sort_order`)
VALUES
	('tr', 'TR', 1, 1, 0),
	('en', 'EN', 1, 0, 1)
ON CONFLICT(`code`) DO UPDATE SET
	`label` = excluded.`label`,
	`is_active` = excluded.`is_active`,
	`is_default` = excluded.`is_default`,
	`sort_order` = excluded.`sort_order`,
	`updated_at` = (unixepoch() * 1000);
