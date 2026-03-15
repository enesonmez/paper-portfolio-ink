# Phase 1 / Task 1.2: TailwindShadcnIntegration

## Kapsam

Bu geliştirme, `paper-enes-ink` projesindeki `Phase 1 / Task 1.2` maddesini tamamlar:

- `1.2` Tailwind CSS ve shadcn/ui entegrasyonunun yapılması

Amaç, mevcut React Router v7 foundation üzerine Tailwind v4 tabanlı stil sistemini, shadcn/ui yapı taşlarını ve neo-brutalist tema token’larını eklemekti.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki entegrasyonlar yapıldı:

1. Tailwind CSS v4, Vite plugin tabanlı olarak projeye eklendi.
2. shadcn/ui için gerekli yardımcı paketler ve proje konfigürasyonu kuruldu.
3. `components.json` oluşturularak shadcn/ui standardı projeye tanıtıldı.
4. `cn` utility ve ilk shadcn tabanlı bileşen olarak `Button` eklendi.
5. Ana sayfa, hata boundary’si ve placeholder route’lar Tailwind utility class’ları ile yeniden yazıldı.
6. Neo-brutalist tasarım dili CSS variable token’ları üzerinden Tailwind tema haritasına taşındı.
7. Dev ortamında ortaya çıkan plugin sırası kaynaklı runtime hata giderildi.

## Teknik Çalışma Mantığı

### 1. Tailwind v4 kurulumu

Tailwind kurulumu, modern Vite entegrasyonuna uygun şekilde yapıldı:

- `tailwindcss`
- `@tailwindcss/vite`

Bu yaklaşımda klasik `tailwind.config.ts` zorunlu değildir. Stil sistemi doğrudan `app/styles/app.css` üzerinden yönetilir.

### 2. shadcn/ui kurulumu

shadcn/ui için tam CLI init akışını elle karşılayan proje yapısı kuruldu:

- `components.json` eklendi
- alias yapısı tanımlandı
- `app/lib/utils.ts` içinde `cn()` utility oluşturuldu
- `app/components/ui/button.tsx` içinde ilk UI atomu eklendi

Eklenen yardımcı paketler:

- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `tw-animate-css`

### 3. Tasarım token’larının Tailwind’e taşınması

`app/styles/app.css` içinde:

- `@import "tailwindcss"` eklendi
- `@import "tw-animate-css"` eklendi
- `@theme inline` ile semantic token’lar Tailwind utility class’larına bağlandı
- light/dark token’lar CSS variable olarak tanımlandı

Bu sayede `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground` gibi utility’ler proje temasıyla hizalı hale geldi.

### 4. Neo-brutalist override stratejisi

shadcn/ui varsayılanı yumuşak radius ve gölgelere yatkın olduğu için `Button` bileşeninde özel override uygulandı:

- `rounded-none`
- `border-2 border-black`
- sert siyah/hardal gölge
- uppercase ve sıkı tracking
- güçlü focus ring
- aktif durumda fiziksel basma hissi için translate + shadow removal

Bu sayede shadcn altyapısı korunurken AGENTS içindeki neo-brutalist tasarım kuralları ihlal edilmedi.

### 5. Route’ların Tailwind’e taşınması

Aşağıdaki route’lar el yazımı CSS sınıflarından Tailwind utility class’larına geçirildi:

- ana sayfa
- blog placeholder sayfası
- projects placeholder sayfası
- root error boundary

Ana sayfada CTA alanı artık shadcn `Button` bileşeni ile render ediliyor.

### 6. Font entegrasyonu

AGENTS typography kararlarını React Router ortamına pratik şekilde taşımak için `@fontsource` paketleri kullanıldı:

- `@fontsource/vt323`
- `@fontsource/jetbrains-mono`

Bu seçim, `next/font/google` doğrudan kullanılamayan React Router/Vite bağlamında aynı tipografik hedefi korumak için yapıldı.

### 7. Dev runtime hatası ve çözümü

Tailwind plugin’i ilk aşamada `reactRouter()` plugin’inden önce yerleştirilmişti. Build ve test geçmesine rağmen dev runtime’da `Meta` tarafında şu hata oluştu:

- `Invalid hook call`
- `Cannot read properties of null (reading 'useContext')`

Sebep:

- React Router framework plugin’inin Vite içinde önce devreye girmemesi

Çözüm:

- `vite.config.ts` içinde plugin sırası `reactRouter(), tailwindcss()` olacak şekilde düzeltildi

Bu değişiklik sonrası local dev server ve browser runtime temiz çalıştı.

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Konfigürasyon

- `package.json`: Tailwind/shadcn bağımlılıkları
- `vite.config.ts`: React Router + Tailwind plugin sırası ve alias çözümleme
- `vitest.config.ts`: test ortamında alias çözümleme
- `tsconfig.json`: Vite/Vitest config typing için `node` types
- `components.json`: shadcn/ui proje tanımı

### Stil ve utility katmanı

- `app/styles/app.css`: Tailwind giriş noktası, tema token’ları, base layer
- `app/lib/utils.ts`: `cn()` helper

### UI bileşenleri

- `app/components/ui/button.tsx`: neo-brutalist shadcn button implementasyonu

### Uygulama route güncellemeleri

- `app/routes/_index.tsx`: CTA alanı ve ana sayfa Tailwind + shadcn geçişi
- `app/routes/blog.tsx`: Tailwind tabanlı placeholder page
- `app/routes/projects.tsx`: Tailwind tabanlı placeholder page
- `app/root.tsx`: Tailwind utility class’lı error boundary

## Uygulanan Testler

### Yeni testler

`tests/unit/button.test.tsx`

- Button’ın neo-brutalist shell sınıflarını doğrular
- `asChild` kullanımında anchor render edildiğini doğrular

### Mevcut testlerin etkilenmesi

Aşağıdaki testler entegrasyon sonrası da geçmeye devam etti:

- `tests/unit/site-config.test.ts`
- `tests/unit/home-route.test.tsx`
- `tests/unit/projects-route.test.tsx`
- `tests/unit/blog-route.test.tsx`
- `tests/unit/root-links.test.ts`
- `tests/unit/favicon-route.test.ts`
- `tests/unit/chrome-devtools-route.test.ts`

### Doğrulama komutları

```bash
npm test
npm run typecheck
npm run build
```

### Sonuç

- `8` test dosyası geçti
- `9` test geçti
- `typecheck` geçti
- production build geçti
- Chrome DevTools tarafında ana sayfa, `/projects` ve `/blog` runtime hatasız doğrulandı

## Feature’ı Çalıştırma Komutları

### Bağımlılık kurulumu

```bash
npm install
```

### Local development

```bash
npm run dev
```

### Test çalıştırma

```bash
npm test
```

### Type check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

## İlgili Roadmap Referansları

- `Phase 1 / Task 1.2`

## Sonraki Mantıklı Adım

Phase 1 içinde sıradaki teknik temel görev:

- `1.4` Prettier / ESLint ve kod standartlarının tamamlanması

