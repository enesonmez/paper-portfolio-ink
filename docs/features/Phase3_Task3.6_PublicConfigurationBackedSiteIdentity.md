# Phase3 Task3.6 Public Configuration Backed Site Identity

## Ozet

Bu calisma ile public yuzeyde kullanilan site name, canonical site URL ve aktif sosyal/iletisim linkleri `configuration_parameters` kayitlarindan okunur hale getirildi. Root loader artik configuration cache'ini sadece warm etmekle kalmiyor, typed configuration payload'ini da tum route'lara tasiyor; public metadata, footer, home social kartlari, CTA e-posta linkleri ve login branding ayni cache-backed kaynaktan besleniyor. Son bakim turunda `site.title.*` translation kayitlari da `{siteName}` placeholder formatina tasinip brand replace fallback'i kaldirildi; boylece resources ekranindan title resource'lari degistirildiginde metadata akisi sabit bir seed metne bagli kalmiyor. Public social link listesi de `ACCOUNT_CONFIGURATION_DEFINITIONS` uzerinden projection uretiyor; `social.*` alanlari bos birakilirsa ilgili link public yuzeyde hic gosterilmiyor.

## Degisen Dosyalar

- `app/root.tsx`
  - Root loader icine configuration payload'i eklendi; ilk request sonrasi isinan cache artik route ve UI katmaninda dogrudan kullaniliyor.
- `app/lib/site.ts`
  - Site metadata, mailto/contact href, public social links ve root-route fallback helper'lari tek yerde toplandi; public sosyal liste artik configuration registry tanimlarindan turetiliyor.
- `app/routes/public/home.tsx`
  - Home meta title dinamik site name ile uretilir hale getirildi.
- `app/routes/public/projects/index.tsx`
  - Projects meta title ve `og:url` degerleri configuration-backed site bilgilerinden uretiliyor.
- `app/routes/public/blog/index.tsx`
  - Blog liste metadata'si dinamik site name ve canonical URL kullaniyor.
- `app/routes/public/blog/$slug.tsx`
  - Blog detay title fallback'i ve article `og:url` degeri configuration-backed hale getirildi.
- `app/features/public/layout/*`
  - Footer brand label'i ve public sosyal linkler root configuration payload'indan okunuyor.
- `app/features/public/home/ui/*`
  - Resume ve CTA mail linkleri ile social kart href'leri configuration-backed hale getirildi.
- `app/features/auth/login/*`
  - Login meta title ve ust bilgi branding'i dinamik site name kullaniyor.
- `app/shared/i18n/i18n.shared.ts`
  - Translator artik placeholder interpolation destekliyor.
- `db/migrations/0023_site_title_translation_placeholders.sql`
  - `site.title.*` translation kayitlarini `{siteName}` placeholder formatina guncelliyor.
- `tests/unit/lib/site-config.test.ts`
  - Site helper'larinin config -> metadata/link donusumleri test edildi.
- `tests/integration/routes/public/*.test.tsx`
  - Home, projects, blog ve blog-post route metadata'larinin custom configuration ile dogru title/url urettigi dogrulandi.

## Testler

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run e2e:prepare`
- `npm run e2e`

Tum komutlar basarili tamamlandi.

## Dogrulama

1. `/dashboard/settings?tab=account` icinden `site.name`, `site.domainUrl` ve `contact.email` degerlerini guncelle.
2. Public home/footer/blog/projects sayfalarinda yeni degerlerin link ve brand olarak gorundugunu dogrula.
3. Blog ve projects sayfalarinda uretilen `og:url` / document title degerlerinin yeni domain ve site name'i kullandigini kontrol et.

## Roadmap Referansi

- `Phase 3 / Task 3.6`: Public sosyal medya linkleri, site name ve site url degerlerini cache-backed configuration parameter kayitlarindan okut.
