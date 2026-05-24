# Agent Workflow

## Task Tracking

- Roadmap kaynağı [docs/roadmap.md](./docs/roadmap.md) dosyasıdır.
- Her görev tamamlandığında ilgili checkbox `[x]` olarak güncellenmelidir.
- Roadmap dışı bakım işlerinde feature dokümantasyonu yine oluşturulmalı, ancak dokümanda roadmap bağı yoksa bu açıkça belirtilmelidir.

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

## Git Strategy

- `main` production branch'idir. Her zaman deploy edilebilir ve temiz tutulmalıdır.
- Yeni işlerde `features/*`, bakım/refactor işlerinde `maintenance/*`, acil production düzeltmelerinde `hotfix/*` branch'i aç.
- Branch isimleri kısa, açıklayıcı ve görev bağlamını yansıtır olmalıdır. Örnek: `features/Phase4_Task4.11_ResourcesCrud`, `maintenance/AuthEnvCleanup`.
- Doğrudan `main` üzerinde geliştirme yapma. Önce branch aç, değişiklikleri o branch'te tamamla, sonra `main`e merge et.
- `develop` benzeri kalıcı ara branch kullanma; entegrasyon PR branch preview'leri üzerinden yönetilir.
- Mevcut kullanıcı değişikliklerini geri alma, ezme veya branch temizliği adına yok etme.
- Commit mesajları standart, açıklayıcı ve değişikliğin nedenini de anlatır olmalıdır.
- Mümkünse merge öncesi branch'i güncel `main` ile hizala ve doğrulama komutlarını branch üzerinde çalıştır.
