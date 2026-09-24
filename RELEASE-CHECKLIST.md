# Luma — paylaşım öncesi kabul listesi

Bu paket yerel portföy demosudur; müşteriye özel satış ürünü değildir. Aşağıdaki gerçek cihaz kontrolleri otomatik testlerin veya dar ekran emülasyonunun yerine geçmez.

## Otomatik kontrol kapısı

`npm run package:demo`: testler → TypeScript/üretim derlemesi → yerel HTTP sunucu kontrolü → lisans ve kılavuzlarla iki ayrı paket → dosya boyutu/SHA-256 doğrulaması → ZIP.

Çıkarılmış paketi kaynak depodaki `node scripts/verify-release.mjs <paket-klasörü>` ile doğrulayın. Manifest, içerikte sonradan değişiklik veya eksik dosya yakalar; kriptografik imza değildir ve manifestle beraber değiştirilen bir paketin kökenini kanıtlamaz.

## İnceleme akışı

1. Luma Avlu'yu seçin. Harita/proje paneli aynı kaydı göstermeli.
2. “Projeyi keşfet”: açılış, mimari, yaşam, konum, daireler. Gerçekçi görsellerin AI konsept etiketleri görünür olmalı.
3. Yaşam galerisinde ileri/geri okları, klavye oklarını, Home/End ve “Sade görünüm”ü deneyin. Seçim korunmalı; kaydırma kilitlenmemeli.
4. “Haritada konumu incele” mevcut haritaya dönmeli. Gerçek donatı bağlı olmadığı açıkça belirtilmeli.
5. Sunum → Daire seç → bir daire: seçili birim sağ panelde gösterilmeli. “Sunuma dön” önceki sunum konumuna dönmeli.
6. PDF bilgi föyü için yalnızca test bilgileri girin. İndirilen dosyayı ayrıca açın; daire kimliği, model görüntüsü, konum ve mesafe uyarılarını kontrol edin. Gerçek müşteri bilgisi içeren çıktı paylaşmayın.
7. Escape, görünür geri düğmesi ve klavyeyle gezinmeyi deneyin.

## Açık kabul maddeleri

- [ ] Kullanıcının son görsel kalite ve akış onayı.
- [ ] Gerçek Android/Chrome: yatay/dikey ekran, galeri dokunmatik kaydırma, 3B seçim, PDF indirme.
- [ ] Gerçek iPhone/Safari: aynı akış, PDF paylaşım/indirme davranışı.
- [ ] Soğuk önbellek + yavaş bağlantı: açılış, boş görsel anları, model bekleme/hata/retry durumları.
- [ ] Gerçek düşük donanımda `?diagnostics=1` ölçümü; sonuçla cihaz/tarayıcı/ekran bilgisi birlikte kaydedilmeli.
- [ ] Yayın adresi ve kullanıcı onayı; son paket henüz yayımlanmış sayılmaz.

## Fiziksel telefon testi sınırı

Başlatıcı yalnızca 127.0.0.1'de dinler. Telefon aynı Wi-Fi'de olsa bile bu adrese erişemez; telefondaki localhost telefonun kendisidir. Test için ayrıca onaylanan HTTPS test yayını veya kontrollü yerel ağ erişimi gerekir. Bu paket güvenlik duvarı, ağ erişimi veya internet yayını açmaz.

## Ne paylaşılır?

- İnceleyene: `luma-demo.zip`. Node çalışma zamanı gerekir; teknik kaynak paketi gönderilmesine gerek yoktur.
- Geliştiriciye: yalnızca kullanıcının uygun gördüğü durumda `luma-source.zip`.
- Her ikisinde de proje lisansı ve varlık açıklamaları korunur. ZIP veya web yayını, indirilen web kodunun teknik olarak kopyalanmasını engellemez.
- `PERFORMANCE.md` içindeki eski masaüstü ölçümleri tarihli sonuçlardır; bu yeni sunum için telefon/yavaş ağ kabulü sayılmaz.

Gerçek donatı, imar/parsel, onaylı plan, CRM ve müşteri markasına göre paketleme başlamadan kullanıcıyla kapsam yeniden planlanır.
