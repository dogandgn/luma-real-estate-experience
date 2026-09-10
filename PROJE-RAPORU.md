# Luma Etkileşimli Gayrimenkul Satış Deneyimi

## Proje, teknik mimari ve müşteri değer raporu

### 1. Yönetici özeti

Luma, gayrimenkul projelerini yalnızca ilan kartlarıyla listelemek yerine 2B şehir haritası, proje çevresi, 3B bina modeli, bağımsız bölüm seçimi, daire dosyası ve müşteriye verilebilecek PDF çıktısını tek satış akışında birleştiren etkileşimli bir web uygulaması demosudur.

Çalışmanın temel amacı, bir emlak danışmanının veya proje satış ofisinin müşteriye şu akışı kesintisiz gösterebilmesidir:

1. Şehirdeki projeleri harita ve liste üzerinden keşfetmek.
2. Bölge, proje tipi, fiyat ve teslim durumuna göre sonuçları filtrelemek.
3. Bir projeyi seçerek proje ve çevre bilgilerini incelemek.
4. Projenin 3B modeline geçerek blok, kat ve daire seçmek.
5. Seçilen dairenin fiyat, alan, cephe, durum ve plan bilgilerini görmek.
6. Konum, 3B görünüm, plan ve donatı tablosunu içeren müşteri PDF'i üretmek.

Demo, gelecekte farklı emlak ofislerine veya geliştiricilere uyarlanabilecek ürün yaklaşımını kanıtlar. Bununla birlikte mevcut içerik gerçek bir satış ilanı değildir. Proje adları, fiyatlar, bölgesel konumlar, donatı örnekleri ve mimari şemalar temsilidir.

---

## 2. Ürünün amacı

### 2.1 Satış amacı

Geleneksel gayrimenkul sitelerinde kullanıcı farklı sayfalarda harita, ilan, görsel, PDF ve sanal tur aramak zorunda kalır. Luma bu parçaları tek bir sunum akışında toplar. Böylece satış danışmanı müşterinin “Nerede?”, “Çevresinde ne var?”, “Hangi daireler uygun?”, “Binada nerede?” ve “Bana gönderebilir misiniz?” sorularına aynı uygulama üzerinden cevap verebilir.

### 2.2 Demo amacı

Bu sürümün görevi büyük bir kurumsal sistem kurmak değil, ürünün bütün temel yeteneklerini müşteriye gösterilebilir kalitede kanıtlamaktır:

- Çoklu proje portföyü ve 2B GIS haritası
- Liste–harita çift yönlü seçim
- Proje çevresi ve donatı katmanı için hazır arayüz
- Tek örnek projede ayrıntılı 3B satış deneyimi
- Blok, kat, oda ve satış durumu filtreleri
- 3B modelden bağımsız bölüm seçimi
- Sağ panelde belirgin daire bilgisi
- Ölçeksiz plan şeması ve harici medya bağlantı altyapısı
- Müşteri bilgi föyü veya sözleşme eki taslağı olarak PDF üretimi
- Masaüstü ve mobil uyumlu arayüz
- Yerel çalışma ve paylaşılabilir demo paketi

### 2.3 Gelecekteki ürün amacı

Demo onaylandıktan sonra aynı çekirdek; müşteri markası, gerçek portföy, gerçek donatı kaynakları, onaylı mimari planlar, CRM, rezervasyon ve yetkilendirme gibi modüllerle ayrı bir satış ürününe dönüştürülebilir. Mevcut mimari bu büyümeyi kolaylaştıracak kimlik ve veri sözleşmelerini içerir; ancak bu kurumsal modüller demoda yapılmış kabul edilmez.

---

## 3. Müşteri açısından değer önerisi

### 3.1 Gayrimenkul geliştiricisi için

- Projenin yalnızca fotoğraflarla değil, seçilebilir 3B bina üzerinden anlatılması
- Müşterinin blok ve kat ilişkisini daha kolay kavraması
- Uygun, rezerve ve satılmış dairelerin aynı görsel dilde gösterilmesi
- Proje çevresinin satış görüşmesine dahil edilmesi
- Farklı satış ofislerinde aynı güncel sunum standardının kullanılabilmesi

### 3.2 Emlak danışmanı için

