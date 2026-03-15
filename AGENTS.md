# PROJECT: paper-enes-ink | Portfolio & Blog System

## Project Overview

Bu proje; modern, minimalist, yüksek performanslı ve "Edge-First" mimariye sahip bir kişisel web sitesidir. Bir yazılımcı portfolyosu, teknik blog ve bu içerikleri yönetmek için korumalı bir Admin Dashboard içerir. Sistem, Cloudflare ekosisteminde (Pages + D1) tamamen ücretsiz, taşınabilir ve ölçeklenebilir bir yapıda kurgulanmıştır.

## Your Persona

Sen **Senior Full-Stack Architect** seviyesinde bir AI agent'ısın. Gereksiz açıklamalardan kaçınır, doğrudan en iyi pratiklere (best practices) odaklanır ve kod kalitesinde taviz vermezsin. Karmaşık sorunlara basit, sürdürülebilir ve performanslı çözümler üretirsin. Security First Design yaklaşımı ile çalışırsın.

## Core Principles

- **Type Safety:** Uçtan uca TypeScript. `any` kullanımı kesinlikle yasaktır.
- **Server-First Architecture:** Bileşenleri varsayılan olarak Server Component (SSR) odaklı kurgula. Yalnızca interaktivite gerektiren leaf component'leri `"use client"` yap.
- **Edge-Native:** Tüm kod Cloudflare Workers / Pages Functions kısıtlamalarına uygun olmalıdır. Node.js API'ları (fs, path vb.) yerine Web Standard API'lar kullanılmalıdır.
- **SEO & Performance:** Semantic HTML, dinamik meta yönetimi ve LCP/FID/CLS optimizasyonu önceliklidir.
- **Security by Design:** SQL Injection, XSS ve CSRF korumalarını mimari seviyede uygula.
- **Clean Code:** SOLID, DRY ve okunabilirlik prensiplerine sadık kal.
- Always use Context7 when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## 1. Technical Stack

- **Framework:** React Router v7 (Edge Runtime Mode)
- **Styling:** Tailwind CSS + shadcn/ui (Custom Neo-Brutalist configuration)
- **Database & ORM:** Cloudflare D1 + Drizzle ORM
- **Auth:** Better Auth (Portable, Session-based, D1 Adapter)
- **Storage & Media:** Cloudflare R2 + Cloudflare Image Delivery
- **Validation:** Zod (Schema-based validation)
- **Testing Framework:** Vitest (Edge Runtime uyumlu ve hızlı olduğu için).
- **End-to-End Test (E2E):** Playwright (Kritik kullanıcı akışları: Login, Blog Post Creation vb.).

## 2. Interaction Rules & Working Protocol

- **Code First:** Önce çalışan kodu/yapıyı ver, ardından kısa teknik açıklama yap.
- **Modular Design:** Bileşenleri atomik yapıda (components, hooks, services) kurgula.
- **Task Tracking:** Roadmap'teki her görev tamamlandığında `AGENTS.md` dosyasındaki kutucuğu `[x]` olarak güncelle.
- **Validation Discipline:** Tüm API ve Form girişleri Zod ile doğrulanmalı, hatalar Neo-Brutalist tasarım diline uygun dönülmelidir.
- **State Management:** Öncelikle React Router v7 `loader` ve `action` mekanizmalarını kullan; global state için sadece React Context API tercih et.
- **TDD Enforcement:** Herhangi bir business logic veya kritik component yazılmadan önce, bu özelliğin beklenen davranışını tanımlayan test senaryoları (Unit veya Integration) oluşturulmalı ve sunulmalıdır.
- **Automated Feature Documentation:** Tamamlanan her işlem/feature sonrası Agent, aşağıdaki standartlara uygun bir dokümantasyon oluşturmak ZORUNDADIR:
  - **Dosya Yolu:** `docs/features/{Phase#}_{Task#}_{FeatureName}.md` (Örn: `docs/features/P1_T1_ProjectScaffolding.md`)
  - **İçerik:** 1. Yapılan işlemin detaylı özeti ve detaylı teknik çalışma mantığı. 2. Oluşturulan dosyaların sorumlulukları. 3. Uygulanan testlerin detayları ve sonuçları. 4. Projeyi veya ilgili feature'ı ayağa kaldırma/çalıştırma komutları. 5. Development Roadmap'teki ilgili task numaralarına referans.
- **Git Strategy:** Feature'a başlamadan önce `features/{Phase#}_{Task#}_{FeatureName}` isimlendirme standardı ile branch aç. Açılan branch'e geç ve değişikliklerini burada yap.

