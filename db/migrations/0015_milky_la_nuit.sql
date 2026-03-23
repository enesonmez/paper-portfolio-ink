CREATE TABLE `log_error_history` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`code` text NOT NULL,
	`category` text NOT NULL,
	`severity` text NOT NULL,
	`status_code` integer NOT NULL,
	`message` text NOT NULL,
	`path` text NOT NULL,
	`method` text NOT NULL,
	`route_id` text,
	`locale` text,
	`user_id` text,
	`user_role` text,
	`stack` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "log_error_history_severity_check" CHECK("log_error_history"."severity" in ('critical', 'error', 'info', 'warn'))
);
--> statement-breakpoint
CREATE INDEX `log_error_history_created_at_idx` ON `log_error_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `log_error_history_request_id_idx` ON `log_error_history` (`request_id`);--> statement-breakpoint
CREATE INDEX `log_error_history_fingerprint_idx` ON `log_error_history` (`fingerprint`);--> statement-breakpoint
CREATE INDEX `log_error_history_code_idx` ON `log_error_history` (`code`);--> statement-breakpoint
CREATE INDEX `log_error_history_user_id_idx` ON `log_error_history` (`user_id`);--> statement-breakpoint
CREATE TABLE `log_history` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`result` text NOT NULL,
	`status_code` integer NOT NULL,
	`message` text NOT NULL,
	`path` text NOT NULL,
	`method` text NOT NULL,
	`user_id` text,
	`user_role` text,
	`target_id` text,
	`target_label` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "log_history_result_check" CHECK("log_history"."result" in ('failure', 'success'))
);
--> statement-breakpoint
CREATE INDEX `log_history_created_at_idx` ON `log_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `log_history_request_id_idx` ON `log_history` (`request_id`);--> statement-breakpoint
CREATE INDEX `log_history_resource_action_idx` ON `log_history` (`resource`,`action`);--> statement-breakpoint
CREATE INDEX `log_history_user_id_idx` ON `log_history` (`user_id`);
--> statement-breakpoint
INSERT INTO authorization_claims (key, resource, action, scope, description)
VALUES
  ('logs.read', 'logs', 'read', 'global', 'Read dashboard audit and error logs.'),
  ('logs.export', 'logs', 'export', 'global', 'Export dashboard error logs.'),
  ('logs.delete', 'logs', 'delete', 'global', 'Delete dashboard error logs by range.')
ON CONFLICT(key) DO NOTHING;
--> statement-breakpoint
INSERT OR IGNORE INTO authorization_role_claims (role, claim_key)
VALUES
  ('admin', 'logs.read'),
  ('admin', 'logs.export'),
  ('admin', 'logs.delete');