- Sunum sırasında farklı uygulamalar arasında geçiş ihtiyacının azalması
- Filtrelerle müşteriye uygun seçeneklerin hızlı daraltılması
- Seçilen daireye 3B modelde odaklanabilme
- Görüşmenin sonunda müşteriye özel PDF hazırlayabilme
- Matterport, video, AR veya VR gibi mevcut içeriklerin daire dosyasına sonradan bağlanabilmesi

### 3.3 Son kullanıcı için

- Projelerin şehir içindeki dağılımını anlayabilme
- Konum ile bina ve daire arasındaki ilişkiyi kaybetmeden ilerleme
- Teknik olmayan, sade bir arayüzle seçenekleri karşılaştırma
- Seçilen dairenin planını, alanını, cephesini ve satış durumunu tek yerde görme
- İncelediği seçeneğin yazılı ve görsel özetini PDF olarak alabilme

---

## 4. Kullanıcı deneyimi ve ekran yapısı

### 4.1 Portföy keşif ekranı

Masaüstünde ana ekran üç aşamalı bir satış mantığı kullanır:

| Alan      | Görevi                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------- |
| Sol panel | Arama, bölge ve proje tipi filtreleri, gelişmiş filtreler, sıralama ve proje kartları           |
| Orta alan | MapLibre tabanlı 2B şehir haritası, proje işaretleri, kümeler ve harita araçları                |
| Sağ panel | Seçilen projenin görseli, fiyatı, uygun birim sayısı, teslim bilgisi ve yakın çevre seçenekleri |

Sol panelde yapılan seçim haritada ilgili projeyi öne çıkarır. Haritadaki bir işarete tıklamak da aynı projeyi listede seçer. Böylece harita ve liste iki ayrı ürün gibi değil, aynı portföy durumunun iki görünümü olarak çalışır.

Mobil görünümde ekran alanı korunmak için “Projeler” ve “Harita” arasında alt gezinme kullanılır. Kullanıcı haritadan bir proje seçip listeye döndüğünde seçili kart görünür konuma kaydırılır.

### 4.2 Proje ve yakın çevre paneli

Bir proje seçildiğinde sağ panel açılır. Burada:

- Proje adı ve bölgesi
- Temsili başlangıç fiyatı
- Uygun ve toplam daire sayısı
- Teslim durumu ve tarihi
- 3B proje dosyasına geçiş
- Yakın çevre yarıçapı
- Otobüs, metro/raylı sistem, eğitim, sağlık ve park kategorileri

bulunur.

Gerçek donatı kaynağı henüz bağlı olmadığı için arayüz bunu açıkça “veri bağlı değil” şeklinde bildirir. “Örnek akışı dene” seçeneği yalnızca kategori, harita ve liste etkileşimini gösterir; örnek noktalar gerçek kurum veya ulaşım noktaları olarak sunulmaz.

### 4.3 3B daire seçim ekranı

3B proje dosyasında ekran üç sütuna ayrılır:

| Alan       | Görevi                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| Sol sütun  | Blok, kat, oda ve durum filtreleri ile daire listesi                     |
| Orta sütun | Etkileşimli 3B bina modeli ve kamera araçları                            |
| Sağ sütun  | Seçilen dairenin ayrıntıları, plan, fiyat, PDF ve önceki/sonraki gezinme |

Seçilen daire hem listede turkuaz bir çerçeveyle hem de 3B model üzerinde yarı saydam hacim ve dış çizgiyle belirginleşir. Kamera seçilen bağımsız bölüme yaklaşır. Blok filtresi diğer bloğu gizler; kat seçimi üst katları kaldırarak kesit benzeri bir görünüm sağlar. Oda ve satış durumu filtrelerine uymayan cepheler geri plana alınır.

Kamera araçları genel görünüm, avlu, A blok, B blok ve üst görünüm seçeneklerini içerir. Ayrıca isteğe bağlı otomatik dönüş, akşam ışığı ve satış durumu renkleri bulunur. Hareket azaltma tercihi olan işletim sistemlerinde gereksiz animasyonlar kapatılır.

### 4.4 Görsel tasarım dili

Arayüz, yüksek yoğunluklu bir yönetim panelinden çok premium proje satış sunumu hissi verecek şekilde tasarlanmıştır:

