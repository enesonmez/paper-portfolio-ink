# Maintenance Security Audit Checklist

## Ozet

Bu dokuman, `paper-portfolio-ink` kod tabaninin 2026-06-02 tarihli savunmaci guvenlik taramasini checklist formatinda kaydeder. Odak; auth, authz, input validation, cookie/session davranisi, public attack surface ve runtime response hardening alanlaridir. Kod tabaninda Zod tabanli validation, Drizzle parametreli veri erisimi, login rate limiting ve rich text sanitization gibi guclu kontroller mevcut olsa da, production hardening seviyesinde kapatilmasi gereken bes acik yuzey tespit edildi.

## Mevcut Guclu Kontroller

- [x] Login akisinda D1 tabanli brute-force throttle mevcut. `app/shared/auth/login-rate-limit.server.ts`
- [x] Dashboard mutation ve loader akislarinda server-side claim tabanli authz kullaniliyor. `app/shared/authz/handlers.server.ts`
- [x] Public blog rich text render akisinda link ve image protokol sanitization uygulanmis. `app/domain/posts/content.ts`
- [x] Dashboard ve public form girislerinde Zod tabanli validation yaygin kullaniliyor. `app/shared/auth/login.server.ts`, `app/lib/configuration/configuration-form.server.ts`

## Guvenlik Eksiklikleri Checklist

### [x] SEC-01 | Resolved | Global response hardening header seti eksikti

- Cozum: SSR cikisina nonce ureten merkezi bir security header katmani eklendi. `ServerRouter`, `Scripts`, `ScrollRestoration`, `Links` ve dynamic appearance `<style>` blogu ayni CSP nonce ile hizalandi; `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` ve `X-Frame-Options` basliklari tek noktadan uygulanir hale getirildi.
- Uygulanan degisiklikler:
  - [x] SSR giris noktasinda ortak bir `buildSecurityHeaders` katmani olustur.
  - [x] `Content-Security-Policy` icin nonce stratejisi kur ve inline style blogunu nonce ile eslestir.
  - [x] `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` ve `frame-ancestors`/`X-Frame-Options` basliklarini merkezi uygula.
- Referans dosyalar:
  - `app/shared/security/headers.server.ts`
  - `app/entry.server.tsx`
  - `app/root.tsx`
- Dogrulama:
  - `tests/unit/shared/security/headers.server.test.ts`
  - Tam proje dogrulama zinciri
- Ilk onerilen kod yonu:

```ts
const headers = new Headers(responseHeaders);
headers.set(
  "Content-Security-Policy",
  "default-src 'self'; style-src 'self' 'nonce-<nonce>' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
);
headers.set(
  "Strict-Transport-Security",
  "max-age=31536000; includeSubDomains; preload",
);
headers.set("X-Content-Type-Options", "nosniff");
headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
```

### [x] SEC-02 | Resolved | State-changing route'larda ortak anti-CSRF dogrulamasi yoktu

- Cozum: `app/shared/security/csrf.server.ts` altinda ortak `assertSameOriginMutationRequest` guard'i eklendi. Guard `Origin` header'ini birinci sinif kontrol olarak uygular, `Origin` eksiginde ayni origin'li `Referer` fallback'i kabul eder ve `sec-fetch-site` ile cross-site mutation'lari erkenden reddeder.
- Uygulanan degisiklikler:
  - [x] `app/shared/security` altinda ortak `assertSameOriginMutationRequest(request)` helper'i eklendi.
  - [x] Tum dashboard action route'lari ile `auth/login`, `auth/logout`, `public/theme`, `locale/action` ve `public/blog/track` girislerinde guard `request.formData()`/feature mutasyonu oncesine yerlestirildi.
  - [x] Authenticated dashboard aksiyonlari ve public mutation'lar icin basarisiz `Origin`/`Referer` regression testleri eklendi.
- Referans dosyalar:
  - `app/shared/security/csrf.server.ts`
  - `app/routes/auth/login.tsx`
  - `app/routes/auth/logout.tsx`
  - `app/routes/system/api-auth.ts`
  - `app/routes/public/theme.tsx`
  - `app/routes/locale/action.tsx`
  - `app/routes/public/blog/track.ts`
  - `app/routes/dashboard/*.tsx`
  - `app/features/public/blog/tracking/server.ts`
- Dogrulama:
  - `tests/unit/shared/security/csrf.server.test.ts`
  - `tests/integration/routes/auth/modules.test.ts`
  - `tests/integration/routes/public/modules.test.ts`
  - `tests/integration/routes/locale/modules.test.ts`
  - `tests/integration/routes/dashboard/modules.test.ts`
  - `tests/integration/features/public/blog-tracking.server.test.ts`
- Ilk onerilen kod yonu:

