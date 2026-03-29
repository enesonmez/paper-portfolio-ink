# Phase4 Maintenance Projects Slice Action Modularization

## Summary

Bu çalışma roadmap dışı bakım/refactor görevi olarak `dashboard/projects` slice'ını `skills` ve `users` slice'larında oturan loader/actions/operations desenine hizalar. Root `server.ts` artık yalnızca export yüzeyi sağlar; read akışı `loader.server.ts`, action orchestration `actions.server.ts`, create/update/delete işlemleri ise `operations/*` altında ayrışır. Intent bazlı authorization ve slug conflict/cache invalidation gibi ortak mutation yardımcıları `operations/_shared/*` içine taşınarak slice'ın okunabilirliği ve bakım hızı artırılmıştır. Son adımda `actions.server.ts` içindeki intent dispatch de map tabanlı hale getirilerek üç registry slice arasında aynı orchestration kalıbı korunmuştur.

## Files And Responsibilities

- `app/features/dashboard/projects/server.ts`: Slice dış kontratını koruyan ince export yüzeyi.
- `app/features/dashboard/projects/loader.server.ts`: `projectsRead` gate'i, listeleme ve loader payload kurulumunu yönetir.
- `app/features/dashboard/projects/actions.server.ts`: FormData çözümleme, invalid intent guard, authorize callback ve operation dispatch akışını yönetir.
- `app/features/dashboard/projects/operations/create.server.ts`: Proje oluşturma, duplicate slug guard, cache purge, audit log ve redirect.
- `app/features/dashboard/projects/operations/update.server.ts`: Proje güncelleme, target id guard, duplicate slug guard, cache purge, audit log ve redirect.
- `app/features/dashboard/projects/operations/delete.server.ts`: Proje silme, target id guard, cache purge, audit log ve redirect.
- `app/features/dashboard/projects/operations/_shared/authorization.server.ts`: Intent bazlı claim eşleşmesini ve intent-specific forbidden error üretimini içerir.
- `app/features/dashboard/projects/operations/_shared/support.server.ts`: Duplicate slug, slug suggestion, cache purge ve eksik `projectId` guard'ları için ortak helper'ları sağlar.
- `app/domain/projects/model.ts`: `isProjectMutationIntent` type guard ile action girişindeki intent doğrulamasını taşır.
- `app/shared/errors/contracts.ts`: `projects.create/update/delete.forbidden` ve `projects.mutation.invalid_intent` typed error kodlarını tanımlar.

## Tests

- `tests/integration/features/dashboard/projects.server.test.ts`
- `tests/unit/domain/projects/model.test.ts`
- `tests/unit/features/dashboard/projects/mutation-authorization.test.ts`

Hedefli testler, invalid intent guard'ının auth resolve etmeden 400 dönmesini, unauthorized create/update/delete akışlarının intent-specific forbidden code üretmesini ve intent-claim eşleşmesini doğrular.

## Verification Commands

```bash
npx prettier --write app/features/dashboard/projects app/domain/projects/model.ts app/shared/errors/contracts.ts tests/integration/features/dashboard/projects.server.test.ts tests/unit/domain/projects/model.test.ts tests/unit/features/dashboard/projects/mutation-authorization.test.ts docs/features/Phase4_Maintenance_ProjectsSliceActionModularization.md docs/lessons.md
npx vitest run tests/integration/features/dashboard/projects.server.test.ts tests/unit/domain/projects/model.test.ts tests/unit/features/dashboard/projects/mutation-authorization.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

## Roadmap Reference

Bu çalışma roadmap dışı bakım/refactor görevidir; doğrudan bir checkbox güncellemesi yoktur.
