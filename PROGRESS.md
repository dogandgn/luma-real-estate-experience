# Luma — aşama takibi

Her aşama sonunda kullanıcıya şu üç başlıkla bilgi verilir: **Ne yaptık? Sıradaki aşama ne? Neler kaldı?**

“Uygulandı” kodun eklenmesini ifade eder; tarayıcı/cihaz testi veya müşteri kabulü yapılmadıysa bunlar ayrıca belirtilir. Demo ve satış ürünü ayrı kapsamlar olarak izlenir. Tarih ya da süre taahhüdü yerine içerik ve kabul koşulları kullanılır.

## Demo

### GitHub Pages yayın onayı — 24 Eylül 2026

- Kullanıcı güncel portföy demosunun mevcut herkese açık GitHub Pages adresine yayımlanmasını onayladı; müşteri paketlemesi sonraya bırakıldı.
- Yayın iş akışı artık biçim kontrolü, testler, üretim derlemesi ve statik sunucu kontrolü başarılı olmadan dağıtıma geçmez.
- Gerçek telefon ve yavaş bağlantı testi yapılmış sayılmaz; yayın sonrası kabul listesinde ayrı kalır. Bu not yayın girişiminin kaydıdır; dağıtım sonucu ilgili GitHub Actions çalışmasından ve canlı site üzerinden doğrulanır.

### Güncel yerel teslim paketi — 24 Eylül 2026

- **Ne yaptık:** Yeni sunum ve mobil görsellerle demo/kaynak ZIP'leri yenilendi. Demo paketine proje lisansı ve varlık açıklamaları; kaynak paketine sunum belgeleri ve biçim/git ayarları eklendi. Sunum kılavuzu güncellendi; `RELEASE-CHECKLIST.md` açık kabul maddelerini tanımlar.
- **Paket bütünlüğü:** Yeni doğrulayıcı dosya listesi, boyut, SHA-256, eksik/fazla dosya ve güvensiz manifest yollarını kontrol eder. Manifest imza değildir. İki ZIP tekrar çıkarılarak doğrulandı. Demo yaklaşık 4,6 MiB, kaynak yaklaşık 3,3 MiB; Node çalışma zamanı dahil değildir.
- **Test keşfi:** Vitest yalnızca kökteki `src` ve `scripts` testlerini toplar. Eski `releases/` kaynak kopyalarının test sayısını katlaması önlendi; doğrulanan gerçek kapsam 52 testtir.
- **Doğrulama:** 52 test / 14 dosya, TypeScript/üretim derlemesi ve HTTP sunucu kontrolleri geçti. ZIP'ten çıkarılan üretim sürümünde görseller, yatay galeri, B-01 seçimi/sağ panel, sunuma aynı galeri konumunda dönüş ve harita bağlantısı tarayıcıda kontrol edildi; konsolda hata yok. PDF'nin bu turda yeniden indirilip görsel doğrulaması yapılmadı.
- **Sıradaki karar:** Kullanıcının son kabulü ve fiziksel telefon/yavaş ağ testi için test ortamının seçimi. Yayın, ağ erişimi açma, gerçek veri veya müşteri paketlemesi yapılmadı; bunlar ayrıca planlanır. Önceki paketler korunur.

### Sunum sağlamlaştırma ve mobil görseller — 24 Eylül 2026

