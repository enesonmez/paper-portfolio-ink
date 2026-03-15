# Phase 4 / Task 4.1: DashboardSessionGuard

## Kapsam

Bu geliştirme, `paper-enes-ink` projesindeki `Phase 4 / Task 4.1` maddesini tamamlar:

- `4.1` `/dashboard` rotalarının dış erişime kapatılması (Server-side Auth Middleware/Loader yazılması)

Amaç, Better Auth ile kurulan session mekanizmasını dashboard route ağacına server-side seviyede bağlamak ve ileride eklenecek tüm `/dashboard/*` alt rotalarının aynı guard üzerinden korunmasını sağlamaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki koruma katmanı eklendi:

1. Server-side session guard helper'ı yazıldı.
2. Parent dashboard route loader'ı üzerinden auth kontrolü eklendi.
3. `/dashboard` için korumalı bir index placeholder route'u oluşturuldu.
4. Unauthorized isteklerin route seviyesinde server-side redirect ile kesilmesi sağlandı.
5. Guard helper ve dashboard parent loader davranışı test-first şekilde doğrulandı.
6. Development roadmap üzerindeki `4.1` maddesi tamamlandı olarak işaretlendi.

## Teknik Çalışma Mantığı

### 1. Session guard helper

`app/lib/auth/session.server.ts` içinde `requireSession()` helper'ı eklendi.

Bu helper:

- request ve `AppLoadContext` alır
- mevcut `context.db` ile Better Auth session çözümlemesi yapar
- request origin'inden auth config üretir
- session yoksa server-side `redirect()` fırlatır
- session varsa onu döndürür

Bu yapı, auth guard mantığını route dosyalarından ayırır ve tekrar kullanılabilir hale getirir.

### 2. Parent route üzerinden tüm dashboard ağacını koruma

`app/routes/dashboard.tsx` dosyası parent route olarak eklendi.

Bu route içindeki `loader()`:

- `requireSession(request, context, { redirectTo: "/" })` çağırır
- session doğrulanmazsa request daha render aşamasına gelmeden server tarafında durdurulur

Bu tercih bilinçli yapıldı. Çünkü ileride:

- `/dashboard/projects`
- `/dashboard/posts`
- `/dashboard/settings`

gibi child route'lar eklendiğinde parent loader otomatik olarak bu alt route'larda da çalışır.

Yani guard mantığı her route'a tek tek yazılmak zorunda kalmaz.

### 3. Redirect hedefi

Unauthorized istekler şimdilik `/` rotasına yönlendirilir.

Bunun nedeni:

- `4.2` içindeki `/login` sayfası henüz oluşturulmadı
- bugünden `/login` yönlendirmesi yapmak kullanıcıyı 404'e atabilirdi

Dolayısıyla `4.1` kapsamında güvenlik davranışı tamamlandı, ama final auth UX akışı bilinçli olarak `4.2`ye bırakıldı.

### 4. Dashboard index placeholder

`app/routes/dashboard._index.tsx` korumalı ilk dashboard içeriği olarak eklendi.

Bu route:

- session doğrulandıktan sonra render edilir
- gelecekteki dashboard layout ve araçları gelene kadar korumalı bir placeholder yüzey sağlar

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni dosyalar

- `app/lib/auth/session.server.ts`: server-side session guard helper'ı
- `app/routes/dashboard.tsx`: parent dashboard route ve auth guard loader'ı
- `app/routes/dashboard._index.tsx`: korumalı dashboard index placeholder'ı
- `tests/unit/auth-session.test.ts`: session guard helper testleri
- `tests/unit/dashboard-guard.test.ts`: dashboard parent loader guard testleri
- `docs/features/Phase4_Task4.1_DashboardSessionGuard.md`: feature dokümantasyonu

### Güncellenen dosyalar

- `AGENTS.md`: roadmap güncellemesi

## Uygulanan Testler ve Doğrulamalar

### Yeni testler

`tests/unit/auth-session.test.ts`

Bu testler:

- authenticated request'te session'ın döndüğünü doğrular
- unauthenticated request'te server-side redirect fırlatıldığını doğrular

`tests/unit/dashboard-guard.test.ts`

Bu test:

- dashboard parent loader'ının `requireSession()` çağırdığını doğrular
- guard'ın `/dashboard` request'ini render öncesi koruduğunu doğrular

### Çalıştırılan komutlar

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

### Sonuç

- dashboard parent route guard testleri geçti
- session helper testleri geçti
- tam test paketi geçti
- lint, typecheck, build ve format kontrolü geçti

## Feature'ı Çalıştırma Komutları

### Geliştirme ortamı

```bash
npm run dev
```

### Genel doğrulama

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## İlgili Roadmap Referansları

- `Phase 4 / Task 4.1`

## Sonraki Mantıklı Adım

Bu temel üzerine gelecek doğal adım:

- `4.2` için `/login` sayfasını oluşturup unauthorized dashboard yönlendirmesini bu sayfaya taşımak
