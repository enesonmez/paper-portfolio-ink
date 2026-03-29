# Phase4 Maintenance Posts Slice Action Modularization

## Summary

Bu çalışma roadmap dışı bakım/refactor görevi olarak `dashboard/posts` slice'ını `skills/users/projects` ile aynı loader/actions/operations omurgasına taşır. Root `server.ts` artık yalnızca export yüzeyi sağlar; read akışı `loader.server.ts`, action orchestration `actions.server.ts`, create/update/delete işlemleri ise `operations/*` altında ayrışır. `posts` slice'ının owner/any policy farkı korunur; bu kez yetki kararı `operations/_shared/authorization.server.ts` içinde async policy helper'larıyla çözülür. Son adımda loader read gate'i de `withDashboardAccess.authorize` callback'ine taşınarak diğer slice'larla aynı orchestration çizgisine tam hizalanmış, create/update parse sonucu da authorize ve handle arasında request-scope memoization ile paylaşılmıştır.

## Files And Responsibilities

- `app/features/dashboard/posts/server.ts`: Slice dış kontratını koruyan ince export yüzeyi.
- `app/features/dashboard/posts/loader.server.ts`: Dashboard post erişim gate'i, authorized list yükleme ve loader payload kurulumunu yönetir.
- `app/features/dashboard/posts/actions.server.ts`: FormData çözümleme, invalid intent guard, authorize callback ve dispatch-map tabanlı operation orkestrasyonunu yönetir.
- `app/features/dashboard/posts/operations/create.server.ts`: Post oluşturma, missing author guard, duplicate slug guard, cache purge, audit log ve redirect.
- `app/features/dashboard/posts/operations/update.server.ts`: Post güncelleme, target id guard, duplicate slug guard, cache purge, audit log ve redirect.
- `app/features/dashboard/posts/operations/delete.server.ts`: Post silme, target id guard, cache purge, audit log ve redirect.
- `app/features/dashboard/posts/operations/_shared/authorization.server.ts`: Create/update/delete için owner/any policy tabanlı authorization kararını ve forbidden state üretimini yönetir.
- `app/features/dashboard/posts/operations/_shared/support.server.ts`: Duplicate slug, slug suggestion, cache purge ve eksik `postId` guard'ları için ortak helper'ları sağlar.
- `app/domain/posts/model.ts`: `isPostMutationIntent` type guard ile action girişindeki intent doğrulamasını taşır.
- `app/shared/errors/contracts.ts`: `posts.mutation.invalid_intent` typed error kodunu tanımlar.

## Tests

- `tests/integration/features/dashboard/posts.server.test.ts`
- `tests/unit/domain/posts/model.test.ts`
- `tests/unit/features/dashboard/posts/mutation-authorization.test.ts`

Hedefli testler, invalid intent guard'ının auth resolve etmeden 400 dönmesini, create/update/delete forbidden patikalarında write yan etkilerinin oluşmadığını ve owner/any policy authorization helper'ının doğru error code ürettiğini doğrular.

## Verification Commands

```bash
npx prettier --write app/features/dashboard/posts app/domain/posts/model.ts app/shared/errors/contracts.ts tests/integration/features/dashboard/posts.server.test.ts tests/unit/domain/posts/model.test.ts tests/unit/features/dashboard/posts/mutation-authorization.test.ts docs/features/Phase4_Maintenance_PostsSliceActionModularization.md docs/lessons.md
npx vitest run tests/integration/features/dashboard/posts.server.test.ts tests/unit/domain/posts/model.test.ts tests/unit/features/dashboard/posts/mutation-authorization.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

## Roadmap Reference

Bu çalışma roadmap dışı bakım/refactor görevidir; doğrudan bir checkbox güncellemesi yoktur.