- Ana koyu renk: lacivert `#122333`
- Proje vurgu rengi: bakır `#b8753b`
- Daire ve donatı seçim rengi: turkuaz/teal
- Zeminler: kırık beyaz ve açık doğal gri
- Tipografi: Inter
- İkon sistemi: Lucide

Bakır renk proje seçimlerinde, turkuaz renk ise bağımsız bölüm ve yakın çevre seçimlerinde kullanılır. Bu ayrım, kullanıcının “proje seçiyorum” ve “daire seçiyorum” bağlamlarını hızlı anlamasını sağlar.

---

## 5. Çözülen temel problemler

| Problem                                                   | Çözüm                                                                     | Uygulandığı yer                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| Şehirde birden fazla projeyi anlaşılır göstermek          | Kümelenebilen GeoJSON proje katmanı ve eş zamanlı portföy listesi         | `PortfolioMap.tsx`, `portfolio.ts`        |
| Liste ile harita seçiminin kopuk olması                   | Ortak `selectedId` durumu ve iki yönlü seçim                              | `App.tsx`                                 |
| Haritayı hareket ettirince sonuçların istemeden değişmesi | Sonuçlar yalnızca “Bu alanda ara” komutuyla sınırlandırılır               | `PortfolioMap.tsx`                        |
| Harita yüklenmediğinde uygulamanın kullanılamaması        | Hata ve yeniden deneme durumu; proje listesi çalışmaya devam eder         | `PortfolioMap.tsx`                        |
| 2B proje ile 3B bina ilişkisinin kaybolması               | Proje kimliği üzerinden proje dosyasına geçiş                             | `ProjectDetail.tsx`                       |
| 3B modelde dairenin hangi envanter kaydı olduğunu bilmek  | `Unit.modelNodeId` ile GLB seçim düğümü eşleştirmesi                      | `model-layout.ts`, `sales-scene.ts`       |
| Seçili dairenin yeterince belirgin olmaması               | Turkuaz hacim, dış çizgi, kamera odağı, seçili kart ve sağ bilgi paneli   | `sales-scene.ts`, `UnitInspector.tsx`     |
| Fare tekerleğiyle yakınlaştırmanın zaman zaman takılması  | OrbitControls değişiklik olayı sahneyi yeniden çizilecek olarak işaretler | `invalidation.ts`, `sales-scene.ts`       |
| 3B sahnenin cihazı sürekli meşgul etmesi                  | Yalnızca değişiklik olduğunda çizim; görünmeyen/kapalı sahneyi duraklatma | `sales-scene.ts`, `BuildingViewer.tsx`    |
| Gerçek olmayan donatıların gerçekmiş gibi algılanması     | Bağlantısız durum, açık “örnek” etiketleri ve ayrı örnek veri kimlikleri  | `nearby.ts`, `ProjectExplorer.tsx`        |
| Daire bilgisinin müşteriye aktarılması                    | Harita ve 3B görüntüsünü içeren yerel A4 PDF üretimi                      | `ReportDialog.tsx`, `create-pdf.ts`       |
| Gerçek plan veya tur yokken sahte bağlantı gösterilmesi   | Yalnızca doğrulanabilir güvenli URL varsa bağlantı üretimi                | `unit-presentation.ts`, `unit-media.json` |
| Müşteriye verilecek paket ile kaynak kodun karışması      | Ayrı demo ve kaynak ZIP'leri, açık dosya izin listesi ve manifest         | `package-demo.mjs`, `verify-release.mjs`  |

---

## 6. Teknik mimari

### 6.1 Genel veri akışı

```text
projects.json ──> portfolio.ts ──> App
                                      ├── Proje listesi ve filtreler
                                      ├── PortfolioMap / GeoJSON
                                      └── ProjectExplorer

Örnek daire envanteri ──> ProjectDetail ──> filtrelenmiş daireler
                                               ├── BuildingViewer
                                               │      └── Three.js / GLB sahnesi
                                               ├── UnitInspector
                                               ├── UnitSheet / SVG plan
                                               └── ReportDialog / PDF
```

