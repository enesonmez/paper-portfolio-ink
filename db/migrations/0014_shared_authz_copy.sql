INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.authz.actionBlockedTitle', 'Islem reddedildi'),
  ('tr', 'dashboard.authz.currentRoleLabel', 'Oturum rolu'),
  ('tr', 'dashboard.authz.forbiddenError', 'Bu islemi gerceklestirme yetkiniz bulunmuyor.'),
  ('tr', 'dashboard.authz.restrictedDescription', 'Bu alani goruntuleme yetkiniz bulunmuyor.'),
  ('tr', 'dashboard.authz.restrictedTitle', 'Erisim reddedildi'),
  ('en', 'dashboard.authz.actionBlockedTitle', 'Action denied'),
  ('en', 'dashboard.authz.currentRoleLabel', 'Session role'),
  ('en', 'dashboard.authz.forbiddenError', 'You do not have permission to perform this action.'),
  ('en', 'dashboard.authz.restrictedDescription', 'You do not have permission to view this area.'),
  ('en', 'dashboard.authz.restrictedTitle', 'Access denied')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
