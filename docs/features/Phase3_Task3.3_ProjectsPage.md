# Phase 3 Task 3.3 Projects Page

## 1. Yapılan İşlemin Detaylı Özeti ve Teknik Çalışma Mantığı

Bu çalışma ile `/projects` route'u placeholder durumdan çıkarılıp veritabanı destekli public proje vitrini haline getirildi. Amaç, ana sayfadaki neo-brutalist dil ile tutarlı bir public projects experience kurmak, published project kayıtlarını doğrudan D1 üzerinden sunmak ve kullanıcı aşağı indikçe yeni kartları scroll tabanlı lazy loading ile kademeli yüklemekti.

Uygulanan mimari kararlar:

- `app/routes/projects.tsx` artık sadece `meta`, `loader` ve screen delegasyonu yapan ince bir route entrypoint.
- Public projects için ayrı vertical slice açıldı: `app/features/public/projects`.
- İlk yükleme server-side `loader` üzerinden gelir; bu sayede public route ilk HTML içinde gerçek proje kartlarını SSR olarak sunar.
- Sonsuz scroll benzeri kademeli yükleme için ayrı bir resource route eklendi: `app/routes/projects.feed.tsx`.
- Scroll lazy loading, tüm route'u client component'e çevirmeden yalnızca `PublicProjectsFeed` leaf bileşeni içinde `IntersectionObserver + useFetcher.load()` kombinasyonu ile kuruldu.
- Proje verisi doğrudan `projects` tablosundan çekilir ve yalnızca `status = published` kayıtları public sayfaya dahil edilir.
- Kart sıralaması `isFeatured desc`, `sortOrder asc`, `createdAt desc`, `slug asc` olacak şekilde stabil hale getirildi.
- Lazy loading için offset tabanlı sayfalama kullanıldı; portfolyo benzeri düşük hacimli veri seti için bu çözüm hem okunur hem de yeterince pratiktir.

Public sayfa akışı şu şekilde çalışır:

- İlk `loader` çağrısı ilk 6 project kartını ve global istatistikleri döner.
- Eğer devam eden veri varsa `nextPage` değeri set edilir.
- Feed altındaki sentinel görünür olduğunda `PublicProjectsFeed` resource route'a `fetcher.load("/projects/feed?page=N")` çağrısı yapar.
- Dönen yeni kartlar mevcut listeye `slug` bazlı dedupe edilerek eklenir.
- Yeni page yoksa sentinel düşer ve yükleme akışı kapanır.

## 2. Oluşturulan Dosyaların Sorumlulukları

### Route Katmanı

- `app/routes/projects.tsx`: public projects route entrypoint'i, loader delegasyonu ve screen render'ı
- `app/routes/projects.feed.tsx`: scroll lazy loading için resource route loader'ı

### Public Projects Slice

- `app/features/public/projects/public-projects.server.ts`: initial page ve feed page yükleme orkestrasyonu
- `app/features/public/projects/public-projects.shared.ts`: copy, page size, query param ve merge helper sözleşmeleri
- `app/features/public/projects/public-projects-screen.tsx`: hero, stats, empty state ve feed kompozisyonu

### Bileşenler

- `app/features/public/projects/components/public-project-card.tsx`: tekil project kartı, cover image, summary, live/repo CTA'ları
- `app/features/public/projects/components/public-projects-feed.tsx`: scroll-triggered lazy loading leaf component'i

### Server / Domain Katmanı

- `app/lib/projects/projects.server.ts`
  - `listPublicProjectsPage`: published project sayfalarını döner
  - `getPublicProjectsStats`: tüm published project kayıtları için featured/live/total metriklerini üretir
  - mevcut admin odaklı project helper'ları ile aynı domain dosyasında kalır

## 3. Uygulanan Testlerin Detayları ve Sonuçları

Eklenen ve güncellenen testler:

- `tests/unit/public-projects.shared.test.ts`
  - page query normalization helper'ını doğrular
  - feed href builder'ı doğrular
  - lazy-loaded project list merge helper'ının duplicate slug üretmediğini doğrular
- `tests/unit/public-projects.server.test.ts`
  - initial projects loader'ın page data + stats döndürdüğünü doğrular
  - feed loader'ın bağımsız page yüklediğini doğrular
- `tests/unit/projects-route.test.tsx`
  - projects screen'in hero, stats, kartlar ve scroll hint ile render olduğunu doğrular
  - published project yoksa empty state'e düştüğünü doğrular

Toplu doğrulama:

- `npm run typecheck` geçti
- `npm run lint` geçti
- `npm test` geçti
- `npm run build` geçti

## 4. Projeyi veya İlgili Feature'ı Ayağa Kaldırma / Çalıştırma Komutları

```bash
npm install
npm run dev
```

Feature doğrulama komutları:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

İlgili route'lar:

- `/projects`
- `/projects/feed?page=2`

## 5. Development Roadmap Referansı

Bu dokümantasyon aşağıdaki roadmap maddesini kapsar:

- `Phase 3 / Task 3.3`: Projeler sayfası (`/projects`) ve proje kartları bileşenlerinin oluşturulması