Uygulama istemci tarafında çalışan bir React uygulamasıdır. Mevcut demoda bir backend veya veritabanı yoktur. Proje verileri JSON, daire envanteri ise deterministik örnek veri olarak kod içinde üretilir. Aynı veri sözleşmesi ileride API veya veritabanı kaynağıyla değiştirilebilir.

### 6.2 Kimlik ilişkileri

Sistemin 2B–3B ilişkisini koruyan temel kimlikler şunlardır:

- `Project.id`: harita, proje kartı, detay ekranı ve PDF arasındaki ana proje kimliği
- `Unit.projectId`: daireyi projeye bağlar
- `Unit.buildingId`: bağımsız bölümü bina/blok seviyesinde gruplar
- `Unit.floorId`: kat ilişkisini taşır
- `Unit.modelNodeId`: daire kaydı ile GLB içindeki seçim nesnesini eşleştirir
- `Unit.planId`: daireyi uygun 2B plan şemasına bağlar

Bu yapı sayesinde harita koordinatı ile 3B modelin aynı koordinat sisteminde olması gerekmez. Şehir haritası coğrafi koordinat kullanırken bina modeli yerel metre sistemi kullanır; ilişki güvenilir kimlikler üzerinden kurulur.

### 6.3 Ana kaynak dosyalar

| Dosya                                | Sorumluluk                                                             |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `src/App.tsx`                        | Ana uygulama durumu, portföy filtreleri, seçili proje ve mobil görünüm |
| `src/data/projects.json`             | Proje kayıtlarının ana veri kaynağı                                    |
| `src/domain/types.ts`                | Proje, daire, filtre ve medya veri sözleşmeleri                        |
| `src/domain/portfolio.ts`            | Filtreleme, para biçimleme, doğrulama ve GeoJSON dönüşümü              |
| `src/components/PortfolioMap.tsx`    | MapLibre haritası, kümeler, işaretler, alan arama ve ekran görüntüsü   |
| `src/components/ProjectExplorer.tsx` | Sağ proje ve yakın çevre paneli                                        |
| `src/components/ProjectDetail.tsx`   | Proje sekmeleri, daire filtreleri ve 3B çalışma alanı                  |
| `src/components/BuildingViewer.tsx`  | Model yükleme, kalite ve kamera kontrolleri, hata yönetimi             |
| `src/three/sales-scene.ts`           | Three.js sahnesi, ışık, seçim, kamera, çizim ve kaynak temizliği       |
| `src/domain/model-layout.ts`         | Dairelerin yerel 3B seçim hacimleri                                    |
| `src/components/UnitInspector.tsx`   | Sağ seçili daire paneli                                                |
| `src/components/UnitSheet.tsx`       | Plan ve daire dosyası                                                  |
| `src/domain/unit-presentation.ts`    | Plan tipleri ve güvenli dış bağlantılar                                |
| `src/components/ReportDialog.tsx`    | PDF alanları, görüntü yakalama ve indirme akışı                        |
| `src/report/create-pdf.ts`           | A4 PDF sayfalarının vektörel üretimi                                   |

---

## 7. Kullanılan kütüphaneler

| Teknoloji        |   Sürüm | Kullanım amacı                                                    |
| ---------------- | ------: | ----------------------------------------------------------------- |
| React            |  19.3.0 | Bileşenler, durum yönetimi ve kullanıcı etkileşimleri             |
| React DOM        |  19.3.0 | Tarayıcıya React arayüzünü bağlama                                |
| TypeScript       |   7.0.2 | Veri sözleşmeleri ve derleme zamanı hata kontrolü                 |
| Vite             |   8.2.2 | Yerel geliştirme sunucusu ve üretim derlemesi                     |
| MapLibre GL JS   |   6.9.0 | WebGL tabanlı 2B harita, GeoJSON, kümeler ve harita etkileşimleri |
| Three.js         | 0.186.0 | GLB model yükleme, 3B sahne, ışık, kamera ve ışınla seçim         |
| jsPDF            |   4.2.1 | Tarayıcı içinde A4 PDF üretimi                                    |
| Lucide React     |  1.43.0 | Tutarlı arayüz ikonları                                           |
| Fontsource Inter |   5.3.0 | Inter yazı tipini yerel sunma                                     |
| Vitest           |   5.0.0 | Veri, model, PDF, filtre ve etkileşim testleri                    |

