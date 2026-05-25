# Phase 4 Task 4.6: Tabbed Settings Page

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu calisma ile admin dashboard altinda `/dashboard/settings` rotasi eklendi ve roadmap'teki "Tabbed Settings Page" gorevi mock olarak tamamlandi. Yuzey, gercek veri mutasyonu olmadan ama sonraki `/account` ve cache gorevlerine zemin hazirlayacak sekilde server-first bir tab yapisi uzerinden kurgulandi.

Teknik akis su sekilde kuruldu:

- Dashboard sidebar'daki daha once statik duran `Settings` girdisi, `settings.manage` claim'i ile korunan gercek bir route'a donusturuldu.
- Route, mevcut proje standardina uygun olarak `route -> loader -> state -> screen -> copy` dikey slice yapisinda kuruldu.
- Tab secimi client state yerine `?tab=account|appearance|security|runtime` query string'i ile cozuldu; boylece sayfa tamamen loader-first ve SSR uyumlu kaldi.
- Non-admin veya `settings.manage` claim'i olmayan kullanicilar icin merkezi authz hata modeliyle denied payload donuluyor.
- Ekran, bilerek read-only tutuldu. Ancak `Account` tab'inda proje ismi, domain, email ve sosyal baglanti satirlari mock olarak listelenerek bir sonraki configuration-parameter gorevi icin UI iskeleti sabitlendi.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `app/features/dashboard/settings/state.ts`
  - Settings tab sabitleri, loader data tipleri ve query-string helper'lari.
- `app/features/dashboard/settings/loader.server.ts`
  - `settings.manage` claim guard'i ve secili tab cozumleme mantigi.
- `app/features/dashboard/settings/server.ts`
  - Loader export yuzeyi.
- `app/features/dashboard/settings/copy.ts`
  - Tab, metric ve mock panel iceriklerinin i18n uyumlu kopya uretimi.
- `app/features/dashboard/settings/screen.tsx`
  - Tabbed settings page mock tasarimi ve denied screen presentational katmani.
- `app/features/dashboard/settings/route.tsx`
  - Loader verisini dashboard outlet context ile birlestiren ince route modulu.
- `app/routes/dashboard/settings.tsx`
  - Route-level error handling ve settings loader baglantisi.
- `tests/integration/features/dashboard/settings.server.test.ts`
  - Loader authz ve tab cozumleme davranislari.
- `tests/integration/routes/dashboard/settings.test.tsx`
  - Mock settings yuzeyinin ve denied state'in render dogrulamasi.
- `db/migrations/0021_tabbed_settings_page_copy.sql`
  - Yeni settings i18n anahtarlarini DB translation seed'ine backfill eder.
- `docs/features/Phase4_Task4.6_TabbedSettingsPage.md`
  - Bu feature dokumani.

### Guncellenen Dosyalar

- `app/routes.ts`
  - `/dashboard/settings` route'u eklendi.
- `app/features/dashboard/layout/navigation.ts`
  - `Settings` girdisi statik placeholder yerine claim-gated link olarak guncellendi.
- `app/shared/errors/contracts.ts`
  - Yeni route id ve `settings.read.forbidden` hata kodu eklendi.
- `app/shared/i18n/messages.shared.ts`
  - Settings mock sayfasi icin TR/EN kopyalari eklendi.
- `tests/unit/features/dashboard/layout/navigation.test.ts`
  - Navigation beklentileri yeni settings linki icin guncellendi.
- `tests/e2e/dashboard.spec.ts`
  - Admin dashboard akisi settings ekraniyla dogrulanacak sekilde genisletildi.
- `docs/roadmap.md`
  - Phase 4 Task 4.6 tamamlandi olarak isaretlendi.
- `docs/lessons.md`
  - Read-only settings shell dersi eklendi.

## 3. Uygulanan Testler ve Sonuclari

- `npm run format`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`
- `npm run e2e`

Bu komutlar feature tamamlandiktan sonra calistirildi.

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npm run dev
```

Tarayicida dogrulama akisi:

- `/login` ile admin oturumu ac
- `/dashboard/settings` sayfasina git
- `Account`, `Appearance`, `Security` ve `Runtime` tab'leri arasinda gecis yap
- URL'de `tab` query param'inin degistigini ve sayfanin tam reload gerektirmeden SSR uyumlu sekilde ayni route kontratinda kaldigini dogrula
- Admin olmayan bir kullanici ile route'a girildiginde denied screen goruldugunu dogrula

## 5. Roadmap Referansi

- `Phase 4 / Task 4.6`: `/settings` menusu icin "Tabbed Settings Page" tasarimi yap. Mock sekilde.
