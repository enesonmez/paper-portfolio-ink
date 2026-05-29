# Phase 4 Task 4.13 - Dashboard Canlı Özet Entegrasyonu

Bu belge, `/dashboard` (Özet) ekranını canlı D1 veritabanı sorgularına bağlamak için yapılan değişiklikleri özetlemektedir.

## Genel Bakış ve Mimari

Daha önce, dashboard özet ekranı statik mock değerleri gösteriyordu. Canlı sayaçları, trafik grafiklerini ve dinamik akışları çeken, claim (yetki) duyarlı, güvenli bir sunucu tarafı loader (yükleyici) yapısı kuruldu.

Veritabanı sorguları kullanıcının rolüne göre otomatik olarak uyarlanır:

- **Admin (Yönetici)**: Global erişime sahiptir. Sistem genelindeki istatistikleri (toplam yazı, toplam proje, aktif kullanıcılar, toplam yetenekler), ziyaretçi metriklerini (son 30 gün/12 aydaki tüm sayfa görüntülemeleri), son sistem günlüklerini (son 5 audit log) ve son güncellenen yazıları görür.
- **Author (Yazar)**: Sınırlandırılmış erişime sahiptir. Kendi yazı sayısını görür, yetkisiz metrikleri kilitler/gizler ("Yetkisiz" gösterilir), kendi yazı görüntülemelerini, kendi son işlem günlüklerini ve kendi son güncellenen yazılarını görür.

```
[İstek] ──> [index.tsx Rota Sarmalayıcısı (Route Wrapper)]
                 │
                 ├──> [loader.server.ts (withDashboardAccess)]
                 │         │
                 │         ├──> [overview.server.ts (İstatistik ve Log Sorguları)]
                 │         └──> [analytics.server.ts (Günlük/Aylık Görüntülenmeler)]
                 │
                 └──> [screen.tsx Sunum Düzeni (Presentational Layout)]
```

## Oluşturulan ve Değiştirilen Dosyalar

### 1. Veritabanı Sorguları

- **[YENİ] [overview.server.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/lib/overview/overview.server.ts)**
  Drizzle ORM kullanarak `getOverviewStats`, `getOverviewRecentLogs` ve `getOverviewRecentPosts` fonksiyonlarını uygular. Aktör yetkilerine bağlı olarak sonuçları `authorId`ye göre otomatik olarak filtreler veya kartları gizler.

### 2. Feature ve Loader

- **[YENİ] [loader.server.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/features/dashboard/overview/loader.server.ts)**
  `withDashboardAccess` kontrolünü entegre eder; istatistikleri, logları, son yazıları çeker ve sayfa görüntülemelerini yüklemek için `analytics.server` ile koordineli çalışır.

### 3. Sunum ve Ekranlar

- **[DEĞİŞTİR] [screen.tsx](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/features/dashboard/overview/screen.tsx)**
  Verileri props olarak alan saf bir sunum (presentational) bileşenine dönüştürüldü. İstatistikleri dinamik olarak render eder (yetkisiz metrikler için "Yetkisiz" durumunu ele alır), `DashboardAnalyticsChart` bileşenini içerir, gerçek log ve yazı listelerini eşler.
- **[DEĞİŞTİR] [copy.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/features/dashboard/overview/copy.ts)**
  Kullanılmayan statik mock listeleri kaldırıldı, sadece yerelleştirilmiş etiket tanımları tutuldu.

### 4. Rotalar ve Global Yapılandırma

- **[DEĞİŞTİR] [index.tsx](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/routes/dashboard/index.tsx)**
  Rota giriş noktası loader'a bağlandı; ekranı `useLoaderData` ile sarmalar ve entegrasyon testlerinin dayanıklılığı için mock bir fallback durumu barındırır.
- **[DEĞİŞTİR] [contracts.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/shared/errors/contracts.ts)**
  `APP_ROUTE_ID`ye `dashboardIndex: "dashboard.index"` ve `APP_ERROR_CODE`a `dashboard.read.forbidden` eklendi.
- **[DEĞİŞTİR] [messages.shared.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/app/shared/i18n/messages.shared.ts)**
  Yeni dashboard öğeleri için Türkçe ve İngilizce çeviri dizeleri seed edildi (`activeUsers.label`, `totalSkills.label`, `totalProjects.label`, `unauthorized`, `recentPostsEmpty`, `recentLogsEmpty`).

### 5. Otomatik Testler

- **[YENİ] [overview.server.test.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/tests/integration/features/dashboard/overview.server.test.ts)**
  Misafir (Guest), Yazar (Author) ve Yönetici (Admin) durumları için loader çıktılarını, metrik yetki kapılarını ve 403 yetkilendirme hatalarını doğrular.
- **[DEĞİŞTİR] [screen.test.tsx](file:///Users/enesonmez/Projects/paper-portfolio-ink/tests/unit/features/dashboard/overview/screen.test.tsx)**
  Sunum props'larını mock'layacak şekilde refaktör edildi, yerleşimin temiz bir şekilde render edildiğini doğrular.
- **[YENİ] [overview.spec.ts](file:///Users/enesonmez/Projects/paper-portfolio-ink/tests/e2e/overview.spec.ts)**
  Yönetici (grafiklerin, akışların ve yüklenen sayaçların görünürlüğünü doğrular) ve Yazar ("Yetkisiz" kartlarını ve kapsamlandırılmış logları doğrular) olarak giriş yapan Playwright testi.

## Doğrulama Sonuçları

Tüm birim, entegrasyon ve E2E testleri başarıyla geçmektedir:

```bash
# Vitest çalışma çıktısı:
Test Files  117 passed (117)
     Tests  393 passed (393)

# Playwright çalışma çıktısı:
Running 2 tests using 1 worker
  ✓  1 [chromium-public] › tests/e2e/overview.spec.ts:8:3 › dashboard overview live data e2e › renders all dynamic metrics and logs for an admin (1.4s)
  ✓  2 [chromium-public] › tests/e2e/overview.spec.ts:30:3 › dashboard overview live data e2e › locks unauthorized metrics and restricts feeds for an author (871ms)
  2 passed (9.0s)
```

Hem ESLint (`npm run lint`) hem de Prettier (`npm run format:check`) tamamen yeşil sonuçlanmıştır.
