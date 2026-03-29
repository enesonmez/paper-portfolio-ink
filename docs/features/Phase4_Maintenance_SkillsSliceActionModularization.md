# Phase 4 Maintenance: Skills Slice Action Modularization

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu bakim calismasi ile `dashboard/skills` slice'indaki server-side akislar daha ince sorumluluklara ayrildi. Ama hedef klasik MVC tarzinda kalin bir controller uretmek degildi; route kontratini bozmadan `loader`, `action dispatch`, intent bazli authorization ve CRUD operation'larini birbirinden ayirmak hedeflendi. Son adimda `actions.server.ts` icindeki intent dagitimi da dispatch map desenine cevrilerek `users/projects` ile ayni orchestration kalibi korundu; create/update parse akislarinin da branch-specific resolver'lara ayrilmasi ile type davranisi bu iki slice ile birebir hizalandi. Buna ek olarak skill-specific authorization helper'i de typed intent kabul edecek sekilde daraltildi ve update/delete forbidden patikalari integration testte sabitlendi.

Uygulanan yapi su sekilde calisir:

- `app/features/dashboard/skills/server.ts` artik yalnizca sabit export yuzeyi saglayan ince bir barrel gorevi gorur.
- `app/features/dashboard/skills/loader.server.ts` loader orchestration ve read claim kontrolunu tasir.
- `app/features/dashboard/skills/actions.server.ts` form payload'ini okur, actor'u cozer, intent dispatch yapar ve uygun operation handler'ina yonlendirir.
- `app/features/dashboard/skills/operations/_shared/authorization.server.ts` intent -> claim eslemesini ve forbidden form state uretimini skill slice'a ozel olarak yonetir.
- `app/features/dashboard/skills/operations/create.server.ts`, `update.server.ts` ve `delete.server.ts` dosyalari kendi validation, audit log, cache invalidation ve redirect davranislarini izole sekilde tasir.
- `app/features/dashboard/skills/operations/_shared/support.server.ts` duplicate slug ve form-state olusturma gibi ortak mutation primitive'lerini tutar.

Bu ayrimla birlikte:

- read gate route-facing loader katmaninda kaldi,
- intent'e ozel authorization karari operation tarafina yaklasti,
- create/update/delete akislarinin yan etkileri birbirinden ayrildi,
- mevcut route ve integration test import kontratlari korunmus oldu.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `app/features/dashboard/skills/loader.server.ts`
  - Skills registry loader orchestration, read yetki kontrolu ve granted payload uretimi.
- `app/features/dashboard/skills/actions.server.ts`
  - FormData okuma, unsupported intent guard, actor resolve oncesi intent cikarma, `withDashboardAccess.authorize` ile claim gate ve submission parse orkestrasyonu.
- `app/features/dashboard/skills/operations/_shared/authorization.server.ts`
  - Skill intent'leri icin claim esleme ve intent'e ozel forbidden error orchestration.
- `app/features/dashboard/skills/operations/create.server.ts`
  - Skill create akisi, duplicate slug guard, cache purge ve audit log.
- `app/features/dashboard/skills/operations/update.server.ts`
  - Skill update akisi, target id validation, duplicate slug guard, cache purge ve audit log.
- `app/features/dashboard/skills/operations/delete.server.ts`
  - Skill delete akisi, target id validation, cache purge ve audit log.
- `app/features/dashboard/skills/operations/_shared/support.server.ts`
  - Mutation'lar arasinda paylasilan form-state ve duplicate slug helper'lari.
- `tests/unit/features/dashboard/skills/mutation-authorization.test.ts`
  - Intent bazli authorization helper'inin required claim secimini ve forbidden error davranisini dogrular.
- `tests/unit/domain/skills/model.test.ts`
  - Skill intent type guard'inin yalnizca desteklenen intent'leri kabul ettigini dogrular.
- `tests/integration/features/dashboard/skills.server.test.ts`
  - Create forbidden'a ek olarak update/delete forbidden ve invalid intent patikalarinda parse/write yan etkilerinin olusmadigini dogrular.
- `docs/features/Phase4_Maintenance_SkillsSliceActionModularization.md`
  - Bu bakim/refactor calismasinin teknik kaydini tutar.

### Guncellenen Dosyalar

- `app/features/dashboard/skills/server.ts`
  - Dis import kontratini koruyan ince barrel yapisina donusturuldu.
- `docs/lessons.md`
  - `loader/actions/operations` ayrimi, gereksiz ara barrel'lerin kaldirilmasi ve intent'e ozel forbidden error kodlari lesson olarak eklendi.

## 3. Uygulanan Testler ve Sonuclari

Hedefli dogrulamalar:

- `npx vitest run tests/integration/features/dashboard/skills.server.test.ts tests/integration/routes/dashboard/modules.test.ts tests/unit/features/dashboard/skills/mutation-authorization.test.ts`
  - Sonuc: 3 test dosyasi, 10 test gecti.

Tum proje kalite kapilari:

- `npm run format:check`
  - Sonuc: gecti.
- `npm run test`
  - Sonuc: 92 test dosyasi, 266 test gecti.
- `npm run typecheck`
  - Sonuc: gecti.
- `npm run lint`
  - Sonuc: gecti.
- `npm run e2e`
  - Sonuc: 24 test gecti.
  - Not: Sandbox icinde Wrangler log ve localhost binding izni olmadigi icin e2e suite yetkili modda tekrar calistirildi.

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npx vitest run tests/integration/features/dashboard/skills.server.test.ts tests/integration/routes/dashboard/modules.test.ts tests/unit/features/dashboard/skills/mutation-authorization.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

Manuel olarak su ekran dogrulanabilir:

- `/dashboard/skills`

Beklenen sonuc:

- Read claim'i olmayan kullanici skills registry verisini alamaz.
- Create/update/delete intent'leri kendi claim'leri ile ayri ayri denetlenir.
- Unsupported intent degerleri auth resolve edilmeden `skills.mutation.invalid_intent` ile reddedilir.
- Forbidden error code'lari intent'e gore `skills.create.forbidden`, `skills.update.forbidden`, `skills.delete.forbidden` seklinde uretilir.
- Basarili mutation'larda cache purge, audit log ve locale-aware redirect davranisi korunur.

## 5. Roadmap Referansi

- Roadmap disi bakim/refactor calismasi.
- Ilgili alan: Phase 4 dashboard registry slice okunabilirligi ve authorization ayrimi.
