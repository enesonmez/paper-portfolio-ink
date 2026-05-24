# Maintenance DbPerformanceFixes

## 1. Ozet

Bu bakim calismasi roadmap disi olarak, D1 sorgu plani ve veri tasima maliyetlerini azaltmak icin yapildi. `posts`, `projects`, `logging` ve `resources/translations` yuzeylerinde index hizalama, keyset pagination, hafif read-model ayrimi ve sayim cache'i uygulandi.

## 2. Teknik Degisiklikler

- `db/schema.ts` ve `db/migrations/0018_db_performance_hardening.sql`
  `posts` tablosuna `reading_time_minutes` kolonu eklendi; feed/log odakli composite index'ler eklendi ve redundant index'ler kaldirildi.
- `app/lib/posts/posts.server.ts`
  Public post listeleri ve dashboard post listesi artik tam `content` kolonu yerine hafif read-model kullaniyor. Edit/detail akislari icin tekil post okuma yardimcilari eklendi.
- `app/shared/authz/post-policy.server.ts` ve `app/features/dashboard/posts/*`
  Dashboard post loader'i, envanter listesi ile edit kaydini ayri sorgularla yukleyecek sekilde ayrildi.
- `app/lib/resources/resources.server.ts` ve `app/features/dashboard/resources/*`
  Translation listeleme offset/page tabanli akistan cursor/direction tabanli keyset pagination'a tasindi. Arama kosulu `lower(...)` yerine `LIKE ... COLLATE NOCASE` ile normalize edildi.
- `app/lib/logging/logs.server.ts`
  Log pagination sorgularindaki ek `hasOlder/hasNewer` probe sorgulari kaldirildi; `count(*)` sonucunu kisa TTL ile cacheleyen ve write/delete operasyonlarinda invalidate edilen bir sayim katmani eklendi.
- Test dosyalari
  Yeni pagination/read-model kontratlari icin unit ve integration testleri guncellendi.

## 3. Degisen Dosyalarin Sorumluluklari

- `db/schema.ts`: Kalici tablo ve index kontrati.
- `db/migrations/0018_db_performance_hardening.sql`: Yerel/remote D1 migration adimi.
- `app/lib/posts/posts.server.ts`: Post read/write persistence ve read-model ayrimi.
- `app/lib/resources/resources.server.ts`: Translation arama ve keyset pagination mantigi.
- `app/lib/logging/logs.server.ts`: Log sayfalama, toplam sayilar ve cache invalidation.
- `app/features/dashboard/resources/*`: Cursor tabanli resources UI/loader routing kontrati.
- `app/features/dashboard/posts/*`: Liste ve edit verisini ayiran dashboard loader/form kontrati.

## 4. Uygulanan Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

Tum komutlar basarili calisti.

## 5. Dogrulama Komutlari

```bash
npm run typecheck
npm test
npm run lint
npm run format:check
npm run e2e:prepare
npm run e2e
```

## 6. Roadmap Referansi

Bu calisma roadmap disi bakim/performance iyilestirmesidir. `docs/roadmap.md` icinde dogrudan bir checkbox guncellemesi yoktur.
