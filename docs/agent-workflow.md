# Agent Workflow

## Task Tracking

- Roadmap kaynağı [docs/roadmap.md](./docs/roadmap.md) dosyasıdır.
- Her görev tamamlandığında ilgili checkbox `[x]` olarak güncellenmelidir.
- Roadmap dışı bakım işlerinde feature dokümantasyonu yine oluşturulmalı, ancak dokümanda roadmap bağı yoksa bu açıkça belirtilmelidir.
- **Lessons Learned Rutini**: Her tamamlanan iş, hata çözümü veya refactor sonrasında kazanılan mimari tecrübeler vakit kaybetmeden [docs/lessons.md](./docs/lessons.md) dosyasına kaydedilmelidir.
- **Lessons Learned Giriş Standartları**: `lessons.md` dosyasına yeni bir öğrenim eklenirken veya mevcut maddeler güncellenirken, AI agent'ların dosyayı hızlı, doğru ve çelişkisiz tüketebilmesi için aşağıdaki kurallara harfiyen uyulmalıdır:
  1. **Durum Etiketi (Status Tags)**: Her yeni veya güncellenen maddenin başına mutlaka `[GÜNCEL / ACTIVE]` veya eski bir kuralı devre dışı bırakıyorsa `[GEÇERSİZ - Ders # ile Aşılmıştır]` etiketi eklenmelidir. Eski kuralın başlığı da `[GEÇERSİZ]` olarak revize edilip yeni referans Ders numarası belirtilmelidir.
  2. **Konu Dizin Etiketleri (Topic Tagging)**: Dersin ilgili olduğu dikey alanlar köşeli parantez içinde belirtilmelidir: `[AUTH]`, `[AUTHZ]`, `[PAGINATION]`, `[TS]`, `[D1]`, `[TEST]`, `[E2E]`, `[UI]`, `[I18N]`, `[CACHE]`, `[ERRORS]`, `[LOGGING]`.
  3. **Dosya Bağlantıları (Markdown File Links)**: Ders içinde geçen tüm ortak modüller, helper dosyaları veya şemalar absolute markdown linkleri (`[dosya_adi.ts](file:///...)`) ile belgelenmelidir.
  4. **Açık ve Deklaratif Dil**: Öğrenimler soyut anlatımlar yerine, agent'ların doğrudan uyması gereken katı iş mantığı kuralları veya kod kontratları şeklinde yazılmalıdır.

## Feature Documentation

Tamamlanan her işlem veya feature sonrası aşağıdaki standartta dokümantasyon oluşturulmalıdır:

- Dosya yolu: `docs/features/{Phase#}_{Task#}_{FeatureName}.md` Örnek: `docs/features/Phase1_Task1.1_ProjectScaffolding.md`
- İçerik:
  1. Yapılan işlemin özeti ve teknik çalışma mantığı
  2. Oluşturulan veya değiştirilen dosyaların sorumlulukları
  3. Uygulanan testler ve sonuçları
  4. İlgili feature'ı çalıştırma veya doğrulama komutları
  5. İlgili roadmap task referansları

Roadmap dışı değişikliklerde isimlendirme bakım amacıyla uyarlanabilir, ancak içerik standardı korunmalıdır.

## Database & Migration Standards

- **Drizzle Journal ve Seed Güvencesi**: Veri şeması veya seed değişikliklerinde üretilen SQL migration dosyalarının yanı sıra Drizzle journal dosyasının (`db/migrations/meta/_journal.json`) de güncellendiği doğrulanmalıdır. Sıfırdan oluşturulan veritabanlarında (`npm run db:seed:test-user`) veri tutarsızlıkları veya eksik admin claim hataları oluşmamalıdır.

## Git Strategy

- `main` production branch'idir. Her zaman deploy edilebilir ve temiz tutulmalıdır.
- Yeni işlerde `features/*`, bakım/refactor işlerinde `maintenance/*`, acil production düzeltmelerinde `hotfix/*` branch'i aç.
- Branch isimleri kısa, açıklayıcı ve görev bağlamını yansıtır olmalıdır. Örnek: `features/Phase4_Task4.11_ResourcesCrud`, `maintenance/AuthEnvCleanup`.
- Doğrudan `main` üzerinde geliştirme yapma. Önce branch aç, değişiklikleri o branch'te tamamla, sonra `main`e merge et.
- `develop` benzeri kalıcı ara branch kullanma; entegrasyon PR branch preview'leri üzerinden yönetilir.
- Mevcut kullanıcı değişikliklerini geri alma, ezme veya branch temizliği adına yok etme.
- Commit mesajları standart, açıklayıcı ve değişikliğin nedenini de anlatır olmalıdır.
- **Tavizsiz Entegrasyon Doğrulama Adımları**: Merge işlemi yapılmadan önce geliştiricinin yerel makinesinde sırasıyla şu komut zincirini çalıştırması ve tamamının başarıyla yeşil sonuçlandığını doğrulaması zorunludur:
  ```bash
  npm test && npm run typecheck && npm run lint && npm run format:check && npm run e2e:prepare && npm run e2e
  ```
