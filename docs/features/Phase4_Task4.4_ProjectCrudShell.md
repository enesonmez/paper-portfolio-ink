# Phase 4 / Task 4.4 - Project CRUD Shell

## Summary

Bu feature ile `/dashboard/projects` rotası, mevcut dashboard shell içinde çalışan gerçek bir project CRUD arayüzüne dönüştürüldü. Ekran artık tam genişlikte bir proje kayıt tablosu gösterir; oluşturma ve düzenleme işlemleri ise sayfa içi bir popup modal üzerinden yapılır. Tasarım dili, Phase 4.3'te kurulan dashboard shell ile aynı Neo-Brutalist çizgiyi sürdürür.

Route, React Router `loader` ve `action` mekanizmalarını kullanır. Listeleme, oluşturma, güncelleme ve silme işlemleri server-side action üzerinden Drizzle ORM ile mevcut `projects` tablosuna bağlandı. Böylece form gönderimleri istemci tarafında ekstra state manager gerektirmeden tamamlanır.

## Technical Flow

1. `loader`, `context.db` üzerinden proje listesini çeker.
2. URL içindeki `?modal=create` veya `?edit=` parametresi popup modal durumunu belirler.
3. `?edit=` varsa seçili proje form için preload edilir.
4. `action`, `intent` alanına göre `create`, `update` veya `delete` akışına ayrılır.
5. Create/update akışlarında `parseProjectFormData()` ile Zod validasyonu uygulanır.
6. Hata varsa field-level error state route üzerinden geri döner ve modal açık kalır.
7. Başarılı işlem sonrası kullanıcı `/dashboard/projects` rotasına redirect edilir.

## Files And Responsibilities

### `/app/routes/dashboard.projects.tsx`

- `/dashboard/projects` route'unun loader, action ve ekran bileşenini içerir.
- Query-string tabanlı modal state, metrik kartları ve tam genişlik proje tablosunu bir araya getirir.
- Create, update ve delete intent'lerini server-side yönetir.

### `/app/components/dashboard/modal.tsx`

- Dashboard içindeki popup CRUD akışları için tekrar kullanılabilir modal shell bileşenidir.
- Overlay, close affordance ve responsive scroll davranışını yönetir.

### `/app/lib/projects/project-form.server.ts`

- Zod tabanlı proje form şemasını tanımlar.
- `FormData` içeriğini typed submission'a dönüştürür.
- Field-level error state ve default form values üretir.

### `/app/lib/projects/projects.server.ts`

- Drizzle ORM ile proje listeleme, ekleme, güncelleme ve silme işlemlerini yapar.
- UI için uygun `ProjectOverview` görünüm modelini üretir.

### `/app/components/dashboard/panel.tsx`

- Dashboard yüzeyleri için ortak hard-border / hard-shadow panel bileşenidir.

### `/app/components/dashboard/metric-card.tsx`

- Metrik kartları için tekrar kullanılabilir dashboard atomudur.

### `/app/components/dashboard/section-heading.tsx`

- Dashboard bölümlerinde ortak eyebrow + title + action yapısını üretir.

### `/app/components/dashboard/status-badge.tsx`

- Durum etiketleri için tekrar kullanılabilir badge bileşenidir.

### `/app/routes/dashboard._index.tsx`

- Yeni dashboard bileşenlerini kullanacak şekilde refactor edildi.

## Tests And Validation

TDD yaklaşımıyla kritik sözleşmeler testle sabitlendi:

1. `project-form` parser'ının valid ve invalid `FormData` davranışı
2. `/dashboard/projects` ekranının tam genişlik tablo ve create trigger ile render etmesi
3. Create modal açıldığında formun popup içinde render edilmesi

Ek olarak mevcut dashboard shell testleri refactor sonrası tekrar çalıştırıldı.

Çalıştırılan komutlar:

```bash
npm test -- project-form dashboard-projects-route dashboard-index dashboard-layout dashboard-guard auth-server
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Run The Feature

Lokal geliştirme için:

```bash
npm run dev
```

Ardından:

```bash
http://localhost:5173/dashboard/projects
```

Test kullanıcısı gerekiyorsa:

```bash
npm run db:seed:test-user
```

## Roadmap Reference

- Phase 4
- Task 4.4
- İlgili roadmap maddesi: `Projeler için CRUD (Ekleme, Düzenleme, Silme, Listeleme) arayüzlerinin form validasyonları (Zod) ile yapılması`