--> statement-breakpoint
INSERT INTO `translations` (`locale`, `key`, `value`)
VALUES
  ('tr', 'dashboard.layout.navLogging', 'Loglar'),
  ('tr', 'dashboard.logging.pageEyebrow', 'Gozlemlenebilirlik'),
  ('tr', 'dashboard.logging.pageTitle', 'Audit ve hata loglari'),
  ('tr', 'dashboard.logging.historyTab', 'Audit kayitlari'),
  ('tr', 'dashboard.logging.systemTab', 'Hata kayitlari'),
  ('tr', 'dashboard.logging.metricsHistory', 'Toplam audit kaydi'),
  ('tr', 'dashboard.logging.metricsErrors', 'Toplam hata kaydi'),
  ('tr', 'dashboard.logging.rangeFormTitle', 'Aralik islemleri'),
  ('tr', 'dashboard.logging.filterStartLabel', 'Baslangic tarihi'),
  ('tr', 'dashboard.logging.filterEndLabel', 'Bitis tarihi'),
  ('tr', 'dashboard.logging.exportAction', 'TXT olarak indir'),
  ('tr', 'dashboard.logging.deleteAction', 'Kayitlari sil'),
  ('tr', 'dashboard.logging.exportTitle', 'Hata kayitlarini disa aktar'),
  ('tr', 'dashboard.logging.exportDescription', 'Secilen araliktaki hata loglari duz metin dosyasi olarak disari aktarilir.'),
  ('tr', 'dashboard.logging.deleteTitle', 'Hata kayitlarini temizle'),
  ('tr', 'dashboard.logging.deleteDescription', 'Secilen araliktaki hata loglari kalici olarak silinir.'),
  ('tr', 'dashboard.logging.emptyHistory', 'Kayitli audit olayi bulunamadi.'),
  ('tr', 'dashboard.logging.emptyErrors', 'Kayitli sistem hatasi bulunamadi.'),
  ('tr', 'dashboard.logging.deleteSuccess', '{count} hata logu silindi.'),
  ('tr', 'dashboard.logging.validation.startAt', 'Gecerli bir baslangic tarihi gir.'),
  ('tr', 'dashboard.logging.validation.endAt', 'Gecerli bir bitis tarihi gir ve araligi kontrol et.'),
  ('tr', 'dashboard.logging.table.createdAt', 'Zaman'),
  ('tr', 'dashboard.logging.table.action', 'Aksiyon'),
  ('tr', 'dashboard.logging.table.result', 'Sonuc'),
  ('tr', 'dashboard.logging.table.message', 'Mesaj'),
  ('tr', 'dashboard.logging.table.path', 'Yol'),
  ('tr', 'dashboard.logging.table.user', 'Kullanici'),
  ('tr', 'dashboard.logging.table.severity', 'Seviye'),
  ('tr', 'dashboard.logging.table.code', 'Kod'),
  ('tr', 'dashboard.logging.table.requestId', 'Istek'),
  ('en', 'dashboard.layout.navLogging', 'Logging'),
  ('en', 'dashboard.logging.pageEyebrow', 'Observability'),
  ('en', 'dashboard.logging.pageTitle', 'Audit and error logs'),
  ('en', 'dashboard.logging.historyTab', 'Audit trail'),
  ('en', 'dashboard.logging.systemTab', 'Error logs'),
  ('en', 'dashboard.logging.metricsHistory', 'Total audit logs'),
  ('en', 'dashboard.logging.metricsErrors', 'Total error logs'),
  ('en', 'dashboard.logging.rangeFormTitle', 'Range operations'),
  ('en', 'dashboard.logging.filterStartLabel', 'Start date'),
  ('en', 'dashboard.logging.filterEndLabel', 'End date'),
  ('en', 'dashboard.logging.exportAction', 'Download TXT'),
  ('en', 'dashboard.logging.deleteAction', 'Delete logs'),
  ('en', 'dashboard.logging.exportTitle', 'Export error logs'),
  ('en', 'dashboard.logging.exportDescription', 'Export error logs in the selected range as a plain text file.'),
  ('en', 'dashboard.logging.deleteTitle', 'Delete error logs'),
  ('en', 'dashboard.logging.deleteDescription', 'Permanently delete error logs in the selected date range.'),
  ('en', 'dashboard.logging.emptyHistory', 'No audit records were found.'),
  ('en', 'dashboard.logging.emptyErrors', 'No error records were found.'),
  ('en', 'dashboard.logging.deleteSuccess', '{count} error logs deleted.'),
  ('en', 'dashboard.logging.validation.startAt', 'Enter a valid start date.'),
  ('en', 'dashboard.logging.validation.endAt', 'Enter a valid end date and make sure the range is ordered.'),
  ('en', 'dashboard.logging.table.createdAt', 'Timestamp'),
  ('en', 'dashboard.logging.table.action', 'Action'),
  ('en', 'dashboard.logging.table.result', 'Result'),
  ('en', 'dashboard.logging.table.message', 'Message'),
  ('en', 'dashboard.logging.table.path', 'Path'),
  ('en', 'dashboard.logging.table.user', 'User'),
  ('en', 'dashboard.logging.table.severity', 'Severity'),
  ('en', 'dashboard.logging.table.code', 'Code'),
  ('en', 'dashboard.logging.table.requestId', 'Request')
ON CONFLICT(`locale`, `key`) DO UPDATE SET
  `value` = excluded.`value`,
  `updated_at` = (unixepoch() * 1000);
