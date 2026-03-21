# Maintenance - Public Header Active Nav

## 1. Ozet ve Teknik Calisma Mantigi

Public layout header icinde `Home` nav item'i `NavLink` varsayilan prefix-match davranisi nedeniyle `/projects` gibi alt rotalarda da aktif gorunuyordu. Cozum olarak ana sayfa linki exact-match olacak sekilde `end` ile sinirlandi. Boylece `Projects` aktifken sari underline yalnizca ilgili sekmede kalir.

Bu degisiklik mevcut locale-aware path uretimi ile uyumlu tutuldu. Header, ana sayfa path'ini `navItems[0].to` uzerinden okuyup yalnizca bu item icin `end` uygular; `blog` gibi alt-path bekleyen linkler prefix-match davranisini korur.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `app/features/public/layout/components/public-site-header.tsx`
  Public header nav item render akisini gunceller ve `Home` linkini exact-match yapar.
- `tests/unit/public-site-layout.test.tsx`
  `/projects` rotasinda `Home` linkinin aktif olmamasi ve `Projects` linkinin aktif kalmasi davranisini testle kilitler.
- `docs/lessons.md`
  Public navigasyonda root link active-state tuzagini ve korunacak cozum desenini kaydeder.

## 3. Uygulanan Testler ve Sonuclari

- `npm test -- --run tests/unit/public-site-layout.test.tsx`
  Basarili. 1 test dosyasi ve 3 test gecti.
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
npm test -- --run tests/unit/public-site-layout.test.tsx
npm test
npm run typecheck
npm run lint
npm run format:check
```

## 5. Roadmap Referansi

- Roadmap disi bakim bugfix'i. `docs/roadmap.md` icinde dogrudan bir task referansi yok.