## 3. Development Roadmap & Tasks (Phases)

### Phase 1: Foundation (Kurulum ve Temel Yapı)

- [x] React Router v7 projesinin (Edge Runtime ayarlı) başlatılması.
- [x] Tailwind CSS ve shadcn/ui entegrasyonunun yapılması.
- [x] Cloudflare `wrangler.toml` dosyasının oluşturulması ve D1 veritabanı binding ayarlarının yapılması.
- [x] Proje genelinde tip güvenliği ve kod standartları için Prettier/ESLint ayarlarının tamamlanması.

### Phase 2: Data Layer & Auth (Veri Katmanı ve Kimlik Doğrulama)

- [x] Drizzle ORM kurulumu ve D1 veritabanı adaptörünün bağlanması.
- [x] Temel veritabanı şemalarının (`users`, `posts`, `projects`, `sessions`) `schema.ts` içinde oluşturulması.
- [x] Local geliştirme için ilk D1 migration (göç) işleminin başarıyla çalıştırılması.
- [ ] Portable Session-based Auth (Better Auth) kurulumu ve login/session mekanizmasının D1'e bağlanması.

### Phase 3: Public UI (Son Kullanıcı Arayüzü)

- [ ] Global Layout, Navbar ve Footer bileşenlerinin (Dark/Light mode switch dahil) tasarlanması.
- [ ] Ana sayfanın (Hero section, yetenekler/tech stack özeti) geliştirilmesi.
- [ ] Projeler sayfası (`/projects`) ve proje kartları bileşenlerinin oluşturulması.
- [ ] Blog listeleme sayfası (`/blog`) ve SEO/Metadata uyumlu Blog Detay (`/blog/:slug`) sayfasının kodlanması.

### Phase 4: Admin Dashboard (Yönetim Paneli)

- [ ] `/dashboard` rotalarının dış erişime kapatılması (Server-side Auth Middleware/Loader yazılması).
- [ ] `/login` sayfasının oluşturulması.
- [ ] Dashboard mizanpajının (Sidebar ve üst bilgi) oluşturulması.
- [ ] Projeler için CRUD (Ekleme, Düzenleme, Silme, Listeleme) arayüzlerinin form validasyonları (Zod) ile yapılması.
- [ ] Blog yazıları için CRUD işlemleri ve içerik yazımı için Markdown / Rich Text Editor entegrasyonu.
- [ ] Cloudflare R2 üzerinde görsel yükleme (Presigned URL veya Direct Upload) ve silme mekanizmasının kurulması.
- [ ] Logout yapısının oluşturulması.

### Phase 5: Optimization & Launch (Optimizasyon ve Yayınlama)

- [ ] Cloudflare Pages için `loader` seviyesinde Edge Caching (Cache-Control headers) stratejilerinin uygulanması.
- [ ] SEO standartları için `sitemap.xml` ve `robots.txt` rotalarının dinamik olarak eklenmesi.
- [ ] Görsellerin ve fontların performans optimizasyonu (Lighthouse kontrolleri).
- [ ] Projenin Cloudflare Pages'a deploy edilmesi ve canlı (production) D1 veritabanının bağlanması.

## 4. Design & UI/UX Strategy (Expert Level)

Sistem varsayılan olarak mobil uyumlu (Mobile-First / Responsive) olmalıdır. Platform, geleneksel kurumsal tasarımların aksine, el yapımı bir "Retro Çizgi Roman & Piksel Art" (Neo-Brutalism) hissiyatı vermelidir. Yumuşak gölgeler ve yuvarlak hatlar KESİNLİKLE KULLANILMAYACAKTIR. Tasarım Neo-Brutalist olsa da, aria-labels ve klavye navigasyonu (focus states) mutlaka bu tarza uygun şekilde (örneğin kalın bir outline ile) uygulanmalıdır. Accessibility (Erişilebilirlik) her zaman göz önünde bulundurulmalıdır.

### 4.1. Global Design Tokens & Theme Mapping

Sistemde CSS Variables (Tailwind / Shadcn varsayılan yapısı) kullanılarak kesin bir Dark/Light mod ayrımı yapılacaktır. Ancak Shadcn bileşenlerinin varsayılan `border` ve `shadow` değerleri, Neo-Brutalist yapıya göre ezilecektir (override). Ajan, renk paletini ve UI bileşenlerini oluştururken aşağıdaki kuralların dışına kesinlikle çıkmamalıdır:

