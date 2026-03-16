# Phase 4 / Task 4.3 - Dashboard Layout

## Summary

Bu feature ile `/dashboard` parent route'u yalnızca auth guard olmaktan çıkarılıp tam bir admin shell'e dönüştürüldü. Yeni yapı; solda kalıcı sidebar, üstte sticky status header ve ortada child route içerik alanı olacak şekilde kuruldu. Layout, mevcut `requireSession()` guard'ını korur ve oturum çözümünden elde edilen kullanıcı özetini shell içinde gösterilecek sade bir view model'e dönüştürür. Son iterasyonda sidebar menüleri `lucide-react` ikonlarıyla güncellendi ve mobil ekranlarda sidebar, açılır/kapanır drawer davranışına taşındı.

UI dili, proje genelindeki Neo-Brutalist "Paper Comic / Comic Noir" token'larına sadık kalacak şekilde yeniden kurgulandı. Referans tasarımdaki sert kenarlar, sert gölgeler, hardal accent ve kömür dark mode kontrastı uygulandı; ancak typography tarafında AGENTS kurallarına bağlı kalınarak başlıklarda `VT323`, gövde ve kontrol metinlerinde `JetBrains Mono` kullanıldı.

## Technical Flow

1. `/dashboard` isteği parent `loader` içine girer.
2. `requireSession()` server-side session doğrulamasını yapar.
3. Session geçerliyse loader, kullanıcı verisini layout için uygun hafif bir modele dönüştürür.
4. `DashboardLayout` sidebar, header ve `<Outlet />` alanını render eder.
5. `dashboard._index.tsx` ilk overview ekranını; stats kartları, içerik yönetim tablosu ve activity/log kartlarıyla doldurur.

Bu yapı sayesinde sonraki CRUD route'ları aynı shell içinde yalnızca child route olarak eklenebilir.

## Files And Responsibilities

### `/app/routes/dashboard.tsx`

- Parent auth loader'ı içerir.
- Session sonucunu shell dostu `user` view model'ine dönüştürür.
- `lucide-react` tabanlı sidebar navigation, responsive drawer toggle, disabled logout placeholder ve sticky top header'ı render eder.
- Child dashboard route'ları için ortak layout boundary sağlar.

### `/app/routes/dashboard._index.tsx`

- Dashboard ana overview ekranını üretir.
- Stats kartları, manage content tablosu ve logs paneli için başlangıç dummy içeriğini taşır.
- Phase 4.4 ve 4.5'te gelecek CRUD akışları için görsel iskelet sağlar.

### `/tests/unit/dashboard-guard.test.ts`

- Parent loader'ın auth guard'ı çalıştırdığını ve artık kullanıcı özetini döndürdüğünü doğrular.

### `/tests/unit/dashboard-layout.test.tsx`

- Dashboard shell'in sidebar, header, kullanıcı bölümü, responsive menu toggle ve child content alanını render ettiğini doğrular.

### `/tests/unit/dashboard-index.test.tsx`

- Dashboard overview ekranının ana bilgi bloklarını render ettiğini doğrular.

## Tests And Validation

Geliştirme TDD yaklaşımıyla ilerledi:

1. Önce dashboard shell için render beklentileri yazıldı.
2. Guard loader testinde yeni `user` payload beklentisi tanımlandı.
3. Layout ve index ekranı bu kontratı karşılayacak şekilde implemente edildi.
4. Son aşamada format/lint/typecheck hattı temizlendi.

Çalıştırılan komutlar:

```bash
npm test -- dashboard-guard dashboard-layout dashboard-index
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Run The Feature

Dashboard shell'i lokal ortamda görmek için:

```bash
npm run dev
```

Ardından geçerli bir admin oturumuyla:

```bash
http://localhost:5173/dashboard
```

Test kullanıcısı gerekiyorsa:

```bash
npm run db:seed:test-user
```

## Roadmap Reference

- Phase 4
- Task 4.3
- İlgili roadmap maddesi: `Dashboard mizanpajının (Sidebar ve üst bilgi) oluşturulması`
