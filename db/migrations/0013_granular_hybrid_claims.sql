INSERT INTO authorization_claims (key, resource, action, scope, description)
VALUES
  ('projects.read', 'projects', 'read', 'global', 'Read the projects registry.'),
  ('projects.create', 'projects', 'create', 'global', 'Create project records.'),
  ('projects.update', 'projects', 'update', 'global', 'Update project records.'),
  ('projects.delete', 'projects', 'delete', 'global', 'Delete project records.'),
  ('skills.read', 'skills', 'read', 'global', 'Read the skills registry.'),
  ('skills.create', 'skills', 'create', 'global', 'Create skill records.'),
  ('skills.update', 'skills', 'update', 'global', 'Update skill records.'),
  ('skills.delete', 'skills', 'delete', 'global', 'Delete skill records.'),
  ('resources.locales.read', 'resources.locales', 'read', 'global', 'Read the locale registry.'),
  ('resources.locales.create', 'resources.locales', 'create', 'global', 'Create locale records.'),
  ('resources.locales.update', 'resources.locales', 'update', 'global', 'Update locale records.'),
  ('resources.locales.delete', 'resources.locales', 'delete', 'global', 'Delete locale records.'),
  ('resources.translations.read', 'resources.translations', 'read', 'global', 'Read translation resources.'),
  ('resources.translations.create', 'resources.translations', 'create', 'global', 'Create translation resources.'),
  ('resources.translations.update', 'resources.translations', 'update', 'global', 'Update translation resources.'),
  ('resources.translations.delete', 'resources.translations', 'delete', 'global', 'Delete translation resources.'),
  ('users.read', 'users', 'read', 'global', 'Read dashboard users.'),
  ('users.create', 'users', 'create', 'global', 'Create dashboard users.'),
  ('users.update', 'users', 'update', 'global', 'Update dashboard users.'),
  ('users.delete', 'users', 'delete', 'global', 'Delete dashboard users.')
ON CONFLICT(key) DO NOTHING;

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'projects.read'
FROM authorization_role_claims
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'projects.create'
FROM authorization_role_claims
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'projects.update'
FROM authorization_role_claims
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'projects.delete'
FROM authorization_role_claims
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'skills.read'
FROM authorization_role_claims
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'skills.create'
FROM authorization_role_claims
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'skills.update'
FROM authorization_role_claims
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'skills.delete'
FROM authorization_role_claims
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.locales.read'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.locales.create'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.locales.update'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.locales.delete'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.translations.read'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.translations.create'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.translations.update'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'resources.translations.delete'
FROM authorization_role_claims
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'users.read'
FROM authorization_role_claims
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'users.create'
FROM authorization_role_claims
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'users.update'
FROM authorization_role_claims
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
SELECT role, 'users.delete'
FROM authorization_role_claims
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'projects.read', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'projects.create', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'projects.update', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'projects.delete', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'projects.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'skills.read', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'skills.create', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'skills.update', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'skills.delete', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'skills.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.locales.read', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.locales.create', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.locales.update', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.locales.delete', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.translations.read', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.translations.create', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.translations.update', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'resources.translations.delete', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'resources.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'users.read', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'users.create', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'users.update', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'users.manage';

INSERT OR IGNORE INTO authorization_user_claim_overrides (user_id, claim_key, effect)
SELECT user_id, 'users.delete', effect
FROM authorization_user_claim_overrides
WHERE claim_key = 'users.manage';

DELETE FROM authorization_role_claims
WHERE claim_key IN (
  'projects.manage',
  'skills.manage',
  'resources.manage',
  'users.manage'
);

DELETE FROM authorization_user_claim_overrides
WHERE claim_key IN (
  'projects.manage',
  'skills.manage',
  'resources.manage',
  'users.manage'
);

DELETE FROM authorization_claims
WHERE key IN (
  'projects.manage',
  'skills.manage',
  'resources.manage',
  'users.manage'
);