MapLibre, Three.js ve PDF modülleri ihtiyaç anında yüklenir. Böylece kullanıcı 3B modele veya PDF ekranına hiç geçmezse bu büyük modüllerin tamamı ilk ekrana yüklenmez.

### 7.1 Harita kaynakları

- Görüntüleme motoru: MapLibre GL JS
- Stil ve tile servisi: OpenFreeMap
- Altlık şeması: OpenMapTiles
- Harita verisi ve atıf: OpenStreetMap

Atıflar arayüzde ve PDF içinde korunur. Altlık harita internet bağlantısı ister. Proje işaretleri harita kaynağından gelmez; Luma'nın temsilî proje katmanıdır.

### 7.2 Neden Cesium kullanılmadı?

Mevcut demo bir dünya küresi, geniş 3B arazi, fotogrametri veya şehir ölçekli 3D Tiles akışı gerektirmiyor. İhtiyaç; şehir içinde proje noktalarını 2B haritada göstermek ve seçilen projenin yerel GLB modelini açmaktır. Bu nedenle MapLibre + Three.js çözümü daha hafif, daha yönetilebilir ve müşteri paketlemesine daha uygundur.

Cesium aşağıdaki ihtiyaçlar ortaya çıkarsa yeniden değerlendirilebilir:

- Çok geniş coğrafyada yüzlerce proje
- 3B arazi ve yükseklik modeli
- Uydu görünümüyle gerçekçi dünya bağlamı
- 3D Tiles, fotogrametri veya şehir modeli
- Jeoreferanslı BIM modellerinin araziye oturtulması

---

## 8. 2B GIS çözümü

### 8.1 Proje katmanı

Proje kayıtları `regionalPoint` alanında WGS84 boylam/enlem koordinatı taşır. `portfolio.ts` bu kayıtları GeoJSON FeatureCollection biçimine dönüştürür. MapLibre aynı kaynağı kullanarak:

- Proje noktalarını çizer
- Yakın ölçekte fiyat etiketlerini gösterir
- Uzak ölçekte noktaları kümeler
- Seçilen projeye bakır renkli vurgu verir
- Kullanıcı tıklamasını proje kimliğine dönüştürür

### 8.2 Alan bazlı arama

Haritanın hareket etmesi sonuçları otomatik değiştirmez. Kullanıcı “Bu alanda ara” dediğinde görünür harita sınırları alınır ve portföy filtresine eklenir. Bu yaklaşım, haritayı incelerken listenin sürekli değişmesinden kaynaklanan kullanıcı deneyimi sorununu önler.

### 8.3 Yakın çevre altyapısı

Donatı katmanı proje katmanından ayrı bir GeoJSON kaynağıdır. Böylece gerçek veri bağlandığında proje işaretleriyle donatı işaretleri birbirine karışmaz. Kategori, yarıçap, seçili nokta, liste ve harita vurgusu hazırdır.

Gerçek aşamada yalnızca nokta göstermek yeterli olmayacaktır. Her kayıt için kaynak, güncelleme tarihi, veri lisansı, doğruluk seviyesi ve mesafe yönteminin belirtilmesi gerekir. Rota süresi kullanılacaksa ayrıca bir yönlendirme servisi gerekir; mevcut kuş uçuşu mesafe hesabı rota süresi değildir.

### 8.4 GIS sınırları

Mevcut işaretler parsel, bina oturumu, adres veya mülkiyet sınırı değildir. Tapu, malik ve resmî imar bilgisi bulunmaz. Gerçek uygulamada bu katmanlar yalnızca yetkili ve lisansı uygun kaynaklarla eklenmelidir.

---

## 9. 3B çözümü

### 9.1 Model üretimi

Demo modeli `scripts/generate-model.mjs` ile bu çalışma için özgün olarak üretilmiştir. Harici veya ücretli bina modeli kullanılmamıştır. GLB dosyası yaklaşık 2,6 MB'tır ve iki blok, altı kat ve 48 bağımsız seçim hacmi içerir.

Model içinde semantik roller bulunur:

- `building`: bina grubu
- `floor`: kat grubu
- `roof`: çatı
- `facade`: daire cephesi
- `selection`: tıklanabilir daire hacmi

