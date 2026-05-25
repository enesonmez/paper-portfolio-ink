# Maintenance Readme And Usage Guide

## 1. Summary

This maintenance task adds an English repository-level `README.md` and a dedicated detailed usage guide. The goal is to keep onboarding, setup, and architecture information easy to scan while moving heavier public-site and dashboard operating instructions into a separate document that can evolve without bloating the repository entrypoint. The follow-up enrichment also adds badges and local SVG visuals so both documents scan better on GitHub without introducing runtime dependencies.

## 2. Files And Responsibilities

- `README.md`
  - Provides the repository overview, stack summary, quick-start steps, common commands, deployment notes, documentation links, badges, and an overview visual.
- `docs/usage-guide.md`
  - Documents local setup, public route behavior, authentication, dashboard sections, authorization expectations, and test workflows in detail, with visual route and workflow summaries.
- `docs/assets/readme-hero.svg`
  - Supplies the repository overview image rendered inside the README.
- `docs/assets/usage-guide-map.svg`
  - Supplies the usage-flow and surface map rendered inside the detailed guide.
- `docs/lessons.md`
  - Records the documentation maintenance lesson about separating quick-start content from operational guides.

## 3. Verification

The following commands were run after the documentation updates:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## 4. Validation Commands

- `npm run dev`
- `npm run db:migrate:local`
- `npm run db:seed:test-user`
- `npm test`
- `npm run e2e:prepare`
- `npm run e2e`

## 5. Roadmap Reference

- Roadmap-external documentation maintenance improvement.
