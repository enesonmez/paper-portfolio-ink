PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`cover_image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "author_id", "title", "slug", "excerpt", "content", "cover_image_url", "status", "published_at", "created_at", "updated_at") SELECT "id", "author_id", "title", "slug", "excerpt", "content", "cover_image_url", "status", "published_at", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_author_id_idx` ON `posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `posts_status_published_at_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
CREATE TRIGGER `users_prevent_last_active_admin_deactivation`
BEFORE UPDATE OF `is_active` ON `users`
FOR EACH ROW
WHEN OLD.`role` = 'admin' AND OLD.`is_active` = 1 AND NEW.`is_active` = 0 AND (
  SELECT COUNT(*)
  FROM `users`
  WHERE `role` = 'admin' AND `is_active` = 1
) <= 1
BEGIN
  SELECT RAISE(ABORT, 'cannot deactivate the last active admin');
END;--> statement-breakpoint
CREATE TRIGGER `users_prevent_last_active_admin_demotion`
BEFORE UPDATE OF `role` ON `users`
FOR EACH ROW
WHEN OLD.`role` = 'admin' AND OLD.`is_active` = 1 AND NEW.`role` <> 'admin' AND (
  SELECT COUNT(*)
  FROM `users`
  WHERE `role` = 'admin' AND `is_active` = 1
) <= 1
BEGIN
  SELECT RAISE(ABORT, 'cannot demote the last active admin');
END;--> statement-breakpoint
CREATE TRIGGER `users_prevent_last_active_admin_delete`
BEFORE DELETE ON `users`
FOR EACH ROW
WHEN OLD.`role` = 'admin' AND OLD.`is_active` = 1 AND (
  SELECT COUNT(*)
  FROM `users`
  WHERE `role` = 'admin' AND `is_active` = 1
) <= 1
BEGIN
  SELECT RAISE(ABORT, 'cannot delete the last active admin');
END;
