CREATE TABLE `view_history` (
  `id` text PRIMARY KEY NOT NULL,
  `post_id` text NOT NULL,
  `user_hash` text NOT NULL,
  `scroll_rate` integer NOT NULL,
  `seconds_spent` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT "view_history_scroll_rate_check" CHECK(`view_history`.`scroll_rate` between 0 and 100),
  CONSTRAINT "view_history_seconds_spent_check" CHECK(`view_history`.`seconds_spent` >= 0),
  CONSTRAINT "view_history_user_hash_length_check" CHECK(length(`view_history`.`user_hash`) = 64)
);
--> statement-breakpoint
CREATE INDEX `view_history_created_at_id_idx` ON `view_history` (`created_at`,`id`);
--> statement-breakpoint
CREATE INDEX `view_history_post_user_created_at_idx`
  ON `view_history` (`post_id`,`user_hash`,`created_at` desc,`id` desc);
