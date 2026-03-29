# Phase4 Maintenance Users Slice Action Modularization

## Summary

Bu bakım çalışması roadmap dışı bir refactor olarak `dashboard/users` slice'ını `skills` slice'ında oturan action düzeniyle hizalar. Root `server.ts` yalnızca export yüzeyi sağlar; read akışı `loader.server.ts`, action orchestration `actions.server.ts`, create/update/delete işlemleri ise `operations/*` altında ayrışır. Intent bazlı authorization ve ortak mutation destek helper'ları `operations/_shared/*` içine taşınarak `users` slice'ındaki yetki, validation ve audit akışı daha merkezi ve okunabilir hale getirilmiştir. Son adımda `actions.server.ts` içindeki intent dağıtımı dispatch map desenine çevrilerek CRUD orkestrasyonu `skills/projects` ile birebir hizalanmıştır.

## Files And Responsibilities

- `app/features/dashboard/users/server.ts`: Slice dış kontratını koruyan ince export yüzeyi.
- `app/features/dashboard/users/loader.server.ts`: `usersRead` gate'i, listeleme ve loader payload kurulumunu yönetir.
- `app/features/dashboard/users/actions.server.ts`: FormData çözümleme, invalid intent guard, authorize callback ve operation dispatch akışını yönetir.
- `app/features/dashboard/users/operations/create.server.ts`: Kullanıcı oluşturma, duplicate email guard, audit log ve redirect.
- `app/features/dashboard/users/operations/update.server.ts`: Kullanıcı güncelleme, target id guard, son aktif admin koruması, duplicate email guard, cache purge, audit log ve redirect.
- `app/features/dashboard/users/operations/delete.server.ts`: Soft-delete/deactivate akışı, target id guard, son aktif admin koruması, cache purge, audit log ve redirect.
- `app/features/dashboard/users/operations/_shared/authorization.server.ts`: Intent bazlı claim eşleşmesini ve intent-specific forbidden error üretimini içerir.
- `app/features/dashboard/users/operations/_shared/support.server.ts`: Duplicate email, last active admin ve eksik `userId` guard'ları için ortak helper'ları sağlar.
- `app/domain/users/model.ts`: `isUserMutationIntent` type guard ile action girişindeki intent doğrulamasını taşır.
- `app/shared/errors/contracts.ts`: `users.create/update/delete.forbidden` ve `users.mutation.invalid_intent` typed error kodlarını tanımlar.

## Tests

- `tests/integration/features/dashboard/users.server.test.ts`
- `tests/unit/domain/users/model.test.ts`
- `tests/unit/features/dashboard/users/mutation-authorization.test.ts`

Hedefli testler, invalid intent guard'ının auth resolve etmeden 400 dönmesini ve create/update/delete forbidden patikalarında doğru forbidden code ile write yan etkisizliğini doğrular.

## Verification Commands

```bash
npx prettier --write app/features/dashboard/users app/domain/users/model.ts app/shared/errors/contracts.ts tests/integration/features/dashboard/users.server.test.ts tests/unit/domain/users/model.test.ts tests/unit/features/dashboard/users/mutation-authorization.test.ts docs/features/Phase4_Maintenance_UsersSliceActionModularization.md docs/lessons.md
npx vitest run tests/integration/features/dashboard/users.server.test.ts tests/unit/domain/users/model.test.ts tests/unit/features/dashboard/users/mutation-authorization.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

## Roadmap Reference

Bu çalışma roadmap dışı bakım/refactor görevidir; doğrudan bir checkbox güncellemesi yoktur.
