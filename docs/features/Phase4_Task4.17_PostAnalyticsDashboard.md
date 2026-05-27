# Phase 4 Task 17: Post Analytics Dashboard

## 1. Ozet ve Teknik Çalıma Mantığı

Bu calismayla birlikte, admin ve author kullanicilarinin post performanslarini ve okuyucu etkilesimlerini izleyebilecegi Edge-First `/dashboard/analytics` paneli sisteme kazandirildi.

- **Yetkilendirme Katmanı (Security by Design)**:
  - `analytics.read.any` (Admin: Herkesin post analitik verisini izleme) ve `analytics.read.own` (Author: Yalnızca kendi post analitik verisini izleme) olmak üzere iki yeni granular yetkilendirme anahtari (claim) olusturuldu.
  - Admin kullanıcılar tüm postların toplam istatistiklerini ve dökümünü görebilirken, Author kullanıcılar veritabanı seviyesinde `posts.authorId = actor.userId` ile filtrelenerek yalnızca kendi yazılarının analitiğine erişebilir.
- **Custom Retro Comic SVG Grafikleri**:
  - Dışarıdan ağır kütüphane bağımlılığı eklemek yerine, projenin neo-brutalist / retro comic noir tasarım sistemine (VT323 tipografi, Yellow-400 dolgular, keskin 3D siyah gölgeler ve 2px siyah kenarlıklar) tam uyumlu, responsive ve yüksek performanslı custom SVG grafik bileşeni (`DashboardAnalyticsChart`) geliştirildi.
  - Bu bileşen, günlük (son 30 gün) ve aylık (son 12 ay) görüntülenme kırılımlarını snappy tab geçişleriyle çizmektedir.
- **Post-by-Post Etkileşim Tablosu**:
  - `DataTable` bileşeniyle entegre şekilde, her bir postun toplam görüntülenme adedi, ortalama okuma derinliği (`avg(scrollRate)`) ve ortalama sayfada kalma süresi (`avg(secondsSpent)`) listelenmektedir. Yazılar veritabanında left-join edilerek 0 görüntülenmeye sahip yazılar da sıfır değerleriyle listelenir.
- **Tarihsel Detay Modalı**:
  - Server-first progressive enhancement mimarisine uygun olarak, tablodaki "Views" butonu query-string tabanlı bir tetikleme (`?view=post-id`) uygular. Bu sayede modal (`DashboardModal`) açıldığında o yaza özel günlük ve aylık historical SVG grafikleri yüklenir ve güvenli ownership doğrulamasıyla render edilir.
- **Localization**:
  - TR ve EN dil destekleri `messages.shared.ts` ve D1 veritabanı `translations` tablolarına seed migration ile eklenerek kusursuz i18n uyumu sağlandı.

## 2. Dosya Sorumlulukları

- `db/migrations/0030_analytics_claims.sql`
  - Veritabanı seviyesinde `analytics.read.any` ve `analytics.read.own` yetkilerini ekler ve varsayılan rollere bağlar.
- `db/migrations/0031_analytics_translations.sql`
  - Yeni eklenen tüm TR/EN analitik metinlerini, tablo başlıklarını ve etiketlerini veritabanı çeviri tablosuna seed eder.
- `app/shared/authz/model.ts`
  - Tip güvenliği için `AUTHORIZATION_CLAIM`, claim değerleri, tanımları ve varsayılan rol yetki haritalarını günceller.
- `app/shared/errors/contracts.ts`
  - Rota bazlı hata yönetimi için `APP_ROUTE_ID.dashboardAnalytics` ve `APP_ERROR_CODE.analytics.read.forbidden` tiplerini ekler.
- `app/features/dashboard/layout/navigation.ts`
  - `/dashboard/analytics` menüsünü `BarChart3` ikonuyla sidebar navigasyonuna ekler ve claims kontrolüyle sarmalar.
- `app/shared/i18n/messages.shared.ts`
  - İlgili navigasyon ve analitik başlıklarının TR/EN statik fallback çevirilerini sağlar.
- `app/features/dashboard/analytics/copy.ts`
  - İlgili tüm yerelleştirilmiş metinlerin feature içinden `useDashboardAnalyticsCopy` hook'uyla çekilmesini sağlar.
- `app/features/dashboard/analytics/state.ts`
  - Arama filtreleri, modal form durumları, veri modelleri, link üreteçleri ve mock/granted veri tipi sözleşmelerini tanımlar.
- `app/features/dashboard/analytics/components/dashboard-analytics-chart.tsx`
  - Günlük/Aylık verileri responsive, hover ve tooltip efektli neo-brutalist SVG bar chart olarak çizen bileşendir.
- `app/features/dashboard/analytics/components/dashboard-analytics-table.tsx`
  - Yazıları, görüntülenme sayılarını, kaydırma oranlarını ve süreleri modal butonuyla listeleyen tablodur.
- `app/features/dashboard/analytics/screen.tsx`
  - Metrik kartlarını, genel SVG grafiklerini, arama barını ve detay modalını koordine eden ana presentational ekrandır.
- `app/features/dashboard/analytics/loader.server.ts`
  - Loader verilerini hazırlar. assert/gate kontrolleri yapar ve veritabanı aggregasyonlarını (Views, avg(scroll_rate), avg(seconds_spent)) SQLite date gruplamalarıyla çeker.
- `app/features/dashboard/analytics/route.tsx`
  - Client-side React Router bağlayıcısı. Loader verisi ve outlet session bilgilerini ekrana paslar.
- `app/routes/dashboard/analytics.tsx`
  - React Router `/dashboard/analytics` route giriş noktası. loader'ı typed wrapper hata yönetimiyle bağlar.
- `app/routes.ts`
  - Yeni analitik sayfasını `/dashboard` alt rotası olarak tescil eder.
- `tests/unit/features/dashboard/analytics/state.test.ts`
  - Parametrelerin ve link üreteçlerinin düzgün çalıştığını doğrular.
- `tests/integration/routes/dashboard/analytics.test.tsx`
  - Metriklerin, SVG grafiklerinin, tabloların ve popup modalların doğru render edildiğini test eder.
- `tests/unit/features/dashboard/layout/navigation.test.ts`
  - Yeni navigasyon linkinin admin ve author rollerinde doğru şekilde yüklendiğini doğrular.

## 3. Uygulanan Testler Ve Sonuçları

Tüm testler ve doğrulamalar başarıyla sonuçlandı:

1. **Typecheck**: `npm run typecheck` sorunsuz derlendi.
2. **Linter**: `npm run lint` lintsiz ve uyarısız şekilde başarıyla tamamlandı.
3. **Format**: `npm run format:check` Prettier kurallarına %100 uyumu doğruladı.
4. **Unit/Integration Tests**:
   - `npm run test` komutuyla **387 testin tamamı (%100) yeşil geçti**.
5. **E2E Browser Tests**:
   - `npm run e2e:prepare` sonrası `npm run e2e` çalıştırıldı.
   - **Playwright 42/42 testin tamamını başarıyla tamamladı**.

## 4. Çalıştırma Ve Doğrulama Komutları

Local ortamda denemek ve çalıştırmak için:

```bash
# Bağımlılıkları ve DB durumunu hazırla
npm install
npm run db:migrate:local
npm run e2e:prepare

# Geliştirme sunucusunu ayağa kaldır
npm run dev

# Doğrulama adımları
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run e2e
```

## 5. Roadmap Referansı

- `docs/roadmap.md`
  - `Phase 4: Admin Dashboard` -> `Analitik için /analytics menüsü oluştur...`
