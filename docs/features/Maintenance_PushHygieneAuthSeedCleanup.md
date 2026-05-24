# Maintenance Push Hygiene Auth Seed Cleanup

## 1. Ozet

Push oncesi repo hijyen taramasinda iki ana risk duzeltildi. `shared/auth` icindeki runtime config artik hicbir ortamda kod tabanli fallback secret kullanmiyor; `BETTER_AUTH_SECRET` veya `AUTH_SECRET` tanimlanmadiysa uygulama acik bir hata ile duruyor. Local development de bu kontrata dahil edildi ve auth secret'i gitignore altindaki gercek `.env` dosyasindan saglanir hale getirildi. Boylece public repoda gorunen bir development secret'in ya da runtime fallback'inin yanlislikla calisan ortama tasinmasi tamamen engellendi.

Test ve seed tarafinda da credential yuzeyi daraltildi. `.env.example` icindeki gercek gorunumlu secret placeholder'a cevrildi, e2e ve test-user seed script'lerindeki daginik sabit parolalar tek noktalı local-only fixture pattern'ine cekildi ve `seed-test-user` cikti log'undan parola kaldirildi.

## 2. Dosya Sorumluluklari

- `app/shared/auth/auth-config.server.ts`
  - Runtime auth secret'i tum ortamlarda environment kontrati ile zorunlu kilar.
- `.env.example`
  - Local kurulum icin sanitize edilmis auth secret placeholder'i sunar.
- `.env`
  - Gitignore altinda kalan yerel auth secret ve base URL ayarlarini tasir.
- `scripts/seed-e2e.mjs`
  - E2E fixture kullanicilari icin local-only parola cozumlemesini merkezilestirir.
- `scripts/seed-test-user.mjs`
  - Test user seed'inde local-only varsayilan parola kullanir ve parola loglamazini kaldirir.
- `tests/e2e/support/constants.ts`
  - Playwright fixture credential cozumlemesini seed script ile ayni kontratta tutar.
- `tests/unit/shared/auth/auth-config.server.test.ts`
  - Eksik auth secret durumunda beklenen hata davranisini dogrular.
- `docs/lessons.md`
  - Push hijyeni ve auth/fixture credential derslerini kaydeder.

## 3. Uygulanan Testler

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run e2e:prepare`
- `npm run e2e`

## 4. Calistirma Ve Dogrulama Komutlari

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run e2e:prepare`
- `npm run e2e`

## 5. Roadmap Referansi

- Roadmap disi maintenance ve push hijyeni duzeltmesi.
