# Maintenance - Mobile Locale Switcher Placement

## 1. Ozet ve Teknik Calisma Mantigi

Public header'a eklenen locale switcher dar mobil genisliklerde logo metninin alanini daraltip ustuste binme etkisi olusturuyordu. Cozum olarak locale switcher masaustunde header satirinda birakildi, mobilde ise ust satirdan alinip hamburger menu panelinin icine tasindi.

Bu yaklasim locale degistirme ozelligini mobilde korurken header'in birincil gorevi olan brand ve temel aksiyon gorunurlugunu sabit tuttu. Ayrica `LocaleSwitcher` bilesenine `className` destegi eklenerek ayni server-first davranis farkli konteynerlerde tekrar kullanilabilir hale getirildi.

## 2. Degistirilen Dosyalar ve Sorumluluklari

- `app/features/i18n/components/locale-switcher.tsx`
  Locale switcher kapsayicisina `className` destegi ekler.
- `app/features/public/layout/components/public-site-header.tsx`
  Locale switcher'i masaustunde header satirinda, mobilde menu panelinde render eder.
- `tests/unit/public-site-layout.test.tsx`
  Locale action davranisini duplicate button senaryosuna gore gunceller ve mobil menu icinde locale switcher varligini test eder.
- `docs/lessons.md`
  Mobil header utility yerlesimiyle ilgili korunacak tasarim dersini ekler.

## 3. Uygulanan Testler ve Sonuclari

- `npm test -- --run tests/unit/public-site-layout.test.tsx`
  Basarili. 1 test dosyasi ve 4 test gecti.
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