- **Ne yaptık:** Galeri modu/ekran genişliği değiştiğinde seçili görsel korunur. “Sade görünüm” ile galeriye ait kaydırmaya bağlı hareket ve yumuşak geçişler kapatılabilir. Mod değişiminde tarayıcının otomatik kaydırma telafisiyle çakışan sayfa sıçraması düzeltildi. Kısa masaüstü pencerelerinde sabitlenmiş anlatım kullanılmaz. Klavye odağı artık hareket eden rayda değil sabit çerçevededir; erişilebilirlik ağacında yalnızca seçili slayt görünür.
- **Mobil yükleme:** Üç 768×432 WebP toplam 237.050 bayt; büyük setten yaklaşık %76 küçük. Açılış, cephe ve galeri `srcset/sizes` kullanır. Tarayıcı ekran/piksel yoğunluğuna göre dosyayı seçer; her telefonda küçük dosya garantisi yoktur.
- **Otomatik doğrulama:** 41 test / 13 dosya, TypeScript, üretim derlemesi ve biçim kontrolü geçti. Mevcut büyük MapLibre/Three.js paket uyarıları devam ediyor; yeni bağımlılık eklenmedi.
- **Tarayıcı kontrolü:** Masaüstü son slayt → sade → hareketli görünümde seçim ve okuma konumu; masaüstü → 390 → 320 px seçim korunumu; önceki/sonraki ok ve klavye; temiz 320 px yüklemede üç küçük görselin seçilmesi; sıfır yatay taşma ve boş hata konsolu doğrulandı. Gerçek telefon/yavaş ağ veya FPS ölçümü değildir.
- **Sıradaki:** Kullanıcıyla son görsel/etkileşim değerlendirmesi ve gerçek cihaz/yavaş ağ kontrolü. Yayın, gerçek veri ve müşteri paketlemesi bu turda yapılmadı.

### Gerçekçi konsept ve yatay hikâye revizyonu — 19 Eylül 2026

- **Ne yaptık:** Sea Breeze'in canlı sayfası yeniden incelendi. Model referanslı üç gerçekçi AI konsepti üretildi; açılış ve editoryal cephe yenilendi. Masaüstünde doğal dikey kaydırmayla ilerleyen sabitlenmiş yatay hikâye, dar ekranda yerel yatay kaydırma, iki yönde oklar ve klavye gezinmesi eklendi. Bölüm göstergesi uzun bölümlerde de kaydırma konumundan hesaplanır. Açılışta hafif paralaks, mimaride yönlü girişler var. Hareket azaltma tercihinde sabitleme/paralaks kaldırılır.
- **Doğrulama:** 35 test / 12 dosya; yerel WebP bütçesi ve galeri kontrolleri dahil. Masaüstü yatay akış/oklar/End tuşu; 390 px yatay kaydırma ve oklar; 320 px mimari düzen; bölüm göstergesi, sıfır yatay sayfa taşması ve sunum → daire seçimi → aynı galeri konumuna dönüş kontrol edildi. Temiz yükleme sonrası konsolda hata yok. Fiziksel telefon ve yeni FPS ölçümü yapılmadı.
- **Sıradaki:** Kullanıcıyla bu görsel dilin değerlendirilmesi; istenirse nihai model geometrisine sadık profesyonel render/video. AI görseller birebir model renderı olarak sunulmaz.
- **Kalan:** Gerçek cihaz/yavaş ağ ve yayına çıkış kontrolleri; bu değişiklikler hâlâ yerel. Gerçek veri ve müşteri paketlemesi ayrı kapsamdır.

### Aynı modelden sunum görselleri — 19 Eylül 2026

- **Ne yaptık:** GLB 2.1 cephe/malzeme/peyzaj iyileştirmesi; dar ekrana uyarlanan sunum kameraları; genel, avlu ve cephe için aynı modelden üç görsel. Mimari ve yaşam bölümlerine WebP'ler eklendi. Canlı modelde seçili açı/ışık için 1500×950 PNG indirme hazır. Daire kimlikleri ve ana portföy korundu.
- **Doğrulama:** 33 test / 11 dosya; model özeti ve medya bütçesi kontrolleri dahil. Model yaklaşık 3,33 MiB; üç görsel toplam yaklaşık 220 KiB. PNG'ler indirildi ve incelendi; 390 px düzen, görsel yüklenmesi, daire seçimi ve ekran dışı canvas temizliği tarayıcıda kontrol edildi. Yeni fiziksel cihaz/FPS ölçümü yapılmadı.
- **Sıradaki:** Görsel değerlendirme; aynı bina tasarımından açılış görseli ve onaylanan kalite düzeyine göre kısa kamera videosu. Ardından son medya ile performans ve yayın kontrolleri.
- **Kalan:** Fotogerçekçi son render/video, fiziksel telefon ve yavaş bağlantı ölçümü. Açılış hâlâ etiketli yapay zekâ konseptidir. Bu değişiklikler yereldir; GitHub'a gönderilmedi veya yayımlanmadı. Gerçek veri ve müşteri paketlemesi ayrı değerlendirme gerektirir.

