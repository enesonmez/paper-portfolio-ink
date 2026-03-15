# Phase 1 / Task 1.4: CodeStandards

## Kapsam

Bu geliştirme, `paper-enes-ink` projesindeki `Phase 1 / Task 1.4` maddesini tamamlar:

- `1.4` Proje genelinde tip güvenliği ve kod standartları için Prettier/ESLint ayarlarının tamamlanması

Amaç, mevcut React Router + TypeScript + Tailwind tabanının üzerine tutarlı linting ve formatting hattı kurmaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki tooling katmanı eklendi:

1. ESLint v9 flat config yapısı kuruldu.
2. `typescript-eslint` ile type-aware linting etkinleştirildi.
3. React Hooks kuralları ESLint'e eklendi.
4. Prettier kuruldu ve Tailwind class sıralaması için `prettier-plugin-tailwindcss` bağlandı.
5. `lint`, `lint:fix`, `format`, `format:check` script'leri eklendi.
6. Prettier ve ESLint ignore stratejileri tanımlandı.
7. Tüm repo Prettier ile normalize edildi ve lint hattı temiz hale getirildi.

## Teknik Çalışma Mantığı

### 1. ESLint flat config seçimi

ESLint tarafında legacy `.eslintrc` yerine modern flat config kullanıldı.

Sebep:

- ESLint v9 ile doğal uyum
- config bileşimlerinin daha açık olması
- `typescript-eslint` ve `eslint-config-prettier` ile temiz entegrasyon

Kurulan yapı:

- `@eslint/js`
- `eslint`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-config-prettier`
- `globals`

### 2. Type-aware linting

`typescript-eslint` tarafında `recommendedTypeChecked` preset'i kullanıldı ve `parserOptions.projectService` aktif edildi.

Bu sayede:

- sadece sözdizimi değil tip bilgisi gerektiren kurallar da çalışıyor
- `any` kullanımı ve tip ithalatı gibi noktalar daha sıkı denetleniyor

Ek kurallar:

- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/consistent-type-imports: error`
- `@typescript-eslint/no-unused-vars: warn`

### 3. React Hooks kuralları

React tarafında ilk kritik kalite güvence katmanı olarak Hooks kuralları bağlandı.

Bu sayede:

- hook kullanım sırası korunuyor
- dependency mantığı hataları daha erken yakalanıyor

### 4. Prettier kurulumu

Prettier tarafında proje köküne ayrı config eklendi:

- `prettier.config.mjs`
- `.prettierignore`

Ek olarak `prettier-plugin-tailwindcss` ile Tailwind utility class sıralaması otomatik hale getirildi.

Bu, özellikle shadcn ve yoğun utility kullanan route dosyalarında manuel class düzenleme maliyetini düşürüyor.

### 5. Ignore stratejisi

Generated veya tool-state dosyaları lint/format dışında bırakıldı:

- `.react-router`
- `.wrangler`
- `build`
- `dist`
- `coverage`
- `node_modules`

Ek olarak `eslint.config.mjs` ve `prettier.config.mjs` typed lint kapsamı dışında tutuldu. Sebep, bu dosyaların TypeScript project service dışında yer alması ve uygulama kaynak kodu ile aynı typed lint akışını gerektirmemesi.

### 6. Format normalizasyonu

Prettier çalıştırılarak proje genelinde yazım biçimi tek çizgiye getirildi. Böylece lint/format hattı sadece yeni değişikliklerde değil mevcut repo üzerinde de kararlı hale geldi.

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni dosyalar

- `eslint.config.mjs`: ESLint flat config
- `prettier.config.mjs`: Prettier ayarları
- `.prettierignore`: format dışı bırakılan dosyalar

### Güncellenen dosyalar

- `package.json`: lint/format script'leri
- `package-lock.json`: yeni tooling bağımlılıkları
- `AGENTS.md`: roadmap task durumu

## Uygulanan Testler ve Doğrulamalar

Bu feature doğrudan business logic değil, tooling katmanı olduğu için ana doğrulama komut tabanlı yapıldı.

### Çalıştırılan komutlar

```bash
npm run format
npm run format:check
npm run lint
npm test
npm run typecheck
npm run build
```

### Sonuç

- `format` başarıyla çalıştı
- `format:check` temiz geçti
- `lint` temiz geçti
- `8` test dosyası ve `9` test geçti
- `typecheck` geçti
- production build geçti

## Feature'ı Çalıştırma Komutları

### Lint

```bash
npm run lint
```

### Otomatik lint düzeltme

```bash
npm run lint:fix
```

### Formatlama

```bash
npm run format
```

### Format kontrolü

```bash
npm run format:check
```

### Mevcut temel doğrulama hattı

```bash
npm test
npm run typecheck
npm run build
```

## İlgili Roadmap Referansları

- `Phase 1 / Task 1.4`

## Sonraki Mantıklı Adım

Foundation fazındaki teknik kurulum tamamlandı. Bundan sonraki mantıklı yön, `Phase 2` veri katmanına geçmek:

- Drizzle ORM + D1 entegrasyonu
- temel şema tanımları
- migration hattı
