# Phase 2 / Task 2.4: BetterAuthIntegration

## Kapsam

Bu geliştirme, `paper-portfolio-ink` projesindeki `Phase 2 / Task 2.4` maddesini tamamlar:

- `2.4` Portable Session-based Auth (Better Auth) kurulumu ve login/session mekanizmasının D1'e bağlanması

Amaç, mevcut Drizzle schema + local D1 migration hattını Better Auth ile uyumlu hale getirmek, auth tablolarını veri modeline eklemek ve request-time çalışan bir Better Auth factory ile `/api/auth/*` handler yüzeyini oluşturmaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki auth katmanı kuruldu:

1. `better-auth` paketi projeye eklendi.
2. `users` ve `sessions` tabloları Better Auth ile uyumlu hale getirildi.
3. `accounts` ve `verifications` tabloları schema'ya eklendi.
4. Better Auth için Drizzle adapter kullanan request-time auth factory yazıldı.
5. Runtime bağımsız auth config çözümleyicisi eklendi.
6. `/api/auth/*` handler route'u React Router resource route olarak eklendi.
7. Yeni schema değişiklikleri için ikinci D1 migration üretildi ve local veritabanına uygulandı.
8. Roadmap üzerindeki `2.4` maddesi tamamlandı olarak işaretlendi.

## Teknik Çalışma Mantığı

### 1. Schema uyumluluğu

Better Auth email/password akışı yalnızca `users` ve `sessions` ile çalışmaz; ek olarak:

- `accounts`
- `verifications`

tablolarına ihtiyaç duyar.

Bu yüzden `db/schema.ts` genişletildi:

- `users.password_hash` kaldırıldı
  Sebep: Better Auth email/password parolasını `accounts.password` alanında yönetir
- `sessions.token_hash` alanı `token` olarak güncellendi
  Sebep: Better Auth session modeli `token` alanını bekler
- `accounts` tablosu eklendi
- `verifications` tablosu eklendi

Bu değişim, mevcut D1/Drizzle veri modeli ile Better Auth'ın beklediği model arasında uyum sağladı.

### 2. Auth factory yaklaşımı

`app/lib/auth/auth.server.ts` içinde global singleton yerine request-time factory kullanıldı.

Bu tercih bilinçliydi:

- DB instance'ı request context üzerinden geliyor
- mevcut uygulama mimarisi runtime-agnostic tutuluyor
- Cloudflare ve gelecekteki Node/Coolify bootstrap'ları aynı auth factory'yi kullanabilir

Ana fonksiyonlar:

- `resolveAuthConfig(request, override?)`
- `createAuth({ db, secret, baseURL, trustedOrigins })`
- `getSessionFromRequest(request, options)`

Burada sorumluluklar özellikle ayrıldı:

- `app/lib/auth/auth-config.server.ts`
  request origin'i, process env ve runtime override'larından son auth config'i üretir
- `app/lib/auth/auth.server.ts`
  yalnızca Better Auth factory ve session çözümleme işini yapar

`resolveAuthConfig()` request origin'inden güvenli local varsayılanları türetir. Context içinden override gelirse onu kullanır.

### 3. Better Auth konfigürasyonu

`createAuth()` içinde şu kurulum yapıldı:

- `drizzleAdapter(db, { provider: "sqlite", schema })`
- `emailAndPassword.enabled = true`
- custom model mapping:
  - `users`
  - `sessions`
  - `accounts`
  - `verifications`
- user field mapping:
  - `name -> display_name`
  - `image -> avatar_url`

Bu sayede Better Auth, proje içinde kullanılan çoğul tablo isimleri ve mevcut alan adları ile çalışabilir hale geldi.

### 4. Resource route entegrasyonu

`app/routes/api.auth.$.ts` dosyası Better Auth handler'ını React Router resource route olarak mount eder.

Bu route:

- `GET` isteklerinde `loader`
- `POST` isteklerinde `action`

üzerinden `auth.handler(request)` çağırır.

Böylece Better Auth'ın tüm endpoint yüzeyi `/api/auth/*` altında sunulur.

### 5. Migration hattı ile bağlama

Schema değişikliği sonrası yeni migration üretildi:

- `db/migrations/0001_flaky_bulldozer.sql`

Bu migration:

- `sessions.token_hash -> token` kolon rename işlemini yapar
- `accounts` tablosunu oluşturur
- `verifications` tablosunu oluşturur
- eski `password_hash` kolonunu `users` tablosundan düşürür

Ardından migration local D1 veritabanına uygulandı ve doğrulandı.

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni dosyalar

