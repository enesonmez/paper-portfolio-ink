# Phase 4 Maintenance: Dashboard Authz Handlers

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu bakim calismasi ile dashboard feature'larinda tekrar eden `requireDashboardActor -> Response check -> claim/policy guard -> handler` akisi ortak bir handler katmanina tasindi. Ama amac tum authorization kararlarini tek middleware'e gommek degildi; yalnızca auth bootstrap ve forbidden error orchestration tek yerde toplandi.

Uygulanan yapi su sekilde calisir:

- `app/shared/authz/handlers.server.ts` icinde `withDashboardAccess` helper'i eklendi. Bu helper, `requireDashboardActor` sonucunu cozer, redirect `Response` ise erken doner, degilse authorize ve handle callback'lerini tip guvenli sekilde calistirir.
- `assertClaimAuthorized`, `assertAnyClaimAuthorized` ve `assertAuthorized` helper'lari ortak `buildAuthorizationError` uzerinden typed forbidden error uretir.
- `projects`, `skills`, `users` ve `logging` gibi basit claim guard kullanan dashboard slice'lari bu helper'a gecirildi.
- `posts` ve `resources` gibi ozel policy ureten slice'lar da ayni orchestration helper'ini kullanir hale getirildi, ancak owner/section bazli policy kararlarini feature katmaninda korudu.
- `layout` loader'i de ayni auth bootstrap helper'ina gecirilerek dashboard shell tarafindaki tekrar kaldirildi.

Bu refactor ile server modullerinde authorization akisi daha okunur hale geldi:

- auth resolve tek yerden yonetiliyor,
- redirect davranisi tum dashboard slice'larinda tutarli,
- forbidden error shape'i ortak utility'lerle kuruluyor,
- feature'a ozel authorization policy'leri kaybolmadan korunuyor.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `app/shared/authz/handlers.server.ts`
  - Dashboard auth bootstrap orchestration helper'i ile ortak authorization throw helper'larini tanimlar; `withDashboardAccess` arguman sozlesmesi `request -> context -> authorize -> handle` sirasinda tutulur.
- `tests/unit/shared/authz/handlers.server.test.ts`
  - Yeni helper'larin redirect handling, authorize/handle callback akisi ve typed forbidden error davranisini dogrular.
- `docs/features/Phase4_Maintenance_DashboardAuthzHandlers.md`
  - Bu bakim calismasinin teknik ozeti ve dogrulama kaydini tutar.

### Guncellenen Dosyalar

- `app/shared/authz/authz.server.ts`
  - Yeni handler helper export'larini ortak authz public API'ye ekler.
- `app/features/dashboard/layout/server.ts`
  - Dashboard layout loader auth bootstrap icin `withDashboardAccess` kullanir.
- `app/features/dashboard/projects/server.ts`
  - Loader ve action icindeki claim guard ve auth bootstrap tekrarini ortak helper'a tasir.
- `app/features/dashboard/skills/server.ts`
  - Loader ve action authorization akisini ortak helper'a tasir.
- `app/features/dashboard/users/server.ts`
  - Loader ve action authorization akisini ortak helper'a tasir.
- `app/features/dashboard/posts/server.ts`
  - Owner/any policy korunurken auth bootstrap `withDashboardAccess` ile merkezilesir.
- `app/features/dashboard/resources/server.ts`
  - Section bazli permission check ortak orchestration helper'i uzerinden calisir.
- `app/features/dashboard/logging/server.ts`
  - Read claim guard ve auth bootstrap tekrarini ortak helper'a tasir.
- `tests/integration/routes/dashboard/layout-loader.test.ts`
  - Yeni helper export'unu mock'layacak sekilde route loader testi guncellendi.
- `docs/lessons.md`
  - Dashboard auth orchestration helper deseni gelecekte korunacak lesson olarak eklendi.

## 3. Uygulanan Testler ve Sonuclari

Asagidaki kalite kapilari bu bakim calismasi sonrasi tum proje icin calistirildi:

- `npm run format:check`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run e2e:prepare`
- `npm run e2e`

Ek olarak refactor sirasinda hedefli su test setleri de ayri olarak kosturuldu:

- `npm test -- tests/unit/shared/authz/authz.server.test.ts tests/unit/shared/authz/handlers.server.test.ts`
- `npm test -- tests/integration/features/dashboard/projects.server.test.ts tests/integration/features/dashboard/skills.server.test.ts tests/integration/features/dashboard/users.server.test.ts tests/integration/features/dashboard/posts.server.test.ts tests/integration/features/dashboard/resources.server.test.ts tests/integration/routes/dashboard/layout-loader.test.ts tests/integration/routes/dashboard/logging.test.tsx`

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e:prepare
npm run e2e
```

Manuel olarak su ekranlar dogrulanabilir:

- `/dashboard/projects`
- `/dashboard/skills`
- `/dashboard/users`
- `/dashboard/posts`
- `/dashboard/resources`
- `/dashboard/logging`

Beklenen sonuc:

- Auth gerektiren dashboard route'lari redirect davranisini korur.
- Read claim'i olmayan kullanicilar loader seviyesinde veri alamaz.
- Mutation claim'i olmayan kullanicilar typed forbidden form state alir.
- `posts` ve `resources` gibi ozel policy ekranlari mevcut davranisini korur.

## 5. Roadmap Referansi

- Roadmap disi bakim/refactor calismasi.
- Ilgili alan: Phase 4 dashboard authorization orchestration.
