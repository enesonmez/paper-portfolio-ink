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

## Feature Documentation & Zero-Dead-Code Rules

Tamamlanan her işlem veya feature sonrası en yüksek kalitede teknik dokümantasyon oluşturulmalı ve atıl duruma düşen tüm kodlar/şemalar temizlenmelidir.

### Zero-Dead-Code (Sıfır Ölü Kod) İlkesi

- **Tam Temizlik**: Yeni bir özelliğe veya daha ince taneli (fine-grained) bir mimariye geçildiğinde, eski kaba yetkiler (claims), kullanılmayan fonksiyonlar, atıl veritabanı kolonları veya modeller hem kod tabanından hem de veritabanından tamamen temizlenmelidir.
- **Veritabanı Hizalaması**: Temizlenen yetkiler veya şemalar için mutlaka idempotent bir SQL migration dosyası oluşturulmalı ve D1 SQLite veritabanından kalıcı olarak silinmesi sağlanmalıdır.
- **Tarihsel İzlenebilirlik**: Kaldırılan özellikler veya claims, oluşturulan teknik özellik dokümanının "Degisen Dosyalar" ve "Ozet" bölümlerinde açıkça listelenmeli ve "Zero-Dead-Code" kapsamında elendiği belgelenmelidir.

### Teknik Özellik Dokümantasyon Şablonu

- Dosya yolu: `docs/features/{Phase#}_{Task#}_{FeatureName}.md` veya `docs/features/Maintenance_{FeatureName}.md`
- Zorunlu Başlıklar ve İçerik Standartları:
  1. **# [Feature Name / Başlık]**: Phase ve Task numarasını içeren ana başlık.
  2. **## Ozet**: Yapılan çalışmanın mimari özeti, teknik arka planı, Zero-Dead-Code temizlik kararları ve neo-brutalist tasarım iyileştirmeleri.
  3. **## Degisen Dosyalar**: Değişen veya yeni eklenen tüm dosyalar, absolute olmaksızın projeyi kaynağından itibaren gösteren path formatında (`app/features/dashboard/...`) listelenmeli ve yanlarında kısa sorumluluk açıklamaları yer almalıdır. Silinen dosyalar `[DELETE]` ve yeni dosyalar `[NEW]` olarak işaretlenmelidir.
  4. **## Testler**: Entegrasyon, birim ve E2E test çalıştırma komutları ve elde edilen test adetleri/başarı oranları.
  5. **## Dogrulama**: Geliştirmenin doğruluğunu kanıtlamak için adım adım elle doğrulama senaryoları.
  6. **## Roadmap Referansi**: İlgili roadmap maddesi veya bakım planına verilen atıflar.

Roadmap dışı değişikliklerde de bu şablon ve Zero-Dead-Code standartları tavizsiz uygulanmalıdır.

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
