# Phase 4 Task 4.11: Resources CRUD

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu calisma ile admin dashboard altinda `/dashboard/resources` rotasi eklendi ve mevcut neo-brutalist dashboard kalibina sadik, tabbed settings page yapisinda bir `Resources` modulu kuruldu. Sayfa iki tab uzerinden ilerler:

- `Locales`: `locales` tablosu icin listeleme, create, update ve delete.
- `Translations`: secilen locale icin `translations` tablosu listeleme, create, update ve delete.
- `Translations` tabina, cekilen locale kayitlari uzerinden `key` ve `value` bazli query-string search eklendi. Boylece buyuk message kataloglarinda ilgili anahtari veya metin parcasini bulmak kolaylasti.

Teknik akis su sekilde kuruldu:

- Route mevcut dashboard dikey slice desenine uygun sekilde `route -> server -> shared -> screen -> components -> lib` yapisina ayrildi.
- Loader admin session guard ile korunur; non-admin istekler restricted screen ile bloke edilir.
- Page query-string tabanli modal ve tab state kullanir. `?tab=locales|translations`, `?modal=*`, `?translationLocale=*` ve edit parametreleri ile modal state server-first cozulur.
- Translation search de ayni URL kontratina dahil edildi. `?translationSearch=*` parametresi ile server, secili locale listesi yuklendikten sonra in-memory filtre uygular; bu yaklasim DB query karmasasini ve cache anahtari patlamasini gereksiz yere artirmadi.
- Locale ve translation formlari Zod ile parse edilir; `locale code`, `key`, `value`, `sortOrder`, `default/active` alanlari typed validation ile normalize edilir.
- Locale mutation'larinda son aktif/default locale'in silinmesi veya pasiflestirilmesi action katmaninda engellendi; gerekli durumlarda baska bir aktif locale deterministic olarak default'a promote edilir.
- I18n cache invalidation katmani genislendi. Resources mutation'lari sonrasinda `supported locales` cache'i ve etkilenen locale payload cache anahtarlari birlikte temizlenir.
- Dashboard sidebar'a admin-only `Resources` linki eklendi.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `app/features/resources/resource.shared.ts`
  - Resources query param, modal, form field ve mutation intent sabitleri.
- `app/features/resources/resource-form.shared.ts`
  - Locale ve translation form degerleri/state tipleri.
- `app/lib/resources/resources-form.server.ts`
  - Locale ve translation form parse/validation mantigi.
- `app/lib/resources/resources.server.ts`
  - `locales` ve `translations` tablolarina ait listeleme ve mutation sorgulari.
- `app/features/dashboard/resources/dashboard-resources.shared.ts`
  - Tab/modal state cozumleme, href helper'lari, form merge ve metrik hesaplama.
- `app/features/dashboard/resources/dashboard-resources.constants.ts`
  - Screen ve form copy haritalari.
- `app/features/dashboard/resources/dashboard-resources.server.ts`
  - Loader/action orkestrasyonu, admin gate, locale invariants ve cache invalidation.
- `app/features/dashboard/resources/dashboard-resources-route.tsx`
  - Loader/action verisini ekrana baglayan ince route modulu.
- `app/features/dashboard/resources/dashboard-resources-screen.tsx`
  - Tabbed settings shell, metrics, filtre yuzeyi ve modal entegrasyonu.
- `app/features/dashboard/resources/components/dashboard-resources-locales-table.tsx`
  - Locale registry tablosu ve row action'lari.
- `app/features/dashboard/resources/components/dashboard-resources-translations-table.tsx`
  - Translation registry tablosu ve row action'lari.
- `app/features/dashboard/resources/components/dashboard-resources-locale-modal.tsx`
  - Locale create/update modal formu.
- `app/features/dashboard/resources/components/dashboard-resources-translation-modal.tsx`
  - Translation create/update modal formu.
- `app/routes/dashboard.resources.tsx`
  - Flat route tanimi.
- `docs/features/Phase4_Task4.11_ResourcesCrud.md`
  - Bu feature dokumani.
- `db/migrations/0010_sparkling_nova.sql`
  - `messages.shared.ts` icine eklenen resources ve resource validation anahtarlarini mevcut DB'lere backfill eder.
- `tests/unit/dashboard-resources.server.test.ts`
  - Loader/action ve cache invalidation davranislari.
- `tests/unit/dashboard-resources-route.test.tsx`
  - Tabbed settings page render davranislari.

### Guncellenen Dosyalar

- `app/routes.ts`
  - `dashboard/resources` route'u eklendi.
- `app/features/dashboard/layout/dashboard-layout.constants.ts`
  - Sidebar'a admin-only `Resources` linki eklendi.
- `app/features/i18n/i18n.server.ts`
  - I18n cache purge helper'lari eklendi.
- `app/features/i18n/messages.shared.ts`
  - Resources UI ve validation anahtarlari eklendi.
- `tests/unit/dashboard-layout.test.tsx`
  - Sidebar'daki yeni `Resources` linki dogrulandi.
- `tests/unit/dashboard-posts-route.test.tsx`
  - Import/runtime maliyetine uygun timeout guncellendi.
- `tests/unit/dashboard-skills-route.test.tsx`
  - Import/runtime maliyetine uygun timeout guncellendi.
- `tests/unit/dashboard-users-route.test.tsx`
  - Import/runtime maliyetine uygun timeout guncellendi.
- `tests/unit/db-schema.test.ts`
  - `locales` ve `translations` tablo beklentileri eklendi.
- `docs/roadmap.md`
  - Phase 4 Task 4.11 tamamlandi olarak isaretlendi.
- `docs/lessons.md`
  - Resources CRUD ve i18n cache invalidation dersi eklendi.
- `db/migrations/meta/_journal.json`, `db/migrations/meta/0010_snapshot.json`
  - Yeni backfill migration kaydi migration zincirine eklendi.

## 3. Uygulanan Testler ve Sonuclari

- `npm run format`
  - Basarili.
- `npm run typecheck`
  - Basarili.
- `npm run lint`
  - Basarili.
- `npm run format:check`
  - Basarili.
- `npm test`
  - Basarili. `54` test dosyasi ve `163` test gecti.

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npm run dev
```

Kalite kapilarini tekrar calistirmak icin:

```bash
npm run format
npm run typecheck
npm run lint
npm run format:check
npm test
```

Tarayicida dogrulama akisi:

- `/login` uzerinden admin oturumu ac
- `/dashboard/resources` sayfasina git
- `Locales` tabindan yeni locale ekle, mevcut locale'i duzenle veya silmeyi dene
- Son aktif/default locale'i silme veya pasiflestirme denemesinin bloklandigini dogrula
- `Translations` tabinda locale filtresi degistir, yeni mesaj ekle ve mevcut mesaji duzenle
- Mutation sonrasinda sayfanin yeniden yuklenip guncel state'i gosterdigini dogrula

## 5. Roadmap Referansi

- `Phase 4 / Task 4.11`: Locale ve translations tablolarini yonetebilecegim CRUD islemlerinin yapilmasi. Cache odakli gelistirilecek. Menu `/resources` olsun. Icerisinde 'Tabbed Settings Page' tasarimi olsun. Tablarda locale ve translations olsun.
