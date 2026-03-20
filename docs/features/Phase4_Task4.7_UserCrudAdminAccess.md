# Phase 4 Task 4.7: User CRUD Admin Access

## 1. Yapılan İşlemin Özeti ve Teknik Çalışma Mantığı

Bu çalışma ile dashboard içine yeni bir `Users` menüsü eklendi ve kullanıcı CRUD akışı yalnızca `admin` rolüne sahip oturumlar için erişilebilir hale getirildi. Çözüm, mevcut dashboard mimarisindeki vertical slice yaklaşımını takip edecek şekilde `route -> server -> shared -> screen -> components -> lib` katmanlarına ayrıldı.

Uygulanan akış şu şekilde çalışır:

- `/dashboard/users` route'u server-side `requireSession` kontrolü ile korunur.
- Oturum açmış kullanıcı admin değilse hiçbir kullanıcı listesi veya form verisi yüklenmez; bunun yerine ekranda `Bu flow'a erişim yetkiniz yoktur.` mesajı gösterilir.
- Admin oturumlarında kullanıcı listesi tek sorguda yüklenir, metrikler bellek içinde türetilir ve modal tabanlı create/update formu ile pasifleştirme akışı sunulur.
- Kullanıcı oluşturma ve parola güncelleme işlemlerinde `better-auth/crypto` ile parola hashlenir; credential account kaydı `users` kaydıyla birlikte yazılır.
- Kullanıcı silme fiziksel delete yerine `isActive=false` olacak şekilde pasifleştirmeye çevrildi. Inactive kullanıcılar yeni oturum açamaz ve mevcut korumalı route akışlarından da geçemez.
- Son aktif admin hesabının pasifleştirilmesi veya `author` rolüne düşürülmesi hem application-level guard ile hem de SQLite trigger'ları ile engellenir. Böylece eşzamanlı isteklerde de admin sayısının `0`'a düşmesi önlenir.
- Tüm form girdileri Zod ile doğrulanır. E-posta benzersizliği hem optimistic query ile hem de DB unique constraint yakalanarak korunur.
- Dashboard sidebar menüsü role göre üretilir; `Users` linki yalnızca admin rolünde görünür.

Güvenlik önlemleri:

- Route erişimi yalnızca istemci tarafında gizlenmedi; loader ve action seviyesinde server-side role gate uygulandı.
- Admin olmayan kullanıcılar için kullanıcı listesi sorgusu hiç çalıştırılmadı.
- Inactive kullanıcılar login aşamasında bloke edilir; stale session'lar ise `requireSession` içinde geri çevrilir.
- Şifreler açık metin tutulmadı, yalnızca hashlenerek `accounts.password` alanına yazıldı.
- Veritabanında trigger tabanlı `last active admin` koruması eklendi.
- CRUD işlemleri Drizzle üzerinden parameterized sorgularla yapıldı.

Performans önlemleri:

- Loader sadece ihtiyaç duyulan kullanıcı alanlarını seçer.
- Dashboard metrikleri ek DB turu yerine yüklenen liste üzerinden hesaplanır.
- Unauthorized akışta liste sorgusu atlanır.

## 2. Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni Dosyalar

- `app/lib/auth/session-user.ts`
  - Session içinden `id`, `role` ve `isActive` çözümleyen ortak yardımcılar.
- `app/features/users/user.shared.ts`
  - Kullanıcı rol, intent ve dashboard query param sabitleri.
- `app/features/users/user-form.shared.ts`
  - Kullanıcı form state ve varsayılan değerleri.
- `app/lib/users/user-form.server.ts`
  - Zod tabanlı kullanıcı form doğrulaması.
- `app/lib/users/users.server.ts`
  - Kullanıcı listeleme, oluşturma, güncelleme, pasifleştirme, admin sayımı ve e-posta benzersizlik sorguları.
- `app/features/dashboard/users/dashboard-users.constants.ts`
  - Users dashboard kopyaları ve hata mesajları.
- `app/features/dashboard/users/dashboard-users.shared.ts`
  - Form çözümleme, metrik üretimi ve href yardımcıları.
- `app/features/dashboard/users/components/dashboard-users-table.tsx`
  - Kullanıcı liste tablosu ve row action butonları.
- `app/features/dashboard/users/components/dashboard-users-modal.tsx`
  - Create/update modal form görünümü.
- `app/features/dashboard/users/dashboard-users-screen.tsx`
  - Admin registry görünümü ve restricted access ekranı.
