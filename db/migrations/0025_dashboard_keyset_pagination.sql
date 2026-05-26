DROP INDEX IF EXISTS `posts_status_feed_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_status_feed_idx`
  ON `posts` (`status`, `published_at` DESC, `updated_at` DESC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
DROP INDEX IF EXISTS `posts_dashboard_status_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_dashboard_status_idx`
  ON `posts` (`status`, `updated_at` DESC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
DROP INDEX IF EXISTS `posts_dashboard_author_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_dashboard_author_idx`
  ON `posts` (`author_id`, `updated_at` DESC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
DROP INDEX IF EXISTS `posts_author_feed_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_author_feed_idx`
  ON `posts` (`author_id`, `published_at` DESC, `updated_at` DESC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
DROP INDEX IF EXISTS `projects_featured_sort_order_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `projects_status_feed_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `projects_dashboard_order_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `projects_status_feed_idx`
  ON `projects` (`status`, `is_featured` DESC, `sort_order` ASC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `projects_dashboard_order_idx`
  ON `projects` (`is_featured` DESC, `sort_order` ASC, `created_at` DESC, `slug` ASC);--> statement-breakpoint
DROP INDEX IF EXISTS `skills_name_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `skills_registry_idx`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_registry_idx`
  ON `skills` (`sort_order` ASC, `name` ASC, `created_at` ASC, `slug` ASC);--> statement-breakpoint

INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.posts.clearFiltersLabel', 'Filtreleri temizle'),
  ('tr', 'dashboard.posts.filter.status.all', 'Tum durumlar'),
  ('tr', 'dashboard.posts.filter.status.label', 'Durum filtresi'),
  ('tr', 'dashboard.posts.paginationNextLabel', 'Sonraki'),
  ('tr', 'dashboard.posts.paginationPreviousLabel', 'Onceki'),
  ('tr', 'dashboard.posts.searchActionLabel', 'Ara'),
  ('tr', 'dashboard.posts.searchLabel', 'Yazi ara'),
  ('tr', 'dashboard.posts.searchPlaceholder', 'Baslik, slug veya ozet ara'),
  ('tr', 'dashboard.projects.clearFiltersLabel', 'Filtreleri temizle'),
  ('tr', 'dashboard.projects.filter.status.all', 'Tum durumlar'),
  ('tr', 'dashboard.projects.filter.status.label', 'Durum filtresi'),
  ('tr', 'dashboard.projects.paginationNextLabel', 'Sonraki'),
  ('tr', 'dashboard.projects.paginationPreviousLabel', 'Onceki'),
  ('tr', 'dashboard.projects.searchActionLabel', 'Ara'),
  ('tr', 'dashboard.projects.searchLabel', 'Proje ara'),
  ('tr', 'dashboard.projects.searchPlaceholder', 'Baslik, slug veya ozet ara'),
  ('tr', 'dashboard.skills.clearFiltersLabel', 'Filtreleri temizle'),
  ('tr', 'dashboard.skills.paginationNextLabel', 'Sonraki'),
  ('tr', 'dashboard.skills.paginationPreviousLabel', 'Onceki'),
  ('tr', 'dashboard.skills.searchActionLabel', 'Ara'),
  ('tr', 'dashboard.skills.searchLabel', 'Beceri ara'),
  ('tr', 'dashboard.skills.searchPlaceholder', 'Ad, slug veya ozet ara'),
  ('en', 'dashboard.posts.clearFiltersLabel', 'Clear filters'),
  ('en', 'dashboard.posts.filter.status.all', 'All statuses'),
  ('en', 'dashboard.posts.filter.status.label', 'Status filter'),
  ('en', 'dashboard.posts.paginationNextLabel', 'Next'),
  ('en', 'dashboard.posts.paginationPreviousLabel', 'Previous'),
  ('en', 'dashboard.posts.searchActionLabel', 'Search'),
  ('en', 'dashboard.posts.searchLabel', 'Search posts'),
  ('en', 'dashboard.posts.searchPlaceholder', 'Search title, slug, or excerpt'),
  ('en', 'dashboard.projects.clearFiltersLabel', 'Clear filters'),
  ('en', 'dashboard.projects.filter.status.all', 'All statuses'),
  ('en', 'dashboard.projects.filter.status.label', 'Status filter'),
  ('en', 'dashboard.projects.paginationNextLabel', 'Next'),
  ('en', 'dashboard.projects.paginationPreviousLabel', 'Previous'),
  ('en', 'dashboard.projects.searchActionLabel', 'Search'),
  ('en', 'dashboard.projects.searchLabel', 'Search projects'),
  ('en', 'dashboard.projects.searchPlaceholder', 'Search title, slug, or summary'),
  ('en', 'dashboard.skills.clearFiltersLabel', 'Clear filters'),
  ('en', 'dashboard.skills.paginationNextLabel', 'Next'),
  ('en', 'dashboard.skills.paginationPreviousLabel', 'Previous'),
  ('en', 'dashboard.skills.searchActionLabel', 'Search'),
  ('en', 'dashboard.skills.searchLabel', 'Search skills'),
  ('en', 'dashboard.skills.searchPlaceholder', 'Search name, slug, or summary')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
