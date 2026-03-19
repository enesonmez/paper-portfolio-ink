# Phase 2 / Task 2.2: DrizzleSchemaDefinitions

## Kapsam

Bu geliştirme, `paper-portfolio-ink` projesindeki `Phase 2 / Task 2.2` maddesini tamamlar:

- `2.2` Temel veritabanı şemalarının (`users`, `posts`, `projects`, `sessions`) `schema.ts` içinde oluşturulması

Amaç, Phase 2.1'de kurulan provider tabanlı veri katmanını bozmadan domain tablolarını tek merkezde tanımlamak ve aktif provider'ın bu typed schema üzerinden DB instance üretmesini sağlamaktı.

## Yapılan İşlemlerin Özeti

Bu turda aşağıdaki schema katmanı eklendi:

1. `db/schema.ts` içinde `users`, `posts`, `projects`, `sessions` tabloları tanımlandı.
2. Ortak kimlik ve timestamp kolonları için tekrar kullanılabilir schema helper'ları yazıldı.
3. Auth, içerik yayınlama ve proje sıralama ihtiyaçlarını karşılayan temel indeksler ve foreign key ilişkileri eklendi.
4. Ortak `schema` nesnesi export edilerek aktif D1 provider'a enjekte edildi.
5. Şema davranışı ve provider wiring'i test-first şekilde doğrulandı.
6. Development roadmap üzerindeki `2.2` maddesi tamamlandı olarak işaretlendi.

## Teknik Çalışma Mantığı

### 1. Tek merkezli schema tanımı

`db/schema.ts` veri modelinin tek kaynak dosyasıdır.

Bu dosyada:

- `users`
- `posts`
- `projects`
- `sessions`

tabloları `drizzle-orm/sqlite-core` ile tanımlandı ve en sonda `schema` nesnesi üzerinden birlikte export edildi.

Bu yaklaşımın amacı, uygulamanın domain modelini provider implementasyonundan ayrı tutmaktı.

### 2. Schema helper'ları

Tekrarlanan kolonları azaltmak için iki yardımcı fonksiyon eklendi:

- `createIdColumn()`
- `createTimestampColumns()`

`createIdColumn()` tüm tablolarda metin tabanlı primary key üretir ve runtime tarafında `crypto.randomUUID()` ile id üretir.

`createTimestampColumns()` ise tüm tablolara:

- `created_at`
- `updated_at`

kolonlarını ekler.

Timestamp default'ları SQLite / D1 tarafında `unixepoch() * 1000` ifadesiyle milisaniye olarak tanımlandı.

### 3. Domain tabloları

#### `users`

Kullanıcı tablosu auth ve profil ihtiyaçlarını karşılayacak şekilde tanımlandı:

- benzersiz `email`
- `email_verified`
- `display_name`
- `password_hash`
- `role`
- opsiyonel `avatar_url`
- opsiyonel `bio`

Performans ve veri bütünlüğü için:

- `users_email_unique`
- `users_role_idx`

indeksleri eklendi.

#### `posts`

Blog yazıları için:

- `author_id`
- `title`
- `slug`
- `excerpt`
- `content`
- `cover_image_url`
- `status`
- `published_at`

kolonları tanımlandı.

`author_id`, `users.id` alanına `onDelete: "cascade"` ile bağlandı.

İçerik sorguları için:

- `posts_slug_unique`
- `posts_author_id_idx`
- `posts_status_published_at_idx`

indeksleri eklendi.

#### `projects`

Portfolyo projeleri için:

- `title`
- `slug`
- `summary`
- `description`
- `repository_url`
- `live_url`
- `cover_image_url`
- `status`
- `is_featured`
- `sort_order`

kolonları tanımlandı.

Listeleme ve öne çıkarma akışları için:

- `projects_slug_unique`
- `projects_status_idx`
- `projects_featured_sort_order_idx`

indeksleri eklendi.

#### `sessions`

Session tablosu güvenli oturum yönetimi için hash tabanlı tasarlandı:

- `user_id`
- `token_hash`
- `expires_at`
- `ip_address`
- `user_agent`

`user_id`, `users.id` alanına `onDelete: "cascade"` ile bağlandı.

Session doğrulama ve temizleme akışları için:

- `sessions_token_hash_unique`
- `sessions_user_id_expires_at_idx`

indeksleri eklendi.

### 4. Provider soyutlaması ile entegrasyon

Phase 2.1'de kurulan soyutlama bu task'te korunarak genişletildi.

`db/providers/d1.ts` artık Drizzle instance'ı oluştururken sadece `casing: "snake_case"` vermiyor; aynı zamanda ortak `schema` nesnesini de inject ediyor.

Bu sayede:

- D1 provider typed query surface üretir
- uygulama katmanı tablo tanımlarını provider'ın iç detaylarıyla karıştırmaz
- ileride yeni provider eklendiğinde aynı domain schema katmanı korunabilir

Yani schema, uygulama domain katmanında; provider ise bunu aktif runtime sürücüsüne bağlayan adapter katmanında kalır.

## Oluşturulan / Güncellenen Dosyaların Sorumlulukları

### Yeni dosyalar

- `db/schema.ts`: tüm domain tabloları, ortak schema export'u ve tekrar kullanılabilir schema helper'ları
- `tests/unit/db-schema.test.ts`: tablo kolonları, foreign key yapıları ve index sayıları için unit testler
- `docs/features/Phase2_Task2.2_DrizzleSchemaDefinitions.md`: feature dokümantasyonu

### Güncellenen dosyalar

- `db/providers/d1.ts`: Drizzle D1 provider'ına typed schema inject edilmesi
- `tests/unit/db-provider.test.ts`: provider'ın schema ile başlatıldığını doğrulayan test beklentisi
- `AGENTS.md`: roadmap güncellemesi

## Uygulanan Testler ve Doğrulamalar

### Yeni testler

`tests/unit/db-schema.test.ts`

Bu testler:

- ortak `schema` nesnesinin tüm domain tablolarını export ettiğini doğrular
- `users`, `posts`, `projects`, `sessions` tablolarındaki kritik kolonları doğrular
- `posts` ve `sessions` tablolarındaki foreign key tanımlarını doğrular
- her tablo için beklenen index yoğunluğunu doğrular

### Güncellenen test

`tests/unit/db-provider.test.ts`

Bu test:

- aktif D1 provider'ın Drizzle adapter'ını `schema` + `casing` ile başlattığını doğrular

### Çalıştırılan komutlar

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## Feature'ı Çalıştırma Komutları

### Genel doğrulama

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run format:check
```

### Geliştirme ortamı

```bash
npm run dev
```

## İlgili Roadmap Referansları

- `Phase 2 / Task 2.2`

## Sonraki Mantıklı Adım

Bu temel üzerine gelecek doğal adım:

- `2.3` local geliştirme için ilk D1 migration hattını kurup migration'ı başarıyla çalıştırmak
