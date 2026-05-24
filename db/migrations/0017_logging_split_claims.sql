INSERT INTO `authorization_claims` (`key`, `resource`, `action`, `scope`, `description`)
VALUES
  ('logs.audit.read', 'logs.audit', 'read', 'global', 'Read dashboard audit logs.'),
  ('logs.audit.export', 'logs.audit', 'export', 'global', 'Export dashboard audit logs.'),
  ('logs.audit.delete', 'logs.audit', 'delete', 'global', 'Delete dashboard audit logs by range.'),
  ('logs.error.read', 'logs.error', 'read', 'global', 'Read dashboard error logs.'),
  ('logs.error.export', 'logs.error', 'export', 'global', 'Export dashboard error logs.'),
  ('logs.error.delete', 'logs.error', 'delete', 'global', 'Delete dashboard error logs by range.')
ON CONFLICT(`key`) DO UPDATE SET
  `resource` = excluded.`resource`,
  `action` = excluded.`action`,
  `scope` = excluded.`scope`,
  `description` = excluded.`description`,
  `updated_at` = (unixepoch() * 1000);
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_role_claims` (`role`, `claim_key`)
VALUES
  ('admin', 'logs.audit.read'),
  ('admin', 'logs.audit.export'),
  ('admin', 'logs.audit.delete'),
  ('admin', 'logs.error.read'),
  ('admin', 'logs.error.export'),
  ('admin', 'logs.error.delete');
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_role_claims` (`role`, `claim_key`)
SELECT `role`, 'logs.error.read'
FROM `authorization_role_claims`
WHERE `claim_key` = 'logs.read';
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_role_claims` (`role`, `claim_key`)
SELECT `role`, 'logs.error.export'
FROM `authorization_role_claims`
WHERE `claim_key` = 'logs.export';
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_role_claims` (`role`, `claim_key`)
SELECT `role`, 'logs.error.delete'
FROM `authorization_role_claims`
WHERE `claim_key` = 'logs.delete';
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_user_claim_overrides` (`user_id`, `claim_key`, `effect`)
SELECT `user_id`, 'logs.error.read', `effect`
FROM `authorization_user_claim_overrides`
WHERE `claim_key` = 'logs.read';
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_user_claim_overrides` (`user_id`, `claim_key`, `effect`)
SELECT `user_id`, 'logs.error.export', `effect`
FROM `authorization_user_claim_overrides`
WHERE `claim_key` = 'logs.export';
--> statement-breakpoint
INSERT OR IGNORE INTO `authorization_user_claim_overrides` (`user_id`, `claim_key`, `effect`)
SELECT `user_id`, 'logs.error.delete', `effect`
FROM `authorization_user_claim_overrides`
WHERE `claim_key` = 'logs.delete';
--> statement-breakpoint
DELETE FROM `authorization_role_claims`
WHERE `claim_key` IN ('logs.read', 'logs.export', 'logs.delete');
--> statement-breakpoint
DELETE FROM `authorization_user_claim_overrides`
WHERE `claim_key` IN ('logs.read', 'logs.export', 'logs.delete');
--> statement-breakpoint
DELETE FROM `authorization_claims`
WHERE `key` IN ('logs.read', 'logs.export', 'logs.delete');
