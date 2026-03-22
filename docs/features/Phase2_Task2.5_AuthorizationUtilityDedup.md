# Phase 2 Task 2.5 Authorization Utility Dedup

## Ozet

Authorization ve dashboard mutation akislari refactor edildikten sonra kalan kucuk utility tekrarlar da temizlendi. Ortak `FormData` string okuma ve compact field-error helper'lari `shared/forms` altina, intent-to-claim eslemeleri ise `shared/authz/action-claims.ts` altina tasindi.

## Dosya Sorumluluklari

- `app/shared/forms/form-data.server.ts`: `readStringField` ve `compactFieldErrors` helper'lari.
- `app/shared/authz/action-claims.ts`: dashboard mutation intent'lerini yetki claim'lerine esleyen ortak tablolar ve resolver.
- `app/features/dashboard/*/server.ts`: local string-field reader ve claim resolver tekrarlarini shared helper'larla degistirir.
- `app/lib/*/*-form.server.ts`: parser seviyesindeki ortak field reader / error compaction tekrarlarini kaldirir.
- `tests/unit/shared/authz/action-claims.test.ts`: mutation-claim resolver davranisini kilitler.
- `tests/unit/shared/forms/form-data.server.test.ts`: shared form-data helper davranisini kilitler.

## Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run db:migrate:local`
- `npm run e2e`

## Roadmap Baglanti

- `docs/roadmap.md` Phase 2: `Db üzerinden role - claim based hybrid bir authorization yapısının kurulması.`
