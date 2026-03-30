# Maintenance: Brand Seed Paper Rename

## Summary

- `Enes` brand stringleri i18n seed mesaji, SQL translation seed'i ve site metadata kaynaklari arasinda hizalandi.
- Public blog detail route icindeki hardcoded marka ismi `siteConfig` uzerinden okunacak sekilde sadelelestirildi.
- Seed script'lerdeki varsayilan admin display name'i `Paper Test Admin` olarak guncellendi.

## Changed Files

- `app/shared/i18n/messages.shared.ts`: TR/EN mesaj seed brand stringleri `Paper` ile hizalandi.
- `db/migrations/0006_pink_masque.sql`: translation seed kayitlari yeni brand degerleriyle guncellendi.
- `app/lib/site.ts`: merkezi site config ismi `Paper Ink` oldu.
- `app/routes/public/blog/$slug.tsx`: blog detail meta title markayi `siteConfig` uzerinden kuruyor.
- `scripts/seed-e2e.mjs`
- `scripts/seed-test-user.mjs`
- Etkilenen route/unit/e2e test assertion'lari

## Verification

- `npm run format:check`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run e2e`

## Roadmap

- Roadmap disi bakim ve isimlendirme hizalama calismasi.