48 seçim nesnesinin adı, envanterdeki `modelNodeId` değerleriyle birebir eşleşir. Otomatik testler bu eşleşmenin bozulmasını engeller.

### 9.2 Seçim yöntemi

Three.js Raycaster, kullanıcının tıkladığı noktadan görünmez seçim hacimlerine ışın gönderir. Bulunan nesnenin daire kimliği React durumuna aktarılır. Aynı kimlik:

- Sol daire kartını seçer
- Model üzerindeki daireyi vurgular
- Kamerayı daireye taşır
- Sağ bilgi panelini açar
- Plan ve PDF akışına veri sağlar

### 9.3 Görsel sunum

Sahnede fiziksel tabanlı malzemeler, gölgeler, renk yönetimi, analitik gökyüzü yansıması ve isteğe bağlı GTAO gölgelendirme bulunur. Varsayılan “Dengeli” kalite daha geniş cihaz desteği için kullanılır. “Detaylı gölgeler” seçeneği daha fazla çizim çağrısı ve doku belleği kullanır.

Akşam görünümü; güneş rengi ve yüksekliği, arka plan, sis, çevre yansıması ve mimari ışık malzemelerini birlikte değiştirir. Bu, ayrı bir video oynatmak yerine gerçek zamanlı sahne durumudur.

### 9.4 Performans yaklaşımı

- Cihaz piksel oranı üst sınırlandırılır.
- Sabit sahne sürekli çizilmez; yalnızca değişiklik olduğunda render edilir.
- Hover testi yaklaşık 32 ms ile sınırlandırılır.
- Detaylı gölge kaynakları yalnızca kullanıcı açtığında oluşturulur.
- Daire dosyası veya PDF penceresi açıkken arka 3B sahne duraklatılır.
- Bileşen kapanınca geometri, malzeme, doku, render hedefi, olay dinleyicisi ve WebGL bağlamı temizlenir.
- Model ve görüntüleyici kodu yalnızca 3B sekmesi açıldığında yüklenir.

Kontrollü RTX 5070 masaüstü ölçümlerinde dengeli ve detaylı dönüş yaklaşık 120 FPS olarak kaydedilmiştir. Bu sonuç fiziksel telefon, düşük donanım, yüksek DPR veya zayıf ağ garantisi değildir. Ayrıntılar `PERFORMANCE.md` dosyasındadır.

---

## 10. Daire dosyası ve medya bağlantıları

Seçilen daire için ölçeksiz SVG plan şeması üretilir. Dört plan tipi 48 örnek daireye `planId` üzerinden bağlanır. Kullanıcı planı yakınlaştırabilir, mekânları seçerek vurgulayabilir, filtrelenmiş daireler arasında ilerleyebilir ve tekrar 3B modelde ilgili daireye dönebilir.

`unit-media.json` yapısı aşağıdaki içeriklerin sonradan bağlanmasına hazırdır:

- Matterport
- Web sanal turu
- AR bağlantısı
- VR bağlantısı
- Video
- Yerel plan veya belge

Bağlantılar yalnızca kullanıcı eylemiyle açılır. HTTPS dış bağlantıları ve yerel plan yolları doğrulanır; yol geçişi veya güvensiz protokol kabul edilmez. Demoda gerçek içerik olmadığı için sahte bağlantı gösterilmez.

---

## 11. PDF bilgi föyü

Sağ daire panelindeki “PDF bilgi föyü / ek taslağı” ile üç bölümlü A4 belge hazırlanır:

1. Daire özellikleri, fiyat ve seçili dairenin 3B görüntüsü
2. Bölgesel harita, tıklanabilir konum ve donatı mesafe tablosu
3. Ölçeksiz plan şeması, belge numarası ve açıklamalar

Kullanıcı belge türü, müşteri, danışman, referans, ek numarası ve not alanlarını doldurabilir. PDF tamamen tarayıcı içinde oluşturulur; form verileri sunucuya gönderilmez veya kalıcı olarak kaydedilmez.

