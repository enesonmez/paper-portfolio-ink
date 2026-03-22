# Phase 2 Task 2.5 Authorization Copy Consistency

## Ozet

Hybrid authorization yapisi kurulduktan sonra dashboard genelindeki `403` response mesaji, denied screen basligi/aciklamasi ve action-blocked modal basligi ortak bir authz diline tasindi. Varsayilan mesajlar `shared/authz` altinda merkezi hale getirildi; feature'lar isterse kendi translation key'lerini vererek bu metinleri override edebiliyor.

## Dosya Sorumluluklari

- `app/shared/authz/copy.ts`: Shared authorization copy anahtarlari ve override destekli builder.
- `app/shared/authz/components/dashboard-authorization-access-denied-screen.tsx`: Dashboard denied screen markup'inin ortak component'i.
- `app/features/dashboard/*/copy.ts`: Feature copy builder'larini shared authz default'larina baglar.
- `app/features/dashboard/*/screen.tsx`: Denied screen render'larini ortak componente tasir.
- `app/shared/i18n/messages.shared.ts`: Yeni `dashboard.authz.*` seed mesajlarini tanimlar.
- `db/migrations/0014_shared_authz_copy.sql`: DB-backed translations icin ortak authz copy anahtarlarini upsert eder.
- `tests/unit/shared/authz/copy.test.ts`: Varsayilan ve feature-override davranisini dogrular.
- `tests/integration/*` ve `tests/e2e/authorization.spec.ts`: Yeni ortak dili ve 403 response beklentilerini kilitler.

## Testler

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run db:migrate:local`
- `npm run e2e`

## Dogrulama Komutlari

```bash
npm test tests/unit/shared/authz/copy.test.ts
npm run db:migrate:local
npm run e2e
```

## Roadmap Baglanti

- `docs/roadmap.md` Phase 2: `Db üzerinden role - claim based hybrid bir authorization yapısının kurulması.`
