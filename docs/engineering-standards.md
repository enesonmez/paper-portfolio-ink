# Engineering Standards

## Core Principles

- Type Safety: Uçtan uca TypeScript. `any` kullanımı yasaktır.
- Server-First Architecture: Varsayılan yaklaşım SSR/server component mantığıdır; sadece gerekli interaktif leaf bileşenlerde client code yazılır.
- Edge-Native: Kod Cloudflare Workers / Pages Functions kısıtlarına uygun olmalıdır; Web Standard API'lar tercih edilir.
- SEO & Performance: Semantic HTML, dinamik meta yönetimi ve Core Web Vitals optimizasyonu önceliklidir.
- Security by Design: SQL Injection, XSS ve CSRF korumaları mimari seviyede ele alınmalıdır.
- Clean Code: SOLID, DRY ve okunabilirlik ilkeleri zorunludur.
- Vertical Slice Architecture: Feature bazlı katman ayrımı korunmalıdır.
- **Dikey Dilim Modül Standartları**: Her dikey dilim (slice) klasörü şu rol bazlı dosyalardan oluşmalıdır:
  - `server.ts`: Rota loader ve action isteklerini karşılayan ince orkestrasyon dosyası.
  - `loader.server.ts`: Sadece loader veri çekme mantığı.
  - `actions.server.ts`: Action dispatch mantığı ve parser doğrulamaları.
  - `operations/*`: İzole CRUD, veri persistence ve iş mantığı helper'ları.
  - `screen.tsx`: Props kabul eden, router hook'larından (`useLoaderData`, `useActionData`) tamamen bağımsız, unit test edilebilir **saf sunum (presentational)** bileşeni.
  - `copy.ts` & `state.ts`: Yerelleştirilmiş metinler ve form durum tanımları.
- **TS 6 Path Normalization**: TypeScript 6 standartlarıyla `baseUrl` kaldırıldığı için, projede path alias tanımları yapılırken explicit `./` ön eki zorunludur (Örn: `"~/shared/*": ["./app/shared/*"]`).
- Code First: Önce çalışan kodu veya yapıyı üret, ardından kısa teknik açıklama ver.
- Modular Design: Bileşenleri atomik ve sorumluluk odaklı kur; `components`, `hooks`, `services` gibi ayrımları net tut.
- Validation Discipline: Tüm API ve form girişlerini Zod ile doğrula; hata durumlarını tasarım diline uygun döndür.
- State Management: Öncelik React Router v7 `loader` ve `action`; global state gerektiğinde sadece React Context API kullan.
- TDD Enforcement: Business logic veya kritik component yazılmadan önce beklenen davranışı tanımlayan test senaryolarını üret.

## Technical Stack

- Framework: React Router v7 (Edge Runtime Mode)
- Styling: Tailwind CSS + shadcn/ui (Custom Neo-Brutalist configuration)
- Database & ORM: Cloudflare D1 + Drizzle ORM
- Auth: Better Auth (Portable, Session-based, D1 Adapter)
- Storage & Media: Cloudflare R2 + Cloudflare Image Delivery
- Validation: Zod
- Testing: Vitest
- E2E: Playwright

## Security Strategy

- OWASP Top 10, CWE Top 25, ASVS standartlarını göz önünde bulundurarak kod yaz.
- Admin rotaları server-side middleware veya loader tabanlı session kontrolü ile korunmalıdır.
- **Multi-Claim Yetki Denetimi**: Hassas veri indirme/silme (export/delete) veya audit işlemlerinde sadece mutation yetkisi (`logs.manage`) yeterli sayılmamalı; ilgili okuma yetkisi (`logs.read`) de loader/action seviyesinde aynı anda aranmalıdır.
- Drizzle ORM ve parametreli sorgular kullanılmalıdır.
- Secrets ve API anahtarları `wrangler` environment variable yapısı ile yönetilmelidir. Geliştirme ve prod ortamlarındaki tüm sırlar `.env` veya `.dev.vars` dosyalarından okunmalı, yerel fallback şemaları kullanılmamalıdır.
- Session verileri yalnızca `HttpOnly`, `Secure`, `SameSite=Lax` cookie'lerde tutulmalıdır; `localStorage` yasaktır.
- Veritabanındaki kritik veriler hash veya encryption yaklaşımı ile korunmalıdır.
- **Strict HTTPS URL Validasyonu**: Kullanıcı girdilerinden alınan dış bağlantı URL'leri doğrulanırken `javascript:` tabanlı XSS açıklarını önlemek için protokolün explicit `https://` ile başladığı Zod seviyesinde garanti edilmelidir.
- **Veritabanı Destekli Rate Limiting**: Kimlik doğrulama gibi brute-force hedeflerinde D1 SQLite veritabanı destekli, failure-bucket mantığına dayanan ve IP ile e-posta adresi bazlı rate-limiting mekanizması uygulanmalıdır.
- Görsel yüklemelerinde MIME-type, dosya boyutu ve içerik doğrulaması yapılmalıdır.

