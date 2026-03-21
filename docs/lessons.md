# Project Lessons

Bu dokuman, `docs/features` altindaki feature dokumanlari olusturulma sirasina gore okunarak hazirlandi. Amac, proje boyunca tekrar eden teknik kararlarin, dogrulanan mimari kaliplarin ve bundan sonraki gelistirmelerde korunmasi gereken uygulama prensiplerinin tek yerde ozetlenmesidir.

## 1. Foundation Lessons

- Projenin en saglam baslangic noktasi React Router v7 framework mode + Cloudflare uyumlu SSR iskeleti oldu.
- `app/root.tsx`, `entry.server.tsx` ve route agaci basit tutuldugunda sonraki feature'lar risksiz eklendi.
- Tailwind v4 + shadcn/ui entegrasyonu ancak tasarim token'lari erkenden tanimlandiginda kontrol altinda kaldi; aksi halde neo-brutalist dil dagilma riski tasiyor.
- ESLint flat config, type-aware linting ve Prettier normalizasyonu erken kuruldugunda sonraki slice refactor'lari daha ucuz hale geldi.
- Ilk gunden Vitest tabani kurmak, kucuk foundation kararlarinin bile geri donusunu kolaylastirdi.

## 2. Data And Auth Lessons

- D1 entegrasyonunda en dogru tercih, veritabani baglantisini dogrudan route'lara dagitmak yerine provider tabanli bir DB giris noktasi kurmak oldu.
- `db/schema.ts` tek kaynak oldugunda migration, provider ve test katmanlari hizali ilerledi.
- Drizzle migration hattinin script tabanli ve tekrar edilebilir olmasi, local D1 ile calismayi tahmin edilebilir hale getirdi.
- Better Auth entegrasyonu ancak schema Better Auth modeline gore duzenlendikten sonra temiz calisti; auth paketi sonradan eklenen bir detay degil, veri modelini etkileyen bir cekirdek karar.
- Request-time auth factory yaklasimi, Cloudflare runtime kisitlariyla daha uyumlu ve gelecekteki farkli runtime hedefleri icin daha tasinabilir bir cozum verdi.

## 3. Route And Slice Architecture Lessons

- Projede en verimli desen, route dosyalarini ince tutup asil yukleme, action, shared state ve screen kompozisyonunu `app/features/*` altina tasimak oldu.
- `route -> server -> shared -> screen -> components -> lib` akisi hem dashboard hem public alanlarda tekrarli olarak basarili oldu.
- Refactor'larin en faydali sonucu route modullerinin sade kalmasi ve client/server sinirlarinin netlesmesi oldu.
- Feature buyudukce ortak string sabitleri, form alan adlari, status degerleri ve query param isimleri shared katmana alinmadan kod hizla kirilganlasiyor.

## 4. Public Experience Lessons

- Public shell'i dashboard ve login gibi yonetim yuzeylerinden ayirmak, hem tema yonetimini hem de route seviyesinde layout kararlarini sadeleştirdi.
- Theme yonetiminde cookie tabanli server-first akisin kullanilmasi client storage ihtiyacini ortadan kaldirdi ve security ile UX arasinda iyi bir denge kurdu.
- Ana sayfa, projects ve blog icin ortak basari kalibi su oldu: ilk HTML icinde SSR veri ver, sonrasinda sadece gerekli leaf component'lerde lazy loading kullan.
- Dashboard tarafinda yonetilen hafif registry verileri public experience'a tasinacaksa, ayni domain server lib'i icinden ayrik bir public view model cikarmak kod tekrarini azaltirken admin'e ozel alanlari public route'lara sizdirmadan reuse sagladi.
- `IntersectionObserver + useFetcher.load()` modeli, tum route'u client-side hale getirmeden progressive feed deneyimi sagladi.
- Public blog detayinda semantic HTML, metadata uretimi, guvenli link protokolleri ve server-safe rich content render'i SEO ile guvenligi birlikte cozmeyi sagladi.

## 5. Admin Dashboard Lessons

