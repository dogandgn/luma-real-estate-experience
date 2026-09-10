# Luma Real Estate Experience

> **Public portfolio showcase — not open source.** Kaynak kod inceleme amacıyla görünürdür; kopyalama,
> yeniden kullanma, dağıtma veya ticari kullanım izni verilmez. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

Gerçek İzmir altlığı, temsili proje kayıtları, sol liste ve filtreler, çift yönlü harita seçimi, proje detayı ve Luma Avlu için 48 daireye bağlı özgün 3B konsept model içeren portföy demosu.

## Çalıştırma

Node.js 22.12 veya üstü desteklenen LTS kullanın:

```sh
npm ci
npm run dev
```

Tarayıcı adresi `http://127.0.0.1:5173`. Uygulama yerelde çalışır; altlık harita internet bağlantısı ister. Yazı tipleri ve konsept görseller yereldir.

```sh
npm test
npm run build
npm run preview
npm run export:gis
npm run generate:model
```

## Paylaşılabilir yerel paket

`npm run package:demo` testleri, üretim derlemesini ve yerel sunucu kontrollerini çalıştırır; `releases/` içinde iki yeni zaman damgalı ZIP oluşturur. Demo ZIP'i hazır `site/` çıktısı ve Node tabanlı başlatıcı içerir; kaynak ZIP'i geliştirici için ayrıdır. Node çalışma zamanı ayrıca gerekir; tam çevrimdışı/bağımsız EXE değildir. Ayrıntı `DEMO-GUIDE.md`, ölçüm sonuçları `PERFORMANCE.md` içindedir.

`npm run demo:serve` üretim çıktısını yalnızca 127.0.0.1:4173 üzerinde açar. `?diagnostics=1` parametresi 3B görünüm içinde tekrar kullanılabilir ölçüm panelini açar. Müşteri PDF'leri, geçici çıktılar ve bağımlılık klasörleri paketlere dahil edilmez. Gerçek donatı/imar/müşteri entegrasyonu kullanıcıyla ortak planlama yapılana kadar bekler.

## Kaynak yapısı

- `PROJE-RAPORU.md`: ürün amacı, müşteri değeri, teknik mimari, 2B/3B çözüm ve sonraki aşamalar.
- `src/config.ts`: marka, altlık ve görsel adresleri.
- `src/data/projects.json`: proje verisinin tek kaynağı.
- `src/domain/types.ts`: proje, kat ve daire veri sözleşmeleri.
- `src/domain/portfolio.ts`: ortak filtreler, GeoJSON dönüşümü ve deterministik örnek envanter.
- `src/components/PortfolioMap.tsx`: MapLibre, kümeler, bölgesel seçim, arama kapsamı.
- `src/components/ProjectDetail.tsx`: proje ve daire envanteri.
- `src/components/UnitSheet.tsx`: seçilen dairenin dosyası, ölçeksiz SVG şeması ve medya bağlantıları.
- `src/domain/unit-presentation.ts`: plan tipleri, daire–plan eşleşmesi ve bağlantı doğrulama.
- `src/data/unit-media.json`: daire kimliğine göre gerçek belge ve harici medya adresleri; demoda boş.
- `PROGRESS.md`: yapılan işler, sıradaki aşama ve kalan kapsamın takibi.
- `src/components/BuildingViewer.tsx`: 3B yükleme, hata durumu ve görünüm araçları.
- `src/three/sales-scene.ts`: GLB yükleme, seçim, gölge/ışık, kamera ve kaynak temizliği.
- `src/domain/model-layout.ts`: metre cinsinden yerel model koordinatları, ortak daire filtresi.
- `scripts/generate-model.mjs`: özgün GLB üreticisi; `public/models/luma-avlu-v2.glb` çıktısını yeniden üretir.
- `src/three/presentation.ts`: yerel analitik gökyüzü yansımaları ve isteğe bağlı GTAO gölgelendirme.
- `public/materials/limestone-albedo.webp`: cephede kullanılan özgün imagegen renk dokusu.
- `gis/`: QGIS'te incelenebilecek çalışma pencereleri ve kullanım notları.
- `public/data/projects.geojson`: uygulama kaynağından türetilen GIS çıktısı; elle değiştirmeyin.

## Çalışan davranışlar

