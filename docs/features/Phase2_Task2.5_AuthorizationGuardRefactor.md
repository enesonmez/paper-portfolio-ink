# Phase 2 Task 2.5 Authorization Guard Refactor

## Ozet

Dashboard `server.ts` modullerindeki tekrar eden authorization bootstrap ve basit claim-check bloklari ortak helper'lara tasindi. `requireDashboardActor()` session + actor cozumlemesini tek noktada topluyor; `denyLoaderIfMissingClaim()` ve `denyActionIfMissingClaim()` ise feature'in kendi denied/forbidden response shape'ini korurken claim guard tekrarini azaltıyor.

## Dosya Sorumluluklari

- `app/shared/authz/authz.server.ts`: `requireDashboardActor`, loader/action claim guard helper'lari ve mevcut actor resolver.
- `app/features/dashboard/layout/server.ts`: parent loader auth bootstrap'ini ortak helper uzerinden kurar.
- `app/features/dashboard/projects/server.ts`: read/mutation claim guard tekrarlarini shared helper ile sadeleştirir.
- `app/features/dashboard/skills/server.ts`: loader/action authz kontrolunu ortak helper'a baglar.
- `app/features/dashboard/users/server.ts`: loader/action authz kontrolunu ortak helper'a baglar.
- `app/features/dashboard/posts/server.ts`: ownership policy korunarak session+actor bootstrap'i ortak helper'a tasinir.
- `app/features/dashboard/resources/server.ts`: section policy korunarak action-level claim guard ve bootstrap ortaklastirilir.
- `tests/unit/shared/authz/authz.server.test.ts`: yeni guard helper davranislarini dogrular.
- `tests/integration/routes/dashboard/layout-loader.test.ts`: dashboard layout'in yeni auth bootstrap giris noktasini dogrular.

## Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run db:migrate:local`
- `npm run e2e`

## Dogrulama Komutlari

```bash
npm test tests/unit/shared/authz/authz.server.test.ts
npm test tests/integration/routes/dashboard/layout-loader.test.ts
```

## Roadmap Baglanti

- `docs/roadmap.md` Phase 2: `Db üzerinden role - claim based hybrid bir authorization yapısının kurulması.`