- Dashboard guvenligi yalnizca navigation gizlemekle cozulmedi; asıl deger loader ve action seviyesinde server-side guard uygulanmasinda ortaya cikti.
- Login akisi, redirect hedefinin normalize edilmesi ve Zod tabanli action validasyonu ile daha guvenli hale geldi.
- Dashboard shell bir kez saglam kuruldugunda projects, posts ve users gibi moduller ayni kalipla hizli gelistirilebildi.
- CRUD ekranlarinda query-string tabanli modal state ve server-side action akisi, ekstra global state ihtiyacini buyuk olcude ortadan kaldirdi.
- Rich text editor gibi agir istemci katmanlari route chunk'indan ayrilip lazy yuklendiginde dashboard deneyimi korunurken gereksiz JS maliyeti azaltildi.
- Slug yonetiminde en iyi desen, DB unique constraint hatasini son savunma olarak tutup once server tarafinda on-dogrulama ve slug onerisi yapmak oldu.
- Kullanici yonetiminde rol kapilari, `isActive` modeli ve "last active admin" trigger'i gibi veri tabani destekli korumalar olmadan yalnizca UI tabanli bir kontrol yetersiz kaliyor.
- Logout akisinin server-side `POST` davranisi ve cookie temizligi ile yapilmasi, mevcut session mimarisiyle en tutarli cozum oldu.
- Skills gibi hafif dashboard registry'lerinde en dusuk riskli desen, ayni CRUD iskeletini role gate ile sarmalayip DB'de yalnizca string key saklayan merkezi bir icon registry ile Lucide bileşenlerini UI katmaninda cozmeye ve sira kontrolunu numeric `sortOrder` ile veri katmaninda tutmaya devam etmek oldu.
- Action seviyesinde ayni `SkillFormState` seklini donen hata dallari cogalmaya basladiginda, ortak response factory ile `400/403/409` state'lerini tek yerden uretmek degisiklik maliyetini belirgin sekilde dusurdu.
- Create/update action'lari ayni duplicate-check ve unique-constraint fallback desenini tasimaya basladiginda, mutation orchestration helper'i ve paylasilan persistence payload builder'i drift riskini azaltip yeni alan eklemeyi daha guvenli hale getirdi.

## 6. UI System Lessons

- Neo-brutalist dil ancak ortak primitive'ler uzerinden yonetildiginde tutarli kaldi.
- `Button`, form field ve tablo primitive'lerini ortaklastirmak hem tekrar eden class zincirlerini azaltti hem de ekran komponentlerini daha okunur hale getirdi.
- Typography, border, shadow ve accent kurallari merkezi olmadiginda feature bazli tasarim kaymasi riski yukseliyor.
- Mobil drawer, sticky header ve sert focus state gibi davranislar en basta ortak tasarim sistemi karari olarak ele alinmali.

## 7. Testing And Delivery Lessons

- Bu projede en iyi sonuc veren akış, once testleri tanimlayip sonra feature'i loader/action davranisina gore implement etmek oldu.
- En degerli testler saf helper'lari, server orkestrasyonunu ve route-level render sonucunu ayri ayri kilitleyen testler oldu.
- Her feature'da tum kalite kapilarinin kosulsuz temiz olmadigi goruldu; bazen hedefli test, typecheck ve secili lint calistirmalariyla ilerlenmis. Bu, proje genel CI hatti eksik oldugunda kabul edilebilir ama uzun vadede risk biriktirir.
- Feature dokumantasyonu her adimda yazildigi icin proje evrimi okunabilir kaldi; bu pratik korunmali.

## 8. What To Preserve Going Forward

- Yeni feature eklerken once ilgili domain icin feature slice ac.
- Route dosyasini ince tut; action, loader ve shared state'i feature katmanina tasi.
- Form ve API girislerinde Zod zorunlulugunu bozma.
- Public sayfalarda once SSR, sonra gerekirse leaf-level progressive enhancement kullan.
- Dashboard alaninda auth ve role gate'i loader/action seviyesinde uygula.
- Ortak UI desenleri tekrar etmeye basladigi anda primitive katmanina geri tasi.
- Veritabani kurallarini sadece uygulama katmaninda degil, gerekliyse migration ve trigger seviyesinde de guvenceye al.
- Her anlamli degisiklikten sonra `docs/features` ve gerekirse bu dokumani guncelle.
