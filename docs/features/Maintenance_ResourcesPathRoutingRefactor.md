# Maintenance: Resources Path Routing Refactor

## Summary

`/dashboard/resources` altindaki locale ve translation gorunumleri query param tab modeliyle yonetiliyordu. Bu refactor ile ekran `path-first` bir yapiya tasindi ve route agaci `resources -> index -> locales -> translations` seklinde duzenlendi.

## Changes

- Parent route `app/routes/dashboard.resources.tsx` loader/action sahibi layout route olarak korundu.
- Yeni child route'lar eklendi:
  - `app/routes/dashboard.resources._index.tsx`
  - `app/routes/dashboard.resources.locales.tsx`
  - `app/routes/dashboard.resources.translations.tsx`
- Child route'larin yalnizca dosya olarak eklenmesi yeterli olmadi; proje `app/routes.ts` ile manuel route config kullandigi icin `resources` altindaki nested path'ler ayni agaca explicit olarak kaydedildi.
- Child route'lara tasinan locale ve translation ekranlarindaki `POST` mutation formlari da mevcut child path'e submit oldugu icin, `index`, `locales` ve `translations` route modullerine shared resources action delegation'i eklendi; aksi halde create/update/delete akislari action'i olmayan leaf route'a gidip 404 uretiyordu.
- `app/features/dashboard/resources` yapisi `layout`, `locales` ve `translations` klasorlerine ayrildi.
- Query-string sozlesmesinde `tab` ana state kaynagi olmaktan cikartildi.
- `translationLocale`, `translationPage`, `translationSearch`, `modal` ve edit parametreleri sadece ikincil view state olarak query'de kaldi.
- `index` route artik redirect etmiyor; dogrudan locale ekranini render ediyor.
- Dashboard sidebar active-state davranisi nested resources path'lerinde dogru calisacak sekilde guncellendi.

## Outcome

- Navigation state URL path'te gorunur hale geldi.
- `locales` ve `translations` ekranlari kendi path'leri altinda ayrildigi icin loader/action layout'u ile ekran sorumluluklari daha temiz sinirlandi.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
