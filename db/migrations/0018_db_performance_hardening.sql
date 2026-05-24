ALTER TABLE `posts` ADD COLUMN `reading_time_minutes` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
UPDATE `posts`
SET
  `reading_time_minutes` = CASE
    WHEN length(trim(`content`)) = 0 THEN 1
    ELSE max(1, CAST((length(`content`) + 899) / 900 AS integer))
  END;
--> statement-breakpoint
DROP INDEX IF EXISTS `posts_author_id_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `posts_status_published_at_idx`;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_status_feed_idx`
  ON `posts` (`status`, `published_at`, `updated_at`, `created_at`, `slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_author_feed_idx`
  ON `posts` (`author_id`, `published_at`, `updated_at`, `created_at`);
--> statement-breakpoint
DROP INDEX IF EXISTS `projects_status_idx`;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `projects_status_feed_idx`
  ON `projects` (`status`, `is_featured`, `sort_order`, `created_at`, `slug`);
--> statement-breakpoint
DROP INDEX IF EXISTS `translations_locale_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `log_history_created_at_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `log_error_history_created_at_idx`;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `log_history_created_at_id_idx`
  ON `log_history` (`created_at`, `id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `log_error_history_created_at_id_idx`
  ON `log_error_history` (`created_at`, `id`);
