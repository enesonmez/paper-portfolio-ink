# Engineering Standards

## Core Principles

- Type Safety: Uçtan uca TypeScript. `any` kullanımı yasaktır.
- Server-First Architecture: Varsayılan yaklaşım SSR/server component mantığıdır; sadece gerekli interaktif leaf bileşenlerde client code yazılır.
- Edge-Native: Kod Cloudflare Workers / Pages Functions kısıtlarına uygun olmalıdır; Web Standard API'lar tercih edilir.
- SEO & Performance: Semantic HTML, dinamik meta yönetimi ve Core Web Vitals optimizasyonu önceliklidir.
- Security by Design: SQL Injection, XSS ve CSRF korumaları mimari seviyede ele alınmalıdır.
- Clean Code: SOLID, DRY ve okunabilirlik ilkeleri zorunludur.
- Vertical Slice Architecture: Feature bazlı katman ayrımı korunmalıdır.
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
- Drizzle ORM ve parametreli sorgular kullanılmalıdır.
- Secrets ve API anahtarları `wrangler` environment variable yapısı ile yönetilmelidir.
- Session verileri yalnızca `HttpOnly`, `Secure`, `SameSite=Lax` cookie'lerde tutulmalıdır; `localStorage` yasaktır.
- Veritabanındaki kritik veriler hash veya encryption yaklaşımı ile korunmalıdır.
- Görsel yüklemelerinde MIME-type, dosya boyutu ve içerik doğrulaması yapılmalıdır.

## Performance Strategy

- Veri akışı mümkün olduğunca React Router `loader` ve `action` ile zero-JS yaklaşımında tasarlanmalıdır.
- D1 sorguları için indeksleme ve query optimization göz önünde bulundurulmalıdır.
- Görseller Cloudflare Images/R2 hattında optimize formatlarla servis edilmelidir.
- Client'a gereksiz paket yüklemelerden kaçın. 
- Projede kullanılmayan kütüphaneleri kaldır.
- LCP/FID/CLS optimizasyonunu her zaman göz önünde bulundur.
- Liste gibi yapılar lazy loading şekilde yüklenmeli.

## Testing Strategy

Red-Green-Refactor döngüsüne sadık kal:

- Unit Tests: Utility fonksiyonları, query helper'lar ve schema dönüşümleri için zorunludur.
- Component Tests: Atomik UI bileşenlerinin render ve temel etkileşim davranışlarını kapsar.
- Integration Tests: Loader/action ile D1 etkileşimini simüle eder.
- Mocking: Cloudflare Workers env ve D1 binding'leri Vitest içinde mock'lanmalıdır.