- Türkçe arama, bölge, tip, teslim, fiyat ve uygun birim filtreleri; sıralama.
- Harita işaretinden kart seçimi, karttan bölge odağı; kümeleri açma.
- Haritayı hareket ettirmek sonuçları kendiliğinden değiştirmez; “Bu alanda ara” kapsamı uygular.
- Proje detayı kapatılınca harita ve filtreler yerinde kalır.
- Luma Avlu envanterinde blok, kat, oda ve durum filtresi; seçili dairenin detayları.
- Mobil liste/harita geçişi, klavye etkileşimi, azaltılmış hareket tercihi.
- Altlık hata durumunda liste kullanılabilir kalır.
- Luma Avlu → İncele: sağda proje/çevre paneli. “3B daireleri keşfet”: solda 48 daire, ortada model, seçilince sağda daire bilgisi. Liste ve modelde ortak seçim.
- Blok izolasyonu, kat seçilince üst katları gizleme, oda/durum filtresine uymayan cepheleri soldurma.
- Kamera odağı, üst görünüm, başlangıca dönüş, isteğe bağlı otomatik dönüş ve akşam ışığı.
- Satış durumlarına göre renkli seçim hacimleri. AR/VR/Matterport bağlantıları uydurulmaz.
- Seçilen dairede “Plan ve daire dosyası”: 2B ölçeksiz şema, yakınlaştırma ve mekân vurgulama.
- Dosyada filtreye uygun önceki/sonraki daireye geçiş; seçilen daireye 3B'de geri odaklanma.
- Daire dosyası açıkken arka plandaki 3B çizim duraklar; ana harita ve filtreler korunur.

## 3B model sözleşmesi

Bu aşama Unreal kalitesinde fotogerçekçi sunum değil, satış etkileşiminin özgün geometrik prototipidir. İki blok × altı kat × dört daire = 48 bağımsız seçim hacmi vardır. GLB içindeki düğüm adları `Unit.modelNodeId` alanıyla eşleşir (`luma-a-01`…`luma-b-24`). `extras.role` alanları building/floor/roof/facade/selection ayrımını taşır. Daha ayrıntılı bir Blender modeliyle değiştirilirken bu sözleşme korunmalıdır.

Koordinatlar yerel metredir; Y yukarı, kuzey -Z yönüdür. GIS ile ilişki `projectId` üzerinden kurulur. Bölgesel harita işareti gerçek bir parsel dönüşümü, jeoreferanslı BIM yerleşimi veya resmi mülkiyet bilgisi değildir. Daire hacimleri şematiktir; envanterdeki net/brüt m² değerleri bu geometriden hesaplanmaz.

Modelin geometrisi ve temel malzemeleri yerel GLB dosyasındadır. Taş renk dokusu ayrı yerel WebP dosyasından yüklenir; eksikse bir uyarıyla düz malzemeye dönülür ve daire seçimi sürer. Harici model, HDRI, doku servisi veya lisans anahtarı kullanılmaz. Üretici statik parçaları malzeme/semantik grup bazında birleştirir. Görüntüleyici yalnızca 3B bölümü açıldığında yüklenir; kapatılınca WebGL kaynaklarını bırakır. Harita için düzeltilen MapLibre worker bağlantısı korunur.

### Görsel geliştirme — üçüncü aşama

V2 modeli, cephe bitkilendirmesi, taş paneller, perde detayları, balkon altı gölge çizgileri, ışık şeritleri, ahşap havuz çevresi ve dallı ağaç kümeleri ekler. GLB yaklaşık 2,5 MiB, 1024 px renk dokusu yaklaşık 294 KiB'dir. Doku bir albedo çalışmasıdır; ölçülmüş bir PBR taraması veya doğrulanmış kusursuz dikişsiz yüzey olduğu iddia edilmez. GLB'yi başka yazılıma taşıyanlar taş dokusunu ayrıca bağlamalıdır.

- Varsayılan **Dengeli** görünüm: yansıma ortamı, gölgeler ve renk yönetimi; sabit sahne yeniden çizilmez.
- **Detaylı gölgeler**: istem üzerine oluşturulan GTAO + renk çıkışı; kapatılınca ek render hedefleri bırakılır. Daha güçlü GPU gerektirebilir; FPS/cihaz performansı henüz ölçülmedi.
- **Genel / Avlu / A Blok / B Blok**: seçimi değiştirmeyen kamera geçişleri. Gizlenen blok için kamera düğmesi devre dışıdır.
- Akşam geçişinde güneş rengi/yüksekliği ve mimari ışık malzemelerinin parlaklığı yumuşak değişir. Azaltılmış hareket tercihi korunur.
- Şeffaf yüzeyler ve seçim hacimleri AO derinlik hesabından ayrıdır; görünmez seçim hacimleri ışın testiyle seçilebilir kalır.

