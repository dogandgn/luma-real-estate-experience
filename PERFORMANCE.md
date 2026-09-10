# Yerel demo performans ve teslim kontrolü

Ölçüm tarihi: 10 Eylül 2026, Türkiye saati. Üretim derlemesi, yalnızca 127.0.0.1 üzerinde çalışan paket sunucusu. Çevrimiçi yayın, gerçek veri entegrasyonu veya müşteriye özel ürün kurulumu yapılmadı.

## Donanım ve yöntem

- İşlemci: AMD Ryzen 5 9600X, 6 çekirdek / 12 mantıksal işlemci (Windows donanım sorgusu).
- WebGL'nin gerçekten kullandığı GPU: NVIDIA GeForce RTX 5070 / ANGLE Direct3D11. Sistemde ayrıca AMD Radeon entegre grafik görünüyor; bu ölçüm onu kullanmıyor.
- Windows sürümü: 10.0.26200. İşletim sistemine görünür RAM yaklaşık 15 GiB; hazırlık anında yaklaşık 3 GiB boştu. Kullanıcının diğer uygulamaları kapatılmadı.
- Brave / Chromium 152.0.0.0. Tarayıcı `hardwareConcurrency` değerini 3 olarak bildiriyor; bu, Windows'un bildirdiği 12 mantıksal işlemci yerine donanım envanteri olarak kullanılmadı.
- Normal görünüm 1910×855; 3B canvas 1520×652; DPR 1. Dar ekran 390×844; canvas 375×438; DPR yine 1. Telefon, dokunma, yüksek DPR, CPU/GPU kısma veya mobil ağ emülasyonu yapılmadı.
- Her örnek 2 saniye ısınma + yaklaşık 8 saniye ölçüm. Sürekli otomatik dönüşte render karelerinin zaman damgaları; p95 kare aralığı, 33,34/50 ms üzeri aralıklar, ana iş parçacığı uzun görevleri ve Three.js render sayaçları kaydedildi.
- CPU p95 yalnızca `presentation.render()` çağrısının ana iş parçacığı süresidir; GPU tamamlanma zamanı veya tüm uygulamanın CPU tüketimi değildir. FPS ekran yenileme sınırından etkilenebilir; 120 FPS bu GPU'nun azami kapasitesi anlamına gelmez.

## Kontrollü sonuçlar

Kullanıcı Brave penceresini önde tuttuğunu doğruladıktan sonra alınan sonuçlar:

| Senaryo                              |        FPS | Kare aralığı p95 | CPU render p95 | En çok çizim çağrısı/kare |   Üçgen/kare | 50 ms üzeri aralık |
| ------------------------------------ | ---------: | ---------------: | -------------: | ------------------------: | -----------: | -----------------: |
| Masaüstü / dengeli                   |     120,00 |           8,4 ms |         1,7 ms |                       412 |       28.286 |                  0 |
| Masaüstü / dengeli tekrar            |     119,87 |           8,4 ms |         3,4 ms |                       413 |       28.298 |                  0 |
| Masaüstü / detaylı gölgeler          |     119,99 |           8,4 ms |         3,8 ms |                       781 |       56.001 |                  0 |
| Dar ekran / dengeli, aynı bilgisayar |     120,00 |           8,4 ms |         1,7 ms |                       412 |       28.286 |                  0 |
| Dar ekran / detaylı, aynı bilgisayar |     119,99 |           8,4 ms |         2,7 ms |                       781 |       56.001 |                  0 |
| Masaüstü / durağan detaylı sahne     | Uygulanmaz |       Uygulanmaz |     Uygulanmaz |              0 yeni çizim | 0 yeni çizim |                  0 |

Bu örneklerde 33,34 ms üzeri render aralığı ve ölçüm penceresi içinde kaydedilen uzun ana iş parçacığı görevi yoktu. Durağan sahnede 8 saniye boyunca 0 yeni 3B render olması, talep üzerine çizimin çalıştığını doğruluyor; tüm uygulamanın veya GPU'nun sıfır enerji harcadığı anlamına gelmez. RAF kontrol döngüsü devam ediyor.

