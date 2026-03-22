# Maintenance - Shared Auth Refactor

## 1. Ozet ve Teknik Calisma Mantigi

`app/lib/auth` altindaki auth modulleri birden fazla feature tarafindan kullaniliyordu ve Better Auth runtime kurulumu, auth config, session cozumleme, login redirect policy ve session user helper'lari gibi uygulama geneli davranislar tasiyordu. Bu nedenle `lib` altinda durmalari, bunlari generic helper gibi gosterse de gercekte app-wide policy modulleri olmalarina uymuyordu.

Refactor sirasinda once `LoginFormState` ve `LoginFormValues` kontrati `app/shared/auth/login.shared.ts` altina cikarildi. Boylece auth login orchestration kodunun feature-local UI state dosyasina olan bagimliligi kaldirildi. Ardindan tum auth modulleri `app/shared/auth` altina tasindi ve auth kullanan feature importlari yeni konuma gore guncellendi.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `app/shared/auth/auth-config.ts`
  Auth runtime config tipini tasir.
- `app/shared/auth/auth-config.server.ts`
  Better Auth icin environment ve request bazli config cozumunu tasir.
- `app/shared/auth/auth.server.ts`
  Better Auth + Drizzle adapter kurulumunu ve session okuma helper'ini tasir.
- `app/shared/auth/session.server.ts`
  Request bazli session okuma ve require-session guard akisini tasir.
- `app/shared/auth/session-user.ts`
  Session user role/id/active helper'larini tasir.
- `app/shared/auth/login.shared.ts`
  Login form state kontratini auth katmaninin kullanacagi sekilde tasir.
- `app/shared/auth/login.server.ts`
  Login redirect, form parse ve sign-in orchestration akisini tasir.
- `app/features/auth/login/login.shared.ts`
  Feature-local login loader ve form state merge helper'larini korurken auth kontratini `shared/auth` uzerinden kullanir.
- `docs/lessons.md`
  Cross-cutting auth modullerinin konumlandirilmasi ile ilgili yeni ders eklendi.

## 3. Uygulanan Testler ve Sonuclari

- `npm test`
  Basarili.
- `npm run typecheck`
  Basarili.
- `npm run lint`
  Basarili.
- `npm run format:check`
  Basarili.

## 4. Dogrulama / Calistirma Komutlari

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

## 5. Roadmap Referansi

- Roadmap disi mimari bakim refactor'u. `docs/roadmap.md` icinde dogrudan bir task referansi yok.
