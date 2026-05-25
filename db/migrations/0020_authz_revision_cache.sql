CREATE TABLE `authorization_state` (
	`key` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT `authorization_state_key_check` CHECK(`key` = 'global'),
	CONSTRAINT `authorization_state_revision_check` CHECK(`revision` >= 1)
);
--> statement-breakpoint
INSERT INTO `authorization_state` (`key`, `revision`)
VALUES ('global', 1);
--> statement-breakpoint
CREATE TRIGGER `authorization_role_claims_after_insert_revision`
AFTER INSERT ON `authorization_role_claims`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
--> statement-breakpoint
CREATE TRIGGER `authorization_role_claims_after_update_revision`
AFTER UPDATE ON `authorization_role_claims`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
--> statement-breakpoint
CREATE TRIGGER `authorization_role_claims_after_delete_revision`
AFTER DELETE ON `authorization_role_claims`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
--> statement-breakpoint
CREATE TRIGGER `authorization_user_claim_overrides_after_insert_revision`
AFTER INSERT ON `authorization_user_claim_overrides`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
--> statement-breakpoint
CREATE TRIGGER `authorization_user_claim_overrides_after_update_revision`
AFTER UPDATE ON `authorization_user_claim_overrides`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
--> statement-breakpoint
CREATE TRIGGER `authorization_user_claim_overrides_after_delete_revision`
AFTER DELETE ON `authorization_user_claim_overrides`
BEGIN
  UPDATE `authorization_state`
  SET
    `revision` = `revision` + 1,
    `updated_at` = (unixepoch() * 1000)
  WHERE `key` = 'global';
END;
