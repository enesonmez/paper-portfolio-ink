INSERT INTO `authorization_claims` (`key`, `resource`, `action`, `scope`, `description`)
VALUES
  ('analytics.read.own', 'analytics', 'read', 'own', 'Read only the viewer''s own post analytics.'),
  ('analytics.read.any', 'analytics', 'read', 'any', 'Read any post analytics.')
ON CONFLICT(`key`) DO UPDATE SET
  `resource` = excluded.`resource`,
  `action` = excluded.`action`,
  `scope` = excluded.`scope`,
  `description` = excluded.`description`,
  `updated_at` = (unixepoch() * 1000);
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_role_claims` (`role`, `claim_key`)
VALUES
  ('admin', 'analytics.read.any'),
  ('author', 'analytics.read.own');
