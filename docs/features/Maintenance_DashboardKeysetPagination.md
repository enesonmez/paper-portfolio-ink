# Dashboard Keyset Pagination

## Ozet

Bu calisma roadmap disi bir bakim/performance iyilestirmesidir. Dashboard icindeki `posts`, `projects`, `skills` ve `users` registry ekranlari tam liste yerine filtre destekli keyset pagination ile calisacak sekilde guncellendi. UI tarafinda `Previous / Next` pager deseni kullanildi; filtre veya arama yapildiginda cursor sifirlaniyor, create/edit akislari ise aktif liste durumunu koruyor.

## Teknik Yapi

- `app/features/dashboard/posts`, `app/features/dashboard/projects`, `app/features/dashboard/skills`
- `app/features/dashboard/users`
  - Query-string tabanli `search`, `status`, `cursor`, `direction` state'i eklendi.
  - Screen/table/modal bileşenleri aktif liste state'ini koruyacak sekilde guncellendi.
- `app/features/dashboard/users`
  - Query-string tabanli `search`, `role`, `active`, `cursor`, `direction` state'i eklendi.
  - Users modal ve table linkleri aktif filtre/pagination baglamini koruyacak sekilde guncellendi.
- `app/features/dashboard/shared/pagination.ts`
  - Dashboard slice'lari icin ortak `next/previous` direction ve pagination state yardimcilari eklendi.
- `app/lib/posts/posts.server.ts`
  - Search + keyset pagination + metrics donduren dashboard list query'si eklendi.
- `app/lib/projects/projects.server.ts`
  - Search + status filtreli keyset pagination ve edit kaydini ayri yukleyen query eklendi.
- `app/lib/skills/skills.server.ts`
  - Search filtreli keyset pagination ve edit kaydini ayri yukleyen query eklendi.
- `app/lib/users/users.server.ts`
  - Search + role + active filtreli keyset pagination ve edit kaydini ayri yukleyen query eklendi.
- `app/shared/authz/post-policy.server.ts`
  - Owner/any policy bozulmadan posts dashboard listesi paginated hale getirildi.
- `db/schema.ts`
  - Dashboard keyset order'lari ile hizali yeni composite index'ler tanimlandi.
- `db/migrations/0025_dashboard_keyset_pagination.sql`
  - Yeni index'ler ve filtre/pagination copy'leri icin translation upsert migration'i eklendi.
- `db/migrations/0026_dashboard_users_pagination.sql`
  - Users registry keyset order'ina uygun index ve users filtre/pager copy'leri icin translation upsert migration'i eklendi.
- `app/shared/i18n/messages.shared.ts`
  - Search, clear filters, status filter ve pager label'lari icin TR/EN seed mesajlari eklendi.

## Degisen Dosya Sorumluluklari

- `loader.server.ts` dosyalari artik tam liste yuklemek yerine view-state parse edip paginated query cagiriyor.
- `state.ts` dosyalari modal/edit state'ine ek olarak filtre ve pagination query kontratini da tasiyor.
- `screen.tsx` ve `components/*table.tsx` dosyalari filtre formu ile pager'i present ediyor.
- `components/*modal.tsx` ve `dashboard-posts-compose-view.tsx` aktif liste durumunu koruyan donus linkleri kullaniyor.

## Testler

- Unit:
  - Dashboard state helper testleri yeni href/filter davranisina gore guncellendi.
  - Schema testleri yeni index sayilarina gore guncellendi.
- Integration:
  - Dashboard server test mock'lari yeni paginated loader kontratina gore guncellendi.
  - Dashboard route screen test fixture'lari yeni `filters` ve `pagination` prop'lari ile hizalandi.

## Dogrulama Komutlari

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run e2e:prepare
npm run e2e
git diff --check
```

## Roadmap Referansi

- Roadmap disi bakim/performance iyilestirmesi.
