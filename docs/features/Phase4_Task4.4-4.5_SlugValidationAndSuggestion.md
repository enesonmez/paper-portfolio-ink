# Phase 4 Task 4.4-4.5 Slug Validation And Suggestion

## 1. Summary

This refactor hardens the dashboard project and post authoring flows around slug management. Project creation and post creation no longer rely on database unique-constraint exceptions surfacing as generic failures. Both flows now preflight the submitted slug, return a `409` form state when the slug is already taken, and keep the form open with a targeted field-level error message.

An additional authoring enhancement was added on top of the validation work. The project modal and post compose screen now derive a slug suggestion from the current title input, then expose a direct "Use suggested slug" action beside the slug field. When the submitted slug collides with an existing record, the server also computes the next available suffixed suggestion and returns it to the same UI surface, so the user can recover without retyping.

## 2. Technical Implementation

### Shared slug helpers

- `app/lib/slug.ts`
  - Normalizes titles into ASCII-safe slugs with lowercase kebab-case output.
  - Finds the next available suffixed slug through an async `isTaken` callback.
  - Detects SQLite unique slug constraint failures so the server actions can gracefully recover from race conditions.

### Projects dashboard flow

- `app/lib/projects/projects.server.ts`
  - Added `isProjectSlugTaken` to check uniqueness.
  - Added `findAvailableProjectSlug` to derive the next usable slug from the submitted title.
- `app/features/dashboard/projects/dashboard-projects.server.ts`
  - Validates duplicate slug collisions before calling `createProject` or `updateProject`.
  - Catches `projects.slug` unique-constraint exceptions as a fallback.
  - Returns a `409` response with `errors.slug`, preserved form values, and `slugSuggestion`.
- `app/features/dashboard/projects/dashboard-projects.shared.ts`
  - Extended dashboard form state with `slugSuggestion`.
- `app/features/dashboard/projects/components/dashboard-projects-modal.tsx`
  - Replaced the raw slug field with the shared suggestion-enabled field.

### Posts dashboard flow

- `app/lib/posts/posts.server.ts`
  - Added `isPostSlugTaken` to check uniqueness.
  - Added `findAvailablePostSlug` to derive the next usable slug from the submitted title.
- `app/features/dashboard/posts/dashboard-posts.server.ts`
  - Validates duplicate slug collisions before calling `createPost` or `updatePost`.
  - Catches `posts.slug` unique-constraint exceptions as a fallback.
  - Returns a `409` response with `errors.slug`, preserved form values, and `slugSuggestion`.
- `app/features/dashboard/posts/dashboard-posts.shared.ts`
  - Extended dashboard form state with `slugSuggestion`.
- `app/features/dashboard/posts/components/dashboard-posts-compose-view.tsx`
  - Replaced the raw slug field with the shared suggestion-enabled field.

### Shared dashboard input surface

- `app/components/dashboard/slug-suggestion-field.tsx`
  - New client leaf component that observes the title field, computes a deferred suggestion, and writes the chosen slug back into the form control.
- `app/components/ui/form-field.tsx`
  - `TextField` now supports a custom `id`, which allows the title and slug inputs to be wired together without breaking labels or error associations.
- `app/features/projects/project-form.shared.ts`
- `app/features/posts/post-form.shared.ts`
  - Both form states now support an optional `slugSuggestion`.

## 3. File Responsibilities

- `app/lib/slug.ts`: shared slug normalization, availability probing, and unique-constraint detection.
- `app/lib/projects/projects.server.ts`: project persistence helpers plus project-specific slug uniqueness checks.
- `app/lib/posts/posts.server.ts`: post persistence helpers plus post-specific slug uniqueness checks.
- `app/features/dashboard/projects/dashboard-projects.server.ts`: project dashboard action orchestration and duplicate-slug recovery.
- `app/features/dashboard/posts/dashboard-posts.server.ts`: post dashboard action orchestration and duplicate-slug recovery.
- `app/components/dashboard/slug-suggestion-field.tsx`: reusable UI for title-driven slug suggestion and quick apply.
- `app/features/dashboard/projects/components/dashboard-projects-modal.tsx`: project create/edit modal form.
- `app/features/dashboard/posts/components/dashboard-posts-compose-view.tsx`: post compose form.

## 4. Tests

### Added / updated coverage

- `tests/unit/slug.test.ts`
  - Verifies title normalization, next-available suffix generation, and unique-constraint detection.
- `tests/unit/dashboard-projects.server.test.ts`
  - Verifies duplicate project slug submissions return a `409` state with a slug error and suggestion.
- `tests/unit/dashboard-posts.server.test.ts`
  - Verifies duplicate post slug submissions return a `409` state with a slug error and suggestion.
- `tests/unit/dashboard-projects-route.test.tsx`
  - Verifies the project modal renders a title-based slug suggestion action.
- `tests/unit/dashboard-posts-route.test.tsx`
  - Verifies the post compose view renders a title-based slug suggestion action.
- `tests/unit/dashboard-projects.shared.test.ts`
  - Updated shared form-state expectation for the new `slugSuggestion` field.

### Result

- `npm run typecheck` -> passed
- `npm test` -> passed

## 5. Run Commands

```bash
npm install
npm run typecheck
npm test
npm run dev
```

## 6. Roadmap References

- Phase 4: Projects CRUD interface and validation improvements.
- Phase 4: Blog posts CRUD authoring interface improvements.
- Related roadmap items:
  - `Projects icin CRUD (Ekleme, Duzenleme, Silme, Listeleme) arayuzlerinin form validasyonlari (Zod) ile yapilmasi.`
  - `Blog yazilari icin CRUD islemleri ve icerik yazimi icin Markdown / Rich Text Editor entegrasyonu.`