Kullanıcı ilk görsel incelemeyi kendisi yapmak istediğinden bu aşamada tarayıcı açma, tıklama veya ekran görüntüsü testi yapılmadı. Derleme ve otomatik GLB/ışın seçimi kontrolleri görsel kalite doğrulamasının yerine geçmez.

## Kapsam ve sonraki işler

4. aşamada daire dosyası ve dört ölçeksiz plan şeması eklendi. Bunlar gerçek/onaylı mimari kat planı değildir. Gerçek satış veritabanı, CRM, rezervasyon, native AR/VR, gömülü Matterport veya çevrimdışı altlık yoktur. Yalnızca Luma Avlu'nun model bağlantısı doludur; diğer projeler var olmayan bir 3B görünüm sunmaz. Model henüz fotogerçekçi/Unreal eşdeğeri son sunum değildir.

5. aşamada seçim/sağ panel ve mobil düzen revizyonu uygulandı; masaüstü ve 390 px tarayıcı kontrolleri yapıldı. Gerçek cihaz performansı ve kapsamlı erişilebilirlik testleri açık. Daha sonra paylaşılabilir demo paketi; demo kabulünün ardından ayrı satış ürünü kapsamı gelir. Ayrıntılı durum `PROGRESS.md`, arayüz kararları ve kontrol sonuçları `UX-REVISION.md` dosyasındadır.

Yakın çevre arayüzü hazır; gerçek donatı verisi kullanıcı isteğiyle sonraya bırakıldı. “Örnek akışı dene” ile açıkça temsili otobüs/metro/eğitim/sağlık/park noktaları, kategori filtresi ve liste–harita seçimi test edilebilir. Bunlar gerçek donatı konumları değildir. Gerçek kaynak henüz bağlı olmadığından çevrede hiç donatı olmadığı sonucu çıkarılmamalıdır.

Gerçek plan/tur içerikleri sağlanınca `MEDIA-CONFIG.md` yönergesiyle bağlanabilir. Mevcut demo hiçbir sahte Matterport veya AR/VR bağlantısı açmaz. URL doğrulaması bağlantının varlığını ya da mülkle ilişkisinin doğruluğunu kanıtlamaz; içerik kontrolü yayın öncesinde ayrıca yapılır.

Konumlar temsili bölgesel işaretlerdir; gerçek adres ve parsel olarak kullanılmamalıdır. Görseller yapay zekâ ile üretilmiş konseptlerdir; bina kat sayısı veya daire planıyla birebir eşleşme iddiası taşımaz. Proje adları, fiyatlar ve durumlar demo verisidir.

## Doğrulama

### PDF ve tekerlek düzeltmesi

Seçili dairenin sağ panelindeki **PDF bilgi föyü / ek taslağı**, modelden 3B görüntü, mevcut harita görünümü/konum bağlantısı, donatı mesafe tablosu, daire özellikleri ve ölçeksiz planı A4 PDF olarak indirir. Müşteri/danışman ve dosya referansları isteğe bağlıdır. Gerçek veriler doğrulanana kadar çıktı demo/taslaktır. Kullanım, sınırlamalar ve teknik akış: `PDF-EXPORT.md`.

Tekerlek zoom'unda OrbitControls kamera değişimini olay içinde uyguladığından, bir sonraki karede yalnızca `controls.update()` sonucuna bakmak çizimi atlıyordu. Artık `change` olayı sahneyi yeniden çizilecek olarak işaretliyor; sabit sahnenin gereksiz çizilmemesi korunuyor. Bu davranış kurulu OrbitControls üzerinden tekerlek olaylarıyla test ediliyor.

`npm test` envanter/filtre kontrollerine ek olarak gerçek GLB dosyasını GLTFLoader ile açar; 48 seçim düğümünü, koordinatlarını, 12 katı, dış kaynak içermemesini, dosya boyutu ve mesh bütçesini doğrular. Plan tipi/oda sayısı eşleşmesi, şema alanlarının çakışmaması, güvenli URL filtreleme ve seçilen dairenin sunucu tarafı işaretleme kontrolleri de vardır. `npm run build` TypeScript kontrolü ve üretim derlemesidir. Görsel tarayıcı testleri ve gerçek mobil cihaz performans ölçümü bunların yerine geçmez; ayrıca yapılmalıdır.
