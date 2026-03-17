# Phase 4 Task 4.5 Blog CRUD Dashboard

## 1. Yapılan İşlemin Detaylı Özeti ve Teknik Çalışma Mantığı

Bu çalışma ile admin dashboard altında `dashboard/projects` ile aynı dikey dilde çalışan yeni bir `dashboard/posts` slice oluşturuldu. Amaç, blog içerik yönetimini route seviyesinde ince tutup asıl form, tablo, loader/action ve rich text editör mantığını feature katmanına taşımaktı.

Uygulanan mimari kararlar:

- `app/routes/dashboard.posts.tsx` sadece route entrypoint olarak bırakıldı.
- Dashboard posts ile ilgili tüm admin yüzeyi `app/features/dashboard/posts` altında tutuldu.
- Blog tarafında yeniden kullanılabilecek domain sözleşmeleri `app/features/posts` altında bırakıldı.
- CRUD işlemleri `app/lib/posts/posts.server.ts` içine taşındı ve `posts` tablosu üzerinde server-side create, update, delete, list akışları eklendi.
- Form validasyonu `Zod` ile `app/lib/posts/post-form.server.ts` içinde kuruldu.
- Yazı içeriği artık TipTap doküman JSON'u olarak saklanıyor; bu sayede dashboard içinde Medium benzeri WYSIWYG deneyim elde edilirken server tarafında typed içerik sözleşmesi korunuyor.
- TipTap entegrasyonu `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder` ve `@tiptap/extension-underline` ile kuruldu.
- Toolbar tarafına `H1`, `H2`, `H3` ve `Horizontal Rule` aksiyonları eklendi.
- Dashboard sidebar içindeki `Posts` girdisi canlı navigasyona çevrildi ve overview ekranındaki `Create New Post` aksiyonu gerçek route'a bağlandı.
- Yazı oluşturma ve güncelleme akışı tek sunuma indirildi: Medium benzeri tam ekran compose yüzeyi.
- Ağır editör katmanı route chunk'ından ayrıldı; hafif editor shell route içinde kalırken TipTap surface ayrı lazy chunk olarak yüklenir.

Compose yüzeyi şu mantıkla çalışır:

- Form içindeki yazı alanı `DashboardPostsEditor` leaf component'i içinde TipTap ile yönetilir.
- `DashboardPostsEditor` sadece hidden input senkronizasyonu ve client gate görevini üstlenir; asıl TipTap surface dinamik import ile açılır.
- `dashboard/posts` liste ekranından create veya edit tetiklendiğinde registry ekranı tamamen yerini compose yüzeyine bırakır.
- Compose açıkken posts registry render edilmez; böylece tekrar eden dashboard katmanları ve çift görünüm problemi ortadan kalkar.
- Üst bar ve yan panel içindeki `Back To Posts` aksiyonları ile doğrudan liste ekranına dönülür.
- Toolbar tarafında undo/redo, tipografi, liste, baglanti, alinti ve code block aksiyonlari neo-brutalist dashboard diliyle eşleşecek şekilde tanımlandı.
- `app/features/posts/post-content.shared.ts` içindeki yardımcılar ile legacy plain text içerikler TipTap dokümanına normalize edilir; yeni submit'ler canonical JSON olarak kaydedilir.

## 2. Oluşturulan Dosyaların Sorumlulukları

### Route ve Dashboard Slice

- `app/routes/dashboard.posts.tsx`: posts dashboard route entrypoint'i, loader/action delegasyonu
- `app/features/dashboard/posts/dashboard-posts.server.ts`: loader/action orkestrasyonu, auth kontrolü, CRUD yönlendirmesi
- `app/features/dashboard/posts/dashboard-posts-route.tsx`: loader ve action state'ini ekrana bağlayan route bileşeni
- `app/features/dashboard/posts/dashboard-posts-screen.tsx`: metrics + registry görünümü ile tam ekran compose görünümü arasında tek akışlı geçiş
- `app/features/dashboard/posts/dashboard-posts.shared.ts`: metrics hesapları, form resolve/merge mantığı, status tone ve route href helper'ları
- `app/features/dashboard/posts/dashboard-posts.constants.ts`: dashboard posts copy ve form metinleri

