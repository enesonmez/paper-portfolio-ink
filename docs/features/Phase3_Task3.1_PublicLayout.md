# Phase 3 Task 3.1 Public Layout

## 1. Yapılan İşlemin Detaylı Özeti ve Teknik Çalışma Mantığı

Bu çalışma ile public route'lar için merkezi bir app shell oluşturuldu. Amaç, `root` seviyesinde tüm public ekranları aynı neo-brutalist layout diliyle sarmak, theme değişimini server-first bir akışla yönetmek ve dashboard/login gibi yönetim yüzeylerini bu shell'den ayrı tutmaktı.

Kurulan akış:

- `app/root.tsx` içinde root `loader` eklendi ve tema bilgisi cookie üzerinden okunur hale getirildi.
- Root `Layout` export'u, React Router'ın önerdiği `useRouteLoaderData("root")` pattern'i ile `<html>` class'ını theme'e göre belirler.
- Root `App` bileşeni pathname'e göre public route'ları algılar ve sadece `/`, `/projects`, `/blog` tarafını `PublicSiteLayout` ile sarar.
- Theme değişimi için ayrı resource route kullanıldı: `app/routes/theme.tsx`.
- Theme form submit'i server-side `action` üzerinden işlenir; cookie yazılır ve kullanıcı aynı route'a geri yönlendirilir.
- Redirect hedefi sanitize edilerek açık yönlendirme (open redirect) riski engellendi.
- Theme cookie `HttpOnly` ve `SameSite=Lax` olarak yazılır; tema client storage yerine server taraflı bir sözleşmeyle korunur.

Bu düzen sayesinde public shell şu özellikleri kazandı:

- Sticky header
- Public navigation
- Dark/Light theme toggle
- Footer, sosyal linkler ve back-to-top CTA
- Public route'larda ortak arka plan atmosferi

## 2. Oluşturulan Dosyaların Sorumlulukları

### Root ve Theme Akışı

- `app/root.tsx`: root loader, document theme class yönetimi, public route shell ayrımı
- `app/routes/theme.tsx`: public theme toggle action route'u

### Public Layout Slice

- `app/features/public/layout/public-layout.shared.ts`: theme, copy, navigation, social link ve public route helper sabitleri
- `app/features/public/layout/public-theme.server.ts`: cookie parse/build ve form validation mantığı
- `app/features/public/layout/public-site-layout.tsx`: public route'ları saran shell bileşeni
- `app/features/public/layout/components/public-site-header.tsx`: logo, navigation ve theme toggle içeren header
- `app/features/public/layout/components/public-site-footer.tsx`: footer, sosyal linkler ve back-to-top CTA
- `app/features/public/layout/components/public-theme-toggle.tsx`: theme action route'una post eden leaf form bileşeni

## 3. Uygulanan Testlerin Detayları ve Sonuçları

Eklenen testler:

- `tests/unit/public-theme.server.test.ts`
  - cookie yoksa light theme döndüğünü doğrular
  - dark theme cookie'sinin okunduğunu doğrular
  - hatalı redirect hedeflerinin `/` olarak sanitize edildiğini doğrular
  - cookie builder'ın `HttpOnly` sözleşmesini koruduğunu doğrular
- `tests/unit/public-site-layout.test.tsx`
  - public header navigation linklerini render ettiğini doğrular
  - theme toggle butonunun göründüğünü doğrular
  - footer CTA ve footer copy'nin render edildiğini doğrular

Toplu doğrulama:

- `npm run typecheck` geçti
- `npm run lint` geçti
- `npm test` geçti
- `npm run build` geçti

## 4. Projeyi veya İlgili Feature'ı Ayağa Kaldırma / Çalıştırma Komutları

```bash
npm install
npm run dev
```

Feature doğrulama komutları:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Public shell'i görmek için örnek route'lar:

- `/`
- `/projects`
- `/blog`

## 5. Development Roadmap Referansı

Bu dokümantasyon aşağıdaki roadmap maddesini kapsar:

- `Phase 3 / Task 3.1`: Global Layout, Navbar ve Footer bileşenlerinin (Dark/Light mode switch dahil) tasarlanması
