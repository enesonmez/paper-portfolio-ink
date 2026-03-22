# Maintenance Dashboard Action Visibility Permissions

## 1. Ozet ve Teknik Yakit

Bu bakim calismasi, dashboard icindeki `posts`, `projects`, `skills` ve `users` slice'larini `resources` ekranlariyla ayni permission-gated UX davranisina getirdi. Server-side action guard'lari korunurken, loader katmaninda hesaplanan `permissions` bayraklari screen ve table bileşenlerine aktarildi; boylece create, edit ve delete aksiyonlari write yetkisi olmayan kullanicilar icin artik render edilmiyor.

## 2. Degisen Dosyalar ve Sorumluluklari

- `app/features/dashboard/posts/server.ts`
  Posts loader'ina `canCreate/canUpdate/canDelete` permission payload'i ekler.
- `app/features/dashboard/posts/state.ts`
  Posts slice icin permission tiplerini loader kontratina ekler.
- `app/features/dashboard/posts/route.tsx`
  Loader permission verisini screen'e aktarir.
- `app/features/dashboard/posts/screen.tsx`
  Create aksiyonunu permission'a gore kosullu render eder.
- `app/features/dashboard/posts/components/dashboard-posts-table.tsx`
  Edit/delete aksiyon kolonunu permission'a gore tamamen gizler veya parcali render eder.
- `app/features/dashboard/projects/server.ts`
  Projects loader'ina permission payload'i ekler.
- `app/features/dashboard/projects/state.ts`
  Projects slice permission tiplerini tanimlar.
- `app/features/dashboard/projects/route.tsx`
  Loader permission verisini screen'e aktarir.
- `app/features/dashboard/projects/screen.tsx`
  Create aksiyonunu permission'a gore kosullu render eder.
- `app/features/dashboard/projects/components/dashboard-projects-table.tsx`
  Edit/delete aksiyon gorunurlugunu permission'a gore yonetir.
- `app/features/dashboard/skills/server.ts`
  Skills loader'ina permission payload'i ekler.
- `app/features/dashboard/skills/state.ts`
  Skills slice permission tiplerini tanimlar.
- `app/features/dashboard/skills/route.tsx`
  Loader permission verisini screen'e aktarir.
- `app/features/dashboard/skills/screen.tsx`
  Create aksiyonunu permission'a gore kosullu render eder.
- `app/features/dashboard/skills/components/dashboard-skills-table.tsx`
  Edit/delete aksiyon kolonunu permission'a gore yonetir.
- `app/features/dashboard/users/server.ts`
  Users loader'ina permission payload'i ekler.
- `app/features/dashboard/users/state.ts`
  Users slice permission tiplerini tanimlar.
- `app/features/dashboard/users/route.tsx`
  Loader permission verisini screen'e aktarir.
- `app/features/dashboard/users/screen.tsx`
  Create aksiyonunu permission'a gore kosullu render eder.
- `app/features/dashboard/users/components/dashboard-users-table.tsx`
  Edit/delete aksiyon kolonunu permission'a gore yonetir.
- `tests/integration/routes/dashboard/posts.test.tsx`
  Posts ekraninda write claim yokken aksiyonlarin gizlendigini dogrular.
- `tests/integration/routes/dashboard/projects.test.tsx`
  Projects ekraninda write claim yokken aksiyonlarin gizlendigini dogrular.
- `tests/integration/routes/dashboard/skills.test.tsx`
  Skills ekraninda write claim yokken aksiyonlarin gizlendigini dogrular.
- `tests/integration/routes/dashboard/users.test.tsx`
  Users ekraninda write claim yokken aksiyonlarin gizlendigini dogrular.

## 3. Uygulanan Testler ve Sonuclari

- `npm test -- tests/integration/routes/dashboard/posts.test.tsx tests/integration/routes/dashboard/projects.test.tsx tests/integration/routes/dashboard/skills.test.tsx tests/integration/routes/dashboard/users.test.tsx`
  Gecti. 4 test dosyasi, 20 test basarili.

## 4. Calistirma ve Dogrulama Komutlari

- `npm test -- tests/integration/routes/dashboard/posts.test.tsx tests/integration/routes/dashboard/projects.test.tsx tests/integration/routes/dashboard/skills.test.tsx tests/integration/routes/dashboard/users.test.tsx`
- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run e2e`

## 5. Roadmap Referansi

- Roadmap disi bakim calismasi. Hedef, mevcut authorization UX'ini dashboard slice'lari arasinda tutarli hale getirmektir.
