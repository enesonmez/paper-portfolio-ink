DELETE FROM `translations` WHERE `key` IN (
  'dashboard.settings.account.actionLabel',
  'dashboard.settings.account.editDescription',
  'dashboard.settings.account.editTitle',
  'dashboard.settings.account.valueFallback'
);

INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.settings.configuration.actionLabel', 'Kaydi duzenle'),
  ('tr', 'dashboard.settings.configuration.editDescription', 'Secili configuration parameter degerini guncelle. Kayit D1''e yazilir ve configuration cache temizlenir.'),
  ('tr', 'dashboard.settings.configuration.editTitle', 'Yapilandirma kaydini guncelle'),
  ('tr', 'dashboard.settings.configuration.valueFallback', 'Henuz ayarlanmadi'),
  ('en', 'dashboard.settings.configuration.actionLabel', 'Edit record'),
  ('en', 'dashboard.settings.configuration.editDescription', 'Update the selected configuration parameter. The value is written to D1 and the configuration cache is purged.'),
  ('en', 'dashboard.settings.configuration.editTitle', 'Update configuration record'),
  ('en', 'dashboard.settings.configuration.valueFallback', 'Not configured yet')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
