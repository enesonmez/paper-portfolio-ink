INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'site.title.home', '{siteName} | Edge-First Portfolyo ve Notlar'),
  ('tr', 'site.title.projects', 'Projeler | {siteName}'),
  ('tr', 'site.title.blog', 'Blog | {siteName}'),
  ('tr', 'site.title.blogPostFallback', 'Blog Yazisi | {siteName}'),
  ('tr', 'site.title.login', 'Dashboard girisi | {siteName}'),
  ('en', 'site.title.home', '{siteName} | Edge-First Portfolio and Notes'),
  ('en', 'site.title.projects', 'Projects | {siteName}'),
  ('en', 'site.title.blog', 'Blog | {siteName}'),
  ('en', 'site.title.blogPostFallback', 'Blog Post | {siteName}'),
  ('en', 'site.title.login', 'Dashboard login | {siteName}')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
