# Phase 2 / Task 2.1: DrizzleD1Integration

## Kapsam

Bu geliştirme, `paper-portfolio-ink` projesindeki `Phase 2 / Task 2.1` maddesini tamamlar:

- `2.1` Drizzle ORM kurulumu ve D1 veritabanı adaptörünün bağlanması

Amaç, Cloudflare `DB` binding'i üzerinden type-safe bir Drizzle giriş noktası kurmak, bunu React Router / Workers bağlamında kullanılabilir hale getirmek ve veri katmanını ileride farklı veritabanı sağlayıcılarına açılabilecek şekilde kurgulamaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki veri katmanı temeli kuruldu:

1. `drizzle-orm` paketi projeye eklendi.
2. `DatabaseProvider` sözleşmesi tanımlandı.
3. D1 binding'den Drizzle instance üreten ayrı bir D1 provider adapter'ı yazıldı.
4. Uygulamanın kullandığı ortak DB entrypoint'i provider seçimi üzerinden kuruldu.
5. Route/server tarafı için context tabanlı DB erişim yardımcı yüzeyi eklendi.
6. React Router `AppLoadContext` modül genişletmesi runtime-agnostic olacak şekilde `db` + `runtime` yüzeyi ile tip güvenli hale getirildi.
7. `wrangler.toml` içine `db/migrations` klasörü D1 migration dizini olarak bağlandı.
8. Entegrasyon davranışı unit test ile doğrulandı.

## Teknik Çalışma Mantığı

### 1. Provider sözleşmesi ve adapter ayrımı

Ana entegrasyon, tek bir D1 factory dosyası yerine provider tabanlı üç katmana ayrıldı:

- `db/contracts.ts`: ortak `DatabaseProvider<TEnv, TDb>` sözleşmesi
- `db/providers/d1.ts`: D1 adapter'ı ve `createD1Db()` factory
- `db/index.ts`: uygulamanın aktif provider giriş noktası

Bu ayrımın amacı, route ve uygulama katmanının doğrudan `drizzle-orm/d1` import etmek zorunda kalmamasıydı.

Mevcut implementasyonda aktif provider `d1Provider` olarak seçildi. Yarın PostgreSQL gibi başka bir sürücü eklendiğinde yeni adapter dosyası eklenip `db/index.ts` içindeki provider seçimi değiştirilebilir; route katmanının geri kalanı değişmeden kalır.

### 2. Drizzle D1 factory

`db/providers/d1.ts` içinde:

- `createD1Db(binding: D1Database)` doğrudan Drizzle D1 adapter'ını başlatır
- `d1Provider.createDb(env)` ise Cloudflare env nesnesinden `DB` binding'ini okuyup bu factory'yi kullanır

Bu yapı iki farklı kullanım yolunu açar:

- saf binding tabanlı kullanım
- provider tabanlı env kullanımı

### 3. Snake case stratejisi

Drizzle adapter başlatılırken `casing: "snake_case"` seçildi.

Sebep:

- ileride eklenecek tablo ve kolon isimlerinin veri tabanı tarafında snake_case kalmasını istemek
- TypeScript tarafında isimlendirme standardını daha kontrollü yönetmek

Bu karar, Phase 2.2 şema tanımları için zemin hazırlar.

### 4. Ortak DB entrypoint ve bootstrap sınırı

`db/index.ts` uygulamanın ortak DB yüzeyidir.

Burada:

- `DatabaseBootstrapInput` aktif provider'ın beklediği bootstrap girdisidir
- `AppDb` aktif provider'ın ürettiği DB tipidir
- `databaseProvider` aktif adapter seçimidir
- `createAppDb(input)` runtime bootstrap katmanının kullanacağı ortak giriş noktasıdır

Bu yapı, üst katmanların somut D1 adapter'ına değil provider sözleşmesine bağlanmasını sağlar. D1 binding'i artık yalnızca bootstrap tarafında görünür; route katmanına sızmaz.

### 5. Context tabanlı erişim

`db/context.ts` içine `getDbFromContext()` helper'ı eklendi.

