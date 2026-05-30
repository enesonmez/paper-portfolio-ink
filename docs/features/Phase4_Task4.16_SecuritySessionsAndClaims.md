# Phase 4 Task 4.16 - Security Sessions & Granular Settings Claims

## Ozet

Bu çalışma kapsamında, ayarlar panelinde ince taneli (fine-grained) yetkilendirme modeline geçiş sonrası atıl duruma düşen eski kaba `settings.manage` yetkisi hem kod tabanındaki yetki modellerinden (`app/shared/authz/model.ts`) hem de D1 SQLite veri tabanından SQL migration ile kalıcı olarak temizlenmiştir (Zero-Dead-Code prensibi).

Ayrıca, `/dashboard/settings?tab=security` sekmesi altında listelenen aktif kullanıcı oturumlarında (Active Sessions), kullanıcının o an tarayıcıda kullandığı aktif oturumu (`isCurrent: true`) listenin en başında yer alacak şekilde sıralanmış ve oturum detaylarındaki uzun, çirkin ve taşma yapan ham User Agent metin blokları kaldırılarak neo-brutalist tasarıma uygun şık birer tarayıcı/işletim sistemi etiketine (`Chrome (macOS)` vb.) dönüştürülmüştür.

## Degisen Dosyalar

- `db/migrations/0034_security_sessions_and_claims.sql` [NEW]
  - D1 SQLite veri tabanı üzerinde `settings.manage` yetkisini temizleyen, ince taneli (fine-grained) settings yetkilerini ve rollerini atayan, ve aktif oturum yönetimi için gereken tüm yerelleştirme (i18n) verilerini tek elden toplayan birleşik veri tabanı migrasyon dosyası.
- `app/shared/authz/model.ts`
  - `settingsManage` sabitinin, `AUTHORIZATION_CLAIM_VALUES` listesinden ve `AUTHORIZATION_CLAIM_DEFINITIONS` yetki tanım kümesinden tamamen kaldırılması.
- `app/features/dashboard/layout/navigation.ts`
  - Dashboard sidebar menüsündeki Settings linkinin görünürlük koşulunun eski kaba claim yerine yeni granular yetkilerden en az birine sahip olmayı zorunlu kılan `hasAnyAuthorizationClaim(claims, SETTINGS_AUTHORIZATION_CLAIMS)` kontrolüne geçirilmesi.
- `app/features/dashboard/settings/loader.server.ts`
  - Aktif oturumlar listelenirken kullanıcının o anki geçerli oturumunun (`isCurrent: true`) listenin en başında yer alacak şekilde sıralama (`.sort()`) mantığının entegre edilmesi.
- `app/domain/configuration/model.ts`
  - `revokeSession` intent'inin `ACCOUNT_CONFIGURATION_MUTATION_INTENT` altına eklenmesi ve `isAccountConfigurationMutationIntent` tip doğrulayıcısının güncellenmesi.
- `app/features/dashboard/settings/actions.server.ts`
  - İstek parametrelerindeki magic-string intent'lerin (`"update-account-configuration"` ve `"revoke-session"`) strongly-typed constants ile değiştirilmesi.
- `app/features/dashboard/settings/screen.tsx`
  - Arayüz kodunun sadeleştirilmesi ve aktif oturum listesinin yeni modüler alt bileşene delege edilmesi.
- `app/features/dashboard/settings/components/security-cards.tsx` [NEW]
  - Oturum kartlarının neo-brutalist tarzda listelenmesi, `parseReadableUserAgent` mantığı ve "Revoke Session" butonu form yönetiminin izole edildiği modüler bileşen.
- `docs/agent-workflow.md`
  - Teknik özellik dokümantasyon standartları ile "Sıfır Ölü Kod (Zero-Dead-Code)" prensiplerini içeren kuralların iş akış anayasasına detaylı bir şekilde eklenmesi.

## Testler

- `npm run format`
  - Kod biçimlendirme kuralları başarıyla doğrulanmıştır.
- `npm run lint`
  - Kod analiz aracı (ESLint) statik kontrolleri başarıyla tamamlanmıştır.
- `npm run typecheck`
  - TypeScript tip güvenliği statik analizi başarıyla geçilmiştir.
- `npm run test`
  - Vitest birim ve entegrasyon test suitleri %100 başarıyla yeşil tamamlanmıştır (393 test).
- `npm run e2e:prepare`
  - E2E testleri için D1 local database bootstrap ve migrate işlemleri yapılmıştır.
- `npm run e2e`
  - Playwright E2E test suitleri başarıyla geçilmiştir.

## Dogrulama

1. `/dashboard/settings?tab=security` adresine erişin.
2. Oturum listesinde o an kullandığınız tarayıcı oturumunun en üstte çıktığını ve üzerinde sarı renkli "CURRENT SESSION" rozeti bulunduğunu teyit edin.
3. Oturum kartlarının en üstünde `Chrome (macOS)` veya benzeri şekilde cihaz ve tarayıcı bilgisinin şık bir etiket olarak yer aldığını ve ham, uzun User Agent metin bloklarının tamamen kaldırıldığını doğrulayın.
4. Kod tabanında `settings.manage` veya `settingsManage` ifadesinin (eski migrasyonlar ve dokümanlar hariç) tamamen temizlendiğini typecheck ve lint adımlarıyla doğrulayın.

## Roadmap Referansi

- `Phase 4 / Task 4.16`: Active Sessions ve yetkilendirme modellerinin temizlenmesi, active session sıralaması, User Agent'ın badge olarak neo-brutalist tasarıma entegrasyonu ve granular settings claims geçişinin tamamlanması.