## Performance Strategy

- Veri akışı mümkün olduğunca React Router `loader` ve `action` ile zero-JS yaklaşımında tasarlanmalıdır.
- D1 sorguları için indeksleme ve query optimization göz önünde bulundurulmalıdır.
- Composite index'ler, gerçekte kullanılan `WHERE` + `ORDER BY` + cursor alanları ile birebir hizalanmalıdır; aksi halde SQLite temp B-tree kurar. Composite index sıralama ve yönü SQL ifadesiyle tam uyumlu olmalıdır.
- Büyük listelerde `OFFSET` yerine mümkün olduğunca keyset/cursor pagination tercih edilmelidir.
- **Drizzling Dynamic Queries**: Alt sorgulardan (CTE) gelen dinamik aggregasyon değerlerine göre filtreleme ve sıralama yaparken Drizzle dynamic query builder'ın `.$dynamic()` metodu kullanılmalıdır.
- **Upsert Tercihi**: Veritabanı roundtrip sayısını azaltmak için `select -> update/insert` döngüsü yerine tek adımda atomik işlem yapan `ON CONFLICT DO UPDATE` yapıları tercih edilmelidir.
- **Custom Light SVG Charts**: Edge kısıtlarına uygun, neo-brutalist tasarımla uyumlu custom SVG grafik bileşenleri kullanılarak harici kütüphane bağımlılığı azaltılmalıdır.
- Liste ve feed sorgularında tam rich-content kolonları taşınmamalı; özet/list read-model'leri ile edit/detail read-model'leri ayrılmalıdır.
- Sık çalışan `count(*)` veya operasyonel toplamlar her request'te yeniden hesaplanmamalı; uygun TTL cache ve write-side invalidation ile yönetilmelidir.
- N+1 problemine dikkat edilmelidir.
- Görseller Cloudflare Images/R2 hattında optimize formatlarla servis edilmelidir.
- Client'a gereksiz paket yüklemelerden kaçın.
- Projede kullanılmayan kütüphaneleri kaldır.
- LCP/FID/CLS optimizasyonunu her zaman göz önünde bulundur.
- Liste gibi yapılar lazy loading şekilde yüklenmeli.

## Testing Strategy

TDD prensibi ile Red-Green-Refactor döngüsüne sadık kal:

- Unit Tests: Utility fonksiyonları, query helper'lar ve schema dönüşümleri için zorunludur.
- Component Tests: Atomik UI bileşenlerinin render ve temel etkileşim davranışlarını kapsar.
- Integration Tests: Loader/action ile D1 etkileşimini simüle eder.
- **Integration Test Actor Rules**: Rol ve claim doğrulamalarında yetkisiz erişim yollarını test ederken, default rollerin getirdiği yan etkileri önlemek adına test aktörleri `role: "guest"` gibi tamamen claimsiz rollerle mock'lanmalıdır.
- **Mocking Sınırları**: Route wrapper testlerinde sadece delegasyon doğrulanmalı; asıl business doğrulamaları feature/shared server testlerinde, `vi.mock` sınırları iyi izole edilmiş entegrasyon testleriyle yapılmalıdır.
- E2E Tests: Feature kapsamında tüm case'ler için e2e testler koşulmalı.
- **Playwright E2E Personas & Serial Execution**: Playwright testlerinde SQLite D1 concurrent locking (çakışma) hatalarını önlemek için testler serial (ardışık) koşturulmalı ve farklı yetkilere sahip personaların (Guest, Author, Admin) çerez oturum durumları izole edilmelidir.
- Mocking: Cloudflare Workers env ve D1 binding'leri Vitest içinde mock'lanmalıdır.
