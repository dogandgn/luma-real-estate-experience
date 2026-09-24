# Görsel ve veri kaynakları

## Mimari konseptler

Kart ve açılış konsept görselleri, bu proje için built-in image_gen ile üretilmiştir. Bunlar gerçek mülk fotoğrafı, tamamlanmış 3B model veya CC0 kütüphane varlığı olarak sunulmaz. Aynı konsept, demo içinde aynı yapı türündeki birden fazla kart için kullanılır.

- `public/images/residence.webp`: özgün iki bloklu Akdeniz konut konsepti. Kaynak: `../artwork/mediterranean-residential-concept.png`.
- `public/images/villa.webp`: özgün Akdeniz villa konsepti. Kaynak: `../artwork/mediterranean-villa-concept.png`.

Üretim briefleri: Gerçekçi mimari dış mekân fotoğrafı estetiğinde, doğal taş, bronz metal ve balkonları bulunan iki altı katlı konut bloğu, peyzajlı avlu ve havuz; sıcak gün batımı; yazı veya logo yok. İkinci brief: taş ve ahşap, özel bahçe ve havuz içeren çağdaş Akdeniz villası; aynı 3:2 kadraj ve doğal akşam ışığı; yazı veya logo yok. Konut görselinde kat adedi geometrik olarak doğrulanmış değildir.

## Özgün 3B konsept

`public/models/luma-avlu-v2.glb`, `scripts/generate-model.mjs` ile bu proje için oluşturulmuştur. Eski model sürümü temiz depoya dahil edilmemiştir. İndirilen veya ücretli bir bina modeli, üçüncü taraf doku/HDRI içermez. Temel taş, cam, ahşap, havuz ve bitki malzemeleri geometrik modelle birlikte üretilir. Üretim kaynağı teslimin parçasıdır; dosya Blender gibi glTF 2.0 destekleyen araçlara aktarılabilir. Gerçek bina, parsel, uygulama projesi veya onaylı mimari kat planı olarak sunulmaz. Kart konsept görselleriyle birebir eşleşme iddiası yoktur.

V2'de `public/materials/limestone-albedo.webp` taş renk dokusu çalışma anında ayrıca bağlanır. Bu proje için built-in imagegen ile üretilmiştir; kaynak `../artwork/limestone-albedo-source.png`, tam üretim briefi `../artwork/limestone-texture-brief.md`. Yalnızca web aktarımı için 1024×1024 WebP'ye dönüştürülmüştür. Bir PBR tarama seti değildir; normal, height ve roughness haritaları içermez. Gökyüzü yansıması Three.js Sky ile yerelde hesaplanır.

Three.js ve eklentileri MIT lisanslı yazılım bağımlılığıdır; paketin lisans metni `node_modules/three/LICENSE` içindedir. Model için bir üçüncü taraf varlık satın alımı yapılmamıştır.

## Modelden üretilen sunum görselleri

Bu teknik görseller korunur; genel görünüm canlı modelin açılış posteridir. Son sunum revizyonunda editoryal cephe/yaşam yüzeyleri aşağıdaki gerçekçi AI konsept setine geçmiştir.

- `public/images/model-overview.webp`: genel yerleşim.
- `public/images/model-facade.webp`: A blok cephe görünümü.
- `public/images/model-courtyard.webp`: avlu ve havuz aksı.

Bu üç görsel, özgün GLB'nin 2.1 revizyonundan ortak Three.js sahnesiyle, gündüz ışığında 1500×950 PNG olarak dışa aktarılıp WebP kalite 86 ile sıkıştırılmıştır. Toplam boyut 225.476 bayttır. Fotoğraf veya yeni yapay zekâ mimari görseli değildir; sahne mevcut özgün taş renk dokusunu kullanır. Proje lisansı geçerlidir. Kaynak modelin SHA-256 özeti ve revizyon bilgisi `src/domain/presentation-media.json` içinde tutulur; test, GLB değiştiğinde bu görsellerin yeniden gözden geçirilmesini zorunlu kılar.

Modelin 2.1 revizyonunda malzeme tonları, daha yumuşak ağaç geometrisi, alt bitkilendirme, giriş oturma elemanları, pencere kayıtları ve çatı peyzajı güncellendi. Uyumluluk için GLB dosya yolu korunmuştur. Taş renk dokusu düşük kuvvetli bir kabartma yaklaşımı olarak da kullanılır; taranmış fiziksel height/normal haritası iddiası yoktur.

