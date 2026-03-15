# Phase 4 / Task 4.2: LoginRoute

## Kapsam

Bu geliştirme, `paper-enes-ink` projesindeki `Phase 4 / Task 4.2` maddesini tamamlar:

- `4.2` `/login` sayfasının oluşturulması

Amaç, Better Auth ile kurulu session mekanizmasını kullanarak neo-brutalist bir `/login` sayfası oluşturmak, protected dashboard redirect akışını bu sayfaya taşımak ve login formunu server-side action + Zod doğrulama ile çalıştırmaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki auth UX katmanı eklendi:

1. `/login` route'u loader, action ve SSR odaklı UI ile oluşturuldu.
2. Dashboard guard redirect hedefi `/login?redirectTo=...` olacak şekilde güncellendi.
3. Login formu için Zod tabanlı server-side doğrulama eklendi.
4. Better Auth `signInEmail` API'sine bağlanan login service helper'ı yazıldı.
5. Auth cookie header'larını koruyarak dashboard'a redirect eden action akışı kuruldu.
6. Login route, login helper ve dashboard redirect davranışı test-first şekilde doğrulandı.
7. Roadmap üzerindeki `4.2` maddesi tamamlandı olarak işaretlendi.

## Teknik Calisma Mantigi

### 1. Protected route'tan login sayfasina yonlendirme

`app/lib/auth/login.server.ts` icinde `buildLoginRedirect()` helper'i eklendi.

Bu helper:

- mevcut request URL'inden pathname + search degerini alir
- bunu `redirectTo` query parametresine encode eder
- `/login?redirectTo=...` yapisini uretir

`app/routes/dashboard.tsx` parent loader'i artik unauthorized kullanicilari `/` yerine bu login rotasina yonlendirir.

### 2. Login route loader davranisi

`app/routes/login.tsx` icindeki `loader()` iki amacla calisir:

- aktif session varsa kullaniciyi tekrar login ekraninda tutmaz, dogrudan dashboard hedefine gonderir
- session yoksa sanitize edilmis `redirectTo` degerini route component'ine verir

Bu tercih, auth akisini tamamen server-side tutar.

### 3. Zod ile form dogrulamasi

`app/lib/auth/login.server.ts` icindeki `parseLoginFormData()` helper'i:

- `email`
- `password`
- `redirectTo`

alanlarini alir ve Zod ile dogrular.

Guvenlik icin `redirectTo` degeri ayrica `normalizeRedirectTarget()` ile filtrelenir:

- sadece relative path'ler kabul edilir
- `//evil.example` veya tam URL gibi acik yonlendirme denemeleri reddedilir
- gecersiz degerlerde fallback olarak `/dashboard` kullanilir

### 4. Better Auth server-side sign-in akisi

`signInWithEmail()` helper'i request context icinden:

- `context.db`
- `resolveAuthConfig(request, context.auth)`

ile Better Auth instance olusturur ve `auth.api.signInEmail()` cagirir.

Basarili durumda:

- Better Auth response body'sindeki hedef URL okunur
- `set-cookie` header'lari korunur
- React Router `redirect()` ile dashboard'a yonlendirme yapilir

Basarisiz durumda:

- `better-auth/api` icindeki `isAPIError()` ile hata tipi ayrilir
- form seviyesinde okunabilir hata mesaji dondurulur
- form email ve redirectTo degerleri korunur

### 5. UI yapisi

`LoginScreen` UI'i route dosyasi icinde ayri tutuldu.

Bu bileşen:

- SSR ile render edilir
- `useLoaderData`, `useActionData` ve `useNavigation` verilerini kapsayan route wrapper'dan ayridir
- testlerde dogrudan render edilmesini kolaylastirir

Neo-brutalist stil dili korunarak:

- kalin siyah border
- sert offset shadow
- belirgin focus state
- hata durumlari icin kiremit kirmizisi alanlar

kullanildi.

## Olusturulan / Guncellenen Dosyalarin Sorumluluklari

### Yeni dosyalar

- `app/lib/auth/login.server.ts`: login form validation, redirect sanitization ve Better Auth sign-in helper'lari
- `app/routes/login.tsx`: login loader, action ve neo-brutalist login UI
- `tests/unit/login-server.test.ts`: login helper testleri
- `tests/unit/login-route.test.tsx`: login route loader/action/UI testleri
- `docs/features/Phase4_Task4.2_LoginRoute.md`: feature dokumantasyonu

### Guncellenen dosyalar

- `app/lib/auth/session.server.ts`: ortak session okuma helper'i
- `app/routes/dashboard.tsx`: unauthorized redirect hedefi `/login` oldu
- `package.json`: `zod` direct dependency olarak eklendi
- `package-lock.json`: lock kaydi guncellendi
- `tests/unit/dashboard-guard.test.ts`: yeni redirect beklentisi
- `AGENTS.md`: roadmap guncellemesi

## Uygulanan Testler ve Sonuclari

### Yeni testler

`tests/unit/login-server.test.ts`

Bu testler:

- protected route icin login redirect URL'inin dogru kuruldugunu
- acik yonlendirme denemelerinin normalize edildigini
- gecersiz login form verilerinin Zod ile field error'a dondugunu
- Better Auth sign-in sonucundaki cookie header'larin redirect response'a tasindigini

dogrular.

`tests/unit/login-route.test.tsx`

Bu testler:

- authenticated kullanicinin `/login` ekranindan dashboard'a yonlendirildigini
- unauthenticated kullanici icin `redirectTo` degerinin loader ile donduruldugunu
- valid form submit'inin login service helper'ina delegasyon yaptigini
- login ekraninin temel SSR UI kabugunu render ettigini

dogrular.

### Guncellenen test

`tests/unit/dashboard-guard.test.ts`

Bu test:

- `/dashboard` icin unauthorized redirect hedefinin artik `/login?redirectTo=...` oldugunu

dogrular.

### Calistirilan Komutlar

```bash
npm test -- login-server login-route dashboard-guard
npm run lint
npm run typecheck
npm run build
npm run format:check
```

### Sonuc

- login helper testleri gecti
- login route testleri gecti
- dashboard redirect testi gecti
- lint, typecheck, build ve format kontrolu gecti

## Feature'i Calistirma Komutlari

### Gelistirme ortami

```bash
npm run dev
```

Not:

- `npm run dev` artik React Router'in Cloudflare dev proxy'si ile local D1 binding'lerini de yukler
- bu sayede login submit akisi development modunda da Better Auth + D1 ile calisir

### Login akis dogrulamasi

1. Browser'da `/dashboard` adresine git
2. Session yoksa `/login?redirectTo=%2Fdashboard` yonlendirmesini dogrula
3. Giris sonrasi dashboard'a donuldugunu kontrol et

### Genel dogrulama

```bash
npm test -- login-server login-route dashboard-guard
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## Ilgili Roadmap Referanslari

- `Phase 4 / Task 4.2`
