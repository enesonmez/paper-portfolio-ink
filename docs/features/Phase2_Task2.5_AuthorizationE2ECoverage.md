# Phase 2 / Task 2.5: Authorization E2E Coverage

## 1. Ozet ve Teknik Calisma Mantigi

Bu calisma, DB-backed hybrid authorization yapisinin gercek browser ortaminda uc uca dogrulanmasi icin Playwright kapsamını genisletir. Amaç yalnizca admin mutlu yolunu test etmek degil, role + claim grant/revoke kombinasyonlarinin navigation, route guard, ownership ve mutation denial davranislarini ayni local D1 fixture'i uzerinde kanitlamaktı.

Bu kapsamda:

- E2E seed fixture'i tek admin kullanicidan coklu authorization personasi modeline genisletildi.
- `author` icin base role davranisi ve own-post kuralı test edildi.
- `registryAuditor` icin role `author` uzerine DB grant override ile `projects.read`, `skills.read`, `users.read` yetkileri verildi.
- `localeOperator` ve `translationOperator` kullanicilari ile `resources.locales.*` ve `resources.translations.*` ayrimi gercek route davranisiyla test edildi.
- `revokedAdmin` kullanicisi ile user-level revoke override'in admin role defaults'u uzerine bindigi dogrulandi.
- Dashboard route navigation gorunurlugu, denied screen'ler ve direct action/mutation denial akislari ayni suite icinde kontrol edildi.

Resources child action'lari icin ek bir not:

- React Router framework mode altinda child action'a normal document-style POST ile gidildiginde, forbidden sonuc bazen raw `403` yerine action error iceren rendered HTML `200` cevabina donusebiliyor.
- Bu nedenle resources altindaki cross-section mutation denial senaryolari same-origin `fetch()` ile test edilerek forbidden body icerigi dogrulandi.

## 2. Degistirilen Dosyalar ve Sorumluluklari

### Guncellenen Dosyalar

- `scripts/seed-e2e.mjs`
  - Coklu test kullanicisi, claim override fixture'lari, deterministic user/post/project/skill seed'i ve authz persona setup'i ekler.
- `tests/e2e/support/constants.ts`
  - Yeni e2e kullanici fixture'larini, storage state path'lerini ve sabit fixture id'lerini tanimlar.
- `tests/e2e/support/auth.ts`
  - Generic `signInAs`, direct action POST ve same-origin fetch helper'larini ekler.
- `tests/e2e/setup/auth.setup.ts`
  - Admin disindaki persona'lar icin de storage state uretir.
- `tests/e2e/dashboard.spec.ts`
  - Users registry assertion'ini yeni revoke-admin fixture'ina karsi exact-match olacak sekilde sertlestirir.
- `playwright.config.ts`
  - Authorization suite'ini authenticated project'e dahil eder.

### Yeni Dosyalar

- `tests/e2e/authorization.spec.ts`
  - Base author, read-only hybrid grant, locale-only, translation-only ve revoked-admin senaryolarini uc uca test eder.
- `docs/features/Phase2_Task2.5_AuthorizationE2ECoverage.md`
  - Bu coverage genislemesinin dokumani.

## 3. Uygulanan Testler ve Sonuclari

- `npm run typecheck`
  - Basarili.
- `npm test`
  - Basarili. `83` test dosyasi ve `231` test gecti.
- `npm run lint`
  - Basarili.
- `npm run format:check`
  - Basarili.
- `npm run build`
  - Basarili.
- `npm run e2e`
  - Basarili. `24` Playwright senaryosu gecti.

Authorization e2e tarafinda dogrulanan ana case'ler:

- Anonim kullanicinin dashboard route redirect'i
- `author` icin posts-only navigation ve admin registry denial
- Own-post visibility ve foreign-post mutation denial
- DB grant override ile read-only registry access
- Read-only persona icin create/update/delete mutation denial
- `resources.locales.*` ve `resources.translations.*` ayrik yetki davranisi
- User-level revoke override ile admin defaults'un daraltilmasi

## 4. Dogrulama / Calistirma Komutlari

```bash
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
npm run e2e
```

## 5. Roadmap Referansi

- `Phase 2 / Task 2.5`: `Db uzerinden role - claim based hybrid bir authorization yapisinin kurulmasi.`
- Bu calisma, ayni task'in dogrulama kapsamini genisleten roadmap disi bir quality-hardening adimidir.