Yeniden üretim: sunumun Mimari bölümünde modeli açın; Genel/Avlu/Cephe açılarını seçip “Bu görünümü indir” ile PNG alın. Model veya aydınlatma değişirse üç görseli birlikte yenileyin; manifesti ancak yeni dosyalar kontrol edildikten sonra güncelleyin. Açılış konsepti bu renderlardan ayrı ve açıkça etiketlidir.

## Gerçekçi sunum konseptleri — 19 Eylül 2026

`luma-hero-realistic.webp`, `luma-courtyard-realistic.webp` ve `luma-facade-realistic.webp`, built-in image_gen ile özgün model ekran görüntüleri referans alınarak üretildi. Her biri 1672×941; WebP kalite 85; toplam 1.000.896 bayt. Açılış, editoryal cephe ve yatay yaşam hikâyesinde kullanılır. İlk görsel öncelikli, diğerleri tembel yüklenir; yeni video veya 3B bağımlılığı eklenmedi.

Fotogerçekçi görünüm, gerçek mülk fotoğrafı veya birebir model doğruluğu anlamına gelmez: kat/cephe ayrıntıları, peyzaj ve özellikle ilk görseldeki deniz manzarası yapay zekâ yorumudur. Canlı seçim modeli değiştirilmedi. Etiketler bu ayrımı belirtir. Üçüncü taraf sitenin görseli indirilmedi veya kopyalanmadı. Proje lisansı geçerlidir. Tam promptlar, referans ve çıktı yolları: [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

### Mobil boyutlar — 24 Eylül 2026

Aynı üç WebP'den 768 px genişliğinde (768×432), kalite 82 sürümleri üretildi; yeni AI üretimi veya mimari düzenleme yapılmadı. `luma-hero-realistic-768.webp`: 84.080 bayt; `luma-courtyard-realistic-768.webp`: 73.280 bayt; `luma-facade-realistic-768.webp`: 79.690 bayt. Toplam 237.050 bayt. `srcset/sizes` ile tarayıcıya seçenek sunulur; piksel yoğunluğuna ve önbelleğe göre büyük sürüm de seçilebilir. Özgün büyük görseller korunur.

## Ölçeksiz daire şemaları

`src/domain/unit-presentation.ts` içindeki dört yerleşim şeması bu demo için özgün teknik diyagram olarak tanımlanır ve `UnitSheet` içinde SVG ile çizilir. Harici plan görseli veya üçüncü taraf mimari proje kopyalanmamıştır. 48 daire aynı dört tip şemayı paylaşır. Oda/durum bilgileri örnek envantere bağlıdır; çizim koordinatları metre değildir, alan hesabında kullanılmaz, gerçek parsel ya da onaylı mimari tasarım iddiası taşımaz.

## Gerçek harita altlığı

- https://openfreemap.org/ — servis ve stil kaynağı; ticari kullanım desteklenir, kamu servisinde SLA yoktur.
- https://www.openmaptiles.org/ — altlık veri şeması ve atıf.
- https://www.openstreetmap.org/copyright — OSM veri lisansı ve atıf.

Atıflar MapLibre kontrolünde korunur. Proje katmanı özgün temsili kayıtlardır. Gerçek parsel veya malik verisi yoktur.

## Yazı tipi ve ikonlar

- Inter, `@fontsource/inter` üzerinden yerel sunulur. Lisansı paket içinde bulunur.
- Lucide ikonları, `lucide-react` üzerinden kullanılır. Lisansı paket içinde bulunur.
- PDF için DejaVu Sans, `public/fonts/DejaVuSans.ttf` üzerinden yerel sunulur; Türkçe karakterler PDF içine gömülür. Değiştirilmemiş fontun gömülü telif ve izin metni `public/fonts/LICENSE-DejaVu.txt` içinde dağıtılır. Yeniden hazırlama aracı `scripts/prepare-pdf-font.mjs` kaynak TTF yolunu parametre alır. Resmî lisans: https://dejavu-fonts.github.io/License.html.
- PDF üretimi jsPDF (MIT) ile yapılır; lisans paketteki `node_modules/jspdf/LICENSE` içindedir. Harita görselinin kaynak atıfları ve OSM bağlantısı PDF içinde de korunur.
