# Maintenance: Routes Folder Refactor

## Summary

`app/routes` klasoru URL segmentlerini dosya adina gomulu sekilde tasidigi icin zamanla okunmasi zor bir duz listeye donusmustu. Bu bakim calismasinda route entrypoint'leri `auth`, `dashboard`, `locale`, `public` ve `system` klasorlerine ayrildi; URL sozlesmesi ise tek kaynak olarak `app/routes.ts` icinde korunmaya devam etti.

## Changes

- `app/routes.ts` yeni klasor yapisina gore guncellendi.
- Route modulleri sorumluluk alanlarina gore tasindi:
  - `app/routes/auth/*`
  - `app/routes/dashboard/*`
  - `app/routes/dashboard/resources/*`
  - `app/routes/locale/*`
  - `app/routes/public/*`
  - `app/routes/system/*`
- Path'e bagli eski dosya adlari (`dashboard.posts.tsx`, `blog.feed.tsx`, `api.auth.$.ts` gibi) daha okunur modul isimlerine tasindi.
- Route testleri yeni modul patikalarina gore guncellendi.
- Eski `app/routes/blog` ve `app/routes/projects` altindaki anlamsiz `gitkeep` kalintilari temizlendi.

## Outcome

- `app/routes` artik route URL'lerinin degil, uygulama alanlarinin etrafinda gruplanmis durumda.
- Manual route config kullanan projede yeni route eklemek veya mevcut bir route'u bulmak daha hizli hale geldi.
- Dashboard resources gibi nested route'lar ayni klasor altinda birlikte gorunur oldugu icin parent/child sorumluluklari daha kolay izleniyor.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run format:check`

## Roadmap

- Bu calisma roadmap disi bir bakim/refactor gorevidir.
