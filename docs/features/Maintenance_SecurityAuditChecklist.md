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

### [ ] SEC-02 | Medium | State-changing route'larda ortak anti-CSRF dogrulamasi yok

- Etki: Dashboard ve public mutation akislari cookie tabanli oturumla calisiyor, ancak bu rotalar icin ortak `Origin`/`Referer` veya CSRF token dogrulamasi uygulanmadigi icin savunma buyuk oranda `SameSite=Lax` davranisina birakilmis durumda.
- Kanit:
  - `app/features/dashboard/settings/actions.server.ts:45` ve `app/features/dashboard/posts/actions.server.ts:83` `request.formData()` alip auth/authz sonrasi mutasyon yurutuyor, fakat request-origin dogrulamasi yapmiyor.
  - `app/features/public/blog/tracking/server.ts:55` ayni-origin kontrolu uygulayan tek belirgin mutation ornegi.
  - `app/routes/public/theme.tsx` ve `app/routes/locale/action.tsx` benzer sekilde POST kabul ediyor, fakat anti-CSRF guard'i tasimiyor.
- Somurulebilirlik Kaniti: Bugunku cookie politikasi bircok cross-site POST'u azaltir, ancak ayni-site alt alan adi senaryolari, gelecekte cookie policy gevsemesi veya yeni mutation route'larin GET/JSON tabanli eklenmesi durumunda ortak bir sunucu guard'i olmadigi icin koruma kolayca delinmeye acik kalir.
- Remediation checklist:
  - [ ] `app/shared/auth` veya `app/shared/security` altinda ortak `assertSameOriginMutationRequest(request)` helper'i ekle.
  - [ ] Tum state-changing route'larda bu guard'i `request.formData()` veya `request.json()` cagrilarindan once zorunlu kil.
  - [ ] Authenticated dashboard aksiyonlari ve public mutation'lar icin basarisiz `Origin`/`Referer` testleri ekle.
- Onerilen kod yonu:

```ts
export function assertSameOriginMutationRequest(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  if (origin !== expectedOrigin) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

### [ ] SEC-03 | Low | Ozel cookie'lerde `Secure` bayragi yok

- Etki: `theme`, `locale` ve public analytics lock cookie'leri HTTPS zorlamasi olmayan bir baglamda plaintext isteklerle tasinabilir veya HTTP uzerinden overwrite edilebilir. Bu cookie'ler kimlik dogrulama cookie'si degil, ancak butunluk ve gizlilik sertlestirmesi eksik.
- Kanit:
  - `app/features/public/layout/theme.server.ts:52` `paper-theme` cookie'sini `HttpOnly` ve `SameSite=Lax` ile kuruyor, fakat `Secure` eklemiyor.
  - `app/shared/i18n/i18n.shared.ts:177` `paper-locale` cookie'sinde de `Secure` yok.
  - `app/features/public/blog/tracking/shared.ts:111` `paper-view-lock` cookie'sinde hem `Secure` yok hem de JS tarafindan okunabilir durumda.
- Somurulebilirlik Kaniti: Kullanici HTTP varyanti olan bir hosta yonlendirilirse veya ara katmanda TLS downgrade/misconfig olursa bu cookie'ler acik agda gozlemlenebilir ya da sahte degerlerle ezilebilir; analytics lock cookie'sinin overwrite edilmesi telemetry kalitesini de bozar.
- Remediation checklist:
  - [ ] Tum custom cookie builder'larina `Secure` ekle.
  - [ ] Uygunsa host-only davranis icin `__Host-` on eki ve `Path=/` kombinasyonunu kullan.
  - [ ] JS-erisimine ihtiyac olmayan cookie'lerde `HttpOnly` korunmaya devam etsin.
- Onerilen kod yonu:

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

### [ ] SEC-04 | Low | Chrome DevTools well-known endpoint'i production'da acik

- Etki: Public `.well-known` rotasi repo/workspace adi sızdiriyor ve gereksiz fingerprinting yuzeyi aciyor.
- Kanit:
  - `app/routes.ts:6` `.well-known/appspecific.com.chrome.devtools.json` rotasini tum ortamlar icin kaydediyor.
  - `app/routes/system/chrome-devtools.ts:1` endpoint'e gelen herkese `workspace` adini JSON olarak donuyor.
- Somurulebilirlik Kaniti: Harici tarayicilar veya botlar tek istekle proje/workspace adini ve devtools entegrasyonunun acik oldugunu anlayabilir; etki dusuk ama yuzey gereksiz.
- Remediation checklist:
  - [ ] Rotayi sadece local/dev runtime'da kaydet veya environment flag ile disable et.
  - [ ] Production'da 404/410 don.
- Onerilen kod yonu:

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
