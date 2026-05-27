INSERT INTO `configuration_parameters` (`key`, `value`)
VALUES
  ('appearance.primaryColor', 'yellow'),
  ('appearance.headingFont', 'vt323'),
  ('appearance.bodyFont', 'mono')
ON CONFLICT(`key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
