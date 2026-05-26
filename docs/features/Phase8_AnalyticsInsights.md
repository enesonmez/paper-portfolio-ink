# Phase8 Analytics Insights

## 1. Ozet

Bu calisma ile public blog detail yuzeyine server-first analytics zinciri eklendi. `view_history` tablosu; post, anonimlestirilmis ziyaretci hash'i, scroll derinligi ve sayfada gecirilen sureyi saklayacak sekilde schema'ya alindi. Tracking endpoint'i blog slice'i altinda ayrik bir action route olarak kuruldu; payload Zod ile dogrulaniyor, origin/fetch-site sinyalleri ile cross-site gonderimler reddediliyor ve `SHA-256(ip + user-agent + secret)` user hash'i ile ayni post icin 12 saatlik DB throttle uygulanıyor.

Client tarafta blog detail sayfasina leaf-level bir tracker eklendi. Tracker, makaledeki maksimum gorulen derinligi tarayip `pagehide`, `unload` ve `visibilitychange(hidden)` anlarinda `navigator.sendBeacon` ile post slug, scroll oranini ve gecen saniyeyi gonderiyor; beacon desteklenmeyen ortamlarda `keepalive` fetch fallback'i kullaniyor. Server basarili ilk kayitta 12 saatlik bir cookie lock donduruyor, sonraki ayni-post ziyaretleri client tarafinda da sessizce bastiriliyor. Boylece roadmap'teki cookie + DB double-lock birlikte tamamlandi.

Analytics runtime secret'i auth secret'tan ayrik tutulabilecek sekilde soyutlandi. Cloudflare load context artik opsiyonel `ANALYTICS_SECRET` binding'ini route context'e tasiyor; binding yoksa analytics katmani auth secret fallback'i ile calisabiliyor. Bu sayede Cloudflare Pages/D1 hedefi korunurken baska runtime'larda da ayni server kontrati suruyor. Son guclendirme turunda server-side duplicate kontrolu `SELECT -> INSERT` akisi yerine atomik `view_history_locks` tablosuna tasindi, tracking endpoint'inde `Origin` header'i zorunlu kilindi ve public analytics write'lari `log_history` audit tablosuna yazilmaktan cikarildi.

## 2. Dosya Sorumluluklari

- `db/schema.ts`
  - `view_history` tablosunu, check constraint'lerini ve throttle sorgusuna uygun index'leri tanimlar.
- `db/migrations/0028_public_blog_view_history.sql`
  - Yeni analytics tablosunu ve index'lerini local/Cloudflare migration hattina ekler.
- `db/migrations/0029_view_history_locks.sql`
  - 12 saatlik duplicate bastirma icin atomik lock tablosunu ekler.
- `app/lib/analytics/view-history.server.ts`
  - Public post lookup, son 12 saatlik view kaydi okuma ve insert operasyonlarini saglar.
- `app/features/public/blog/tracking/*`
  - Payload schema'si, cookie lock yardimcilari, hash/throttle action orchestration'i ve blog detail beacon tracker leaf component'ini barindirir.
- `app/routes/public/blog/track.ts`
  - Analytics action route'unu merkezi hata raporlama zincirine baglar.
- `app/shared/analytics/*`
  - Runtime analytics secret sozlesmesini ve server-side config resolver'ini tanimlar.
- `workers/analytics-env.ts`, `workers/bindings.ts`, `workers/load-context.ts`, `app/env.server.ts`
  - Cloudflare binding -> app load context analytics config haritalamasini yapar.
- `tests/unit/db/schema.test.ts`
  - `view_history` schema kontratini sabitler.
- `tests/unit/features/public/blog/tracking.shared.test.ts`
  - Cookie lock ve metrik normalizasyon yardimcilarini dogrular.
- `tests/integration/features/public/blog-tracking.server.test.ts`
  - Validation, origin guard, throttle ve audit/cookie yan etkilerini test eder.
- `tests/integration/routes/public/modules.test.ts`
  - Yeni route action'in blog server export'una delege oldugunu dogrular.
- `tests/e2e/public.spec.ts`
  - Gercek browser akisinda beacon istegini ve lock cookie'sini dogrular.

## 3. Uygulanan Testler

- `npx vitest run tests/unit/db/schema.test.ts tests/unit/features/public/blog/tracking.shared.test.ts tests/unit/workers/analytics-env.test.ts tests/unit/workers/load-context.test.ts tests/integration/features/public/blog-tracking.server.test.ts tests/integration/routes/public/modules.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run e2e:prepare`
- `npm run e2e`

Tum komutlar basarili tamamlandi.

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
  - `Phase 8: Analytics & Insights`
  - `view_history tablosunun (post_id, user_hash, scroll_rate, seconds_spent) olusturulmasi.`
  - `Backend Tracking: SHA-256(ip + user-agent + secret) tabanli user_hash uretimi ve 12 saatlik kisitlama (Throttling) logic'i.`
  - `Frontend Tracker: navigator.sendBeacon ile sayfa terk edildiginde (unload/visibilitychange) db'ye veri gonderimi.`
  - `Scroll & Time Depth: Kullanicinin makalenin yuzde kacina ulastiginin ve ne kadar sure kaldiginin hesaplanmasi.`
  - `Double-Lock Mechanism: Hem Cookie (Client) hem de DB (Server) seviyesinde 12 saatlik mukerrer kayit engelleme.`
