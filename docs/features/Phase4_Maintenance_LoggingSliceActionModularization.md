# Phase4 Maintenance Logging Slice Action Modularization

## Summary

Bu çalışma roadmap dışı bakım/refactor görevi olarak `dashboard/logging` slice'ını `skills/users/projects/posts` ile aynı orchestration omurgasına taşır. Root `server.ts` artık yalnızca export yüzeyi sağlar; read akışı `loader.server.ts`, action orchestration `actions.server.ts`, intent-spesifik işlemler ise `operations/*` altında ayrışır. `logging` CRUD olmayan bir slice olduğu için operation adları `export` ve `delete` olarak korunur; buna rağmen invalid intent guard, dispatch map, operation-level authorization ve `_shared` yardımcı katmanı diğer dashboard slice'larla aynı kontratta çalışır.

## Files And Responsibilities

- `app/domain/logging/model.ts`: Logging action intent ve form field sabitlerini, type guard ile birlikte taşır.
- `app/features/dashboard/logging/server.ts`: Slice dış kontratını koruyan ince export yüzeyi.
- `app/features/dashboard/logging/loader.server.ts`: `logs.read` gate'i, overview sorgusu ve loader payload kurulumunu yönetir.
- `app/features/dashboard/logging/actions.server.ts`: FormData çözümleme, invalid intent guard, intent-spesifik authorization ve dispatch-map tabanlı operation orkestrasyonunu taşır; parse yalnızca `handle` katmanında yapılır.
- `app/features/dashboard/logging/operations/export.server.ts`: Hata logu export akışını, audit kaydını ve txt response üretimini yönetir.
- `app/features/dashboard/logging/operations/delete.server.ts`: Tarih aralığına göre hata logu silme, audit kaydı ve başarı notice üretimini yönetir.
- `app/features/dashboard/logging/operations/_shared/authorization.server.ts`: `export-errors` ve `delete-errors` intent'lerini claim bazlı authorize eder.
- `app/features/dashboard/logging/operations/_shared/support.server.ts`: Logging action response state kurulumunu ve submission tiplerini merkezi tutar.
- `app/lib/logging/logging-range-form.server.ts`: Domain intent/field sabitleriyle hizalı parser ve typed validation error üretir.
- `app/shared/authz/action-claims.ts`: Logging intent -> claim eşleşmesini merkezi claim map'e ekler.
- `app/shared/errors/contracts.ts`: `logging.read/export/delete` ve `logging.mutation.invalid_intent` kodlarını slice'larla aynı nested kontrata taşır.

## Tests

- `tests/integration/features/dashboard/logging.server.test.ts`
- `tests/integration/routes/dashboard/logging.test.tsx`
- `tests/unit/domain/logging/model.test.ts`
- `tests/unit/features/dashboard/logging/mutation-authorization.test.ts`
- `tests/unit/features/dashboard/logging/state.test.ts`
- `tests/unit/shared/errors/app-error.server.test.ts`

Hedefli testler loader denied/granted akışını, invalid intent guard'ının auth resolve etmeden 400 dönmesini, export/delete forbidden patikalarında yan etki oluşmamasını ve `logs.read` olmadan yalnızca `logs.export` veya `logs.delete` claim'iyle direct action akışının çalıştığını doğrular.

## Verification Commands

```bash
npx prettier --write app/domain/logging/model.ts app/lib/logging/logging-range-form.server.ts app/features/dashboard/logging app/shared/authz/action-claims.ts app/shared/errors/contracts.ts tests/unit/domain/logging/model.test.ts tests/unit/features/dashboard/logging/mutation-authorization.test.ts tests/integration/features/dashboard/logging.server.test.ts tests/unit/shared/errors/app-error.server.test.ts docs/features/Phase4_Maintenance_LoggingSliceActionModularization.md docs/lessons.md
npx vitest run tests/unit/domain/logging/model.test.ts tests/unit/features/dashboard/logging/state.test.ts tests/unit/features/dashboard/logging/mutation-authorization.test.ts tests/integration/features/dashboard/logging.server.test.ts tests/integration/routes/dashboard/logging.test.tsx tests/unit/shared/errors/app-error.server.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

## Roadmap Reference

Bu çalışma roadmap dışı bakım/refactor görevidir; doğrudan bir checkbox güncellemesi yoktur.
