# Phase 4 Maintenance: Drizzle Journal Backfill

## Ozet

Bu bakım çalışması, `db/migrations/` klasöründeki gerçek SQL zinciri ile `db/migrations/meta/_journal.json` arasındaki kopukluğu giderir. Repo içinde `0016` ile `0036` arasındaki migration dosyaları bulunmasına rağmen journal kaydı yalnızca `0015` ve `0037` girişlerini içeriyordu. Bu tutarsızlık, `drizzle-kit generate` çalıştırıldığında aracın mevcut migration geçmişini göremeyip schema farkını yeni bir SQL migration gibi üretmesine yol açıyordu.

Onarım yaklaşımı bilinçli olarak yalnızca journal zincirini düzeltir:

- geçici ve hatalı üretilen `0017_common_praxagora.sql` ile `0017_snapshot.json` temizlendi
- `_journal.json` gerçek SQL dosya setine göre `0000..0037` arasında eksiksiz hale getirildi
- daha önce var olan snapshot zincirine dokunulmadı; repo zaten tarihsel olarak her migration için birebir snapshot tutmuyor

Bu sayede sıfırdan kurulum yapan D1 migration akışı ile Drizzle meta geçmişi tekrar aynı kaynak setini gösterir.

## Degisen Dosyalar

- `db/migrations/meta/_journal.json`
  Eksik `0016..0036` kayıtları eklendi ve journal gerçek SQL migration zinciriyle hizalandı.
- `db/migrations/0017_common_praxagora.sql` `[DELETE]`
  Bozuk journal yüzünden `drizzle-kit generate` tarafından yanlışlıkla üretilen geçici migration temizlendi.
- `db/migrations/meta/0017_snapshot.json` `[DELETE]`
  Aynı yanlış üretim akışının parçası olan snapshot temizlendi.
- `docs/features/Phase4_Maintenance_DrizzleJournalBackfill.md` `[NEW]`
  Bu bakım çalışmasının teknik kaydı.
- `docs/lessons.md`
  Drizzle journal kopukluğu durumunda otomatik migration üretimine güvenilmemesi gerektiğine dair yeni ders eklendi.

## Testler

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run e2e:prepare`
- `npm run e2e`

## Dogrulama

1. `db/migrations/` altındaki SQL dosyalarını sırala ve `0000..0037` zincirinin eksiksiz olduğunu doğrula.
2. `db/migrations/meta/_journal.json` içinde aynı tag setinin aynı sırayla yer aldığını doğrula.
3. Repo içinde yanlışlıkla üretilmiş `0017_common_praxagora.sql` ve `0017_snapshot.json` dosyalarının bulunmadığını doğrula.
4. Yerel migration ve seed akışının `npm run e2e:prepare` ile hatasız tamamlandığını doğrula.

## Roadmap Referansi

- Roadmap dışı bakım çalışması.
