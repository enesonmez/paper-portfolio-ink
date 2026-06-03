# Maintenance CSRF Mutation Guards

## Ozet

Bu calisma, `Maintenance_SecurityAuditChecklist.md` icindeki `SEC-02` bulgusunu kapatir. Cookie tabanli mutation girisleri icin ortak same-origin guard'i eklendi; route wrapper'lari `request.formData()` veya feature mutasyonlarindan once `Origin`/`Referer` ve `sec-fetch-site` kontrollerini uygular hale getirildi. Boylece dashboard ve public POST akislarinin guvenligi yalnizca `SameSite=Lax` davranisina birakilmadi.

## Degisen Dosyalar

- `app/shared/security/csrf.server.ts`
  - Mutation request'leri icin ortak same-origin guard'i tanimlar.
- `app/routes/auth/login.tsx`
  - Login action'ina same-origin guard ekler.
- `app/routes/auth/logout.tsx`
  - Logout action'ina same-origin guard ekler.
- `app/routes/system/api-auth.ts`
  - Better Auth mutation endpoint'lerini route seviyesinde same-origin guard altina alir.
- `app/routes/public/theme.tsx`
  - Theme mutation'i body parse oncesi guard eder.
- `app/routes/locale/action.tsx`
  - Locale switch mutation'ini body parse oncesi guard eder.
- `app/routes/public/blog/track.ts`
  - Tracking action girisini ortak guard ile korur.
- `app/routes/dashboard/*.tsx`
  - Posts, projects, skills, users, settings, logging ve resources action girislerine ortak guard ekler.
- `app/features/public/blog/tracking/server.ts`
  - Blog tracking feature'i ayni shared guard'i kullanacak sekilde normalize edilir.
- `tests/unit/shared/security/csrf.server.test.ts`
  - Origin, referer fallback ve rejection kontratlarini sabitler.
- `tests/integration/routes/auth/modules.test.ts`
- `tests/integration/routes/public/modules.test.ts`
- `tests/integration/routes/locale/modules.test.ts`
- `tests/integration/routes/dashboard/modules.test.ts`
  - Route wrapper seviyesinde basarisiz same-origin dogrulamalarinin feature handler'lari blokladigini kanitlar.
- `docs/features/Maintenance_SecurityAuditChecklist.md`
  - `SEC-02` bulgusunu resolved olarak gunceller.
- `docs/lessons.md`
  - Mutation route guard'larini kalici security dersi olarak kaydeder.

## Testler

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## Dogrulama

1. Dashboard ve public POST route'larina `Origin` olmadan istek gonderildiginde 403 hata kontratinin dondugunu dogrula.
2. Ayni route'lara dogru `Origin` veya ayni-origin `Referer` ile istek gonderildiginde feature handler'larin normal calistigini dogrula.
3. Blog tracking dahil tum mutation route'larinin body parse veya mutasyon oncesi ortak guard'dan gectigini kod uzerinden dogrula.
4. Tam proje dogrulama zincirinin yesil gectigini dogrula.

## Roadmap Referansi

Roadmap disi maintenance guvenlik sertlestirmesi. Kaynak bulgu: `docs/features/Maintenance_SecurityAuditChecklist.md` icindeki `SEC-02`.
