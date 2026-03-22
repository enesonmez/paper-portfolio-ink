# Maintenance: Feature Structure Refactor

## Summary

`app/features/*` altindaki yapida iki farkli kavram ayni katmanda bulunuyordu: gercek route slice'lari ve domain kontrat dosyalari. Bu refactor ile domain kontratlari `app/domain/*` altina tasindi, feature slice dosya adlari kisaltildi ve buyumeye egilimli `shared/constants` dosyalari davranisa gore parcalandi.

## Goals

- `app/features/*` altinda yalnizca route ve ekran slice'larini birakmak
- Top-level domain kontratlarini `app/domain/*` altina tasimak
- Slice klasoru zaten baglam verdigi icin tekrar eden `dashboard-posts-*`, `public-home-*`, `login-*` gibi dosya adlarini sadeleştirmek
- `shared.ts` ve `constants.ts` dosyalarini `copy.ts`, `feed.ts`, `theme.ts`, `routing.ts`, `href.ts`, `state.ts` gibi daha net modullere ayirmak

## Structural Changes

### Domain Boundary

- `app/features/posts|projects|users|skills|resources` altindaki kontratlar `app/domain/*` altina tasindi.
- Feature slice'lar domain sabitlerini artik `~/domain/*` uzerinden tuketiyor.

### Slice Naming

- Feature klasorlerindeki ana dosyalar `route.tsx`, `screen.tsx`, `server.ts`, `copy.ts`, `state.ts` adlarina cekildi.
- Bu desen auth, dashboard ve public alanlarda tutarli hale getirildi.

### Shared File Splits

- `public/blog` icinde copy ile feed/cursor mantigi ayrildi.
- `public/projects` icinde copy ile feed/cursor mantigi ayrildi.
- `public/layout` icinde copy, theme ve routing sorumluluklari ayrildi.
- `dashboard/layout` icinde navigation ile copy sorumluluklari ayrildi.
- `dashboard/resources` icinde query-string/href sozlesmesi `href.ts`, form ve loader state orkestrasyonu `state.ts` icine ayrildi.

## Outcome

- `features` klasoru artik daha net bir vertical slice agaci veriyor.
- Domain kontratlari ve app-wide shared moduller feature klasorunden ayrildigi icin sinirlar daha okunur hale geldi.
- Query-string agir ekranlarda href/state ayrimi, yeni filtre ve modal aksiyonlari eklerken drift riskini azaltti.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
