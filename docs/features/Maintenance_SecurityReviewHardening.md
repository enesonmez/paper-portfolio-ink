# Maintenance Security Review Hardening

## 1. Ozet

Mimari guvenlik incelemesinde cikan dort bulgu kapatildi. Logging export ve delete akislarinda artik yalnizca action claim'i yeterli degil; ilgili `read` claim'i de zorunlu. Authorization actor cozumleyicisi DB'yi source-of-truth olarak korurken `authorization_state.revision` uzerinden guvenli cross-request claim cache'i kullanacak sekilde sertlestirildi; role claim veya user override degistiginde migration trigger'lari revision'i artiriyor. Login akisina D1 tabanli rate limit katmani eklendi; email ve istemci IP seviyesinde failure bucket tutuluyor, basarili giriste temizleniyor. Public blog rich text render'inda image kaynaklari da sanitize edilmeye baslandi.

## 2. Dosya Sorumluluklari

- `app/features/dashboard/logging/operations/_shared/authorization.server.ts`
  - Logging export/delete akislarinda `read + action` claim kombinasyonunu zorunlu kilar.
- `app/shared/authz/resolver.server.ts`
  - Yetkileri DB tabanli cozer ve `authorization_state.revision` anahtariyla stale claim cache penceresini kapatir.
- `app/shared/auth/login-rate-limit.server.ts`
  - Login throttle politikalarini, identifier hash uretimini ve D1 persistence akislarini yonetir.
- `app/shared/auth/login.server.ts`
  - Login oncesi throttle kontrolu, failure kaydi ve basari sonrasi throttle cleanup orkestrasyonunu yapar.
- `scripts/seed-e2e.mjs`
  - Tekrar kosulabilir e2e suite icin `login_rate_limits` tablosunu da temizler.
- `app/domain/posts/content.ts`
  - Public post image `src` degerleri icin sanitize helper saglar.
- `app/features/public/blog/post/components/public-blog-post-body.tsx`
  - Sadece sanitize edilmis image kaynaklarini render eder.
- `db/schema.ts`
  - `login_rate_limits` ve `authorization_state` tablolarini schema'ya ekler.
- `db/migrations/0019_security_review_hardening.sql`
  - Login throttle tablosunu ve yeni localization kayitlarini migration ile ekler.
- `db/migrations/0020_authz_revision_cache.sql`
  - Authorization revision tablosunu ve role/override mutasyonlarinda revision artiran trigger'lari ekler.
- `app/shared/i18n/messages.shared.ts`
  - Login rate limit mesaji icin seed translation ekler.
- `tests/unit/shared/auth/login-rate-limit.server.test.ts`
  - Throttle politika davranisini unit seviyede dogrular.
- `tests/integration/shared/auth/login.server.test.ts`
  - Login throttle entegrasyonunu ve erken bloklama davranisini dogrular.
- `tests/unit/shared/authz/authz.server.test.ts`
  - DB mevcutken explicit session claim'lerinin yok sayildigini, revision sabitken cache hit ve revision artinca cache invalidation davranisini sabitler.
- `tests/unit/features/dashboard/logging/mutation-authorization.test.ts`
  - Logging mutation'larinda `read + action` yetki gereksinimini dogrular.
- `tests/integration/features/dashboard/logging.server.test.ts`
  - Action-only logging grant'lerinin artik reddedildigini dogrular.
- `tests/e2e/authorization.spec.ts`
  - Browser seviyesinde logging action-only grant'lerinin reddedildigini dogrular.
- `tests/unit/domain/posts/content.test.ts`
  - Unsafe image source degerlerinin reddedildigini dogrular.
- `tests/unit/db/schema.test.ts`
  - Yeni throttle ve authorization revision tablolarinin schema kontratini dogrular.
- `docs/lessons.md`
  - Bu duzeltmelerden cikan mimari dersleri kaydeder.

## 3. Uygulanan Testler

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`
- `npm run e2e:prepare`
- `npm run e2e`

## 4. Calistirma Ve Dogrulama Komutlari

- `npm run e2e:prepare`
- `npm run test`
- `npm run e2e`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`

## 5. Roadmap Referansi

- Roadmap disi maintenance ve guvenlik sertlestirme duzeltmesi.
