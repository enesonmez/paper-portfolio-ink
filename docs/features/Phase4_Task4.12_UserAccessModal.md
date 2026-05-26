# Phase 4 Task 4.12: User Access Modal

## 1. Summary

Bu task ile `dashboard/users` slice'inda kullanici profil duzenleme akisi ile authorization mutasyonlari ayrildi. Mevcut create/edit modal'i artik kimlik, avatar, bio, aktiflik ve parola alanlarini yonetiyor; role degisimi ile claim override yonetimi ise yeni bir access modal'ina tasindi.

Teknik akis:

- `/dashboard/users` tablosunda her satira yeni bir access aksiyonu eklendi.
- Access modal rol degisimi icin ayri bir form, claim grant/revoke icin claim bazli butonlar sunuyor.
- Role ve claim mutasyonlari ayni `usersUpdate` claim'i ile korunuyor, ancak artik kendi parser/operation zincirinde calisiyor.
- Access modal her istekte hedef kullanicinin guncel `authz_version` degerini hidden field ile gonderiyor.
- Server mutation oncesi DB'deki guncel `authz_version` ile gonderilen degeri karsilastiriyor; stale durumda write yapmadan localized conflict hatasi donuyor.
- Role ve claim degisimleri basarili oldugunda `users.authz_version` artiyor ve authz cache anahtariyla uyumlu sekilde yeni effective-claim snapshot'i devreye giriyor.

## 2. Files And Responsibilities

- `app/features/dashboard/users/state.ts`
  - Profile modal ve access modal state'lerini ayristirir, auth snapshot'tan claim liste view-model'i uretir.
- `app/features/dashboard/users/loader.server.ts`
  - Query-param modal state'ine gore profile edit kaydini veya authorization snapshot'ini yukler.
- `app/features/dashboard/users/actions.server.ts`
  - Profile CRUD intent'leri ile yeni access intent'lerini ayni route uzerinde authorize ve dispatch eder.
- `app/features/dashboard/users/components/dashboard-users-modal.tsx`
  - Profile modalini role alanini edit modundan cikarmis sekilde render eder.
- `app/features/dashboard/users/components/dashboard-users-authorization-modal.tsx`
  - Role update ve claim grant/revoke akislarini server-first modal UI olarak sunar.
- `app/features/dashboard/users/components/dashboard-users-table.tsx`
  - Yeni access aksiyonunu tabloya ekler.
- `app/features/dashboard/users/operations/update-authorization.server.ts`
  - `authz_version` stale-check, last-admin role guard, role update, claim override upsert ve audit log akislarini yonetir.
- `app/lib/users/user-authorization-form.server.ts`
  - Access modal form girdilerini Zod ile parse eder.
- `app/lib/users/users.server.ts`
  - Kullanici auth snapshot'i, version-guarded role update ve claim override write helper'larini saglar.
- `app/shared/i18n/messages.shared.ts`
  - Access modal ve stale-version copy/validation seed'lerini ekler.
- `db/migrations/0027_dashboard_users_access_modal.sql`
  - Yeni users access modal translation key'lerini DB seed olarak upsert eder.
- `docs/roadmap.md`
  - Phase 4 Task 4.12 checkbox'ini tamamlandi olarak gunceller.
- `docs/lessons.md`
  - Profile ve authorization mutasyonlarini ayirma kararini kalici lesson olarak kaydeder.

## 3. Tests And Results

Calistirilan dogrulamalar:

- `npm run format:check`
- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run e2e`

Sonuc:

- Tum komutlar basarili.
- Hedefli yeni kapsam, users loader'inin access modal snapshot'ini donmesini ve stale `authz_version` durumunda role mutation'in write yapmadan `409` conflict vermesini sabitliyor.

## 4. Verification Commands

```bash
npm run format:check
npm run typecheck
npm test
npm run lint
npm run e2e
```

## 5. Roadmap Reference

- Phase 4 / Task 4.12: `/user` sekmesinde claim tanimlama veya cikarma butonu koy. Tiklayinca modal uzerinden aksiyon aldirt. Role guncellemeyide bu modal icine al, user guncellemeden cikar. authz_version'u bu modal uzerinden kontrol et.
