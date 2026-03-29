# Phase4 Maintenance Resources Slice Action Modularization

## Summary

Bu çalışma roadmap dışı bakım/refactor görevi olarak `dashboard/resources` slice'ını `skills/users/projects/logging` ile aynı orchestration omurgasına taşır. Root `server.ts` artık yalnızca export yüzeyi sağlar; read akışı `loader.server.ts`, action orchestration `actions.server.ts`, intent-spesifik işlemler ise `locales/operations/*` ve `translations/operations/*` altında ayrışır. Son bakım turunda slice root'u da sadeleştirilir; form-state, routing, permission ve loader concern'leri kendi alt klasörlerine taşınır. Locale ve translation alt-domain'leri farklı claim ve conflict davranışları taşıdığı için ortak kök altında kalır; ama authorization, validation, audit ve redirect kararları intent'e en yakın dosyalarda yaşar.

## Files And Responsibilities

- `app/domain/resources/contract.ts`: Resource action intent/form field sabitlerini ve `isResourceMutationIntent` guard'ını taşır.
- `app/features/dashboard/resources/server.ts`: Slice dış kontratını koruyan ince export yüzeyi.
- `app/features/dashboard/resources/loader.server.ts`: Resource dashboard read gate'ini, section fallback'ini ve final loader payload orchestration'ını taşır.
- `app/features/dashboard/resources/actions.server.ts`: FormData çözümleme, invalid intent guard, locale/translation authorize dispatch'i ve operation dispatch-map orkestrasyonunu taşır.
- `app/features/dashboard/resources/forms/form-state.server.ts`: Locale/translation action response state kurulumunu merkezi tutar.
- `app/features/dashboard/resources/routing/href.ts`: Section, modal, href builder ve query normalization sabitlerini taşır.
- `app/features/dashboard/resources/routing/navigation.server.ts`: Locale fallback ve resource redirect davranışını yönetir.
- `app/features/dashboard/resources/access/permissions.ts`: Resource section permission modelini ve read gate helper'larını taşır.
- `app/features/dashboard/resources/locales/loader/queries.server.ts`: Locale registry okuma akışını loader katmanı için izole eder.
- `app/features/dashboard/resources/locales/operations/create.server.ts`
- `app/features/dashboard/resources/locales/operations/update.server.ts`
- `app/features/dashboard/resources/locales/operations/delete.server.ts`
- `app/features/dashboard/resources/locales/operations/_shared/authorization.server.ts`
- `app/features/dashboard/resources/locales/operations/_shared/support.server.ts`
- `app/features/dashboard/resources/translations/operations/create.server.ts`
- `app/features/dashboard/resources/translations/operations/update.server.ts`
- `app/features/dashboard/resources/translations/operations/delete.server.ts`
- `app/features/dashboard/resources/translations/loader/request.server.ts`: Translation tab'ına ait modal/page/search/selected-locale request state'ini çözümler.
- `app/features/dashboard/resources/translations/loader/queries.server.ts`: Translation record/page sorgu akışını request-state üzerinden çalıştırır.
- `app/features/dashboard/resources/translations/operations/_shared/authorization.server.ts`
- `app/features/dashboard/resources/translations/operations/_shared/support.server.ts`
- `app/shared/errors/contracts.ts`: `resources.locales.*.forbidden`, `resources.translations.*.forbidden` ve `resources.mutation.invalid_intent` kodlarını nested kontratta tutar.

Eski `resources/mutations.server.ts`, `resources/locales/mutations.server.ts`, `resources/translations/mutations.server.ts`, `resources/action-state.server.ts`, `resources/href.ts`, `resources/navigation.server.ts` ve `resources/permissions.ts` dosyalari kaldirildi.

## Tests

- `tests/integration/features/dashboard/resources.server.test.ts`
- `tests/integration/routes/dashboard/resources-child-actions.test.ts`
- `tests/unit/domain/resources/contract.test.ts`
- `tests/unit/features/dashboard/resources/href.test.ts`
- `tests/unit/features/dashboard/resources/mutation-authorization.test.ts`
- `tests/unit/features/dashboard/resources/state.test.ts`

Hedefli testler loader denied/granted akışını, invalid intent guard'ının auth resolve etmeden 400 dönmesini, locale/translation forbidden patikalarında operation ve sorgu tarafına girilmediğini, locale/translation operation redirect davranışını ve yeni routing/helper klasörlerinin kontratını doğrular.

## Verification Commands

```bash
npx prettier --write app/domain/resources/contract.ts app/features/dashboard/resources app/shared/errors/contracts.ts tests/unit/domain/resources/contract.test.ts tests/unit/features/dashboard/resources/mutation-authorization.test.ts tests/integration/features/dashboard/resources.server.test.ts docs/features/Phase4_Maintenance_ResourcesSliceActionModularization.md docs/lessons.md
npx vitest run tests/unit/domain/resources/contract.test.ts tests/unit/features/dashboard/resources/href.test.ts tests/unit/features/dashboard/resources/state.test.ts tests/unit/features/dashboard/resources/mutation-authorization.test.ts tests/integration/features/dashboard/resources.server.test.ts tests/integration/routes/dashboard/resources-child-actions.test.ts
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run e2e
```

## Roadmap Reference

Bu çalışma roadmap dışı bakım/refactor görevidir; doğrudan bir checkbox güncellemesi yoktur.