### Dashboard Bileşenleri

- `app/features/dashboard/posts/components/dashboard-posts-table.tsx`: posts liste tablosu, edit/delete aksiyonları
- `app/features/dashboard/posts/components/dashboard-posts-compose-view.tsx`: tam ekran compose overlay'i
- `app/features/dashboard/posts/components/dashboard-posts-editor.tsx`: lazy-loaded editor shell ve client gate
- `app/features/dashboard/posts/components/dashboard-posts-rich-text-surface.tsx`: TipTap tabanlı full-screen WYSIWYG yazım alanı, toolbar ve hidden input senkronizasyonu

### Domain ve Server Katmanı

- `app/features/posts/post.shared.ts`: status, form field, intent ve query param sabitleri
- `app/features/posts/post-content.shared.ts`: TipTap içerik doküman tipi, legacy plain text dönüşümü, plain-text extraction ve canonical serialization helper'ları
- `app/features/posts/post-form.shared.ts`: typed form values/state ve default builder
- `app/lib/posts/post-form.server.ts`: Zod tabanlı form parse, TipTap içerik karakter validasyonu ve hata dönüşleri
- `app/lib/posts/posts.server.ts`: posts tablosu için create/update/delete/list servisleri

### Güncellenen Mevcut Dosyalar

- `app/features/dashboard/layout/dashboard-layout.constants.ts`: `Posts` navigasyonu aktif link oldu
- `app/features/dashboard/overview/dashboard-overview-screen.tsx`: `Create New Post` aksiyonu gerçek posts route'una bağlandı
- `tests/unit/dashboard-index.test.tsx`: overview create aksiyonu link olarak doğrulandı
- `tests/unit/dashboard-layout.test.tsx`: posts navigation link'i beklentisi eklendi

## 3. Uygulanan Testlerin Detayları ve Sonuçları

Eklenen testler:

- `tests/unit/dashboard-posts-route.test.tsx`
  - posts registry ekranının metrics + create trigger ile render olduğunu doğrular
  - create/edit sırasında sadece tam ekran compose yüzeyinin render olduğunu doğrular
  - compose açıkken registry ekranının tekrar etmediğini doğrular
  - compose yüzeyinden liste ekranına geri dönülebildiğini doğrular
- `tests/unit/dashboard-posts.server.test.ts`
  - loader'ın inventory ve metrics döndürdüğünü doğrular
  - create action'ın aktif session user id'si ile kayıt açtığını doğrular
  - validation failure durumunda 400 action state döndüğünü doğrular
- `tests/unit/post-form.server.test.ts`
  - geçerli TipTap JSON içerikli form submit'inin parse edildiğini doğrular
  - hatalı input durumunda alan bazlı hata üretildiğini doğrular
- `tests/unit/post-content.shared.test.ts`
  - structured TipTap içeriğinin korunduğunu doğrular
  - legacy plain text içeriğin canonical TipTap dokümanına normalize edildiğini doğrular

Toplam doğrulama sonucu:

- `npm run lint` geçti
- `npm run typecheck` geçti
- `npm test` geçti
  - Sonuç: `34 passed`, `68 passed`
- `npm run build` geçti
  - Not: route tarafındaki `dashboard.posts` chunk'lari `0.30 kB` ve `13.12 kB` seviyesine indi.
  - Agir editor katmani `dashboard-posts-rich-text-surface` adiyla `394.97 kB` ayri lazy chunk olarak uretildi.

## 4. Projeyi veya İlgili Feature'ı Ayağa Kaldırma / Çalıştırma Komutları

```bash
npm install
npm run dev
```

Dashboard posts akışını doğrulamak için:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Local geliştirmede doğrudan route:

- `/dashboard/posts`
- `/dashboard/posts?modal=create`

## 5. Development Roadmap Referansı

Bu dokümantasyon aşağıdaki roadmap maddesini kapsar:

- `Phase 4 / Task 4.5`: Blog yazıları için CRUD işlemleri ve içerik yazımı için Markdown / Rich Text Editor entegrasyonu