### Luma sunum revizyonu — 19 Eylül 2026

- **Ne yaptık:** Mevcut portföyü koruyan Luma Avlu sunumu; beş bölüm, klavye/geri dönüş ve harita bağlantıları. İlk aşamanın kalan kontrolleri kapatıldı. Sonraki aşamada aynı GLB ile isteğe bağlı genel/avlu/cephe sunumu, gündüz/akşam ışığı, bölüm giriş animasyonları ve ekran dışı kaynak temizliği eklendi.
- **Doğrulama:** 30 test / 9 dosya, TypeScript ve üretim derlemesi, tüm projede biçim kontrolü. Masaüstü, 390 ve 320 px yerleşim; filtre/çevre yarıçapı korunumu, iki giriş yolu, odak/Escape, kamera/ışık, model üzeri kaydırma ve daire seçimine geçerken canvas temizliği tarayıcıda kontrol edildi. Yeni fiziksel cihaz/FPS ölçümü yapılmadı.
- **Sıradaki:** Canlı modelin malzeme, peyzaj ve kadraj kalitesini geliştirmek; onaylanan tek bina tasarımından açılış/cephe/avlu renderları hazırlamak. Ayrıntı: [PRESENTATION-ROADMAP.md](PRESENTATION-ROADMAP.md).
- **Kalan:** Nihai render/video, gerçek telefon/yavaş bağlantı ölçümü ve görsel onay sonrası yayın. Gerçek donatı, imar/parsel ve müşteri paketlemesi ayrı kapsamdır. Bu revizyon henüz GitHub'a gönderilmedi veya yayına alınmadı.

| Aşama                         | Durum                                                           | Kapsam / açık iş                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. GIS ve portföy             | Uygulandı                                                       | MapLibre altlığı, 8 temsili proje, sol liste/filtreler ve harita bağlantısı. Harita yükleme hatası düzeltildi ve o aşamada tarayıcıda kontrol edildi.                                                                                  |
| 2. 3B seçim temeli            | Uygulandı                                                       | Özgün GLB, iki blok, 12 kat grubu, 48 seçim hacmi ve ortak daire kimlikleri. Otomatik GLB/ışın testleri var.                                                                                                                           |
| 3. Görsel geliştirme          | İlk revizyon uygulandı                                          | V2 cephe/peyzaj, özgün taş dokusu, ışık, kamera açıları ve isteğe bağlı detaylı gölge. Fotogerçekçi son model değil; kullanıcı görsel değerlendirmesi ve cihaz ölçümleri açık.                                                         |
| 4. Daire dosyası ve planlar   | Uygulandı                                                       | Dört ölçeksiz plan şeması, 48 daire bağlantısı, yakınlaştırma, mekân vurgusu, dosyada gezinme, 3B'ye geri odaklanma ve koşullu belge/medya bağlantıları. Gerçek mimari plan/AR/VR/tur içeriği sağlanmadı.                              |
| **5. Demo sağlamlaştırma**    | **Masaüstü ölçümü tamamlandı; fiziksel mobil/alt donanım açık** | Sağ paneller, seçim, PDF ve mobil düzen; RTX 5070 üzerinde dengeli/detaylı dönüş, durağan sahne ve dar ekran ölçümleri. Ayrıntı: PERFORMANCE.md. Gerçek donatı henüz bağlı değil.                                                      |
| 6. Paylaşılabilir demo paketi | Yerel paket hazır                                               | Üretim demo ZIP'i ve ayrı geliştirici kaynak ZIP'i, Node tabanlı yerel başlatıcı, lisanslar, SHA-256 manifestleri, sunum kılavuzu. Gerçek veri/müşteri kapsamından önce kullanıcıyla yeniden değerlendirme. Çevrimiçi yayın yapılmadı. |

## 6. aşama kapanışı — ortak değerlendirme kapısı

