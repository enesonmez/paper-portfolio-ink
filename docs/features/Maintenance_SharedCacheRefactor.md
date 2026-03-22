# Maintenance - Shared Cache Refactor

## 1. Ozet ve Teknik Calisma Mantigi

`app/lib/cache` altindaki cache modulleri generic yardimci fonksiyonlardan daha fazlasini yapiyordu. Bu katman, worker load context tarafinda Cloudflare cache store adapter'ini bagliyor, node runtime icin process-memory fallback'i secip birden fazla feature tarafinda ortak `loadCachedData` / `invalidateCachedData` facade'i sagliyordu.

Bu nedenle cache modulleri `app/shared/cache` altina tasindi. Boylece app-wide infrastructure olan cache contracts, adapter'lar ve facade ayni yatay katmanda toplandi; feature slice'lar ise cache'i bir altyapi servisi gibi kullanmaya devam etti.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `app/shared/cache/contracts.ts`
  Cache arayuzleri ve write option kontratlarini tasir.
- `app/shared/cache/adapters/cloudflare-data-cache.server.ts`
  Cloudflare Cache API adaptasyonunu tasir.
- `app/shared/cache/adapters/memory-data-cache.server.ts`
  Node runtime icin process-memory fallback adaptasyonunu tasir.
- `app/shared/cache/data-cache.server.ts`
  App cache facade'ini, runtime fallback secimini ve typed load/invalidate helper'larini tasir.
- `app/env.server.ts`
  `AppLoadContext.cache` tipini yeni `shared/cache` kaynagina baglar.
- `workers/load-context.ts` ve `workers/cache-store.ts`
  Worker tarafindaki cache store wiring'ini yeni konuma gore gunceller.
- `app/shared/i18n/i18n.server.ts` ve public feature server modulleri
  Cache facade importlarini yeni konuma gore kullanir.
- `tests/unit/data-cache.server.test.ts` ve `tests/unit/app-load-context.test.ts`
  Yeni cache modulu konumuna gore guncellenir.
- `docs/lessons.md`
  Shared cache altyapisi ile ilgili yeni ders eklenir.

## 3. Uygulanan Testler ve Sonuclari

- `npm test`
  Basarili.
- `npm run typecheck`
  Basarili.
- `npm run lint`
  Basarili.
- `npm run format:check`
  Basarili.

## 4. Dogrulama / Calistirma Komutlari

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

## 5. Roadmap Referansi

- Roadmap disi mimari bakim refactor'u. `docs/roadmap.md` icinde dogrudan bir task referansi yok.
