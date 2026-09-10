# Görsel ve veri kaynakları

## Mimari konseptler

Yerel görseller, bu proje için built-in image_gen ile üretilmiştir. Bunlar gerçek mülk fotoğrafı, tamamlanmış 3B model veya CC0 kütüphane varlığı olarak sunulmaz. Aynı konsept, demo içinde aynı yapı türündeki birden fazla kart için kullanılır.

- `public/images/residence.webp`: özgün iki bloklu Akdeniz konut konsepti. Kaynak: `../artwork/mediterranean-residential-concept.png`.
- `public/images/villa.webp`: özgün Akdeniz villa konsepti. Kaynak: `../artwork/mediterranean-villa-concept.png`.

Üretim briefleri: Gerçekçi mimari dış mekân fotoğrafı estetiğinde, doğal taş, bronz metal ve balkonları bulunan iki altı katlı konut bloğu, peyzajlı avlu ve havuz; sıcak gün batımı; yazı veya logo yok. İkinci brief: taş ve ahşap, özel bahçe ve havuz içeren çağdaş Akdeniz villası; aynı 3:2 kadraj ve doğal akşam ışığı; yazı veya logo yok. Konut görselinde kat adedi geometrik olarak doğrulanmış değildir.

## Özgün 3B konsept

`public/models/luma-avlu-v2.glb`, `scripts/generate-model.mjs` ile bu proje için oluşturulmuştur. Eski model sürümü temiz depoya dahil edilmemiştir. İndirilen veya ücretli bir bina modeli, üçüncü taraf doku/HDRI içermez. Temel taş, cam, ahşap, havuz ve bitki malzemeleri geometrik modelle birlikte üretilir. Üretim kaynağı teslimin parçasıdır; dosya Blender gibi glTF 2.0 destekleyen araçlara aktarılabilir. Gerçek bina, parsel, uygulama projesi veya onaylı mimari kat planı olarak sunulmaz. Kart konsept görselleriyle birebir eşleşme iddiası yoktur.

V2'de `public/materials/limestone-albedo.webp` taş renk dokusu çalışma anında ayrıca bağlanır. Bu proje için built-in imagegen ile üretilmiştir; kaynak `../artwork/limestone-albedo-source.png`, tam üretim briefi `../artwork/limestone-texture-brief.md`. Yalnızca web aktarımı için 1024×1024 WebP'ye dönüştürülmüştür. Bir PBR tarama seti değildir; normal, height ve roughness haritaları içermez. Gökyüzü yansıması Three.js Sky ile yerelde hesaplanır.

Three.js ve eklentileri MIT lisanslı yazılım bağımlılığıdır; paketin lisans metni `node_modules/three/LICENSE` içindedir. Model için bir üçüncü taraf varlık satın alımı yapılmamıştır.

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
