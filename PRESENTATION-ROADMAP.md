# Luma Avlu — proje sunumu yol haritası

## Amaç ve sınır

Son revizyon: kullanıcı geri bildirimiyle açılış/editoryal görseller model referanslı gerçekçi AI setine geçti. Birebir GLB renderı değildir. Avluda yaşam bölümünde masaüstü kaydırmaya bağlı yatay hikâye; dar ekranda yerel yana kaydırma ve her iki düzende ok/klavye kontrolü uygulandı. Otomatik video oynatımı yok. Ayrıntı ve doğrulama: PROGRESS.md; promptlar: IMAGE-PROMPTS.md. Aşağıdaki ilk alt aşama notları geçmiş teslimleri de içerir.

Ana ürün bir gayrimenkul portföyü ve satış deneyimidir. Çoklu proje listesi, filtreler, gerçek altlık harita, 3B daire seçimi ve PDF akışı korunur. Luma Avlu için isteğe bağlı, tam ekran bir anlatım eklenir. Sunum, daire seçimine ulaşmak için zorunlu değildir.

Sea Breeze referansından alınan yaklaşım: geniş mimari görsel, sakin tipografi, bölümlü anlatım ve görünür satış eylemi. Referansın görseli, videosu, markası veya kaynak kodu kopyalanmaz. Yeni backend, Cesium veya Unreal gerekmez.

## 1. Sunum girişi ve gezinme — tamamlandı

- Proje bazlı içerik kaydı: yalnızca Luma Avlu için sunum girişi.
- Proje/çevre panelinde “Projeyi keşfet”; doğrudan 3B erişim korunur.
- Proje dosyasından da sunuma erişim.
- Tam ekran yerel dialog, erişilebilir ad, Escape ve görünür geri düğmesi.
- Portföy arkada bağlı kalır: harita, proje seçimi ve filtreler sıfırlanmaz.
- Sunumdan 3B açılınca sunumun kaydırma konumu korunur. “Sunuma dön” aynı yere döner.
- Konum eylemi mevcut harita ve çevre panelini açar; ikinci harita oluşturulmaz.

Kabul: yalnızca kayıtlı projede giriş; sunum → 3B → sunum → portföy; klavye, dar ekran ve üretim derlemesi kontrolü.

## 2. Editoryal sunum — ilk düzen ve geçişler tamamlandı

1. Açılış: mimari konsept görseli, Luma Avlu başlığı, kısa anlatım.
2. Mimari: yaklaşım, mevcut proje verisinden toplam konut/oda/alan bilgileri.
3. Avluda yaşam: projedeki ortak alanlar.
4. Konum: bölgesel konum sınırı ve mevcut haritaya bağlantı.
5. Daireler: mevcut 3B envantere geçiş; PDF üretimi yine daire seçildikten sonra.

Tasarım değişikliği yalnızca sunum yüzeyindedir: taş tonlu zemin, koyu petrol yeşili, büyük serif başlıklar, Inter arayüz metinleri. Ana harita arayüzü yeniden tasarlanmaz.

İlk sürümde mevcut tek konsept görseli kullanılır. Görsel yapay zekâ üretimidir; mevcut seçim modelinin birebir renderı değildir. Bölüm içindeki uyarılar bunu açıklar. Gerçek bina/plan, gerçek satış fiyatı veya gerçek donatı varmış izlenimi verilmez.

## 3. Aynı modelden sinematik görseller — canlı model ve ilk render seti uygulandı

Mimari bölümüne isteğe bağlı canlı GLB incelemesi eklendi. Genel görünüm, avlu ve A blok cephesi; 1,5 saniyelik kamera geçişleri ve gündüz/akşam aydınlatması. Aynı `project.modelUrl`, envanter ve sahne kodu kullanılır. Bu, nihai tanıtım videosu veya yüksek kaliteli çevrimdışı render teslimi değildir.

- Model yalnızca “Mimari modeli aç” eylemiyle istenir; hata halinde sunum açık kalır.
- Model üzerindeki tekerlek/dokunmatik hareketi sayfayı kaydırır; serbest kamera döndürme bu yüzeyde kapalıdır.
- Model alanı görünmez olduğunda veya daire dosyası açıldığında sahne kaynakları bırakılır; geri dönünce seçili açı/ışık korunarak yeniden kurulur.
- Hafif bölüm giriş animasyonları eklendi; doğal kaydırma korunur. Hareketi azalt CSS tercihi desteklenir; kamera mevcut sahnenin hareket tercihini kullanır.

  2.1 revizyonunda taş/cam/ahşap tonları, cephe ayrıntıları, giriş oturma elemanları ve peyzaj geliştirildi. 48 daire kimliği korundu. Sunum kameraları dar ekran oranına göre uzaklaşır; daire seçim kamerasının davranışı değişmez. GLB yaklaşık 3,33 MiB'dir.

Genel yerleşim, cephe ve avlu için aynı modelden 1500×950 çıktılar üretildi. Üç WebP toplam yaklaşık 220 KiB'dir; mimari ve yaşam bölümleri bu görselleri kullanır. “Bu görünümü indir” seçili açı/ışıkla PNG üretir. Kaynak, lisans, model revizyonu ve SHA-256 özeti medya manifestinde tutulur. Model değişince test görsellerin yenilenmesini ister. Bu çıktılar fotogerçekçi render değildir; açılış hâlâ ayrı ve etiketli yapay zekâ konseptidir.

Kalan görsel üretim işleri:

- Mevcut GLB'nin cephe, peyzaj, malzeme ve kamera açılarını kullanıcıyla değerlendirmek.
- Açılışı da aynı bina tasarımından, onaylanan daha yüksek kaliteli render ile değiştirmek.
- Onaylanırsa kısa, sessiz ve döngüye uygun kamera videosu; poster görseli ve mobil alternatif.
- Video açılış görselinin yerine aşamalı yüklenir. Ses otomatik başlamaz.
- Her görselin kaynağı, kullanım hakkı, boyutu ve model sürümü kaydedilir.
- WebGL seçim modeli ile önceden render edilmiş tanıtım medyası farklı performans bütçeleriyle yönetilir.

Kabul: sunum ve seçim modelinin aynı bina tasarımını anlatması. Fotogerçekçi kalite, yalnızca arayüz animasyonu eklemekle sağlanmış sayılmaz.

## 4. Geçişler ve satış akışı — temel bağlantı bu teslimde

- Mevcut bağlantılar: harita, 3B seçim ve oradan PDF.
- Sonraki: onaylanan medya ile bölüm geçişleri, kontrollü kamera anlatımı ve gerekiyorsa paylaşılabilir proje/sunum URL'si.
- Tekerlek olayını ele geçiren kaydırma sistemi yok; tarayıcının doğal kaydırması korunur.
- Hareketi azalt tercihi desteklenir. Arka planda video/3B animasyon gereksiz çalıştırılmaz.
- Sunumun kendi içinde yeni stok, fiyat, daire veya donatı kopyası tutulmaz; ortak veri kullanılır.

Kabul: daire kimliği, fiyat, durum, PDF ve harita bağlamı sunumdan geçerken değişmemeli.

## 5. Kalite kontrolü ve yayın

24 Eylül sağlamlaştırması: galeride sade görünüm, mod değişiminde okuma konumu, dar ekranda seçili slayt korunumu ve sabit klavye odağı uygulandı. Küçük WebP seçenekleri bağlandı; temiz mobil genişlikte seçilmeleri doğrulandı. Bu kontrol fiziksel cihaz veya yavaş ağ ölçümünün yerine geçmez.

- Otomatik testler, TypeScript, üretim derlemesi ve biçimlendirme.
- Masaüstü/dar ekran taşma, klavye odağı, Escape, geri dönüş ve hareket tercihi.
- Gerçek düşük donanım/telefon ve yavaş bağlantı testi; masaüstünde dar ekran testi bunun yerine geçmez.
- Son medya geldiğinde indirme boyutları, ilk görüntü süresi ve kaydırma ölçümlerini yenilemek.
- Kullanıcı görsel onayından sonra GitHub Pages yayını ve portföy bağlantısı.

## Ayrı kapsamda kalanlar

Gerçek donatı servisi, parsel/imar, onaylı mimari plan, CRM, satış envanteri backend'i ve müşteri paketlemesi bu sunum revizyonunun parçası değildir. Diğer projelere sunum ekleme veya dış tanıtım sitesine bağlantı daha sonra proje bazlı yapılandırılır. Sunumun doğrudan URL ile paylaşılması ilk aşamada uygulanmaz.

## Teknik yerleşim

- `src/domain/project-presentation.ts`: sunumu olan projeler ve editoryal içerikleri.
- `src/components/ProjectPresentation.tsx`: tam ekran sunum; doğal kaydırma, IntersectionObserver ile bölüm göstergesi.
- `src/components/project-presentation.css`: yalnızca sunuma özgü duyarlı tasarım.
- `src/App.tsx`: sunum/proje dosyası görünürlüğü; mevcut portföy durumunu korur.
- `ProjectExplorer` / `ProjectDetail`: isteğe bağlı sunum girişleri.

Yeni çalışma zamanı bağımlılığı eklenmedi. Sunum açılışı Three.js veya PDF kütüphanesini yüklemez. `PresentationModel.tsx` yalnızca model istendiğinde yüklenir; `sales-scene` kodu daire seçimiyle ortak bir üretim paketinde paylaşılır.

## 19 Eylül 2026 yerel doğrulama

- Son revizyonda 33 test / 11 dosya geçti; kamera oranı, medya kaynağı/model özeti ve görsel boyut bütçesi testleri dahil. TypeScript, üretim derlemesi ve biçim kontrolü geçti. Mevcut MapLibre ve ortak Three.js paketlerinin boyut uyarısı devam ediyor; bağımlılık eklenmedi.
- Arama metni ve 5 km çevre yarıçapı, sunum → harita dönüşünde korundu.
- Sunum → daire seçimi → sunum dönüşünde kaydırma konumu ve klavye odağı korundu.
- 390 ve 320 px genişliklerde tüm sunum bölümlerinin yatay taşması kontrol edildi; 320 px üst başlık için ek düzenleme yapıldı.
- Mimari model genel/avlu/cephe açıları ve akşam ışığı tarayıcıda çalıştırıldı.
- 2.1 model revizyonundan üç PNG indirildi ve görsel olarak kontrol edildi. Yeni WebP'lerin yüklenmesi, 390 px yerleşim ve A-01 daire seçimi tekrar kontrol edildi; tarayıcı konsolunda hata görülmedi.
- Model üzerinde tekerlek kaydırması sunumun kaydırma konumunu değiştirdi; daire dosyası açıldığında sunum modelinin canvas'ı kaldırıldı.
- Bunlar işlev/yerleşim kontrolleridir; fiziksel telefon veya yeni FPS ölçümü değildir.
- Gerçek veriler, nihai model/render/video ve çevrimiçi yayın bu teslimde yapılmadı.
