# Maintenance - Shared I18n Refactor

## 1. Ozet ve Teknik Calisma Mantigi

`i18n` yapisi proje genelinde root loader, locale route'lari, DB-backed locale registry, cache invalidation, React provider/hook'lari ve locale switcher UI davranisini birlikte yonetiyordu. Bu nedenle `app/features/i18n` altinda durmasi, onu bir domain feature gibi gosterse de gercekte app-wide cross-cutting bir policy modulu olmasiyla uyusmuyordu.

Cozum olarak `i18n` modulleri `app/shared/i18n` altina tasindi ve tum import zinciri yeni konuma gore guncellendi. Boylece feature slice'lar kendi domain kontratlarini korurken, uygulamanin yatay kesen localization katmani daha dogru bir yerde toplandi.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `app/shared/i18n/i18n.shared.ts`
  Locale cozumleme, cookie, localized path ve seed/fallback helper'larini tasir.
- `app/shared/i18n/i18n.server.ts`
  DB-backed locale/translation yukleme, request-scope runtime state ve cache invalidation akisini tasir.
- `app/shared/i18n/i18n-react.tsx`
  AppI18n provider ve hook'larini tasir.
- `app/shared/i18n/messages.shared.ts`
  Seed locale ve translation katalogunu tasir.
- `app/shared/i18n/components/locale-switcher.tsx`
  Locale degistirme UI davranisini tasir.
- `app/root.tsx` ve ilgili route/feature dosyalari
  Yeni `~/shared/i18n/*` import yoluna gecirildi.
- `docs/lessons.md`
  Cross-cutting modullerin konumlandirilmasi ile ilgili yeni ders eklendi.

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
