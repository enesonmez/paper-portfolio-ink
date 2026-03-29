# Maintenance: Slice Test Coverage Audit

## Summary

`dashboard`, `public` ve `auth` altindaki slice'lar test yuzeyi acisindan yeniden tarandi. Mevcut unit/integration/e2e yapisi genel olarak saglamdi; ancak feature-level `auth/login` server kontrati, direct slice-level `dashboard/overview` ekran testi ve iki gorunur e2e boslugu (`public/projects` legacy redirect, `dashboard/logging` admin akisi) eksik kalmisti. Bu bosluklar tamamlandi.

Ikinci turda authorization e2e matrisi de derinlestirildi. `dashboard` altindaki registry slice'lar, `resources` alt-domain operator'lari ve `logging` action-only claim senaryolari positive/negative direct action akisleriyle tamamlandi; unsupported intent guard'lari da browser seviyesinde sabitlendi.

## Added Tests

- `tests/integration/features/auth/login.server.test.ts`
  `loadLoginData` ve `handleLoginAction` icin feature-server seviyesinde loader redirect normalizasyonu, auth service delegasyonu ve typed validation error davranisini sabitler.
- `tests/unit/features/dashboard/overview/screen.test.tsx`
  `DashboardOverviewScreen` icin route wrapper'dan bagimsiz slice-level render kontratini sabitler.
- `tests/e2e/public.spec.ts`
  Legacy `/projects` redirect ve localized projects sayfasi gorunurlugunu ek kapsama alir.
- `tests/e2e/dashboard.spec.ts`
  Admin kullanicinin `logging` slice'inda errors tabina erisip export/delete araclarini gorebildigini dogrular.
- `tests/e2e/authorization.spec.ts`
  Author, registry auditor, locale operator, translation operator, revoked admin ve claim-only logging operator personelari uzerinden dashboard authorization matrisini tamamlar; registry positive mutations, owner-only post update, locale/translation CRUD, invalid intent guard'lari ve `logs.export` / `logs.delete` icin read'siz action izinlerini browser seviyesinde sabitler.

## Verification

- `npx vitest run tests/integration/features/auth/login.server.test.ts tests/unit/features/dashboard/overview/screen.test.tsx`
- `npm run format:check`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run e2e`

## Roadmap

Bu calisma roadmap disi bir test coverage bakim/refactor gorevidir; `docs/roadmap.md` icinde yeni bir checkbox guncellenmedi.
