DROP INDEX IF EXISTS `users_dashboard_registry_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `users_dashboard_registry_idx`
  ON `users` (`is_active` DESC, `role` ASC, `display_name` ASC, `email` ASC, `id` ASC);--> statement-breakpoint

INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.users.clearFiltersLabel', 'Filtreleri temizle'),
  ('tr', 'dashboard.users.filter.active.all', 'Tum durumlar'),
  ('tr', 'dashboard.users.filter.active.label', 'Durum filtresi'),
  ('tr', 'dashboard.users.filter.role.all', 'Tum roller'),
  ('tr', 'dashboard.users.filter.role.label', 'Rol filtresi'),
  ('tr', 'dashboard.users.paginationNextLabel', 'Sonraki'),
  ('tr', 'dashboard.users.paginationPreviousLabel', 'Onceki'),
  ('tr', 'dashboard.users.searchActionLabel', 'Ara'),
  ('tr', 'dashboard.users.searchLabel', 'Kullanici ara'),
  ('tr', 'dashboard.users.searchPlaceholder', 'Gorunen ad veya e-posta ara'),
  ('en', 'dashboard.users.clearFiltersLabel', 'Clear filters'),
  ('en', 'dashboard.users.filter.active.all', 'All statuses'),
  ('en', 'dashboard.users.filter.active.label', 'Status filter'),
  ('en', 'dashboard.users.filter.role.all', 'All roles'),
  ('en', 'dashboard.users.filter.role.label', 'Role filter'),
  ('en', 'dashboard.users.paginationNextLabel', 'Next'),
  ('en', 'dashboard.users.paginationPreviousLabel', 'Previous'),
  ('en', 'dashboard.users.searchActionLabel', 'Search'),
  ('en', 'dashboard.users.searchLabel', 'Search users'),
  ('en', 'dashboard.users.searchPlaceholder', 'Search display name or email')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
