CREATE TABLE `login_rate_limits` (
	`scope` text NOT NULL,
	`identifier_hash` text NOT NULL,
	`failure_count` integer DEFAULT 0 NOT NULL,
	`window_started_at` integer NOT NULL,
	`blocked_until` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`scope`, `identifier_hash`),
	CONSTRAINT `login_rate_limits_failure_count_check` CHECK(`failure_count` >= 0),
	CONSTRAINT `login_rate_limits_scope_check` CHECK(`scope` in ('email', 'ip'))
);
--> statement-breakpoint
CREATE INDEX `login_rate_limits_blocked_until_idx` ON `login_rate_limits` (`blocked_until`);
--> statement-breakpoint
INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
	('tr', 'validation.login.rateLimited', 'Cok fazla giris denemesi yapildi. Lutfen kisa bir sure sonra tekrar dene.'),
	('en', 'validation.login.rateLimited', 'Too many sign-in attempts were made. Please try again in a few minutes.');
