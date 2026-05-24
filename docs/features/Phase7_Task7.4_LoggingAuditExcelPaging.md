# Phase7 Task7.4 Logging Audit Excel Paging

## 1. Ozet

`dashboard/logging` slice'i audit ve error sekmeleri icin ayni operasyon omurgasina genisletildi. Audit tarafina da aralik bazli `export` ve `delete` aksiyonlari eklendi, iki sekme de `createdAt + id` keyset pagination ile sayfalanir hale getirildi ve her iki export akisi gercek Excel workbook (`.xlsx`) dosyasi uretiyor.

Bu degisiklikte loader sadece aktif sekmenin cursor bilgisini uygular; pasif sekme lazy kalir. Boylece URL sozlesmesi `tab + cursor + direction` seviyesinde sade kalirken D1 uzerinde offset maliyeti de ortadan kalkar. Authorization modeli audit ve error yuzeyleri icin ayristirildi: `logs.audit.read/export/delete` ve `logs.error.read/export/delete`. Loader yalnizca actor'un okuyabildigi sekmeleri ve toplamlari render eder; mutasyonlar ise intent'e denk gelen audit ya da error claim'iyle korunur. Export path'lerinde Worker bellegini korumak icin 1000 satir ust limiti eklenmistir. UI export akisi dashboard action POST yuzeyinden cikarilip browser download semantigini koruyan ayri `GET /dashboard/logging/export` route'una tasinmistir; `actions.server.ts` yalnizca delete intent'lerini orkestre eder.

Son bakim adiminda logging tablosundaki `createdAt` gosterimleri kullanicinin browser timezone'una tasindi; hucreler lokal saat olarak render edilirken ham UTC ISO degeri `title` attr ile korunur. Range formundaki `datetime-local` alanlari da browser timezone offset'lerini hidden field olarak submit eder ve server bu bilgiyi kullanarak `startAt/endAt` degerlerini UTC araliklara cevirir. `endAt` secimi dakika sonuna kadar (`:59.999`) kapsayici olacak sekilde normalize edilir.

## 2. Dosya Sorumluluklari

- `app/domain/logging/model.ts`
  - Yeni audit mutation intent'lerini ve pagination cursor/direction sozlesmesini tanimlar.
- `app/lib/logging/logs.server.ts`
  - Audit/error listeleme icin keyset pagination, audit delete ve audit ascending export query'lerini saglar.
- `app/features/dashboard/logging/*`
  - Loader/action/orchestration, yeni history operation dosyalari, pagination state'i ve ekran rendering akisini tasir.
- `app/features/dashboard/logging/components/*`
  - Browser-local tarih hucreleri ve timezone offset tasiyan range form leaf component'lerini barindirir.
- `app/shared/export/xlsx.server.ts`
  - Cloudflare uyumlu, bagimsizliksiz OOXML workbook uretimini saglar.
- `app/lib/logging/logging-range-form.server.ts`
  - `datetime-local` + offset verisini UTC `Date` araligina cevirir ve minute-boundary semantigini uygular.
- `app/shared/i18n/messages.shared.ts`
  - Yeni logging copy ve tablo/pagination etiketlerini seed eder.
- `db/migrations/0016_logging_excel_paging_copy.sql`
  - Logging export/delete copy'lerini upsert eder, legacy `logs.read/export/delete` claim'lerini yeni audit/error claim'lerine migrate eder ve eski claim kayitlarini temizler.
- `tests/unit/features/dashboard/logging/*`
  - Domain/state/authz kontratinin yeni intent ve pagination davranisini dogrular.
- `tests/integration/features/dashboard/logging.server.test.ts`
  - Loader cursor orkestrasyonu ile audit/error export-delete server davranisini dogrular.
- `tests/integration/routes/dashboard/logging.test.tsx`
  - Ekranin audit/error range tool ve pagination linklerini dogrular.
- `tests/e2e/dashboard.spec.ts`
  - Admin logging ekranindaki yeni Excel export aksiyon metnini sabitler.

## 3. Uygulanan Testler

- `npx vitest run tests/unit/domain/logging/model.test.ts tests/unit/features/dashboard/logging/state.test.ts tests/unit/features/dashboard/logging/mutation-authorization.test.ts tests/integration/routes/dashboard/logging.test.tsx tests/integration/features/dashboard/logging.server.test.ts`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## 4. Calistirma Ve Dogrulama Komutlari

- `npm run db:migrate:local`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## 5. Roadmap Referansi

- `docs/roadmap.md`
  - `Phase 7: Observation & Logging`
  - `Logging sekmesinde audit ve error tablolarina keyset paging ekle. Audit ve error aralik export islemlerini Excel uyumlu dosya olarak sun ve iki tabloda da aralik bazli delete akisini destekle.`