```ts
export function assertSameOriginMutationRequest(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  if (origin !== expectedOrigin) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

### [x] SEC-03 | Resolved | Ozel cookie'lerde `Secure` bayragi yoktu

- Cozum: `theme`, `locale` ve public analytics lock cookie builder'lari `Secure` ile sertlestirildi. `theme` ve `locale` cookie'leri host-only `__Host-` ismine gecirildi ve `HttpOnly` korundu; analytics lock cookie'si de host-only `__Host-` + `Secure` olarak hizalandi, ancak client-side duplicate suppression mekanizmasi `document.cookie` okudugu icin bilerek `HttpOnly` yapilmadi.
- Uygulanan degisiklikler:
  - [x] Tum custom cookie builder'larina `Secure` eklendi.
  - [x] Uygun yuzeylerde host-only davranis icin `__Host-` on eki ve `Path=/` kombinasyonu kullanildi.
  - [x] JS-erisimine ihtiyac olmayan cookie'lerde `HttpOnly` korundu; analytics lock cookie'sinde JS ihtiyaci nedeniyle korunmadi.
- Referans dosyalar:
  - `app/features/public/layout/theme.server.ts`
  - `app/shared/i18n/i18n.shared.ts`
  - `app/features/public/blog/tracking/shared.ts`
  - `tests/unit/features/public/layout/theme.server.test.ts`
  - `tests/unit/shared/i18n/i18n.shared.test.ts`
  - `tests/unit/features/public/blog/tracking.shared.test.ts`
  - `tests/integration/routes/public/modules.test.ts`
  - `tests/integration/routes/locale/modules.test.ts`
  - `tests/integration/features/public/blog-tracking.server.test.ts`
  - `tests/e2e/public.spec.ts`
- Dogrulama:
  - Theme, locale ve analytics lock cookie'lerinin `Secure`/`Path=/`/`__Host-` kontratlarini sabitleyen unit ve integration testleri
  - Public tracking E2E cookie assertion'i
- Ilk onerilen kod yonu:

```ts
return [
  "__Host-paper-theme=dark",
  "Path=/",
  "Max-Age=31536000",
  "HttpOnly",
  "Secure",
  "SameSite=Lax",
].join("; ");
```

### [x] SEC-04 | Resolved | Chrome DevTools well-known endpoint'i production'da acikti

- Cozum: `.well-known/appspecific.com.chrome.devtools.json` handler'i local/dev probe'lari ile production host'larini ayirt edecek sekilde sertlestirildi. `node` runtime ve loopback/local hostlar JSON cevabi almaya devam ederken, Cloudflare runtime'da non-local hostlar icin endpoint 404 donuyor.
- Uygulanan degisiklikler:
  - [x] Rota local/dev probe'lara acik kalirken production hostlarda 404 donen runtime gate ile sertlestirildi.
  - [x] Production benzeri Cloudflare request'leri icin 404 regression testi eklendi.
- Referans dosyalar:
  - `app/routes/system/chrome-devtools.ts`
  - `tests/integration/routes/system/chrome-devtools.test.ts`
- Dogrulama:
  - Local `node` ve local Cloudflare request'lerinde 200 JSON response
  - Production benzeri Cloudflare hostunda 404 response
- Ilk onerilen kod yonu:

```ts
if (context.runtime.platform === "cloudflare" && env.NODE_ENV === "production") {
  throw new Response(null, { status: 404 });
}
```

### [ ] SEC-05 | Informational | Auth base URL ve trusted origin pinning request origin'a dusuyor

- Etki: `BETTER_AUTH_URL` tanimli degilse auth base URL ve trusted origin listesi gelen request origin'inden turetiliyor; bu durum preview domain, alias host veya yanlis host konfigrasyonlarinin istemeden guvenli kabul edilmesine yol acabilir.
- Kanit:
  - `app/shared/auth/auth-config.server.ts:19` `baseURL` icin `new URL(request.url).origin` fallback'i kullaniyor.
  - `app/shared/auth/auth-config.server.ts:33` `trustedOrigins` degerini `[baseURL]` olarak set ediyor.
  - `workers/auth-env.ts:16` Cloudflare tarafinda da ayni fallback tekrar ediyor.
- Somurulebilirlik Kaniti: Uygulama yanlis host alias'lariyla veya preview domain'lerle erisilebilir oldugunda auth katmani bu origin'leri explicit allowlist yerine otomatik trusted kabul eder; bu dogrudan auth bypass degil, ancak host/origin hardening seviyesini dusurur.
- Remediation checklist:
  - [ ] Production startup sirasinda `BETTER_AUTH_URL` zorunlu olsun.
  - [ ] `trustedOrigins` icin explicit allowlist kullan.
  - [ ] Preview ve local ortamlar icin ayri env profilleri tanimla.
- Onerilen kod yonu:

```ts
if (isProduction && !readServerEnv("BETTER_AUTH_URL")) {
  throw new Error("BETTER_AUTH_URL is required in production");
}
```

## Degisen Dosyalar

- `docs/features/Maintenance_SecurityAuditChecklist.md`
  - Repo genelindeki guvenlik eksiklerini severity, kanit ve remediation checklist'i ile kaydeden audit dokumani.
- `docs/lessons.md`
  - Bu auditten cikan kalici guvenlik sertlestirme dersini kaydeder.

## Testler

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## Dogrulama

1. `docs/features/Maintenance_SecurityAuditChecklist.md` dosyasinda her bulgunun `severity`, `kanit`, `somurulebilirlik kaniti` ve `remediation checklist` alanlarini kontrol et.
2. Checklist'teki satir referanslarinin ilgili kaynak dosyalara karsilik geldigini dogrula.
3. Zorunlu komut zincirinin yesil gectigini dogrula.

## Roadmap Referansi

Roadmap disi maintenance guvenlik incelemesi.
