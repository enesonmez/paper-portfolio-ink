# Task 1.1 / 1.3: React Router Cloudflare Foundation Bootstrap

## Kapsam

Bu doküman, `paper-portfolio-ink` projesinde Phase 1 altındaki aşağıdaki görevler için yapılan ilk foundation geliştirmesini özetler:

- `1.1` React Router v7 projesinin Edge Runtime uyumlu şekilde başlatılması
- `1.3` Cloudflare `wrangler.toml` dosyasının oluşturulması ve D1 binding temelinin hazırlanması

Bu çalışma sırasında ayrıca TDD sürecini başlatmak için Vitest tabanı da kurulmuştur.

## Feature Adı

`react-router-cloudflare-foundation-bootstrap`

## Oluşturulan Temel Dosyalar

### Çekirdek konfigürasyon

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `react-router.config.ts`
- `wrangler.toml`
- `.gitignore`

### Uygulama iskeleti

- `app/root.tsx`
- `app/entry.client.tsx`
- `app/entry.server.tsx`
- `app/routes.ts`
- `app/routes/_index.tsx`
- `app/lib/site.ts`
- `app/styles/app.css`

### Test altyapısı

- `tests/setup.ts`
- `tests/unit/site-config.test.ts`
- `tests/unit/home-route.test.tsx`

### Temel klasör yapısı

- `app/components/`
- `app/hooks/`
- `app/services/`
- `app/routes/blog/`
- `app/routes/projects/`
- `app/routes/dashboard/`
- `tests/integration/`
- `public/`
- `db/migrations/`

## Çalışma Mantığı

### 1. React Router v7 iskeleti

Uygulama React Router v7 framework mode mantığıyla kuruldu.

- `app/root.tsx` uygulamanın HTML shell yapısını kurar.
- `Layout` içinde `Meta`, `Links`, `Scripts` ve `ScrollRestoration` kullanılır.
- `Outlet` ile route ağacı render edilir.
- `ErrorBoundary` ile ilk hata sınırı eklenmiştir.

### 2. Client ve server entry mantığı

- `app/entry.client.tsx` tarafında `HydratedRouter` ile hydration başlatılır.
- `app/entry.server.tsx` tarafında `renderToReadableStream` kullanılarak SSR response üretilir.
- Bu yapı Cloudflare/edge uyumlu SSR akışına uygun temel başlangıçtır.

### 3. Route çözümleme

- `app/routes.ts` içinde `flatRoutes()` kullanıldı.
- Bu sayede `app/routes/` altındaki dosyalar route kaynağı olarak çözümlenir.
- İlk route olarak `app/routes/_index.tsx` eklendi.

### 4. İlk sayfa ve içerik modeli

Ana sayfa şu amaçlarla hazırlandı:

- app shell’in düzgün render edildiğini görmek
- route çözümlemesini doğrulamak
- ileride gelecek `/projects` ve `/blog` navigasyonunu erken yerleştirmek

`app/lib/site.ts` içinde merkezi `siteConfig` tanımlandı. Başlık, locale ve açıklama gibi metadata değerleri tek noktadan yönetiliyor.

### 5. Stil yaklaşımı

Henüz Tailwind/shadcn entegrasyonu yapılmadı. Bu görev bir sonraki adıma bırakıldı.

Bu aşamada:

- `app/styles/app.css` ile geçici ama çalışan bir temel stil katmanı kuruldu
- Neo-brutalist yönü destekleyen sert border ve sert shadow kullanıldı
- light/dark farkı CSS custom properties ile kuruldu

Amaç, tasarım sisteminin nihai halini değil, foundation katmanının sağlam çalışmasını doğrulamaktı.

### 6. Cloudflare yapılandırması

`wrangler.toml` içinde:

- Worker adı tanımlandı
- build sonrası server entry `main` olarak ayarlandı
- client build çıktısı için `assets` binding eklendi
- `DB` isimli D1 binding tanımlandı

Not:

- `database_id` ve `preview_database_id` şu anda placeholder değerlerdir
- gerçek D1 kaynakları oluşturulduğunda bu alanlar güncellenmelidir

### 7. TDD yaklaşımı

İş mantığı küçük de olsa önce test tabanı kuruldu.

Bu aşamada yazılan testler:

- `siteConfig` içindeki minimum marka/metadata değerlerinin varlığını doğrular
- ana sayfanın başlık ve temel navigasyon linklerini render ettiğini doğrular

Bu yaklaşımın amacı:

- foundation katmanında kırılmaları erken yakalamak
- sonraki feature’lar için test disiplinini baştan yerleştirmek

## Yapılan Testler

### Unit testler

`tests/unit/site-config.test.ts`

- locale bilgisini doğrular
- uygulama adını doğrular
- title ve description alanlarının beklenen içerikleri taşıdığını doğrular

`tests/unit/home-route.test.tsx`

- ana sayfa başlığını doğrular
- `/projects` linkini doğrular
- `/blog` linkini doğrular

### Çalıştırılan doğrulama komutları

```bash
npm test
npm run typecheck
```

Sonuç:

- testler geçti
- TypeScript typecheck geçti

## Projeyi Ayağa Kaldırma Komutları

### İlk kurulum

```bash
npm install
```

### Geliştirme ortamı

```bash
npm run dev
```

### Build alma

```bash
npm run build
```

### Build sonrası local preview

```bash
npm run preview
```

### Test çalıştırma

```bash
npm test
```

### Watch modunda test

```bash
npm run test:watch
```

### Type check

```bash
npm run typecheck
```

## Bu Geliştirmenin Sınırları

Henüz tamamlanmayan foundation maddeleri:

- `1.2` Tailwind CSS ve shadcn/ui entegrasyonu
- `1.4` ESLint ve Prettier standartlarının eklenmesi

Yani bu geliştirme, tam UI sistemi kurulumundan önce gelen çalışan temel iskelet adımıdır.

## İlgili Dosyalar

- `package.json`
- `wrangler.toml`
- `app/root.tsx`
- `app/entry.client.tsx`
- `app/entry.server.tsx`
- `app/routes/_index.tsx`
- `tests/unit/site-config.test.ts`
- `tests/unit/home-route.test.tsx`
