# Phase 1 / Task 1.6 - DB Centered I18n

## 1. Ozet ve Teknik Calisma Mantigi

Bu task ile uygulamanin tamamina `tr` ve `en` dilleri icin veritabani merkezli i18n altyapisi eklendi. Sonraki refactor turunda locale listesinin de DB'den yonetilmesi saglandi. Cozumun ana kararleri su sekilde kuruldu:

- Locale cozumleme path-prefix tabanli yapildi. Uygulama rotalari `/:locale/*` seklinde yeniden tanimlandi ve varsayilan giris `/` rotasi kullaniciyi tercih edilen locale ana sayfasina yonlendirir.
- Mesajlarin source of truth kaynagi D1 icindeki `translations` tablosu oldu. Tum metinler `locale + key + value` modeli ile tutulur.
- Desteklenen diller ve varsayilan dil bilgisi D1 icindeki `locales` tablosuna tasindi. Boylece ileride yeni dil eklemek kod degisikligi gerektirmez.
- Locale runtime kararlari request-scope memoized helper ile tek noktada cozulur; boylece loader, action ve auth redirect'leri ayni DB-backed locale state'i kullanir.
- Eski unprefixed URL'ler icin dar kapsamli bir compatibility forwarder eklendi; `/blog`, `/projects`, `/login`, `/dashboard/*` gibi eski deep link'ler secilen locale karsiligina redirect edilir.
- Uygulama, locale payload'larini mevcut portable cache katmani uzerinden cache'ler. Cloudflare runtime'da gercek bir "startup preload" garantisi olmadigi icin cache isitma request-time miss ile gerceklesir; Node benzeri ortamlarda ayni katman process-memory fallback ile calisabilir.
- Development asamasinda ekranlarin bos kalmamasi icin tum mevcut TR/EN mesajlar migration icine seed edildi. Ayni seed set'i runtime fallback kontrati olarak da kullanildi.
- Root loader i18n payload'ini yukler, HTML `lang` niteligini secilen locale ile yazar ve React tarafina provider ile aktarir.
- Locale degisimi cookie ile da desteklenir; kullanici locale switch yaptiginda hedef yol sanitize edilip ayni sayfanin diger locale karsiligina gidilir.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `db/schema.ts`
  `translations` ve `locales` tablolarini, ilgili index tanimlariyla birlikte ekler.
- `db/migrations/0006_pink_masque.sql`
  `translations` tablosunu olusturur ve tum TR/EN metinleri seed eder.
- `db/migrations/0007_next_maverick.sql`
  `locales` tablosunu olusturur ve aktif/default `tr` ile `en` locale kayitlarini seed eder.
- `app/features/i18n/messages.shared.ts`
  Seed mesaj setlerini, desteklenen locale listesini ve ortak i18n key uzayini tanimlar.
- `app/features/i18n/i18n.shared.ts`
  Locale algilama, path-prefix cozumleme, locale cookie, localized path uretimi ve translator helper'larini saglar.
- `app/features/i18n/i18n.server.ts`
  DB + cache merkezli locale payload yukleme, desteklenen locale listesini D1'dan okuma, request-scope locale runtime state memoization'i ve server-side locale yardimcilarini saglar.
- `app/features/i18n/i18n-react.tsx`
  React provider, hook'lar ve testlerde guvenli fallback davranisini saglar.
- `app/features/i18n/components/locale-switcher.tsx`
  Locale degistirme UI'sini sunar.
- `app/root.tsx`
  Root loader icinde i18n payload'ini yukler, HTML `lang` niteligini locale ile yazar ve tum uygulamayi i18n provider ile sarar.
- `app/routes.tsx`
  Route agacini locale prefix yapisina tasir.
- `app/routes/locale-index.tsx`
  `/` rotasindan tercih edilen locale ana sayfasina yonlendirme yapar.
- `app/routes/locale-prefix.tsx`
  Locale param'ini dogrular ve locale tabanli route shell gorevi gorur.
- `app/routes/locale.tsx`
  Locale switch action route'unu saglar.
- `app/lib/auth/login.server.ts`, `app/features/auth/login/login.server.ts`, `app/features/auth/logout/logout.server.ts`, `app/routes/theme.tsx`
  Redirect, validasyon ve action akisini localized route yapisina uyarlar.
- `app/features/public/*` ve `app/features/dashboard/*`
  Public ve dashboard ekranlarindaki tum gorunen metinleri translator uzerinden kullanir.
- `tests/unit/*`
  Localized redirect, route render, provider fallback ve i18n metin akisini kilitleyecek sekilde guncellendi.

## 3. Mimari Notlar

- Cloudflare Workers ortami gercek anlamda uygulama ayaga kalkarken async DB preload garantisi vermez. Bu nedenle i18n cache modeli "startup preload" yerine "first hit warm-up" ve gerekirse scheduled warm-up mantigiyla tasarlandi.
- Yeni dil ekleme gereksinimi nedeniyle locale listesi kod sabitinden ayrilip D1 `locales` tablosuna tasindi; buna ragmen test ve minimum mock context senaryolari icin seed locale fallback'i korunur.
- Sonraki sertlestirme turunda `locales` tablosuna locale code sanity check'leri, `translations.locale -> locales.code` foreign key iliskisi ve auth/dashboard redirect'leri icin tek locale runtime helper'i eklendi.
- Ayni sertlestirme turunda migration henuz uygulanmamis ortamlarda `locales` veya `translations` tablolarinin eksik olmasi durumuna karsi seed fallback davranisi korundu.
- Runtime'da DB okunamazsa veya test mock context'i minimum tutulmussa, seed mesajlar fallback olarak kullanilir. Bu sayede testler ve lokal gelistirme akisi kirilmaz.
- `useAppI18n` ve bagli hook'larda guvenli fallback bulunur; bu sayede izole component testleri root provider kurmadan da calisabilir.
- Son audit turunda root error boundary, public header aria etiketleri, dashboard modal kapanis etiketleri, project table badge metinleri, rich text toolbar aria label'lari ve blog bos-icerik fallback'i de seed kataloguna tasindi; bu farklar `0009_solid_sasquatch.sql` ile mevcut DB'lere backfill edildi.

## 4. Uygulanan Testler ve Sonuclari

- `npm test`
  Basarili. `50` test dosyasi ve `146` test gecti.
- `npm run typecheck`
  Basarili.
- `npm run lint`
  Basarili.
- `npm run format`
  Basarili.
- `npm run format:check`
  Basarili.

## 5. Dogrulama / Calistirma Komutlari

```bash
npm test
npm run typecheck
npm run lint
npm run format
npm run format:check
```

## 6. Roadmap Referansi

- `Phase 1 / Task 1.6`: i18n altyapisinin DB merkezli kurulmasi ve cache ile desteklenmesi
