# Maintenance: Lessons Prune

## Summary

`docs/lessons.md` icinde kalan bir madde, tum kalite kapilarinin her degisiklikte kosulmasi gerektigi mevcut agent workflow'u ile celisiyordu. Bu bakim calismasinda, secili test/lint/typecheck calistirmalarini "kabul edilebilir" gosteren eski ders kaldirildi; boylece dokuman yalnizca guncel calisma modelini yansitiyor.

## Files

- `docs/lessons.md`
  Guncel kalite kapisi beklentisi ile celisen eski ogrenme maddesi kaldirildi.
- `docs/features/Maintenance_LessonsPrune.md`
  Bu maintenance degisikliginin kaydini tutar.

## Tests

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`

## Commands

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

## Roadmap Reference

Bu calisma roadmap disi bir dokumantasyon bakim gorevidir.
