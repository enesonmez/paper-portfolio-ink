INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.resources.paginationNextLabel', 'Sonraki'),
  ('tr', 'dashboard.resources.paginationPreviousLabel', 'Onceki'),
  ('en', 'dashboard.resources.paginationNextLabel', 'Next'),
  ('en', 'dashboard.resources.paginationPreviousLabel', 'Previous')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
