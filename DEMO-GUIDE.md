# Luma yerel demo paketi

## Açılış

1. ZIP dosyasını bir klasöre çıkarın; uygulamayı ZIP içinden çalıştırmayın.
2. Bilgisayarda Node.js 22.12 veya üstü desteklenen sürüm bulunmalı. Bu bir kurulum gerektirmeyen bağımsız EXE değildir; Node çalışma zamanı pakete gömülmez.
3. Windows'ta `BASLAT.cmd` dosyasını açın. macOS/Linux'ta aynı klasörde `node demo-server.mjs` çalıştırın (bu sistemlerde fiilî test yapılmadı).
4. Tarayıcıda `http://127.0.0.1:4173/` adresine gidin. Konsol açık kaldığı sürece demo çalışır. Durdurmak için Ctrl+C.

4173 doluysa başka uygulamayı kapatmak yerine `node demo-server.mjs site 4174` kullanabilirsiniz. Sunucu yalnızca 127.0.0.1 üzerinde dinler; yerel ağ, başka telefon veya internetten erişime açılmaz. Harita altlığı internet ister. Model, yazı tipleri, plan şemaları ve PDF üretimi yereldir. `site/index.html` dosyasını çift tıklamak WebGL/modül/worker yüklemesinin desteklenen yolu değildir.

## Sunum akışı

1. Sol listeden bölge/proje filtrelerini gösterin; harita işareti ve kartın aynı projeyi seçtiğini anlatın.
2. Luma Avlu'yu seçin: sağdaki proje/çevre paneli. Gerçek donatı henüz bağlı değildir.
3. “Projeyi keşfet”: beş bölümlü tanıtım sunumu. Yaşam bölümünde masaüstünde aşağı kaydırma görselleri yana ilerletir; küçük ekranda yana kaydırılır. Ok/klavye ve “Sade görünüm” alternatifleri vardır. AI konseptler gerçek mülk veya birebir model renderı değildir.
4. Mimari bölümündeki “Mimari modeli aç” isteğe bağlıdır. Üç kamera, gündüz/akşam ve PNG indirme vardır; burada görülen gerçek seçim modelidir. “Haritada konumu incele” mevcut haritaya döner.
5. İsteğe bağlı “Örnek akışı dene”: temsili donatı kategorileri, mesafeleri ve liste–harita seçimi. Bunları gerçek metro/durak konumu olarak anlatmayın.
6. “3B daireleri keşfet” veya sunumda “Daire seç”: blok/kat/oda/durum filtresi, kat kesiti, kamera açıları ve daire seçimi. Sunumdan geldiyseniz “Sunuma dön” önceki konumu korur.
7. Seçili dairenin sağ panelinde özellikler, plan dosyası ve PDF. PDF'ye girdiğiniz kişisel bilgiler indirilen dosyanın içinde bulunur; bunu paylaşmadan önce kontrol edin.
8. Haritaya dönün. Diğer yedi portföy kaydının 3B modeli olmadığını ve tüm kayıtların temsili olduğunu belirtin.

## Başka cihazda aynı ölçümü tekrar etme

Adrese `?diagnostics=1` ekleyin, Luma Avlu'nun 3B görünümünü açın. “Yerel performans ölçümü” bölümünde “Dönüşü ölç” veya “Durağan sahneyi ölç” düğmesini kullanın. 2 saniye ısınmadan sonra 8 saniye kaydedilir; ölçüm sırasında sekmeyi değiştirmeyin. Arka plana geçiş, sahne kapatma, kamera etkileşimi ve kalite/ekran değişimi sonucu geçersiz kılar. JSON sonucu seçilip kopyalanabilir; sunucuya gönderilmez ve kalıcı kaydedilmez. Normal adreste ölçüm paneli görünmez.

Gerçek telefon ölçümü için ayrıca onaylanmış HTTPS test yayını veya kontrollü ağ kurulumu gerekir; bu paket bunları otomatik açmaz. Aynı masaüstünde dar ekran testi telefonun işlemci/GPU, ısı ve bellek koşullarını ölçmez. Son ölçümler ve sınırlar: `PERFORMANCE.md`.

## Paket sınırları

- Demo ZIP: `site/` üretim çıktısı, yerel sunucu, başlatıcı, kılavuz, proje lisansı, varlık açıklamaları, kabul listesi, performans raporu, üçüncü taraf bildirimleri ve SHA-256 manifesti.
- Ayrı kaynak ZIP: kaynak kodu, kilitli bağımlılıklar, özgün model üreticisi, varlıklar ve teknik kılavuzlar. Geliştirici kullanımı içindir; müşteri sunumu için paylaşılması gerekmez.
- ZIP'lerde müşteri PDF'leri, geçici ölçüm dosyaları, `.env`, `node_modules`, sohbet/araştırma belgeleri veya erişim anahtarları bulunmaz. Kaynak paketi açık bir dosya/klasör izin listesiyle hazırlanır.
- Projeler, konum işaretleri, fiyatlar ve planlar temsilidir. Gerçek imar durumu/parsel, malik bilgisi, onaylı plan, CRM, rezervasyon, e-imza veya müşteri yönetimi yoktur.
- Harita ve font lisans/atıfları korunmalıdır. Statik web kodu ve GLB dosyaları ziyaretçinin cihazına iner; bu yöntem teknik kopyalama engeli değildir. Kullanım koşulları `LICENSE` içindedir.
- Bu paket müşteriye özgü ticari ürün veya çevrimiçi yayın değildir.

## Kaynaktan yeniden üretme

Kaynak paketinde `npm ci`, ardından `npm run package:demo` çalıştırın. Test, üretim derlemesi ve sunucu denetimi geçince `releases/` altında yeni zaman damgalı iki ZIP ve açık klasörleri oluşur; eski paketler silinmez. ZIP oluşturma komutu Windows PowerShell/.NET ZIP kullanır. `MANIFEST.json` dosyaları her içerik için boyut ve SHA-256 taşır; kendisini kapsamaz.

## Bir sonraki karar kapısı

Paylaşım öncesi elle kontrol edilecek akışlar ve fiziksel telefon/yavaş ağ açıkları `RELEASE-CHECKLIST.md` içindedir. İki ZIP'in bulunması, bu kabul maddelerinin tamamlandığı anlamına gelmez.

Gerçek donatı, imar planı ve müşteri paketlemeye başlamadan önce demo akışı, görsel kalite, performans sonuçları ve veri sorumluluklarını kullanıcıyla birlikte yeniden değerlendirin. Bu aşama bunların entegrasyonuna yetki vermez.
