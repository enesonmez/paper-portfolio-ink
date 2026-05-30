DELETE FROM `authorization_role_claims` WHERE `claim_key` = 'settings.manage';
DELETE FROM `authorization_claims` WHERE `key` = 'settings.manage';

INSERT INTO `authorization_claims` (`key`, `resource`, `action`, `scope`, `description`)
VALUES
  ('settings.account.manage', 'settings.account', 'manage', 'global', 'Manage settings account panel.'),
  ('settings.appearance.manage', 'settings.appearance', 'manage', 'global', 'Manage settings appearance panel.'),
  ('settings.security.manage.own', 'settings.security.own', 'manage', 'own', 'Manage own settings security panel.'),
  ('settings.security.manage.any', 'settings.security.any', 'manage', 'global', 'Manage any settings security panel.'),
  ('settings.runtime.manage', 'settings.runtime', 'manage', 'global', 'Manage settings runtime panel.')
ON CONFLICT(`key`) DO NOTHING;

INSERT INTO `authorization_role_claims` (`role`, `claim_key`)
VALUES
  ('admin', 'settings.account.manage'),
  ('admin', 'settings.appearance.manage'),
  ('admin', 'settings.security.manage.own'),
  ('admin', 'settings.security.manage.any'),
  ('admin', 'settings.runtime.manage'),
  ('author', 'settings.security.manage.own')
ON CONFLICT(`role`, `claim_key`) DO NOTHING;

INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.settings.security.cardAccessDescription', 'Loader-first authz gate ve settings.security.manage claim''i mock tasarim icinde de acikca gorunur.'),
  ('tr', 'dashboard.settings.security.noSessions', 'Aktif oturum bulunamadı.'),
  ('tr', 'dashboard.settings.security.currentSession', 'Mevcut Oturum'),
  ('tr', 'dashboard.settings.security.revokeSession', 'Oturumu Sonlandır'),
  ('tr', 'dashboard.settings.security.revokeSessionConfirm', 'Bu aktif oturum sonlandırılacak. Bu cihazdaki kullanıcı hesaba tekrar giriş yapmak zorunda kalacaktır. Devam etmek istiyor musunuz?'),
  ('tr', 'dashboard.settings.security.ipAddress', 'IP Adresi'),
  ('tr', 'dashboard.settings.security.unknown', 'Bilinmeyen'),
  ('tr', 'dashboard.settings.security.createdAt', 'Oluşturulma Tarihi'),
  ('tr', 'dashboard.settings.security.expiresAt', 'Son Geçerlilik Tarihi'),
  ('tr', 'dashboard.settings.security.unknownDevice', 'Bilinmeyen Cihaz'),
  ('tr', 'dashboard.settings.security.revokeOtherSessionsTitle', 'Çoklu Oturum Güvenliği'),
  ('tr', 'dashboard.settings.security.revokeOtherSessionsLabel', 'Diğer Oturumları Kapat'),
  ('tr', 'dashboard.settings.security.revokeOtherSessionsDescription', 'Şu an kullandığınız oturum hariç diğer tüm cihazlardaki oturumları sonlandırın.'),
  ('tr', 'dashboard.settings.security.revokeOtherSessionsButton', 'Diğer Oturumları Sonlandır'),
  ('tr', 'dashboard.settings.security.revokeOtherSessionsConfirm', 'Diğer tüm oturumlar sonlandırılacak. Devam etmek istiyor musunuz?'),
  ('tr', 'dashboard.settings.security.revokeAllSessionsTitle', 'Toplu Oturum Güvenliği'),
  ('tr', 'dashboard.settings.security.revokeAllSessionsLabel', 'Tüm Oturumları Kapat'),
  ('tr', 'dashboard.settings.security.revokeAllSessionsDescription', 'Sistemdeki tüm kullanıcıların oturumlarını sonlandırın. Mevcut oturumunuz korunur.'),
  ('tr', 'dashboard.settings.security.revokeAllSessionsButton', 'Tüm Oturumları Sonlandır'),
  ('tr', 'dashboard.settings.security.revokeAllSessionsConfirm', 'Sistemdeki tüm aktif oturumlar sonlandırılacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?'),
  ('tr', 'dashboard.settings.security.cancelLabel', 'İptal'),
  ('en', 'dashboard.settings.security.cardAccessDescription', 'The loader-first authz gate and settings.security.manage claim remain explicit even in the mock phase.'),
  ('en', 'dashboard.settings.security.noSessions', 'No active sessions found.'),
  ('en', 'dashboard.settings.security.currentSession', 'Current Session'),
  ('en', 'dashboard.settings.security.revokeSession', 'Revoke Session'),
  ('en', 'dashboard.settings.security.revokeSessionConfirm', 'This active session will be revoked. The user on this device will have to log in to the account again. Do you want to continue?'),
  ('en', 'dashboard.settings.security.ipAddress', 'IP Address'),
  ('en', 'dashboard.settings.security.unknown', 'Unknown'),
  ('en', 'dashboard.settings.security.createdAt', 'Created At'),
  ('en', 'dashboard.settings.security.expiresAt', 'Expires At'),
  ('en', 'dashboard.settings.security.unknownDevice', 'Unknown Device'),
  ('en', 'dashboard.settings.security.revokeOtherSessionsConfirm', 'All other sessions will be revoked. Do you want to continue?'),
  ('en', 'dashboard.settings.security.revokeAllSessionsTitle', 'Bulk Session Security'),
  ('en', 'dashboard.settings.security.revokeAllSessionsLabel', 'Revoke All Sessions'),
  ('en', 'dashboard.settings.security.revokeAllSessionsDescription', 'Revoke all active sessions across all users. Your current session will be preserved.'),
  ('en', 'dashboard.settings.security.revokeAllSessionsButton', 'Revoke All Sessions'),
  ('en', 'dashboard.settings.security.revokeAllSessionsConfirm', 'All active sessions in the system will be revoked. This action cannot be undone. Do you want to continue?'),
  ('en', 'dashboard.settings.security.cancelLabel', 'Cancel')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
