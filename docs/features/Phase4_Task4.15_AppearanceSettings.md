# Phase 4 Task 4.15 Appearance Settings Tab

## Ozet

Bu calisma ile `/dashboard/settings?tab=appearance` altinda neo-brutalist temalari ve tipografi ayarlarını yonetebilmek icin dinamik bir gorunum özelleştirme katmanı entegre edilmiştir. Renk paleti secenekleri (Sarı, Turuncu, Yeşil, Mavi, Kırmızı) ve yazi tipi kilitleri (VT323/Outfit display basliklari, JetBrains Mono/Inter body fontlari) D1 veritabanı uzerindeki `configuration_parameters` tablosuna tasinarak persistent hale getirilmiştir. Tercih edilen stiller, layout root (`app/root.tsx`) uzerinde sunucu tarafindan dinamik CSS variable'lari ve font `@import` bloklari olarak HTML head alanina enjekte edilerek istemci tarafindaki görsel kırılmalar (FOUC) tamamen engellenmiştir.

## Degisen Dosyalar

- `db/migrations/0032_appearance_settings.sql` [NEW]
  - D1 SQLite veritabanı uzerinde gorunum parametrelerini seed eden idempotent sql migration betigi.
- `app/domain/configuration/model.ts`
  - Renk ve yazı tipi sabitlerinin, strongly-typed union tiplerinin ve varsayilan ayarların model seviyesinde tanimlanmasi.
- `app/lib/configuration/configuration-form.server.ts`
  - Zod super-refinements dogrulama kurallarının strongly-typed olarak guncellenmesi.
- `app/root.tsx`
  - `buildAppearanceStyleOverrides` fonksiyonu ile head icine dinamik Google Fonts @import ve CSS custom variable overrides enjeksiyonu.
- `app/features/dashboard/settings/copy.ts`
  - Görünüm etiketlerinin, hex kodlarının ve yazi tipi listelerinin i18n çeviri anahtarlarina bağlanması.
- `app/features/dashboard/settings/actions.server.ts`
  - Görünüm tabındaki guncellemeler sonrasi kullanıcının dogrudan appearance tabına yonlendirilmesi.
- `app/features/dashboard/settings/screen.tsx`
  - Orkestrasyon katmaninin temizlenerek alt modular bilesenlere import vermesi.
- `app/features/dashboard/settings/components/account-cards.tsx` [NEW]
  - Hesap bilgileri kartlarini listeleyen modular bilesen.
- `app/features/dashboard/settings/components/appearance-cards.tsx` [NEW]
  - Görünüm seceneklerini yerel dilde ve dinamik i18n registry uzerinden sunan bilesen.
- `app/features/dashboard/settings/components/configuration-modal.tsx` [NEW]
  - Sihirli kelimelerden arindirilmis, domain section kontrolleriyle hem account hem de appearance ayarlarını dinamik olarak yoneten generic modal.
- `app/shared/i18n/messages.shared.ts`
  - Tüm secenekler ve dogrulamalar icin yeni Türkçe/İngilizce translations kayitlari.
- `docs/lessons.md`
  - Sihirli kelimelerin temizlenmesi, modüler components dizini tasarimi ve section kontrolleri konularinda cikarilan dersler.
- `tests/integration/routes/dashboard/settings.test.tsx`
  - Görünüm kartlarinin dogru etiketlerle ve secili i18n degerleriyle render edildigini kanitlayan integration test blogunun eklenmesi.

## Testler

- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run e2e:prepare`
- `npm run e2e`

Tüm test ve dogrulama pipelines %100 basari oraniyla yeşil tamamlanmıştır (390 unit/integration ve 45 E2E testi gecmistir).

## Dogrulama

1. `/dashboard/settings?tab=appearance` adresine erisin.
2. Görünüm kartlarinda "Renk paleti" satırında "Sarı / Yellow (Default - #facc15)" seklinde renk kodunu ve default marker'ini dogrulayin.
3. Bir satira tıklayarak generic modalin acildigini ve icinde yerel dildeki seçim listelerinin (SelectField) geldigini teyit edin.
4. Vurgu rengini "Yeşil" veya yazı tipini "Outfit" yapıp kaydedin.
5. Sayfa yenilendikten sonra dynamic head injection sayesinde tüm sitenin vurgu renklerinin ve fontunun aninda degistigini ve kullanıcının appearance tabında kalmaya devam ettigini dogrulayin.

## Roadmap Referansi

- `Phase 4 / Task 4.15`: `/settings` menusu altinda appearance tab'i, renk paleti ve font degisim destegi ve configuration-parameter entegrasyonu.