- `app/features/dashboard/users/dashboard-users-route.tsx`
  - Route-level loader/action verisini ekrana bağlayan bileşen.
- `app/features/dashboard/users/dashboard-users.server.ts`
  - Users route loader/action mantığı ve admin gate.
- `app/routes/dashboard.users.tsx`
  - Flat route tanımı.

### Güncellenen Dosyalar

- `app/features/dashboard/layout/dashboard-layout.constants.ts`
  - Role-aware navigation üretimi.
- `app/features/dashboard/layout/components/dashboard-sidebar.tsx`
  - `Users` linkini sadece admin için render eder.
- `app/features/dashboard/layout/dashboard-layout-route.tsx`
  - Sidebar'a kullanıcı kimliği aktarır.
- `app/features/dashboard/layout/dashboard-layout.shared.ts`
  - Dashboard identity içine `id` alanı ve outlet context tipi eklendi.
- `app/features/dashboard/posts/dashboard-posts.server.ts`
  - Session user id çözümü ortak yardımcıya taşındı.
- `db/schema.ts`
  - `users.is_active` kolonu eklendi ve `posts.author_id` foreign key'i `restrict` olarak değiştirildi.
- `db/migrations/0002_tearful_warbound.sql`
  - `is_active` migration'ı, `posts.author_id` restrict dönüşümü ve `last active admin` trigger'ları.
- `scripts/seed-test-user.mjs`
  - Seed edilen admin hesabını aktif durumda upsert edecek şekilde güncellendi.
- `AGENTS.md`
  - Phase 4 Task 4.7 tamamlandı olarak işaretlendi.

### Test Dosyaları

- `tests/unit/dashboard-users.server.test.ts`
- `tests/unit/dashboard-users-route.test.tsx`
- `tests/unit/dashboard-layout.test.tsx`
- `tests/unit/dashboard-layout.shared.test.ts`
- `tests/unit/dashboard-guard.test.ts`

## 3. Uygulanan Testler ve Sonuçları

Uygulanan test kapsamı:

- Admin oturumunda users registry loader'ı doğru veri döndürüyor.
- Admin olmayan oturumda route veri sızdırmadan `access: "denied"` döndürüyor.
- Admin action isteği ile kullanıcı oluşturma redirect ile tamamlanıyor.
- Delete intent fiziksel silme yerine kullanıcıyı pasifleştiriyor.
- Son aktif admin hesabı pasifleştirilemiyor.
- Son aktif admin hesabı `author` rolüne düşürülemiyor.
- Admin olmayan action isteği `403` ve `Bu flow'a erişim yetkiniz yoktur.` hatası döndürüyor.
- Inactive kullanıcıların login denemesi `403` ile reddediliyor.
- Inactive session taşıyan kullanıcılar korumalı route'lardan redirect alıyor.
- Users registry ekranı metrikler, tablo ve create action ile render oluyor.
- Create modal görünümü ilgili input alanlarını render ediyor.
- Restricted access ekranı doğru uyarı mesajını gösteriyor.
- Dashboard sidebar admin kullanıcılar için `Users` linkini gösteriyor, diğer roller için gizliyor.
- Dashboard parent loader testi ve identity helper testleri yeni `id` alanına göre güncellendi.

Komut sonuçları:

- `npm test` -> başarılı, `46` test dosyası ve `118` test geçti.
- `npm run typecheck` -> başarılı.
- Yeni ve güncellenen dosyalar üzerinde hedefli `eslint` kontrolü -> başarılı.
- Not: Proje genel `npm run lint` komutu bu değişiklikten bağımsız mevcut dosyalarda (`public-blog.server.ts`, `blog_.$slug.tsx`, `slug.test.ts`) halihazırda hata veriyor.

## 4. Feature'ı Çalıştırma / Doğrulama Komutları

```bash
npm install
npm run dev
```

Kullanıcı yönetimi akışını doğrulamak için:

```bash
npm test
npm run typecheck
```

Geliştirme ortamında test admin kullanıcısı gerekiyorsa:

```bash
npm run db:seed:test-user
```

Ardından tarayıcıda şu akışlar kontrol edilir:

- `/login` üzerinden admin oturumu aç
- `/dashboard/users` sayfasında kullanıcı oluştur/güncelle/sil
- Admin olmayan bir kullanıcı ile `/dashboard/users` adresine git ve uyarı ekranını doğrula

## 5. Roadmap Referansı

- Phase 4 / Task 4.7: `Kullanıcılar için CRUD işlemlerinin yapılması.`