3B sahne geçici olarak 1500 × 950 çözünürlükte çizilir ve görüntü alınır. Harita görüntüsü, harita hareketi tamamlandıktan sonraki render olayında yakalanır. Görüntüler alınamazsa eksik bir PDF üretmek yerine kullanıcıya yeniden deneme sunulur.

Belge; teklif, tapu belgesi, onaylı mimari plan, imzalı sözleşme veya elektronik imza değildir. Gerçek sözleşmeye eklenmeden önce tüm bilgiler yetkili kişilerce doğrulanmalıdır.

---

## 12. Güvenlik, gizlilik ve veri dürüstlüğü

- Uygulama mevcut aşamada yalnızca `127.0.0.1` üzerinde çalışır.
- Müşteri form bilgileri bir API'ye gönderilmez.
- PDF tarayıcı belleğinde hazırlanır.
- Harici medya bağlantıları protokol ve yol açısından filtrelenir.
- Proje, daire ve GLB kimlik eşleşmeleri uygulama açılışında ve testlerde doğrulanır.
- Harita veya 3B model başarısız olduğunda kontrollü hata ekranı gösterilir.
- Demo paketine `.env`, `node_modules`, müşteri PDF'leri ve geçici dosyalar alınmaz.
- Paket içeriği açık izin listesiyle seçilir ve SHA-256 manifesti oluşturulur.
- OpenStreetMap/OpenMapTiles/OpenFreeMap atıfları korunur.

Gerçek satış ürününde kullanıcı hesabı, yetki, log, CRM veya kişisel veri saklama eklenecekse KVKK kapsamı, saklama süresi, erişim rolleri ve veri işleyen taraflar ayrıca tasarlanmalıdır.

---

## 13. Test ve kalite durumu

Son teknik kontrolde:

- 21 test dosyasında 78 otomatik test geçti.
- TypeScript kontrolü başarılı oldu.
- Vite üretim derlemesi tamamlandı.
- Yerel sunucunun GET/HEAD, MIME türü, eksik dosya, yöntem ve dizin dışına erişim kontrolleri geçti.
- Masaüstü ve 390 × 844 duyarlı görünüm tarayıcıda kontrol edildi.
- Harita → proje → 3B → daire → sağ panel → PDF önizleme akışı doğrulandı.
- Fare tekerleğiyle 3B yakınlaştırma kontrol edildi.

Otomatik testler gerçek cihaz kabul testinin yerine geçmez. Fiziksel Android/iPhone, Safari, entegre GPU, düşük bellek, yüksek DPR, zayıf internet ve uzun süreli bellek kullanımı hâlâ ayrı test kapsamıdır.

---

## 14. Yerel kurulum ve çalıştırma

Gereksinim: Node.js 22.12 veya daha yeni desteklenen LTS sürümü.

```powershell
cd luma-real-estate-experience
npm ci
npm run dev
```

Geliştirme adresi:

```text
http://127.0.0.1:5173/
```

Üretim kontrolü:

```powershell
npm test
npm run build
npm run preview
```

Üretim önizleme adresi:

```text
http://127.0.0.1:4173/
```

Paylaşılabilir yerel paket üretimi:

```powershell
npm run package:demo
```

Bu komut testleri ve derlemeyi çalıştırır; ardından `releases/` klasöründe ayrı demo ve geliştirici kaynak paketleri oluşturur.

---

## 15. Demo sunum akışı

Müşteri görüşmesinde önerilen sıra:

1. Sol panelde arama, bölge ve proje tipi filtrelerini gösterin.
2. Bir harita işaretine ve proje kartına tıklayarak çift yönlü seçimi anlatın.
3. Luma Avlu projesini seçerek sağ proje ve yakın çevre panelini açın.
4. Donatıların henüz gerçek veri olmadığını belirterek örnek etkileşim akışını gösterin.
5. “3B daireleri keşfet” ile proje dosyasına geçin.
6. Blok, kat, oda ve satış durumu filtrelerini deneyin.
7. Modelden veya listeden bir daire seçin; sağ panel ve kamera odağını gösterin.
8. Plan ve daire dosyasını açın.
9. PDF önizlemesini gösterip müşteriye özel föy üretilebildiğini anlatın.
10. Diğer projelerin portföy ölçeğini temsil ettiğini, ayrıntılı 3B modelin bu demoda yalnızca örnek projede bulunduğunu açıklayın.

