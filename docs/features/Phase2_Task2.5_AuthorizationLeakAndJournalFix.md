# Phase2 Task2.5 Authorization Leak And Journal Fix

## Ozet

Hybrid authorization refactor'u sonrasinda iki guvenlik/delivery problemi giderildi:

1. `0013_granular_hybrid_claims.sql` ve `0014_shared_authz_copy.sql` migration'lari Drizzle journal'a kaydedildi.
2. `resources.locales.read` sahibi ama `resources.translations.read` olmayan kullanicilar icin translation verisinin loader payload'ina serialize edilmesi engellendi.

## Degisen Dosyalar

- `db/migrations/meta/_journal.json`
  Yeni authorization data migration'larini fresh/reset DB'lerin de uygulayabilmesi icin journal zinciri guncellendi.

- `app/features/dashboard/resources/server.ts`
  Translation read claim'i olmayan kullanicilar icin:
  - `findTranslation` ve `listTranslationsByLocale` cagirilmaz
  - translation modal query state'i sanitize edilir
  - translation payload alanlari bos/default state ile doner

- `tests/integration/features/dashboard/resources.server.test.ts`
  Locale-only session'larda translation data leak olmadigini ve translation sorgularinin hic cagrilmadigini kilitleyen test eklendi.

- `docs/lessons.md`
  Journal guncelleme ve loader payload sanitization dersi eklendi.

## Uygulanan Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run db:migrate:local`
- `npm run e2e`

## Roadmap Referansi

- `Phase 2 / Db üzerinden role - claim based hybrid bir authorization yapısının kurulması`
