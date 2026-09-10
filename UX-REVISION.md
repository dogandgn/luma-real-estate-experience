# Seçim ve yakın çevre — UI/UX revizyonu

## İncelenen örnekler

- [VM Condominium / Property Mapper](https://vm-condominium.propertymapper.co/vm-condominium-luxury/): liste ve 3B harita seçenekleri, kat/oda/alan/durum filtreleri; uygun–rezerve–satılmış ayrımı. Erişilebilir sayfa içeriği incelendi; tüm etkileşimleri denenmiş kabul edilmez.
- [VisEngine Real Estate Sales App](https://visengine.com/property-app/): daire bilgisi, uygunluk/fiyat, kat planı ve sanal turu aynı satış deneyiminde birleştiren ürün yaklaşımı. Özellik sunumu incelendi; ürünün kendisi kurulmadı.

Bu referanslardan alınan karar: arama, mekânsal keşif ve seçimin ayrıntıları ayrı bölgelerde olsun. Görsel varlıkları veya site tasarımları kopyalanmadı. Bu çalışma Unreal veya fotogerçekçi model eşdeğerliği iddiası taşımaz.

## Uygulanan akış

1. Soldaki **İncele** veya harita işareti projeyi seçer. Sağ panelde proje özeti ve yakın çevre açılır.
2. **3B daireleri keşfet**, yalnızca modeli olan projede görünür. Solda filtreli daire listesi, ortada model, seçilince sağda daire bilgileri vardır.
3. Daire: liste, turkuaz cephe dolgusu/çerçevesi, sahne etiketi ve sağ panel aynı kimliğe bağlıdır. Plan düğmesi sağ panelin sabit alt bölümünde kalır.
4. Plan dosyasında daire değiştirme ve 3B'ye dönüş aynı seçimi korur. Filtre dışı kalan daire seçimi temizlenir.
5. Mobilde üç sütun sıkıştırılmaz; model, seçili daire bilgisi ve liste sıralanır. Harita ile proje/çevre paneli dikey akışa geçer.

## Donatı bağlantısı — bilinçli olarak beklemede

Kullanıcının son kararı doğrultusunda gerçek donatı servisi bağlanmadı. Varsayılan durum **Donatı verisi henüz bağlı değil**; bilinmeyen sayılar 0 değil çizgi olarak sunulur. Bu aşama gerçek metro/durak varlığı, konumu veya yakınlığı iddia etmez.

**Örnek akışı dene** açıldığında proje başına 6 açıkça temsili nokta oluşur: 2 otobüs, metro, eğitim, sağlık, park. Kategori/yarıçap, liste seçimi, harita vurgusu, odaklama ve temizleme bu verilerle denenebilir. Etiketler, panel ve harita lejantı gerçek konum olmadığını belirtir. Hiçbir örnek nokta gerçek bir kuruma bağlantı vermez.

Gerçek bağlantı için veri sınırı `src/domain/nearby.ts`:

```ts
interface NearbyPoint {
  id: string
  name: string
  category: 'bus' | 'metro' | 'education' | 'health' | 'park'
  coordinates: [number, number] // WGS84: boylam, enlem
}
```

Sonraki entegrasyonda kaynak/lisans, veri tarihi, gerçek/temsili ayrımı, yükleniyor/hata/boş sonuç durumu ve servis adaptörü ayrıca eklenecek. Mevcut `findNearby`, `visibleNearby`, `nearbyGeoJSON` aynı kalabilir. Şimdiki uygulama yalnızca örnek kaynağa bağlıdır; gerçek kaynağa otomatik geçmez. Mesafe Haversine ile kuş uçuşudur, rota veya seyahat süresi değildir. GIS altlığı ve POI katmanı ayrı tutulur.

## Performans ve kaynaklar

- Yeni paket bağımlılığı eklenmedi; ağır MapLibre / Three görüntüleyicileri ayrı, ihtiyaç anında yüklenen modüller olarak korundu.
- Seçimde renk/GeoJSON güncellenir; harita ve WebGL sahnesi yeniden kurulmaz.
- Daire kimliği araması Map üzerinden; fare üzerindeyken ışın testi yaklaşık 32 ms aralıkla sınırlı.
- Sabit ışık/modelde gölge haritası tekrar çizilmez; kat/blok/oda/durum veya ışık değişimi gölgeyi geçersiz kılar.
- Yeni cephe vurgusu yalnızca iki çizim nesnesi ekler. Geometri/malzemeler kapanışta serbest bırakılır.
- Işık/pozlama dengesi ve avluya bakan dairelerde kameranın karşı bloğun içine girmemesi için odak mesafesi düzenlendi.
- Bunlar uygulanan optimizasyonlardır; ölçülmüş FPS artışı iddia edilmez. Düşük donanım / gerçek telefon ve uzun kullanım GPU ölçümü bekliyor.

## Doğrulama ve açık işler

- TypeScript + üretim derlemesi; 20 otomatik test.
- Masaüstü tarayıcı: proje sağ paneli, örnek modu, metro filtresi, listeden donatı seçimi ve görünür harita vurgusu, 3B daire sağ paneli, A-01 → plan → A-02 → 3B dönüş kontrol edildi.
- 390 × 844 duyarlı görünüm: harita/panel dikey düzeni, model ve daire paneli kontrol edildi. Avluya bakan A-02 kamera odağı da görünür şekilde doğrulandı. Bu gerçek telefon testi değildir.
- B blok filtresiyle A blok seçiminin sağ panelden kaldırıldığı tarayıcıda doğrulandı.
- Derlemede MapLibre ve Three parçaları için büyük paket uyarısı sürüyor; hata değil, sonraki performans bütçesi işidir.
- Gerçek POI beslemesi, gerçek plan/tur medyası, nihai fotogerçekçi model, düşük donanım ölçümü ve paylaşılabilir demo paketi tamamlanmış sayılmaz.
- Yayın yapılmadı; çalışma yereldir.