Bu helper:

- React Router loader/action context'ine enjekte edilmiş `db` nesnesini alır
- bunu doğrudan route ve servis katmanına taşır

Bu sayede route dosyaları runtime vendor ayrıntılarını bilmeden sadece `context.db` ile çalışır.

### 6. React Router context typing ve runtime metadata

`app/runtime.server.ts` ve `app/env.server.ts` birlikte uygulamanın runtime bağımsız context sözleşmesini tanımlar.

Bu katmanda:

- `createRuntimeContext(platform)` ile taşınabilir runtime metadata üretilir
- `AppLoadContext` içine sadece:
  - `db`
  - `runtime`
    alanları eklenir

Bu katman, yarın Cloudflare dışında Node/Coolify gibi bir runtime kullanılacak olsa bile route katmanının aynı context yüzeyiyle çalışmasına zemin hazırlar.

### 7. Wrangler hizalaması

`wrangler.toml` içinde D1 binding bloğuna:

- `migrations_dir = "db/migrations"`

eklendi.

Bu, migration task'i henüz tamamlanmamış olsa da veri katmanı dizin yapısını Cloudflare tarafındaki D1 beklentisiyle hizalar.

### 8. Nelerin özellikle yapılmadığı

Bu task'te aşağıdakiler bilerek yapılmadı:

- tablo şemaları
- migration üretimi / çalıştırma
- `drizzle-kit` kurulumu

Sebep:

- bunlar roadmap'te ayrı görevler olarak zaten `2.2` ve `2.3` altında tanımlı
- `2.1` kapsamını ORM kurulumu ve D1 adapter binding'i ile sınırlı tuttum

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni dosyalar

- `db/contracts.ts`: provider sözleşmesi
- `db/index.ts`: uygulamanın ortak DB giriş noktası
- `db/providers/d1.ts`: D1 adapter implementasyonu
- `db/context.ts`: route/server context içinden DB erişim helper'ı
- `app/runtime.server.ts`: runtime-agnostic platform metadata sözleşmesi
- `app/env.server.ts`: React Router AppLoadContext type augmentation
- `tests/unit/app-load-context.test.ts`: runtime-agnostic app context testleri
- `tests/unit/db-provider.test.ts`: provider ve D1 adapter entegrasyon testleri

### Güncellenen dosyalar

- `package.json`: `drizzle-orm` bağımlılığı
- `package-lock.json`: kurulum kilidi
- `tsconfig.json`: `db/` klasörünün typecheck kapsamına alınması
- `wrangler.toml`: D1 migrations klasörü tanımı
- `AGENTS.md`: roadmap güncellemesi

## Uygulanan Testler ve Doğrulamalar

### Yeni test

`tests/unit/db-provider.test.ts`

`tests/unit/app-load-context.test.ts`

Bu testler:

- D1 binding ile Drizzle adapter'ın doğru çağrıldığını doğrular
- aktif provider üzerinden env nesnesi içinden `DB` binding'inin okunup DB instance üretildiğini doğrular
- ortak entrypoint'in provider seçimi ile çalıştığını doğrular
- route katmanının DB'yi vendor-specific wrapper olmadan `context.db` üzerinden alabildiğini doğrular
- runtime metadata'nın Cloudflare ve Node için taşınabilir şekilde üretildiğini doğrular

### Çalıştırılan komutlar

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

### Sonuç

- `10` test dosyası geçti
- `13` test geçti
- `lint` geçti
- `typecheck` geçti
- production build geçti

## Feature'ı Çalıştırma Komutları

### Genel doğrulama

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

### Geliştirme ortamı

```bash
npm run dev
```

## İlgili Roadmap Referansları

- `Phase 2 / Task 2.1`

## Sonraki Mantıklı Adım

Bu temel üzerine gelecek iki doğal adım:

- `2.2` `users`, `posts`, `projects`, `sessions` tablolarını `schema.ts` içinde tanımlamak
- `2.3` ilk local D1 migration hattını kurup çalıştırmak
