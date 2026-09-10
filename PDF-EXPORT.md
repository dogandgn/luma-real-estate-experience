# Daire PDF çıktısı

## Kullanım

Luma Avlu → İncele → 3B daireleri keşfet → bir daire seç → sağ panelde **PDF bilgi föyü / ek taslağı**. İsteğe bağlı müşteri, danışman, referans, ek no. ve not alanları doldurulur. PDF oluştur ve indir düğmesi A4 dosyayı indirir; tekrar indirme bağlantısı pencere açıkken kalır.

Üç bölüm: daire özellikleri/fiyatı ve seçili dairenin 3B görüntüsü; mevcut harita görünümü, tıklanabilir bölgesel konum ve donatı tablosu; ölçeksiz plan şeması ve belge referansları. Normal çıktı üç sayfadır. Uzun notlar veya geniş donatı tablosu gerektiğinde ek sayfaya geçer. Görseller pencere açıldığında alınır; başka açı için pencereyi kapatıp modeli/haritayı ayarlayın.

Gerçek donatı kaynağı bağlı değilken tablo kategori bazında “Veri bağlı değil” yazar. Haritada kullanıcı “Örnek akışı dene” seçtiyse sadece seçili projenin görünür örnek kayıtları, kategori ve yarıçap kapsamıyla aktarılır. Örnek mesafeler temsili koordinatlardan kuş uçuşu hesaplanır; rota/süre veya gerçek kurum yakınlığı değildir.

## Teknik sınırlar

- `src/domain/report.ts`: daire/proje/örnek donatı kimlik doğrulaması, değişmez aktarım bağlamı ve dosya adları.
- `src/components/ReportDialog.tsx`: alanlar, görüntü önizlemesi, hata/yeniden deneme, indirme bağlantısı ve kaynak temizliği.
- `src/report/create-pdf.ts`: istem üzerine yüklenen jsPDF, yerel DejaVu TTF, vektör metin/plan/tablo. HTML sayfa rasterizasyonu kullanılmaz.
- `sales-scene.capture`: seçime geçişi tamamlar, 1500×950 çözünürlükte mevcut kameradan render alır, sonra ekran boyutunu/kalitesini geri yükler. Kalıcı `preserveDrawingBuffer` kullanılmaz.
- `PortfolioMap.captureRef`: harita yüklenip hareket durduktan sonraki render olayında canvas alınır. 12 saniyede hazır olmazsa eksik PDF üretmek yerine yeniden deneme sunulur.
- Form verileri sunucuya gönderilmez veya kalıcı depoya yazılmaz. PDF ve font tarayıcı belleğinde hazırlanır. **İndirilen PDF müşteri bilgilerini içerir**; dosyanın paylaşılması ve saklanması kullanıcının sorumluluğundadır.
- Harita ve ilk altlık yüklemesi internet gerektirir. Font/model yereldir; çevrimdışı GIS paketi henüz yoktur.
- PDF statik bir belgedir; imza, elektronik imza, düzenlenebilir PDF formu veya resmî sözleşme değildir. Tarih, belge kimliği ve sayfa numarası bulunur. Demo fiyat/konum/plan uyarıları bütün sayfalarda korunur.

## Tasarım referansı

[Savills The Old House föyünün](https://pdf.savills.com/documents/THE_OLD_HOUSE_03022016.pdf) belge yapısındaki görsel, özellikler, konum/mesafeler, plan ve açıklama ayrımı incelendi. Sayfa görselleri kopyalanmadı; Luma'nın petrol yeşili/kırık beyaz/bakır diliyle özgün, daha kısa A4 düzeni kuruldu.

## Kontrol

25 otomatik test: mevcut 20 kontrole ek olarak gerçek OrbitControls tekerlek olayı/yeniden çizim ve dinleyici temizliği, aktarım kimlikleri, dosya adları, Türkçe fontlu üç sayfalı PDF ve uzun alanların ek sayfaya aktarılması. İndirilen A-01 örneği üç sayfa olarak PNG'ye render edilip görsel incelendi; Türkçe karakterler, harita/3B görüntü, mesafeler ve OSM bağlantısı kontrol edildi. 390×844 tarayıcı görünümünde form taşmıyor ve indirme düğmesi sabit erişilebilir. Fiziksel fare/gerçek telefon FPS ölçümü ayrı testtir.
