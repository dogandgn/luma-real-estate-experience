# Luma — aşama takibi

Her aşama sonunda kullanıcıya şu üç başlıkla bilgi verilir: **Ne yaptık? Sıradaki aşama ne? Neler kaldı?**

“Uygulandı” kodun eklenmesini ifade eder; tarayıcı/cihaz testi veya müşteri kabulü yapılmadıysa bunlar ayrıca belirtilir. Demo ve satış ürünü ayrı kapsamlar olarak izlenir. Tarih ya da süre taahhüdü yerine içerik ve kabul koşulları kullanılır.

## Demo

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
