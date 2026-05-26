CREATE TABLE `view_history_locks` (
  `post_id` text NOT NULL,
  `user_hash` text NOT NULL,
  `locked_until` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
  PRIMARY KEY(`post_id`, `user_hash`),
  CONSTRAINT "view_history_locks_user_hash_length_check" CHECK(length(`view_history_locks`.`user_hash`) = 64)
);
--> statement-breakpoint
CREATE INDEX `view_history_locks_locked_until_idx` ON `view_history_locks` (`locked_until`);