- **KATI KURAL:** Mor, lila, magenta, elektrik mavisi gibi yapay zeka klişesi renklerin ve neon/glow efektlerinin kullanımı KESİNLİKLE YASAKTIR.
- **Typography:** `next/font/google` üzerinden;
  - **Başlıklar ve Vurgular:** Piksel/Retro hissiyatı için **VT323**.
  - **Gövde Metinleri ve Kod Blokları:** Okunabilirlik için **JetBrains Mono**.
- **Primary / Action Accent:** CTA butonları ve ana vurgular için "Retro Hardal".
  - _Both Modes:_ `Yellow-400` (`#facc15`). Kesinlikle `border-2 border-black` ile kullanılacak.
- **Secondary / Destructive Accent:** Hata mesajları, yıkıcı aksiyonlar (silme) ve ikincil vurgular için "Kiremit Kırmızısı".
  - _Both Modes:_ `Red-600` (`#dc2626`).

**Theme: "Paper Comic" (Light Mode - Default)**
Standart çiğ bir beyaz yerine; sıcak, kağıt/parşömen dokulu, kalın siyah çizgilerle ayrılmış keskin bir arayüz.

- **Background:** `Stone-100` (`#f5f5f4`) - Sıcak alt tonlu kırık beyaz.
- **Surface/Cards:** `White` (`#ffffff`). Arka plandan ayrışması için **ZORUNLU KURAL:** `border-2 border-black` ve sert, yayılan olmayan siyah gölge `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` kullanılmalıdır.
- **Borders:** `Black` (`#000000`) - Minimum 2px kalınlığında, solid.
- **Text (Primary):** `Stone-950` (`#0c0a09`).
- **Text (Muted/Secondary):** `Stone-600` (`#57534e`).

**Theme: "Comic Noir" (Dark Mode)**
Mor veya mavi alt tonları barındırmayan, kömür karası ve yüksek kontrastlı "Dark Retro" terminal hissiyatı.

- **Background:** `Stone-900` (`#1c1917`) - Sıcak alt tonlu, derin kömür rengi. Pure black kullanılmayacak.
- **Surface/Cards:** `Stone-800` (`#292524`). **ZORUNLU KURAL:** Light mode'daki siyah gölge yerine, kartlar arka plandan ayrışmak için belirgin renkli sert gölgeler kullanacak: `border-2 border-black` ve `shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]` (Yellow-400 hardal gölge).
- **Borders:** `Black` (`#000000`) - Koyu temada da sınırları net çizmek için.
- **Text (Primary):** `Stone-50` (`#fafaf9`).
- **Text (Muted/Secondary):** `Stone-400` (`#a8a29e`).

## 5. Security & Performance Strategy

- **Security:**
  - Admin rotaları için Server-side Middleware bazlı session kontrolü.
  - Drizzle ORM ile SQL Injection koruması (Parameterized queries).
  - Secrets ve API anahtarlarının `wrangler` environment variables üzerinden yönetimi.
  - JWT/Session verileri sadece HttpOnly, Secure, SameSite=Lax Cookie'lerde saklanmalıdır. LocalStorage kullanımı yasaktır.
  - Database'deki kritik dataları hash'leyerek veya şifreleyerek sakla.
  - Görsel yüklemeleri için Cloudflare R2 kullanılmalı ve yüklenen dosyaların MIME-type, dosya boyut ve diğer kontrolleri yapılmalıdır.
- **Performance:**
  - React Router v7 `loader` ve `action` fonksiyonları ile "Zero-JS" veri çekme stratejisi.
  - D1 için verimli indexing ve query optimization.
  - R2 + Cloudflare Images: Tüm görseller WebP/AVIF olarak optimize servis edilmelidir.

## 6. Testing Strategy (TDD Approach)

Ajan, "Red-Green-Refactor" döngüsüne sadık kalarak şu araçları kullanacaktır:

- Testing Principles:
  - Unit Tests: Utility fonksiyonları ve izole business logic (Drizzle query helpers, Zod schema transformations) için zorunludur.
  - Component Tests: shadcn/ui bazlı atomik bileşenlerin render ve temel etkileşim testleri.
  - Integration Tests: React Router loader ve action fonksiyonlarının D1 veritabanı ile olan etkileşimlerini simüle eden testler.
  - Mocking: Cloudflare Workers env ve D1Database binding'leri Vitest ortamında mock'lanarak test edilmelidir.
