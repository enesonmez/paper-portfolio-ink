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
- Her bir değişiklik sonrası test, typecheck, lint ve prettier sorgularını tüm proje için çalıştır.
- Proje Cloudflare Pages + D1 üstünde çalışacak ancak başka platformlara adapte olabilsin. Soyutlandırma işini unutma.
- En sonda yazdığın kodların bulunduğu branch üzerinde code review modunu çalıştır.

# Self-Improvement Loop

- Her bir task, refactor, bug düzenlemesi sonrası öğrendiklerini ve uygulananlar için [docs/lessons.md](./docs/lessons.md) dosyasını güncelle.
- Her session başında docs/lessons.md dosyasını gözden geçir.
- Basit olmayan her görev için plan moduna gir. (3+ adım veya mimari kararlar)
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
