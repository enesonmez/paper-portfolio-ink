# Phase 3 Maintenance: Public Slice Server Modularization

## Summary

`app/features/public/home`, `app/features/public/blog` ve `app/features/public/projects` altindaki slice root'lari daha okunur bir klasor yapisina kavusturuldu. Amaç, dashboard'taki action/mutation odakli omurgayi public tarafa zorla tasimak degil; read-only public slice'larda server-side data akisini `data/*`, presentational katmani `ui/*`, blog detayina ozel davranisi ise `post/*` altinda toplamakti.

## Files

- `app/features/public/home/server.ts`
  Ince export yuzeyi olarak kaldi.
- `app/features/public/home/data/*`
  Ana sayfa cache key/schema, cache invalidation ve cache-backed loader akisini tasir.
- `app/features/public/home/ui/*`
  Ana sayfa screen, copy ve component katmanini tasir.
- `app/features/public/blog/server.ts`
  Ince export yuzeyi olarak kaldi.
- `app/features/public/blog/data/*`
  Blog index cache key/schema, cache invalidation, ilk sayfa loader'i ve feed loader'ini tasir.
- `app/features/public/blog/ui/*`
  Blog archive screen, copy ve feed/sidebar component'lerini tasir.
- `app/features/public/blog/post/*`
  Blog detay screen, post-body, post-not-found error kontrati ve detail loader akisini tasir.
- `app/features/public/projects/server.ts`
  Ince export yuzeyi olarak kaldi.
- `app/features/public/projects/data/*`
  Projects cache key/schema, cache invalidation, ilk sayfa loader'i ve feed loader'ini tasir.
- `app/features/public/projects/ui/*`
  Projects screen, copy ve card/feed component katmanini tasir.

## Verification

- `npx vitest run tests/integration/features/public/home.server.test.ts tests/integration/features/public/blog.server.test.ts tests/integration/features/public/projects.server.test.ts tests/integration/routes/public/home.test.tsx tests/integration/routes/public/blog.test.tsx tests/integration/routes/public/blog-post.test.tsx tests/integration/routes/public/projects.test.tsx tests/integration/routes/public/modules.test.ts`
- `npm run format:check`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run e2e`

## Roadmap

Bu degisiklik roadmap disi bir bakim/refactor calismasidir; `docs/roadmap.md` icinde yeni bir checkbox guncellenmedi.
