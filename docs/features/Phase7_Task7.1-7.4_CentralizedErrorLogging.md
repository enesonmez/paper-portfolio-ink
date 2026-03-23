# Phase 7 Task 7.1-7.4: Centralized Error And Logging

## 1. Yapilan Islemin Ozeti ve Teknik Calisma Mantigi

Bu calisma ile uygulama geneline typed error tabanli merkezi hata yonetim sistemi eklendi, beklenen CRUD aksiyonlari `log_history` tablosuna audit kaydi olarak alinmaya baslandi, beklenmeyen veya sistem seviyesindeki hatalar `log_error_history` tablosuna kaydedildi ve dashboard altina admin-only `Logging` ekrani acildi.

Mimari akisin cekirdegi su sekilde kuruldu:

- Domain ve server helper katmanlari `ValidationError`, `AuthorizationError`, `BusinessError`, `ConflictError`, `NotFoundError`, `ExternalServiceError` ve `InternalServerError` gibi typed hata nesneleri firlatir.
- Bu hata nesneleri `status`, `severity`, `category`, `logSink`, `audit metadata`, `responseData` ve `requestId` gibi alanlari tasir.
- Route seviyesinde ortak wrapper katmani hatayi normalize eder, uygun tabloya raporlar, `requestId` header'ini ekler ve gerekiyorsa kullaniciya guvenli fallback dondurur.
- Beklenen form hatalari parser veya mutation katmaninda `ValidationError` / `BusinessError` olarak uretilir; route wrapper bu hatalari `responseData` icinden yeniden form state'e serilestirir. Boylece form UX'i korunurken validation ve logging daginmaz.
- `log_history` create/update/delete ve benzeri beklenen aksiyonlar icin actor, resource, result, status code ve request baglamini saklar.
- `log_error_history` ise kod, severity, request id, path, stack ve metadata gibi hata odakli alanlari saklar.
- Dashboard `Logging` ekrani iki gorunum sunar: `history` ve `errors`. Error tab'inda belirli tarih araligi icin txt export ve toplu silme aksiyonlari sadece admin claim'leri ile korunur.

## 2. Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni Dosyalar

- `app/shared/errors/app-error.server.ts`
  - Uygulama geneli typed error hiyerarsisi, normalize islemi ve raporlama isaretleme yardimcilari.
- `app/shared/errors/builders.server.ts`
  - Validation, authorization, business ve conflict hata builder'lari.
- `app/shared/errors/request-id.server.ts`
  - Request id uretimi ve response header yardimcilari.
- `app/shared/errors/report.server.ts`
  - AppError nesnelerini `log_history` ve `log_error_history` sink'lerine raporlayan merkez.
- `app/shared/errors/route-error-handling.server.ts`
  - Loader/action wrapper'lari; hata serilestirme, request id ekleme ve fallback davranisi.
- `app/shared/errors/submission.server.ts`
  - Parser sonucunu yeni typed error modeline baglayan submission resolver.
- `app/shared/logging/audit.server.ts`
  - Basarili CRUD ve policy aksiyonlarini `log_history` tablosuna kaydetme yardimcisi.
- `app/lib/logging/logs.server.ts`
  - `log_history` ve `log_error_history` icin insert/list/delete/count sorgulari.
- `app/features/dashboard/logging/copy.ts`
  - Logging ekrani copy ve tablo etiketleri.
- `app/features/dashboard/logging/server.ts`
  - Logging dashboard loader/action orkestrasyonu, tarih araligi validasyonu, export ve delete aksiyonlari.
- `app/features/dashboard/logging/screen.tsx`
  - Logging tabli dashboard ekrani, metrikler, tablolar ve aralik formu.
- `app/routes/dashboard/logging.tsx`
  - Logging route delegasyonu.
- `db/migrations/0015_milky_la_nuit.sql`
  - Log tablolari, yeni auth claim'leri ve ilgili i18n seed verileri.
- `tests/unit/shared/errors/app-error.server.test.ts`
  - Typed error normalize ve metadata davranislari.
- `tests/unit/shared/errors/route-error-handling.server.test.ts`
  - Route wrapper serilestirme ve fallback davranislari.
- `docs/features/Phase7_Task7.1-7.4_CentralizedErrorLogging.md`
  - Bu feature dokumani.

### Guncellenen Dosyalar

- `db/schema.ts`
  - `logHistory` ve `logErrorHistory` tablolari ile ilgili tipler eklendi.
- `app/entry.server.tsx`
  - Global `handleError` merkezi raporlama akisi ile baglandi.
- `app/root.tsx`
  - Root loader ortak hata wrapper'ina alindi ve root `ErrorBoundary` request id gosterecek sekilde genislendi.
