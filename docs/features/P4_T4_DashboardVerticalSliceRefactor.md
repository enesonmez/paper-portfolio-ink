# Dashboard Vertical Slice Refactor

## 1. Yapilan Islem Ozeti ve Teknik Calisma Mantigi

Bu refactor ile `app/routes` altindaki dashboard route modulleri inceltilerek sadece route entrypoint gorevi gorecek hale getirildi. Asil loader, action, ekran orkestrasyonu ve component parcalaama mantigi `app/features/dashboard/*` altinda vertical slice yapisina tasindi.

Ana hedefler:

- `app/routes/dashboard.tsx`, `app/routes/dashboard._index.tsx` ve `app/routes/dashboard.projects.tsx` dosyalarini ince route modullerine dusurmek.
- Dashboard layout kabugunu `layout` slice altinda server helper, shared helper ve component seviyesinde ayirmak.
- Projects dashboard ekranini `projects` slice altinda server, shared state, modal, tablo ve form field componentlerine parcalaamak.
- Tekrarlanan enum benzeri string degerleri ve form field isimlerini `app/features/projects/project.shared.ts` altinda merkezi hale getirmek.
- Mevcut davranisi korumak icin yeni unit testlerle pure helper katmanlarini kilitlemek.

Refactor akisi:

1. Dashboard identity cozumleme mantigi saf fonksiyon haline getirildi.
2. Dashboard navigation, shell copy ve phase notlari sabitlestirildi.
3. Projects route icindeki modal/query/form/action mantigi pure helper ve server helper katmanlarina ayrildi.
4. Status, intent, query param ve form field isimleri typed constant yapisina tasindi.
5. Route testleri ve yeni helper testleri ile davranis tekrar dogrulandi.

## 2. Olusturulan ve Guncellenen Dosyalarin Sorumluluklari

### Route entrypoint dosyalari

- `app/routes/dashboard.tsx`
  Dashboard layout route loader'ini feature katmanina delegeler ve layout route component'ini export eder.
- `app/routes/dashboard._index.tsx`
  Dashboard overview ekranini feature katmanindan re-export eder.
- `app/routes/dashboard.projects.tsx`
  Projects route loader/action davranisini feature katmanina delegeler, ekran component'ini re-export eder.

### Dashboard layout slice

- `app/features/dashboard/layout/dashboard-layout.server.ts`
  Session guard sonucunu dashboard kullanici view-model'ine donusturur.
- `app/features/dashboard/layout/dashboard-layout.shared.ts`
  Dashboard identity fallback ve initials uretim mantigini barindirir.
- `app/features/dashboard/layout/dashboard-layout.constants.ts`
  Navigation item, shell copy ve phase notu gibi sabitleri toplar.
- `app/features/dashboard/layout/components/dashboard-sidebar.tsx`
  Sidebar navigation ve logout placeholder alanini render eder.
- `app/features/dashboard/layout/components/dashboard-header.tsx`
  Mobile menu toggle ve kullanici ozetini render eder.
- `app/features/dashboard/layout/dashboard-layout-route.tsx`
  Sidebar state orkestrasyonunu yapan route-level UI kabugudur.

### Dashboard overview slice

- `app/features/dashboard/overview/dashboard-overview.constants.ts`
  Dashboard overview ekranindaki stat, post ve log fixture verilerini typed constant haline getirir.
- `app/features/dashboard/overview/dashboard-overview-screen.tsx`
  Overview ekranini route klasoru disinda tutar.

### Dashboard projects slice

- `app/features/dashboard/projects/dashboard-projects.server.ts`
  Loader ve action icin D1/database tarafli route mantigini toplar.
- `app/features/dashboard/projects/dashboard-projects.shared.ts`
  Query param yorumlama, form state cozumleme, metrics uretimi ve status tone mapping gibi pure helper mantigini toplar.
- `app/features/dashboard/projects/dashboard-projects.constants.ts`
  Ekran copy'lerini ve form hata mesajlarini merkezi hale getirir.
- `app/features/dashboard/projects/dashboard-projects-screen.tsx`
  Metrics, heading, table ve modal orkestrasyonunu yapar.
- `app/features/dashboard/projects/dashboard-projects-route.tsx`
  `useLoaderData` ve `useActionData` sonucunu birlestirip ekran component'ine aktarir.
- `app/features/dashboard/projects/components/dashboard-projects-table.tsx`
  Proje listeleme tablosunu ve row-level action alanlarini render eder.
- `app/features/dashboard/projects/components/dashboard-projects-modal.tsx`
  Create/Edit modalini render eder.
- `app/features/dashboard/projects/components/project-form-fields.tsx`
  Ortak input, textarea ve select field componentlerini tutar.

### Shared project typing

- `app/features/projects/project.shared.ts`
  Project status degerleri, form field isimleri, action intent'leri ve query param anahtarlarini typed constant olarak toplar.
- `app/lib/projects/project-form.server.ts`
  Artik shared project constants uzerinden parse/default davranisi kurar.
- `app/lib/projects/projects.server.ts`
  `ProjectStatus` tipini shared project domain uzerinden kullanir.

### Test dosyalari

- `tests/unit/dashboard-layout.shared.test.ts`
  Dashboard identity helper davranisini dogrular.
- `tests/unit/dashboard-projects.shared.test.ts`
  Projects shared helper davranisini dogrular.
- `tests/unit/dashboard-projects-route.test.tsx`
  Guncel `ProjectOverview` fixture yapisina gore route screen davranisini test eder.

## 3. Uygulanan Testler ve Sonuclari

Refactor sirasinda once yeni helper testleri eklenmis, ardindan implementasyon bu testleri gececek sekilde tamamlanmistir.

Calistirilan komutlar ve durumlar:

- `npm test -- --run tests/unit/dashboard-layout.shared.test.ts tests/unit/dashboard-projects.shared.test.ts`
  Ilk calistirmada beklenen sekilde kirmizi durum olustu; cunku yeni slice dosyalari henuz yoktu.
- `npm test -- --run tests/unit/dashboard-layout.shared.test.ts tests/unit/dashboard-projects.shared.test.ts tests/unit/dashboard-layout.test.tsx tests/unit/dashboard-projects-route.test.tsx tests/unit/dashboard-index.test.tsx tests/unit/project-form.test.ts`
  Guncel refactor sonrasi gecti.
- `npm run lint`
  Gecti.
- `npm run typecheck`
  Gecti.
- `npm test`
  Tum test dosyalari gecti. Son durumda `27 passed`, `53 passed`.

## 4. Projeyi veya Ilgili Feature'i Calistirma Komutlari

Genel development:

```bash
npm install
npm run dev
```

Kalite ve dogrulama:

```bash
npm run lint
npm run typecheck
npm test
```

Dashboard refactor odakli hedefli testler:

```bash
npm test -- --run tests/unit/dashboard-layout.shared.test.ts tests/unit/dashboard-projects.shared.test.ts tests/unit/dashboard-layout.test.tsx tests/unit/dashboard-projects-route.test.tsx tests/unit/dashboard-index.test.tsx tests/unit/project-form.test.ts
```

## 5. Roadmap Referanslari

Bu refactor asagidaki mevcut roadmap alanlarini daha surdurulebilir hale getirmek icin uygulanmistir:

- Phase 4: Admin Dashboard
- Task 4.3 Dashboard mizanpaji
- Task 4.4 Projeler icin CRUD arayuzu

Not:
Bu calisma yeni bir roadmap kutucugunu tamamlamadigi icin `AGENTS.md` task checkbox durumlari degistirilmemistir.
