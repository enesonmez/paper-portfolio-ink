# Development Roadmap

## Phase 1: Foundation

- [x] React Router v7 projesinin (Edge Runtime ayarlı) başlatılması.
- [x] Tailwind CSS ve shadcn/ui entegrasyonunun yapılması.
- [x] Cloudflare `wrangler.toml` dosyasının oluşturulması ve D1 veritabanı binding ayarlarının yapılması.
- [x] Proje genelinde tip güvenliği ve kod standartları için Prettier/ESLint ayarlarının tamamlanması.
- [ ] E2E testler için playwrigt entegrasyonunun yapılması.
- [x] i18n altyapısını kur. DB merkezli olsun. Proje ayağa kalkarken cache'e alsın.

## Phase 2: Data Layer & Auth

- [x] Drizzle ORM kurulumu ve D1 veritabanı adaptörünün bağlanması.
- [x] Temel veritabanı şemalarının (`users`, `posts`, `projects`, `sessions`) `schema.ts` içinde oluşturulması.
- [x] Local geliştirme için ilk D1 migration (göç) işleminin başarıyla çalıştırılması.
- [x] Portable Session-based Auth (Better Auth) kurulumu ve login/session mekanizmasının D1'e bağlanması.

## Phase 3: Public UI

- [x] Global Layout, Navbar ve Footer bileşenlerinin (Dark/Light mode switch dahil) tasarlanması.
- [x] Ana sayfanın (Hero section, öne çıkan projeler, yetenekler/tech stack, sosyal medya ve özgeçmiş bölümü) geliştirilmesi.
- [x] Projeler sayfası (`/projects`) ve proje kartları bileşenlerinin oluşturulması.
- [x] Blog listeleme sayfası (`/blog`) ve SEO/Metadata uyumlu Blog Detay (`/blog/:slug`) sayfasının kodlanması.
- [x] Ana sayfadaki skill kısmı db'ye bağlansın. Eğer skill yoksa bu bölüm gösterilmesin.

## Phase 4: Admin Dashboard

- [x] `/dashboard` rotalarının dış erişime kapatılması (Server-side Auth Middleware/Loader yazılması).
- [x] `/login` sayfasının oluşturulması.
- [x] Dashboard mizanpajının (Sidebar ve üst bilgi) oluşturulması.
- [x] Projeler için CRUD (Ekleme, Düzenleme, Silme, Listeleme) arayüzlerinin form validasyonları (Zod) ile yapılması.
- [x] Blog yazıları için CRUD işlemleri ve içerik yazımı için Markdown / Rich Text Editor entegrasyonu.
- [ ] `/settings` menüsü için 'Tabbed Settings Page' tasarımı yap. Mock şekilde.
- [x] Kullanıcılar için CRUD işlemlerinin yapılması.
- [x] Logout yapısının oluşturulması.
- [x] Beceriler için `/skills` menüsü altında listeleme, create ve delete işlemleri.
- [ ] `/settings` menüsü için 'Tabbed Settings Page' tasarımı içine `/account` tabı ekle. İçerisinde email, linkedin, github, x, instagram linklerini alacak yapı olsun. Form şeklinde olmasın. Listelensin üzerine tıklayınca po-up çıksın ve orada kayıt edilsin. DB de configuration-parameter tablosu oluştur ve oraya key-value şeklinde kaydet.
- [ ] Locale ve Transalations tablolarını yönetebileceğim CRUD işlemlerinin yapılması. Cache odaklı geliştirilecek. Menü `/resources` olsun. İçerisinde 'Tabbed Settings Page' tasarımı olsun. Tablarda locale ve translations olsun.

## Phase 5: Optimization & Launch

- [x] Cloudflare Pages için `loader` seviyesinde Edge Caching (Cache-Control headers) stratejilerinin uygulanması.
- [ ] SEO standartları için `sitemap.xml` ve `robots.txt` rotalarının dinamik olarak eklenmesi.
- [ ] Semantic HTML, dinamik meta yönetimi ve LCP/FID/CLS optimizasyonun yapılması.
- [ ] Görsellerin ve fontların performans optimizasyonu (Lighthouse kontrolleri).
- [ ] Projenin Cloudflare Pages'a deploy edilmesi ve canlı (production) D1 veritabanının bağlanması.

## Phase 6: CI/CD Pipeline

- [ ] Pull Request bazlı CI hattının kurulması (`lint`, `typecheck`, `unit/integration test`, `build` adımlarının otomatik çalıştırılması).
- [ ] Playwright tabanlı kritik E2E akışlarının (özellikle login ve dashboard guard) CI ortamında çalıştırılması.
- [ ] Local D1 migration ve seed akışını CI içinde doğrulayacak geçici test veritabanı veya pipeline adımlarının kurulması.
- [ ] `main` branch push'larında Cloudflare preview/production deploy sürecinin otomatikleştirilmesi.
- [ ] Production deploy öncesi D1 migration apply adımının kontrollü ve güvenli şekilde pipeline'a bağlanması.
- [ ] Cloudflare secrets, Better Auth secret'ları ve diğer environment variable'lar için güvenli CI secret yönetiminin dokümante edilmesi ve standardize edilmesi.
- [ ] Deploy sonrası smoke test, health check ve başarısız deploy durumları için rollback veya alert stratejisinin eklenmesi.
