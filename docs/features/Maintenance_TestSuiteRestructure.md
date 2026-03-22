# Maintenance: Test Suite Restructure

## Ozet

Bu bakim calismasinda test klasor yapisi yeniden duzenlendi. `tests/unit` altindaki dosyalar uygulama mimarisi ile hizali `app`, `components`, `db`, `domain`, `features`, `lib`, `shared` ve `workers` slice'larina tasindi. Route wrapper, loader/action orkestrasyonu ve cache/db/auth bagimli senaryolar ise `tests/integration` altina ayrildi.

Ayrica feature bazli eksik kapsama icin yeni testler eklendi:

- auth login state helper'lari
- dashboard layout navigation helper'i
- dashboard posts/users/skills/resources state ve href helper'lari
- public blog/home/projects cache helper'lari
- public layout routing helper'i
- public blog not-found error kontrati
- domain user/resource/skill/post/project form-model kontratlari
- shared session-user ve `cn` utility helper'lari
- public theme normalize helper'i
- auth, dashboard, locale ve public route wrapper delegasyonlari

Tum yeni testler mevcut yaklasim korunarak sadece mock tabanli yazildi; gercek DB, auth veya network kullanilmadi.

## Degisen Dosya Sorumluluklari

- `tests/unit/**`: saf helper, parser, shared utility, UI primitive ve izole component testleri
- `tests/integration/routes/**`: route module delegasyonu, route-level render ve action/loader wrapper testleri
- `tests/integration/features/**`: feature server orkestrasyonu ve coklu bagimlilikli mock senaryolari
- `tests/integration/shared/**`: feature-disi fakat request-level orkestrasyon yapan shared auth testleri
- `tsconfig.json`, `vitest.config.ts`: yeni test klasor yapisinda okunabilir importlar icin test dostu alias genisletmeleri

## Uygulanan Testler

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run format:check`

Son durumda test suiti `82` test dosyasi ve `226` test ile temiz geciyor.

## Dogrulama Komutlari

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

## Roadmap Referansi

Bu calisma roadmap uzerinde yeni bir checkbox kapatmayan bakim/refactor gorevidir. Icerik olarak `Phase 6` test ve kalite hattina hazirlik kapsamiyla hizalidir.
