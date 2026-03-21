# Agent Instruction Reorganization

## Summary

Bu çalışma ile proje kökündeki `AGENTS.md` dosyası yüksek sinyalli, kısa ve operasyonel bir çekirdek talimat dosyasına dönüştürüldü. Yol haritası, çalışma protokolü, mühendislik standartları ve tasarım sistemi ayrı Markdown dosyalarına taşınarak agent'ın görev sırasında sadece ihtiyaç duyduğu referansı açması sağlandı.

Teknik hedef; sürekli okunan çekirdek talimat dosyasını kısa tutmak, değişken ve detaylı kuralları `docs/` altında uzmanlaşmış referanslara ayırmak ve task tracking'i `AGENTS.md` yerine tek bir roadmap kaynağında sürdürmekti.

## Files

- `AGENTS.md`: Çekirdek proje tanımı, non-negotiable kurallar ve referans doküman bağlantıları.
- `docs/agent-workflow.md`: Çalışma protokolü, branch stratejisi, task tracking ve feature documentation kuralları.
- `docs/engineering-standards.md`: Mimari prensipler, teknik stack, security, performance ve testing standartları.
- `docs/design-system.md`: Neo-Brutalist tasarım dili, typography, tema ve renk kuralları.
- `docs/roadmap.md`: Phase bazlı yapılacaklar listesi ve ilerleme takibi.

## Tests

Bu değişiklik dokümantasyon odaklıdır. Çalıştırılan otomatik test yoktur.

## Commands

İlgili dosyaları gözden geçirmek için:

```bash
sed -n '1,220p' AGENTS.md
sed -n '1,260p' docs/agent-workflow.md
sed -n '1,260p' docs/engineering-standards.md
sed -n '1,260p' docs/design-system.md
sed -n '1,260p' docs/roadmap.md
```

## Roadmap Reference

Bu bakım çalışması mevcut roadmap içinde ayrı bir maddeye bağlı değildir. Operasyonel iyileştirme niteliğindedir.