- `app/shared/auth/login.server.ts`
  - Login validasyon ve kimlik dogrulama hatalari typed error modeline tasindi.
- `app/lib/posts/project/users/skills/resources/*-form.server.ts`
  - Form parser'lari validation durumunda typed error uretir hale getirildi.
- `app/features/dashboard/projects/server.ts`
- `app/features/dashboard/posts/server.ts`
- `app/features/dashboard/users/server.ts`
- `app/features/dashboard/skills/server.ts`
- `app/features/dashboard/resources/server.ts`
- `app/features/dashboard/resources/loader.server.ts`
- `app/features/dashboard/resources/mutations.server.ts`
- `app/features/dashboard/resources/locales/mutations.server.ts`
- `app/features/dashboard/resources/translations/mutations.server.ts`
  - Beklenen is kurali ve yetki hatalari typed error + `responseData` modeline tasindi; basarili mutation'lara audit log kaydi eklendi.
- `app/routes/public/*`, `app/routes/auth/*`, `app/routes/dashboard/*`, `app/routes/locale/action.tsx`
  - Loader/action export'lari ortak merkezi hata wrapper'lari ile hizalandi.
- `app/features/dashboard/layout/navigation.ts`
- `app/shared/authz/model.ts`
  - Logging sidebar link'i ve `logs.read/export/delete` claim'leri eklendi.
- `app/shared/i18n/messages.shared.ts`
  - Logging ve authz copy anahtarlari eklendi.
- `tests/integration/shared/auth/login.server.test.ts`
- `tests/integration/features/dashboard/posts.server.test.ts`
- `tests/integration/features/dashboard/projects.server.test.ts`
- `tests/integration/features/dashboard/users.server.test.ts`
- `tests/integration/features/dashboard/skills.server.test.ts`
- `tests/integration/features/dashboard/resources.server.test.ts`
- `tests/unit/domain/posts/form.test.ts`
- `tests/unit/domain/projects/form.test.ts`
- `tests/unit/domain/skills/form.test.ts`
  - Eski inline response beklentileri yerine typed error kontrati ve yeni parser davranislari dogrulandi.
- `docs/roadmap.md`
  - Phase 7 gorevleri tamamlandi olarak isaretlendi.
- `docs/lessons.md`
  - Merkezi hata yonetimi ve log sink politikalariyla ilgili dersler eklendi.

## 3. Uygulanan Testler ve Sonuclari

- `npx vitest run tests/unit/shared/errors/app-error.server.test.ts tests/unit/shared/errors/route-error-handling.server.test.ts`
  - Basarili.
- `npx vitest run tests/unit/domain/posts/form.test.ts tests/unit/domain/projects/form.test.ts tests/unit/domain/skills/form.test.ts tests/integration/shared/auth/login.server.test.ts tests/integration/features/dashboard/projects.server.test.ts tests/integration/features/dashboard/posts.server.test.ts tests/integration/features/dashboard/users.server.test.ts tests/integration/features/dashboard/skills.server.test.ts tests/integration/features/dashboard/resources.server.test.ts tests/integration/routes/public/modules.test.ts tests/integration/routes/locale/modules.test.ts`
  - Basarili. `11` test dosyasi ve `51` test gecti.
- Tam proje kalite kapilari bu feature sonunda yeniden calistirildi:
  - `npm run format:check`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run e2e:prepare`
  - `npm run e2e`

## 4. Feature'i Calistirma / Dogrulama Komutlari

```bash
npm run dev
```

Kalite kapilarini tekrar kosmak icin:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run e2e:prepare
npm run e2e
```

Elle dogrulama akisi:

- `/login` uzerinden admin oturumu ac.
- CRUD aksiyonlari olan dashboard ekranlarinda validation, forbidden, duplicate ve business-rule hata yuzeylerini kontrol et.
- Beklenen form hatalarinda field/form state'in korundugunu dogrula.
- `/dashboard/logging?tab=history` ekraninda audit log kayitlarini goruntule.
- `/dashboard/logging?tab=errors` ekraninda tarih araligi girip txt export ve delete aksiyonlarini test et.
- Beklenmeyen bir hata olustugunda kullaniciya stack yerine request id gosterildigini dogrula.

## 5. Roadmap Referansi

- `Phase 7 / Task 7.1`: Merkezi hata yonetim sisteminin olusturulmasi.
- `Phase 7 / Task 7.2`: `log_history` tablosunun ve CRUD audit kayitlarinin olusturulmasi.
- `Phase 7 / Task 7.3`: `log_error_history` tablosunun ve sistem hata kayitlarinin olusturulmasi.
- `Phase 7 / Task 7.4`: Dashboard sidebar'a `Logging` sekmesi eklenmesi, export/delete aksiyonlari ve admin-only erisim.
