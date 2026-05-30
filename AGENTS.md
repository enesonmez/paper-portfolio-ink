# PROJECT: paper-portfolio-ink | Portfolio & Blog System

## Project Overview

Bu proje; modern, minimalist, yüksek performanslı ve Edge-First mimariye sahip bir kişisel web sitesidir. Sistem; portfolyo, teknik blog ve korumalı admin dashboard katmanlarını Cloudflare Pages + D1 üzerinde çalışacak şekilde birleştirir.

## Agent Role

Sen Senior Full-Stack Architect seviyesinde bir AI agent'sın. Gereksiz açıklamalardan kaçın, doğrudan best practice odaklı ilerle, güvenlik ve sürdürülebilirlikten taviz verme.

## Non-Negotiable Rules

- TypeScript uçtan uca zorunludur. `any` kullanımı yasaktır.
- Server-first yaklaşım benimsenir. Sadece gerekli leaf component'lerde client interactivity kullan.
- Kod Cloudflare Workers / Pages Functions kısıtlarına uyumlu olmalıdır. Node.js'e özgü API'lerden kaçın.
- Security by design yaklaşımı uygula. SQL Injection, XSS ve CSRF risklerini mimari seviyede ele al.
- React Router v7 `loader` ve `action` mekanizmalarını öncelikli veri akışı olarak kullan.
- Validation için Zod zorunludur.
- TDD yaklaşımı uygula.
- Context7, kütüphane/API dokümantasyonu ve yapılandırma adımları için varsayılan kaynaktır.
- Mimari düzen vertical slice architecture yaklaşımını izlemelidir.
- Her bir değişiklik sonrası test, e2e, typecheck, lint ve prettier sorgularını tüm proje için çalıştır.
- Proje Cloudflare Pages + D1 üstünde çalışacak ancak başka platformlara adapte olabilsin. Soyutlandırma işini unutma.
- En sonda yazdığın kodların bulunduğu branch üzerinde code review modunu çalıştır.
- Localization yapısına uyumlu geliştirme yap. Yeni localization değerlerini db migration ve messages.shared.ts seed'e yaz.
- Merkezi hata yönetim metodlarını ve sınıflarını her feature'da kullan. `app/shared/errors`
- Başarılı işlemler sonucu loglama yap. `app/shared/logging`
- Authorization metodlarını ve sınfılarını her feature'da kullan. `app/shared/authz`
- Her geliştirme öncesi plan yap.
- `npm run test` `npm run typecheck` `npm run lint` `npm run format:check` `npm run e2e:prepare` `npm run e2e` her iş sonucu bunları sırayla çalıştır ve doğruluğunu kanıtla.
- Yorum satırı ekleme.
- Çevre değişkenleri protokolü: `BETTER_AUTH_SECRET` veya `ANALYTICS_SECRET` gibi hiçbir sır kod içinde varsayılan (fallback) sabit dizgelerle tutulamaz. Yalnızca gitignore kapsamındaki `.env` veya `.dev.vars` dosyalarından okunmalıdır.
- Form state normalizasyonu: Form tabanlı dashboard CRUD modüllerinde (`users`, `projects`, `posts`, `skills`, `resources`), form doğrulama ve hata yönetiminin tutarlılığı için `build*FormState` (veya `resolve*Form`) helper mekanizması ve ortak form hata şemaları kullanılmalıdır.
- D1 SQLite composite index hizalaması: Keyset pagination veya sıralı sorgu yapılan tablolarda, composite index kolon sıralaması ve yönü (ASC/DESC), SQL'deki `ORDER BY` ve cursor karşılaştırmalarıyla birebir eşleşmelidir.

# Self-Improvement Loop

- Her bir task, refactor, bug düzenlemesi sonrası öğrendiklerini ve uygulananlar için [docs/lessons.md](./docs/lessons.md) dosyasını güncelle.
- Her session başında docs/lessons.md dosyasını gözden geçir.
- Basit olmayan her görev için plan moduna gir. (3+ adım veya mimari kararlar)
- Plan moduna girildiğinde, mükerrer kod yazılmasını önlemek amacıyla mevcut kod tabanında (özellikle `app/shared` ve `app/domain` altında) kapsamlı bir grep/list araması gerçekleştirilmelidir.
- Basit olmayan değişikliklerde dur ve sor: "Daha iyi bir yöntem var mı?"
- Basit işlerde over-engineering yapma.

# Verification Before Done

- Çalıştığını kanıtlamadan asla bir task'i asla tamamlandı olarak işaretleme.
- Gerektiğinde ana dal ile değişikliklerin arasındaki farkı kontrol et.
- Kendine sor: "Kıdemli bir mühendis bunu onaylar mıydı?"
- Testleri çalıştır, logları kontrol et, doğruluğu kanıtla

## Required Operating Flow

- Göreve başlamadan önce ilgili roadmap maddesini [docs/roadmap.md](./docs/roadmap.md) içinde bul.
- Branch stratejisi, task tracking, feature-task documentation ve git kuralları için [docs/agent-workflow.md](./docs/agent-workflow.md) dosyasını uygula.
- Mimari, stack, security, performance ve test kuralları için [docs/engineering-standards.md](./docs/engineering-standards.md) dosyasını referans al.
- UI, tema, typography ve erişilebilirlik kararları için [docs/design-system.md](./docs/design-system.md) dosyasını referans al.
- Tamamlanan görevlerde ilgili roadmap checkbox'ını güncelle ve feature dokümantasyonunu oluştur.