Dengeli sahnede renderer sayacı 176 geometri / 6 doku; detaylıda 177 / 14. Detaylıdan dengeliye dönüşte 176 / 6'ya geri döndüğü görüldü. Bu, ek render kaynaklarının bırakılması için sınırlı bir kontrol; uzun süreli bellek sızıntısı testi veya VRAM byte ölçümü değildir.

## Başlangıçta dışlanan ölçümler

Pencere koşulları doğrulanmadan önce masaüstü dönüş denemeleri 3,96 ve 6,66 FPS; detaylı görünüm 1 FPS verdi. Kare aralıkları yer yer tam 1 saniyeydi; uzun ana iş parçacığı görevi kaydedilmedi. Pencere öne alındıktan sonra aynı GPU'da yaklaşık 120 FPS elde edildi. Bu bulgu arka plan/örtülü pencere çizim kısıtlamasıyla uyumlu; düşük örnekler GPU kapasitesi olarak yorumlanmadı ve kontrollü tabloya karıştırılmadı. Kamera elle değiştirilen başka bir deneme otomatik iptal edildi.

## Açılış ve aktarım boyutu

Tek gezinme örneği, önbellek temizlenmeden; gerçek internet hız testi veya Lighthouse sonucu değildir:

- İlk içerik boyaması: 112 ms; belge yüklenmesi: 232 ms.
- MapLibre yükleme olayı: gezinme başlangıcından 2,64 sn sonra. Bu işaret tam etkileşim gecikmesi veya bütün gelecekteki tile isteklerinin tamamlanması değildir.
- İlk 3B hazırlık: 481 ms; sahne oluşturma başlangıcından ilk model render'ının CPU tarafı sonuna 1,57 sn. Bu ilk örneğin pencere koşulları kontrolsüzdü.
- Ön planda yeniden açılış: model hazırlığı 67 ms; ilk model karesi 115 ms. Sıcak tarayıcı/GPU önbelleği etkisi vardır.
- Model: 2.635.940 byte; yerel HTTP isteği ilk örnekte 73 ms, yeniden açılışta 37 ms. Bu değerler uzak sunucu/telefon için geçerli değildir.
- MapLibre JS yaklaşık 1,02 MB, 3B görüntüleyici JS yaklaşık 707 KB (sıkıştırılmamış). Her ikisi ayrı yüklenir; PDF modülü de istem üzerine yüklenir. Geliştirme derleyicisinin büyük parça uyarısı sürer; uzak yayın için HTTP sıkıştırma/önbellek ayrıca planlanmalıdır.

## Sonuç ve açık testler

Bu güçlü masaüstünde mevcut iki blok / 48 daire demosu kontrollü örneklerde akıcı. Varsayılan dengeli kalite korunuyor: detaylı gölgeler yaklaşık iki kat çizim işi yapıyor ve daha fazla render dokusu tutuyor. Bu test, düşük donanımlı bilgisayar veya gerçek telefona performans garantisi vermez.

Henüz ölçülmeyenler: fiziksel Android/iPhone, Safari, entegre GPU, 2×/3× DPR, batarya/ısı etkisi, zayıf ağ, uzun süreli bellek kullanımı ve gelecekteki büyük şehir/çoklu bina modelleri. Gerçek telefona erişim olmadığı için bunlar yapılmış sayılmadı. `?diagnostics=1` test paneli başka bilgisayarda aynı yöntemin tekrarlanabilmesi için pakete eklendi.

## Teslim denetimleri

- 26 otomatik test; üretim derlemesi; paket sunucusunda GET/HEAD, MIME, eksik dosya, yöntem ve dizin dışına erişim denetimi.
- ZIP'lerde yalnızca açık izin listesiyle seçilmiş kaynaklar/üretim dosyaları. Müşteri PDF'leri, `.env`, `node_modules` ve geçici çıktı klasörleri dışarıda.
- Her pakette dosya bazlı SHA-256 manifesti. Çıkarılmış paket üzerinde `scripts/verify-release.mjs` ile denetim yapılır.
- Gerçek donatı, imar/plan ve müşteri ürünü aşaması kullanıcıyla ortak değerlendirme yapılana kadar bekler.

Yöntem referansları: [MDN uzun kare zamanlamaları](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Long_animation_frame_timing) ve [Three.js renderer sayaçları](https://threejs.org/docs/#WebGLRenderer). Ölçümlerin kendisi bu yerel çalışmadan gelir.
