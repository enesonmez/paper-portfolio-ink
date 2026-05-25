# Development Roadmap

## Phase 1: Foundation

- [x] React Router v7 projesinin (Edge Runtime ayarlı) başlatılması.
- [x] Tailwind CSS ve shadcn/ui entegrasyonunun yapılması.
- [x] Cloudflare `wrangler.toml` dosyasının oluşturulması ve D1 veritabanı binding ayarlarının yapılması.
- [x] Proje genelinde tip güvenliği ve kod standartları için Prettier/ESLint ayarlarının tamamlanması.
- [x] E2E testler için playwrigt entegrasyonunun yapılması.
- [x] i18n altyapısını kur. DB merkezli olsun. Proje ayağa kalkarken cache'e alsın.

## Phase 2: Data Layer & Auth

- [x] Drizzle ORM kurulumu ve D1 veritabanı adaptörünün bağlanması.
- [x] Temel veritabanı şemalarının (`users`, `posts`, `projects`, `sessions`) `schema.ts` içinde oluşturulması.
- [x] Local geliştirme için ilk D1 migration (göç) işleminin başarıyla çalıştırılması.
- [x] Portable Session-based Auth (Better Auth) kurulumu ve login/session mekanizmasının D1'e bağlanması.
- [x] Db üzerinden role - claim based hybrid bir authorization yapısının kurulması.

## Phase 3: Public UI

- [x] Global Layout, Navbar ve Footer bileşenlerinin (Dark/Light mode switch dahil) tasarlanması.
- [x] Ana sayfanın (Hero section, öne çıkan projeler, yetenekler/tech stack, sosyal medya ve özgeçmiş bölümü) geliştirilmesi.
- [x] Projeler sayfası (`/projects`) ve proje kartları bileşenlerinin oluşturulması.
- [x] Blog listeleme sayfası (`/blog`) ve SEO/Metadata uyumlu Blog Detay (`/blog/:slug`) sayfasının kodlanması.
- [x] Ana sayfadaki skill kısmı db'ye bağlansın. Eğer skill yoksa bu bölüm gösterilmesin.
- [ ] Projede kullanılan sosyal medya linkleri, site name ve site url cache'deki configuration-parameter değerlerinden alınsın. Projede eğer statik olarak kullanılan yerler var ise oralarıda dinamik hale getir.

## Phase 4: Admin Dashboard

- [x] `/dashboard` rotalarının dış erişime kapatılması (Server-side Auth Middleware/Loader yazılması).
- [x] `/login` sayfasının oluşturulması.
- [x] Dashboard mizanpajının (Sidebar ve üst bilgi) oluşturulması.
- [x] Projeler için CRUD (Ekleme, Düzenleme, Silme, Listeleme) arayüzlerinin form validasyonları (Zod) ile yapılması.
- [x] Blog yazıları için CRUD işlemleri ve içerik yazımı için Markdown / Rich Text Editor entegrasyonu.
- [x] `/settings` menüsü için 'Tabbed Settings Page' tasarımı yap. Mock şekilde.
- [x] Kullanıcılar için CRUD işlemlerinin yapılması.
- [x] Logout yapısının oluşturulması.
- [x] Beceriler için `/skills` menüsü altında listeleme, create ve delete işlemleri.
- [x] `/settings` menüsü için 'Tabbed Settings Page' tasarımı içine `/account` tabı ekle. İçerisinde email, linkedin, github, x, instagram linkleri, proje ismi, proje domain url'ini alacak yapı olsun. Form şeklinde olmasın. Listelensin üzerine tıklayınca po-up çıksın ve orada kayıt edilsin. DB de configuration-parameter tablosu oluştur ve oraya key-value şeklinde kaydet. Bu tablodaki değerler proje ayağa kalktığında ilk istek sonrası cache alınmalı.
- [x] Locale ve Transalations tablolarını yönetebileceğim CRUD işlemlerinin yapılması. Cache odaklı geliştirilecek. Menü `/resources` olsun. İçerisinde 'Tabbed Settings Page' tasarımı olsun. Tablarda locale ve translations olsun.
- [ ] `/user` sekmesinde claim tanımlama veya çıkarma butonu koy. Tıklayınca modal üzerinden aksiyon aldır. Role güncellemeyide bu modal içine al, user güncellemeden çıkar. authz_version'u bu modal üzerinden kontrol et.
- [ ] Dashboard Overview: Genel istatistiklerin (toplam yazı, proje, aktif kullanıcı, toplam skill) gösterildiği bir özet ekranı. Post'ların tümünün görüntülenme sayısının günlük - aylık kırılım ile gösterecek grafik. log_history üzerinden son 5 kaydın listelenmesi. Admin tüm kayıtlar üzerinden diğer kullanıcılar sadece kendi log'ları.
- [ ] `/settings` sayfasında `/runtime` tabı ekle. Projedeki cache'lenen tüm yapılar yer alsın ve her yapı için bir buton ile cache temizleyip tekrar cache alma yapısı kurulsun. Her yapı için ayrı buton olsun. Aynı zamanda burada sistemin ram, storage, cpu kullanım gösterimi de olsun. Belirli aralıklarla güncellencek şekilde örneğin 5 sn.
- [ ] `/settings` sayfasında `/apperance` tabı ekle. Projede renk paleti ve font değişim imkanı versin. Seçilen değerler configuration-parameter tablosunda tutulsun.
- [ ] `/settings` sayfasında `/security` tabı ekle. Session'ı olan kullanıcıları görüntüleme ve bunların session'larını sonlandırma yapısı kuralım.

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

## Phase 7: Observation & Logging

- [x] Merkezi hata yönetim sisteminin oluşturulması.
- [x] Create, update, delete işlemlerinde ilgili akışın bilgisi ile `log_history` adında bir log tablosu oluştur. Kullanıcı ile eşleştir.
- [x] Sistemde oluşan hataları loglayacak `log_error_history` adında bir log tablosu oluştur.
- [x] Dashboard sidebar'a Logging sekmesi ekle. 'Tabbed Settings Page' tasarımı olsun. Tablarda log history ve log error history olsun. Log error history kısmı için belirli bir aralıktaki veriyi txt formatında alma özelliği olsun. Belirli bir aralıktaki log kayıtlarını silme özelliğide olsun. Sadece Admin rolü erişebilsin.
- [x] Logging sekmesinde audit ve error tablolarına keyset paging ekle. Audit ve error aralık export işlemlerini Excel uyumlu dosya olarak sun ve iki tabloda da aralık bazlı delete akışını destekle.

## Phase 8: Analytics & Insights

[ ] view_history tablosunun (post_id, user_hash, scroll_rate, seconds_spent) oluşturulması.
[ ] Backend Tracking: SHA-256(ip + user-agent + secret) tabanlı user_hash üretimi ve 12 saatlik kısıtlama (Throttling) logic'i.
[ ] Frontend Tracker: navigator.sendBeacon ile sayfa terk edildiğinde (unload/visibilitychange) db'ye veri gönderimi.
[ ] Scroll & Time Depth: Kullanıcının makalenin yüzde kaçına ulaştığının ve ne kadar süre kaldığının hesaplanması.
[ ] Double-Lock Mechanism: Hem Cookie (Client) hem de DB (Server) seviyesinde 12 saatlik mükerrer kayıt engelleme.
