# Phase2 Task2.5 Authorization Readability Refactor

## Ozet

Hybrid authorization altyapisi sonrasinda biriken okunabilirlik borclari temizlendi. `shared/authz` modulu actor resolution, guard ve response sorumluluklarina ayrildi; `resources` dashboard slice'i locale ve translation mutation handler'larina bolundu; `projects` server akisi dogrudan `AppLoadContext` kullanacak sekilde sadeletirildi.

## Dosya Sorumluluklari

- `app/shared/authz/actor.ts`: authorization actor ve dashboard actor session kontratlari
- `app/shared/authz/resolver.server.ts`: session -> actor resolution, cache ve `requireDashboardActor`
- `app/shared/authz/guards.ts`: claim kontrol ve denied helper'lari
- `app/shared/authz/responses.ts`: ortak forbidden form response builder
- `app/shared/authz/authz.server.ts`: ince barrel export katmani
- `app/shared/auth/session-user.ts`: normalize edilmis `sessionUser` snapshot helper'i
- `app/features/dashboard/resources/server.ts`: yalnizca resources loader/action orchestration
- `app/features/dashboard/resources/permissions.ts`: locale/translation permission hesaplama
- `app/features/dashboard/resources/navigation.server.ts`: locale fallback ve redirect helper'lari
- `app/features/dashboard/resources/action-state.server.ts`: resources action response builder'lari
- `app/features/dashboard/resources/locale-actions.server.ts`: locale mutation akislari
- `app/features/dashboard/resources/translation-actions.server.ts`: translation mutation akislari
- `app/features/dashboard/projects/server.ts`: `AppLoadContext` ile sade projects action/loader akisi
- `app/features/dashboard/layout/server.ts`: cast yerine `sessionUser` snapshot kullanimi
- `app/features/dashboard/posts/server.ts`: `auth.actor.userId` uzerinden author resolution

## Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run db:migrate:local`
- `npm run e2e`

Tum komutlar basariyla gecti.

## Dogrulama Notlari

- `shared/authz/authz.server.ts` artik yalnizca barrel export gorevi goruyor.
- `resources/server.ts` ana akisi intent bazli locale ve translation handler'larina delegasyon yapiyor.
- `projects/server.ts` icindeki `DbContextShape` ve `context as AppLoadContext` cast'leri kaldirildi.

## Roadmap Referansi

- `Phase 2 / Db üzerinden role - claim based hybrid bir authorization yapısının kurulması`
