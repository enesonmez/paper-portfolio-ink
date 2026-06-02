# Phase 4 Task 4.15 Runtime Settings

## Ozet

`/dashboard/settings?tab=runtime` tabi mock durumdan cikarilarak gercek operasyon yuzeyine donusturuldu. Runtime tabi artik projede aktif olarak kullanilan cache registry'lerini tek tek listeliyor, her registry icin purge + warm yapan ayri bir refresh aksiyonu sunuyor ve browser kaynakli runtime telemetry sinyallerini 5 saniyede bir yeniliyor.

Calisma sirasinda cache invalidation mantigi route modullerinden ayrilarak ayri bir runtime registry katmanina tasindi. Bu sayede `configuration`, `i18n`, `public home`, `public projects`, `public blog` ve `authz` cache'leri tek bir merkezden yonetiliyor. `authz` tarafinda klasik delete yerine mevcut revision tabanli invalidation modeli korunarak revision bump + current actor warm yaklasimi uygulandi.

Zero-Dead-Code kapsaminda settings mutation intent sabitleri `configuration` domain'inden cikartildi ve settings feature icine tasindi. Boylece `configuration` domain'i yalnizca kendi form alanlarini tasiyan daha temiz bir kontrata indirildi.

## Degisen Dosyalar

- `app/features/dashboard/settings/contracts.ts` [NEW]
  - Settings feature icin account, security ve runtime intent sozlesmesini merkezilesitirir.
- `app/features/dashboard/settings/runtime/state.ts` [NEW]
  - Runtime cache registry id ve loader payload tiplerini tanimlar.
- `app/features/dashboard/settings/operations/runtime-cache.server.ts` [NEW]
  - Cache registry listesi ile purge + warm operasyonlarini tek noktadan yonetir.
- `app/features/dashboard/settings/operations/refresh-runtime-cache.server.ts` [NEW]
  - Runtime refresh action akisini, validation, audit log ve redirect ile tamamlar.
- `app/features/dashboard/settings/components/runtime-cards.tsx` [NEW]
  - Runtime cache kartlarini ve her registry icin ayri refresh butonunu render eder.
- `app/features/dashboard/settings/components/runtime-metrics.tsx` [NEW]
  - Browser telemetry metriklerini 5 saniyede bir yenileyen leaf client component.
- `app/features/dashboard/settings/loader.server.ts`
  - Runtime tab secildiginde cache registry payload'ini loader data icine ekler.
- `app/features/dashboard/settings/actions.server.ts`
  - Runtime refresh intent'ini authz ve action dispatch zincirine ekler.
- `app/features/dashboard/settings/screen.tsx`
  - Runtime tabi icin statik mock kartlar yerine cache controls + telemetry layout'u cizer.
- `app/features/dashboard/settings/copy.ts`
  - Runtime cache registry, telemetry ve refresh durum metinlerini ekler.
- `app/features/dashboard/settings/components/configuration-modal.tsx`
  - Feature-local settings mutation intent modeline gecirildi.
- `app/features/dashboard/settings/components/security-cards.tsx`
  - Feature-local settings mutation intent modeline gecirildi.
- `app/domain/configuration/model.ts`
  - Settings'e ait mutation intent sabitleri kaldirildi; domain yalnizca configuration alan kontratini tasir.
- `app/lib/configuration/configuration.server.ts`
  - Configuration cache key builder export edildi.
- `app/shared/i18n/i18n.server.ts`
  - I18n cache key builder'lari export edildi ve tum locale bundle'larini warm eden helper eklendi.
- `app/shared/authz/resolver.server.ts`
  - Authz revision okuma, revision bump ve current actor warm helper'lari eklendi.
- `app/shared/cache/data-cache.server.ts`
  - Kullanilan cache backend stratejisini raporlayan helper eklendi.
- `app/shared/cache/contracts.ts`
  - Cache strategy tipi eklendi.
- `app/shared/i18n/messages.shared.ts`
  - Runtime tabi icin yeni localization seed degerleri ve guncel runtime aciklamalari eklendi.
- `db/migrations/0037_runtime_settings_controls.sql` [NEW]
  - Runtime tabi icin yeni translation key'lerini ve guncel runtime metinlerini D1'e yazar.
- `db/migrations/meta/_journal.json`
  - Yeni runtime localization migration kaydi eklendi.
- `tests/integration/features/dashboard/settings.server.test.ts`
  - Runtime loader payload'i ve runtime refresh action redirect'i dogrulandi.
- `tests/integration/routes/dashboard/settings.test.tsx`
  - Runtime tabinin yeni cache control ve telemetry gorunumu dogrulandi.
- `tests/e2e/dashboard.spec.ts`
  - Admin runtime tabi cache control ve refresh postback akisi eklendi.
- `docs/roadmap.md`
  - Phase 4 Task 4.15 checkbox'i tamamlandi olarak guncellendi.
- `docs/lessons.md`
  - Runtime cache registry dersi eklendi.

## Testler

- `npm test -- --run tests/integration/features/dashboard/settings.server.test.ts tests/integration/routes/dashboard/settings.test.tsx`
  - 2 test dosyasi, 14 test basarili.
- Tam proje dogrulama zinciri:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run format:check`
  - `npm run e2e:prepare`
  - `npm run e2e`

## Dogrulama

1. `/tr/dashboard/settings?tab=runtime` sayfasina admin olarak gidin.
2. `Configuration cache`, `I18n cache bundle`, `Public home cache`, `Public projects cache`, `Public blog cache` ve `Authz claim cache` kartlarinin gorundugunu dogrulayin.
3. Her kartta ayri bir `Cache Yenile` butonu bulundugunu dogrulayin.
4. Bir refresh butonuna basin ve sayfanin yine `?tab=runtime` ile ayni rota uzerinde kaldigini dogrulayin.
5. `Runtime telemetry` panelinde CPU, JS heap ve storage bilgilerinin ilk render sonrasi doldugunu ve yaklasik 5 saniyede bir guncellendigini dogrulayin.
6. Authz refresh aksiyonu sonrasinda runtime tabinin yeniden yuklendigini ve hata olusmadigini dogrulayin.

## Roadmap Referansi

- `Phase 4 / Task 4.15`: `/settings` sayfasinda `/runtime` tabi ekle. Projedeki cache'lenen tum yapilar yer alsin ve her yapi icin bir buton ile cache temizleyip tekrar cache alma yapisi kurulsun. Her yapi icin ayri buton olsun. Ayni zamanda burada sistemin ram, storage, cpu kullanim gosterimi de olsun. Belirli araliklarla guncellencek sekilde ornegin 5 sn.
