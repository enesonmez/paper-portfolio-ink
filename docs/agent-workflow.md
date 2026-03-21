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

- Feature'a başlamadan önce `features/{Phase#}_{Task#}_{FeatureName}` formatında, açıklayıcı bir branch aç. Örnek: `features/Phase1_Task1.1_ProjectScaffolding.md`
- Branch üzerinde çalış ve değişiklikleri bu branch'te tut.
- Mevcut kullanıcı değişikliklerini geri alma veya ezme.
- Git standartlarına uygun detaylı commit mesajları yaz.
