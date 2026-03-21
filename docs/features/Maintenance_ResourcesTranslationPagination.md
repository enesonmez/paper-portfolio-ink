# Maintenance: Resources Translation Pagination

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu bakim calismasinda `/dashboard/resources` altindaki `Translations` tab'i server-first pagination yapisina tasindi. Amaç, secili locale icin tum translation kayitlarini tek seferde cekmek yerine sayfa basi `20` kayit gostermek ve search mekanizmasini da ayni akisin icine almakti.

Teknik olarak:

- `translationSearch` artik bellek icinde sonradan filtrelenmiyor; DB sorgusuna tasinarak `key` ve `value` alanlarinda arama yapiyor.
- Yeni URL kontrati `translationLocale + translationSearch + translationPage` uzerinden ilerliyor.
- Search formu ve locale degisimi sayfayi otomatik olarak `1`'e donduruyor.
- Pagination linkleri mevcut search query ve secili locale durumunu koruyor.
- Metric karti ve tab badge, filtrelenmis sonucu degil secili locale'in gercek toplam translation sayisini gostermeye devam ediyor.
- Translation modal close/cancel ve edit linkleri aktif sayfa bilgisini koruyor.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `db/migrations/0011_steady_quasar.sql`
  - Pagination UI icin eklenen yeni i18n anahtarlarini mevcut DB'lere backfill eder.
- `docs/features/Maintenance_ResourcesTranslationPagination.md`
  - Bu bakim dokumani.

### Guncellenen Dosyalar

- `app/features/resources/resource.shared.ts`
  - `translationPage` query param sabiti eklendi.
- `app/features/dashboard/resources/dashboard-resources.shared.ts`
  - Pagination state tipleri, page normalization ve href helper'i genisletildi.
- `app/features/dashboard/resources/dashboard-resources.server.ts`
  - Loader, DB tabanli arama ve `20` kayitlik translation pagination akisini orkestre eder hale getirildi.
- `app/features/dashboard/resources/dashboard-resources-screen.tsx`
  - Search, locale filter ve pagination state'leri tab ekranina baglandi.
- `app/features/dashboard/resources/components/dashboard-resources-translations-table.tsx`
  - Translation tablosuna page navigation ve result araligi yuzeyi eklendi.
- `app/features/dashboard/resources/components/dashboard-resources-translation-modal.tsx`
  - Modal close/cancel akisinda aktif sayfa korundu.
- `app/features/dashboard/resources/dashboard-resources.constants.ts`
  - Pagination button copy'leri eklendi.
- `app/lib/resources/resources.server.ts`
  - Translation listeleme sorgusu DB-seviyesi search + count + pagination destekler hale getirildi.
- `app/features/i18n/messages.shared.ts`
  - Pagination UI copy anahtarlari eklendi.
- `db/migrations/meta/_journal.json`, `db/migrations/meta/0011_snapshot.json`
  - Yeni data migration zincire eklendi.
- `tests/unit/dashboard-resources.server.test.ts`
  - Paginated loader ve search davranislari icin testler guncellendi/genisletildi.
- `tests/unit/dashboard-resources-route.test.tsx`
  - Translation tab pagination kontrolleri route render testine eklendi.
- `docs/lessons.md`
  - Buyuk registry listelerinde DB-seviyesi search + pagination deseni kayda gecirildi.

## 3. Uygulanan Testler ve Sonuclari

- `npm run format`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`

Tum kalite kapilari basarili.

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npm run dev
```

Translation tab'i tarayicida su akislarla dogrula:

- Farkli locale sec ve tablonun sayfa basi `20` kayit gosterdigini kontrol et.
- Search ile `key` veya `value` bazli arama yap ve sonuc pagination'inin search query ile birlikte calistigini dogrula.
- `?translationPage=*` ile manuel sayfa gecisi yap ve page linklerinin search state'ini korudugunu kontrol et.

Kalite kapilari icin:

```bash
npm run format
npm run typecheck
npm run lint
npm run format:check
npm test
```

## 5. Roadmap Task Referansi

- Bu degisiklik roadmap disi bir bakim/olceklenebilirlik iyilestirmesidir.
