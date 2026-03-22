# Phase 2 / Task 2.5: Hybrid Authorization

## 1. Ozet ve Teknik Calisma Mantigi

Bu calisma ile proje icin DB merkezli, role-claim tabanli hibrit bir authorization katmani kuruldu. Amaç, mevcut `users.role` alanini coarse-grained bir baslangic noktasi olarak korurken, route ve action seviyesinde daha ince taneli yetki kararlarini claim tablosu ve kullanici bazli override mekanizmasi ile yonetmekti.

Uygulanan model su sekilde calisir:

- `users.role` hala ana rol bilgisini tasir.
- Yeni `authorization_claims` tablosu claim registry'sini tutar.
- `authorization_role_claims` tablosu rol -> varsayilan claim eslesmesini tutar.
- `authorization_user_claim_overrides` tablosu kullanici bazli `grant` / `revoke` override'larini tutar.
- `users.authz_version` alani kullanicinin efektif yetki snapshot versiyonunu tasir.
- Request sirasinda session dogrulandiktan sonra effective claims DB'den cozulur; cache anahtari `userId + authzVersion` uzerinden kuruludur.
- Profil/rol guncellemelerinde `authzVersion` arttirilir; boylece eski cache anahtari otomatik stale hale gelir.

Dashboard tarafinda hardcoded `role === "admin"` kontrolleri claim tabanli hale getirildi. Coarse `manage` claim'leri de CRUD seviyesine indirildi:

- `users.read`, `users.create`, `users.update`, `users.delete`
- `skills.read`, `skills.create`, `skills.update`, `skills.delete`
- `projects.read`, `projects.create`, `projects.update`, `projects.delete`
- `resources.locales.read|create|update|delete`
- `resources.translations.read|create|update|delete`
- `posts.read.*`, `posts.create`, `posts.update.*`, `posts.delete.*`

Posts slice icin ownership policy de eklendi:

- `admin` tum postlari gorebilir ve yonetebilir.
- `author` yalnizca kendi postlarini gorebilir/guncelleyebilir/silebilir.
- Post dashboard access, create ve mutation izinleri claim set'i ile karar verir.

Bu cozumde cookie icine claim snapshot yazilmadi. Session cookie yalnizca auth token tasir; authorization source-of-truth DB olarak kaldigi icin role veya claim degisiklikleri sonraki request'te deterministik sekilde devreye girer.

## 2. Degistirilen Dosyalar ve Sorumluluklari

### Yeni Dosyalar

- `app/shared/authz/model.ts`
  - Claim/effect/scope sabitleri, default role claim matrisi ve authz helper'lari.
- `app/shared/authz/authz.server.ts`
  - Session -> effective claim resolver, versioned cache ve actor helper'lari.
- `app/shared/authz/post-policy.server.ts`
  - Posts ownership ve claim tabanli policy helper'lari.
- `docs/features/Phase2_Task2.5_HybridAuthorization.md`
  - Bu feature dokumani.

### Guncellenen Dosyalar

- `db/schema.ts`
  - `users.authz_version` ve authorization tablolarini ekler.
- `db/migrations/0012_marvelous_black_queen.sql`
  - Authorization schema migration'i, ilk claim seed'leri, role-claim map'i ve i18n backfill'i.
- `db/migrations/0013_granular_hybrid_claims.sql`
  - Ilk `*.manage` claim'lerini CRUD/sub-resource claim'lerine migrate eder ve mevcut role/override kayitlarini yeni matrisle backfill eder.
- `app/shared/auth/auth.server.ts`
  - Better Auth user payload'ina `authzVersion` ekler.
- `app/shared/auth/session-user.ts`
  - Session icinden `authzVersion` ve explicit `claims` cozumler.
- `app/lib/users/users.server.ts`
  - Kullanici guncelleme/pasiflestirme akislarinda `authzVersion` arttirir.
- `app/lib/posts/posts.server.ts`
  - Author-aware post listeleme ve ownership lookup helper'larini ekler.
- `app/features/dashboard/layout/*`
  - Dashboard identity ve navigation'i claim tabanli hale getirir.
- `app/features/dashboard/posts/*`
  - Claim + ownership tabanli gate, denied state ve forbidden action akisini ekler.
- `app/features/dashboard/projects/*`
  - Leaf-level session + `projects.read/create/update/delete` enforcement ve denied state ekler.
- `app/features/dashboard/users/server.ts`
  - `users.read/create/update/delete` claim'leri ile intent bazli yetki verir.
- `app/features/dashboard/skills/server.ts`
  - `skills.read/create/update/delete` claim'leri ile intent bazli yetki verir.
- `app/features/dashboard/resources/server.ts`
  - `resources.locales.*` ve `resources.translations.*` claim'leri ile loader/action yetkisini ayirir; tab fallback ve action gorunurlugunu permission objesiyle uretir.
- `app/shared/i18n/messages.shared.ts`
  - Projects/posts restricted state ve forbidden action mesajlarini ekler.
- `docs/roadmap.md`
  - Phase 2 Task 2.5 tamamlandi olarak isaretlenir.
- `docs/lessons.md`
  - Authorization ve leaf route guard dersi eklenir.

### Testler

- `tests/unit/shared/authz/authz.server.test.ts`
  - Fallback role claim ve explicit session claim davranisini dogrular.
- `tests/unit/shared/auth/auth.server.test.ts`
  - Better Auth additional field mapping'ine `authzVersion` beklentisini ekler.
- `tests/unit/shared/auth/session-user.test.ts`
  - `authzVersion` ve explicit claim helper'larini dogrular.
- `tests/unit/db/schema.test.ts`
  - Authorization tablolarini ve `users.authz_version` kolonunu dogrular.
- `tests/unit/features/dashboard/layout/*.test.*`
  - Dashboard identity/navigation kontratini claim tabanli yapida dogrular.
- `tests/integration/features/dashboard/posts.server.test.ts`
  - Posts loader/action'in claim-aware shape'ini dogrular.
- `tests/integration/features/dashboard/projects.server.test.ts`
  - Projects action route'unun session/authz gereksinimini dogrular.
- `tests/integration/features/dashboard/resources.server.test.ts`
  - Resources loader/action'in sub-resource claim ayrimini ve section fallback davranisini dogrular.
- `tests/integration/routes/dashboard/layout-loader.test.ts`
  - Layout loader'in dashboard identity icine effective claims tasidigini dogrular.

## 3. Uygulanan Testler ve Sonuclari

- `npm run db:generate`
  - Basarili.
- `npm run db:migrate:local`
  - Basarili. `0012_marvelous_black_queen.sql` ve `0013_granular_hybrid_claims.sql` local D1 veritabanina uygulandi.
- `npm test`
  - Basarili. `83` test dosyasi ve `229` test gecti.
- `npm run typecheck`
  - Basarili.
- `npm run lint`
  - Basarili.
- `npm run format:check`
  - Basarili.
- `npm run build`
  - Basarili.
- `npm run e2e`
  - Basarili. `8` Playwright senaryosu gecti.

## 4. Dogrulama / Calistirma Komutlari

```bash
npm run db:generate
npm run db:migrate:local
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run e2e
```

## 5. Roadmap Referansi

- `Phase 2 / Task 2.5`: `Db uzerinden role - claim based hybrid bir authorization yapisinin kurulmasi.`
