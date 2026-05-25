INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'public.layout.social.instagram', 'Instagram'),
  ('tr', 'public.layout.social.x', 'X'),
  ('tr', 'public.home.social.instagram.label', 'Instagram'),
  ('tr', 'public.home.social.instagram.description', 'Gorsel notlar, brand paylasimlari ve sahne arkasi akislar.'),
  ('tr', 'public.home.social.x.label', 'X'),
  ('tr', 'public.home.social.x.description', 'Kisa guncellemeler, shipping notlari ve dagitim akisi.'),
  ('tr', 'dashboard.settings.account.field.social.github.hint', 'Repository ve acik kaynak profil baglantisi. Bos birakilirsa public yuzeyde gosterilmez.'),
  ('tr', 'dashboard.settings.account.field.social.instagram.hint', 'Gorsel paylasim ve brand stream linki. Bos birakilirsa public yuzeyde gosterilmez.'),
  ('tr', 'dashboard.settings.account.field.social.linkedin.hint', 'Profesyonel profil baglantisi. Bos birakilirsa public yuzeyde gosterilmez.'),
  ('tr', 'dashboard.settings.account.field.social.x.hint', 'Kisa guncellemeler ve dagitim kanali. Bos birakilirsa public yuzeyde gosterilmez.'),
  ('en', 'public.layout.social.instagram', 'Instagram'),
  ('en', 'public.layout.social.x', 'X'),
  ('en', 'public.home.social.instagram.label', 'Instagram'),
  ('en', 'public.home.social.instagram.description', 'Visual notes, brand drops, and behind-the-scenes updates.'),
  ('en', 'public.home.social.x.label', 'X'),
  ('en', 'public.home.social.x.description', 'Short updates, shipping notes, and release distribution.'),
  ('en', 'dashboard.settings.account.field.social.github.hint', 'Repository and open-source profile link. Leave empty to hide it on the public site.'),
  ('en', 'dashboard.settings.account.field.social.instagram.hint', 'Visual brand stream link. Leave empty to hide it on the public site.'),
  ('en', 'dashboard.settings.account.field.social.linkedin.hint', 'Professional profile link. Leave empty to hide it on the public site.'),
  ('en', 'dashboard.settings.account.field.social.x.hint', 'Short updates and distribution channel. Leave empty to hide it on the public site.')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