- Yapılan: mevcut bağımlılıkları ve yerel çalışma düzenini koruyan iki ayrı teslim paketi, tekrar üretilebilir paketleme, güvenli dosya sunumu ve performans ölçüm paneli.
- Ölçüm: 1910×855 masaüstünde dengeli 119,87–120 FPS; detaylı 119,99 FPS. Aynı donanımda 390×844 dar ekran yaklaşık 120 FPS. Durağan sahne 8 sn boyunca 0 yeni 3B çizim. İlk arka plan/örtülü pencere denemeleri ayrı raporlandı.
- Doğrulama: 26 test, üretim derlemesi, yerel sunucu kontrolleri; ZIP çıkarma ve dosya bütünlüğü denetimi. Başka bilgisayar ve fiziksel telefon testi yapılmış sayılmaz.
- Sıradaki: **kullanıcıyla birlikte demo akışı, görsel kalite, gerçek veri sınırları ve sonraki iş kapsamını yeniden planlama**. Kodlama/entegrasyon otomatik devam etmeyecek.
- Kalan ve henüz yetkilendirilmeyen: gerçek donatı servisleri, gerçek parsel/imar planı, onaylı mimari plan/tur medyası, müşteri markası/paketi, satış sistemi ve yayın ortamı.

### 5. aşama ek kapanışı — tekerlek ve PDF

- Yapılan: tekerlekle yakınlaştırma sırasında atlanan sahne çizimi düzeltildi. Seçili dairenin sağ paneline PDF bilgi föyü/ek taslağı eklendi; gerçek sahne görüntüsü, harita/konum bağlantısı, donatı tablosu, özellikler ve plan aktarılıyor.
- Doğrulama: 25 otomatik test; yerel tarayıcıda PDF önizlemesi/üretimi/indirme; indirilen üç sayfalı A4 dosyanın görüntü ve Türkçe metin kontrolü; 390 px PDF formu.
- Sıradaki: 6. aşama paylaşılabilir yerel demo paketi. Bu düzeltme kapsamında dağıtım/çevrimiçi yayın yapılmadı.
- Açık kalanlar: gerçek düşük donanım/mobil FPS ölçümü, gerçek donatı/plan/tur verileri, ileri görsel model kalitesi ve demo kabulü. Müşteriye özgü satış ürünü ayrı kapsamdır.

## Satış ürünü — ayrı kapsam

Demo onaylandıktan sonra müşteri başına marka/proje/veri paketleri, yönetim arayüzü, kalıcı satış envanteri, yetkilendirme, medya yönetimi ve dağıtım/bakım seçenekleri ele alınacak. CRM, rezervasyon, ödeme, çok kiracılı altyapı ve native AR/VR mevcut demoda yapılmış kabul edilmez; ihtiyaç varsa ayrıca kapsamlandırılır.

## 4. aşama kapanışı

- Yapılan: daire dosyası + plan tipi sözleşmesi + güvenli/koşullu dış bağlantılar.
- Doğrulama: TypeScript/üretim derlemesi; envanter/GLB/plan/bağlantı ve sunucu tarafı işaretleme testleri.
- Açık doğrulama: kullanıcı önce kendisi incelemek istediği için bu aşamada tarayıcı tıklama veya ekran görüntüsü testi yapılmadı.
- Sıradaki: 5. aşama demo sağlamlaştırma. Görsel geri bildirimler varsa öncelikle bu aşamada ele alınacak.
- Yayın: yalnızca yerel; bir barındırma veya satış sistemine veri gönderilmedi.

## 5. aşama — UI/UX revizyonu

- Yapılan: sol filtre/liste – orta harita/model – sağ bilgi paneli; daire vurgusu; yakın çevre akış önizlemesi; mobil yerleşim; gölge önbelleği ve hover optimizasyonu.
- Doğrulama: 20 test, üretim derlemesi; tarayıcıda harita/örnek donatı/3B/plan akışı. 390 px duyarlı görünüm kontrolü gerçek telefon ölçümü yerine geçmez.
- Sıradaki: demo kabulü, düşük donanım/gerçek mobil performans ve klavye/fokus kontrollerinin tamamlanması; ardından 6. aşama taşınabilir paylaşım paketi.
- Kalan entegrasyonlar: gerçek donatı kaynağı, gerçek plan/tur medyası; kullanıcı isteğiyle sonra bağlanacak.
- Satış ürünü: marka/müşteri paketleme, envanter yönetimi ve CRM ayrı kapsamda kalır.
