CREATE TABLE `authorization_claims` (
	`key` text PRIMARY KEY NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`scope` text,
	`description` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `authorization_claims_resource_action_idx` ON `authorization_claims` (`resource`,`action`);--> statement-breakpoint
CREATE TABLE `authorization_role_claims` (
	`role` text NOT NULL,
	`claim_key` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`role`, `claim_key`),
	FOREIGN KEY (`claim_key`) REFERENCES `authorization_claims`(`key`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `authorization_role_claims_claim_key_idx` ON `authorization_role_claims` (`claim_key`);--> statement-breakpoint
CREATE TABLE `authorization_user_claim_overrides` (
	`user_id` text NOT NULL,
	`claim_key` text NOT NULL,
	`effect` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `claim_key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`claim_key`) REFERENCES `authorization_claims`(`key`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "authorization_user_claim_overrides_effect_check" CHECK("authorization_user_claim_overrides"."effect" in ('grant', 'revoke'))
);
--> statement-breakpoint
CREATE INDEX `authorization_user_claim_overrides_claim_key_idx` ON `authorization_user_claim_overrides` (`claim_key`);--> statement-breakpoint
ALTER TABLE `users` ADD `authz_version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
INSERT INTO `authorization_claims` (`key`, `resource`, `action`, `scope`, `description`)
VALUES
  ('dashboard.access', 'dashboard', 'access', 'global', 'Allow entering the dashboard surface.'),
  ('posts.read.own', 'posts', 'read', 'own', 'Read only the viewer''s own posts.'),
  ('posts.read.any', 'posts', 'read', 'any', 'Read every post in the dashboard registry.'),
  ('posts.create', 'posts', 'create', 'own', 'Create new posts.'),
  ('posts.update.own', 'posts', 'update', 'own', 'Update only the viewer''s own posts.'),
  ('posts.update.any', 'posts', 'update', 'any', 'Update any post.'),
  ('posts.delete.own', 'posts', 'delete', 'own', 'Delete only the viewer''s own posts.'),
  ('posts.delete.any', 'posts', 'delete', 'any', 'Delete any post.'),
  ('projects.manage', 'projects', 'manage', 'global', 'Manage the projects registry.'),
  ('skills.manage', 'skills', 'manage', 'global', 'Manage the skills registry.'),
  ('resources.manage', 'resources', 'manage', 'global', 'Manage locale and translation resources.'),
  ('users.manage', 'users', 'manage', 'global', 'Manage dashboard users.'),
  ('settings.manage', 'settings', 'manage', 'global', 'Manage settings panels.')
ON CONFLICT(`key`) DO UPDATE SET
  `resource` = excluded.`resource`,
  `action` = excluded.`action`,
  `scope` = excluded.`scope`,
  `description` = excluded.`description`,
  `updated_at` = (unixepoch() * 1000);--> statement-breakpoint
INSERT INTO `authorization_role_claims` (`role`, `claim_key`)
VALUES
  ('admin', 'dashboard.access'),
  ('admin', 'posts.read.own'),
  ('admin', 'posts.read.any'),
  ('admin', 'posts.create'),
  ('admin', 'posts.update.own'),
  ('admin', 'posts.update.any'),
  ('admin', 'posts.delete.own'),
  ('admin', 'posts.delete.any'),
  ('admin', 'projects.manage'),
  ('admin', 'skills.manage'),
  ('admin', 'resources.manage'),
  ('admin', 'users.manage'),
  ('admin', 'settings.manage'),
  ('author', 'dashboard.access'),
  ('author', 'posts.read.own'),
  ('author', 'posts.create'),
  ('author', 'posts.update.own'),
  ('author', 'posts.delete.own')
ON CONFLICT(`role`, `claim_key`) DO UPDATE SET
  `updated_at` = (unixepoch() * 1000);--> statement-breakpoint
INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.projects.currentRoleLabel', 'Mevcut rol'),
  ('tr', 'dashboard.projects.restrictedDescription', 'Bu flow icin erisim yetkiniz yoktur.'),
  ('tr', 'dashboard.projects.restrictedTitle', 'Kisitli akis'),
  ('tr', 'dashboard.projects.form.error.forbidden', 'Bu flow icin erisim yetkiniz yoktur.'),
  ('tr', 'dashboard.posts.currentRoleLabel', 'Mevcut rol'),
  ('tr', 'dashboard.posts.restrictedDescription', 'Bu flow icin erisim yetkiniz yoktur.'),
  ('tr', 'dashboard.posts.restrictedTitle', 'Kisitli akis'),
  ('tr', 'dashboard.posts.form.error.forbidden', 'Bu flow icin erisim yetkiniz yoktur.'),
  ('en', 'dashboard.projects.currentRoleLabel', 'Current role'),
  ('en', 'dashboard.projects.restrictedDescription', 'You do not have permission to access this flow.'),
  ('en', 'dashboard.projects.restrictedTitle', 'Restricted flow'),
  ('en', 'dashboard.projects.form.error.forbidden', 'You do not have permission to access this flow.'),
  ('en', 'dashboard.posts.currentRoleLabel', 'Current role'),
  ('en', 'dashboard.posts.restrictedDescription', 'You do not have permission to access this flow.'),
  ('en', 'dashboard.posts.restrictedTitle', 'Restricted flow'),
  ('en', 'dashboard.posts.form.error.forbidden', 'You do not have permission to access this flow.')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