- `app/lib/auth/auth-config.ts`: auth runtime config sözleşmesi
- `app/lib/auth/auth.server.ts`: Better Auth factory, config resolver ve session helper'ı
- `app/routes/api.auth.$.ts`: Better Auth resource route handler'ı
- `db/migrations/0001_flaky_bulldozer.sql`: auth uyumlu ikinci schema migration'ı
- `db/migrations/meta/0001_snapshot.json`: auth schema snapshot kaydı
- `tests/unit/auth-server.test.ts`: Better Auth factory wiring testleri
- `tests/unit/auth-route.test.ts`: auth route delegasyon testleri
- `docs/features/Phase2_Task2.4_BetterAuthIntegration.md`: feature dokümantasyonu

### Güncellenen dosyalar

- `db/schema.ts`: Better Auth uyumlu tablo alanları + `accounts` ve `verifications`
- `app/env.server.ts`: auth config override alanı
- `package.json`: `better-auth` bağımlılığı
- `package-lock.json`: kurulum kilidi
- `tests/unit/db-schema.test.ts`: auth uyumlu schema beklentileri
- `AGENTS.md`: roadmap güncellemesi

### Auth secret ve URL konfigürasyonu

Local `react-router dev` akışında:

- `.env.example`

dosyası referans alınarak:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

değerleri `.env` içine konabilir.

Cloudflare / Wrangler akışında:

- `.dev.vars.example`

dosyası referans alınarak local Worker secret'ları `.dev.vars` içine konabilir.

Cloudflare request handler, runtime env değerlerini `AppLoadContext.auth` içine taşıyacak şekilde bridge edildiği için Worker tarafında da Better Auth artık gerçek secret ile çalışır.

Bu mapper da ayrıca ayrıştırıldı:

- `workers/auth-env.ts`
  Cloudflare env binding'lerini auth override nesnesine dönüştürür
- `workers/load-context.ts`
  yalnızca app load context compositon root'u olarak davranır

Local `npm run dev` akışı için de Vite tarafında resmi React Router Cloudflare dev proxy eklendi:

- `vite.config.ts`
  `cloudflareDevProxy(...)` ile `.dev.vars` ve `wrangler.toml` içindeki local D1 binding'leri React Router development server'a taşır

Böylece Better Auth, development modunda da gerçek `context.db` ve `context.auth` üzerinden çalışır; login gibi DB sorgusu yapan akışlar yalnızca `wrangler dev` altında değil, standart local dev komutunda da bozulmaz.

## Uygulanan Testler ve Doğrulamalar

### Yeni testler

`tests/unit/auth-server.test.ts`

Bu testler:

- Better Auth factory'nin Drizzle adapter ile doğru kurulduğunu doğrular
- çoğul tablo ve özel alan mapping'lerinin doğru verildiğini doğrular
- request origin'inden auth config türetildiğini doğrular

`tests/unit/auth-route.test.ts`

Bu testler:

- `/api/auth/*` resource route'unun GET isteklerini Better Auth handler'ına delegasyon yaptığını doğrular
- POST isteklerinde de aynı delegasyonu doğrular

### Güncellenen test

`tests/unit/db-schema.test.ts`

Bu test:

- Better Auth için gerekli yeni tabloları ve kolon uyumluluğunu doğrular

### Çalıştırılan komutlar

```bash
npm run db:generate
npm run db:migrate:local
npm run db:migrations:list:local
npx wrangler d1 execute paper-portfolio-ink-db --local --command "PRAGMA table_info('sessions'); SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

### Sonuç

- Better Auth schema değişikliği migration'a dönüştürüldü
- local D1 apply başarılı oldu
- `sessions` tablosunda `token` kolonu doğrulandı
- `accounts` ve `verifications` tabloları local veritabanında doğrulandı
- test, lint, typecheck, build ve format kontrolü geçti

## Feature'ı Çalıştırma Komutları

### Auth migration'ını üretmek

```bash
npm run db:generate
```

### Local D1 veritabanına auth migration'ını uygulamak

```bash
npm run db:migrate:local
```

### Local auth migration durumunu görmek

```bash
npm run db:migrations:list:local
```

### Test login kullanicisini seed etmek

```bash
npm run db:seed:test-user
```

Varsayilan bilgiler:

- `admin@paper-portfolio-ink.local`
- `ExamplePass123!`

### Genel doğrulama

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## İlgili Roadmap Referansları

- `Phase 2 / Task 2.4`

## Sonraki Mantıklı Adım

Bu temel üzerine gelecek doğal adımlar:

- `Phase 4.1` için dashboard rotalarını server-side session kontrolü ile kapatmak
- `Phase 4.2` için `/login` sayfasını Better Auth client/server akışına bağlamak