---

## 16. Demo ile gerçek satış ürünü arasındaki sınır

### Mevcut demoda hazır olanlar

- 2B harita ve çoklu proje gösterimi
- Portföy filtreleri ve sıralama
- Proje ve çevre paneli
- Donatı arayüzü ve örnek etkileşim
- Tek projede 48 daireli özgün 3B model
- Daire filtreleri, seçim ve kamera animasyonları
- Ölçeksiz plan şemaları
- Güvenli medya bağlantısı altyapısı
- PDF bilgi föyü
- Yerel demo ve kaynak paketleme

### Gerçek ürün için henüz gerekenler

- Doğrulanmış proje adresleri ve koordinatları
- Gerçek parsel ve imar planı kaynakları
- Lisanslı ve güncel donatı verisi
- Rota mesafesi ve ulaşım süresi servisi
- Onaylı mimari kat ve daire planları
- Müşteriye ait gerçek 3B/BIM modeli ve optimizasyonu
- Gerçek fiyat ve satış durumu veri kaynağı
- Yönetim paneli ve içerik güncelleme süreci
- Kullanıcı hesabı, rol ve yetkilendirme
- CRM, talep toplama ve rezervasyon bağlantıları
- Alan adı, HTTPS, barındırma, yedekleme ve izleme
- KVKK ve kurumsal güvenlik süreçleri

---

## 17. Önerilen sonraki aşamalar

### Aşama 1 — Veri ve sorumluluk planı

Her gerçek veri alanı için kaynak, sahip, güncelleme sıklığı, lisans, doğruluk ve yayın sorumluluğu belirlenmelidir. Özellikle imar, parsel, fiyat ve satış durumu için “tek doğru kaynak” tanımlanmalıdır.

### Aşama 2 — Müşteri paket şeması

Marka renkleri, logo, iletişim bilgileri, proje veri şeması, model dosyası, görseller, planlar ve PDF metinleri müşteri bazlı bir yapılandırmaya taşınmalıdır. Böylece yeni müşteriye uyarlama kod değişikliği yerine veri ve tema paketiyle yapılabilir.

### Aşama 3 — Gerçek donatı ve rota

Onaylanan veri kaynağı bağlanmalı; kategori eşleme, önbellek, kaynak tarihi ve hata davranışı kurulmalıdır. Kuş uçuşu mesafe ile yol/ulaşım süresi kullanıcıya açıkça ayrılmalıdır.

### Aşama 4 — Gerçek parsel ve imar katmanları

Yetkili GIS verileriyle parsel sınırı, plan notu, kullanım kararı ve gerekli açıklamalar eklenmelidir. Resmî olmayan kaynaklar resmî belge gibi sunulmamalıdır.

### Aşama 5 — Gerçek model ve satış envanteri

Blender, Revit veya benzeri kaynaktan gelen model web için optimize edilmeli; daire kimlikleri mevcut `modelNodeId` sözleşmesine bağlanmalıdır. Fiyat ve durum verileri yönetim sistemi veya API üzerinden güncellenmelidir.

### Aşama 6 — Kurumsal ürün

Yönetim paneli, kullanıcı rolleri, CRM bağlantısı, talep formları, rezervasyon kuralları, analitik, yayın ortamı ve bakım modeli ayrı kapsamlandırılmalıdır.

---

## 18. Sonuç

Luma demosu, gayrimenkul satışında şehir ölçeğindeki 2B keşif ile bina ve daire ölçeğindeki 3B seçimi aynı müşteri yolculuğunda birleştiren çalışan bir ürün prototipidir. Teknik çözüm; ücretsiz ve açık web teknolojilerine, özgün bir GLB modele, açık veri tabanlı harita altyapısına ve tarayıcı içinde çalışan PDF üretimine dayanır.

En önemli kazanım yalnızca 3B bina göstermek değildir. Proje, konum, çevre, envanter, daire seçimi, plan ve müşteri belgesinin ortak kimliklerle birbirine bağlanmış olmasıdır. Bu çekirdek doğrulandıktan sonra gerçek veri ve müşteri markası eklenerek tekrar satılabilir bir gayrimenkul sunum ürününe dönüştürülebilir.
