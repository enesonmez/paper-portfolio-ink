# Maintenance Tsconfig BaseUrl Deprecation

## 1. Ozet

TypeScript 6 ile `compilerOptions.baseUrl` deprecate edildigi icin `tsconfig.json` icindeki `baseUrl` kaldirildi. Bu repoda alias cozumlemesi zaten `paths` altinda explicit `./...` hedefleriyle tanimlandigi icin ek bir migration gerekmedi.

Bu degisiklik, `ignoreDeprecations` ile uyariyi susturmak yerine TypeScript 7 uyumlu kalici bir cozum saglar. Module resolution davranisi `~/*`, `#db/*`, `#root/*` ve `#workers/*` alias'lari uzerinden ayni kalir.

## 2. Dosya Sorumluluklari

- `tsconfig.json`
  - Deprecated `baseUrl` ayarini kaldirir ve alias cozumlemesini yalnizca `paths` ile birakir.
- `docs/lessons.md`
  - TypeScript 6 `baseUrl` migrasyon kararini kaydeder.

## 3. Uygulanan Testler

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run e2e:prepare`
- `npm run e2e`

## 4. Calistirma Ve Dogrulama Komutlari

- `npm run typecheck`
- `npm run test`

## 5. Roadmap Referansi

- Roadmap disi maintenance ve tooling uyumlulugu duzeltmesi.
