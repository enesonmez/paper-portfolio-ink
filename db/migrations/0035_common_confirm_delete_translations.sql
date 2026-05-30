DELETE FROM `translations` WHERE `key` IN (
  'common.confirmDeleteTitle',
  'common.confirmDeleteDescription',
  'common.cancel'
);

INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'common.confirmDeleteTitle', 'Silme İşlemini Onayla'),
  ('tr', 'common.confirmDeleteDescription', 'Bu işlem geri alınamaz. Seçili kaydı kalıcı olarak silmek istediğinizden emin misiniz?'),
  ('tr', 'common.cancel', 'İptal'),
  ('en', 'common.confirmDeleteTitle', 'Confirm Deletion'),
  ('en', 'common.confirmDeleteDescription', 'This action cannot be undone. Are you sure you want to permanently delete the selected record?'),
  ('en', 'common.cancel', 'Cancel')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
