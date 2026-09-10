# GIS çalışma paketi

Bu paket gerçek WGS84 koordinatlarında bölgesel demo kayıtlarını ve masa başı inceleme pencerelerini içerir. Pencereler parsel veya yatırım alanı değildir. Kesin saha seçimi yapılmadı.

## QGIS içinde açma

1. `npm run export:gis` ile uygulamanın tek veri kaynağından güncel `public/data/projects.geojson` üretin.
2. QGIS'e `public/data/projects.geojson` ve `gis/study-areas.geojson` dosyalarını sürükleyin. Kaynak CRS WGS84, EPSG:4326'dır; koordinat sırası boylam, enlemdir.
3. QGIS'in standart XYZ OpenStreetMap altlığını açın veya erişim hakkınız olan altlığı ekleyin. Uygulamadaki OpenFreeMap vektör stili bir XYZ raster adresi değildir.
4. Görüntüleme için EPSG:3857 kullanabilirsiniz. Alan hesaplarını uygun yerel metre projeksiyonu veya jeodezik ölçümle yapın; EPSG:3857 üzerinden doğrudan hesaplamayın.
5. Katmanları QGIS içinden GeoPackage'a kaydedin ve QGIS projesini bu dosyaya bağlayın. Bu ilk sürümde henüz QGIS ile doğrulanmış `.qgz` veya `.gpkg` dosyası üretilmedi.

## Kaynak ayrımı

- Gerçek şehir altlığı: OpenFreeMap / OpenMapTiles / OpenStreetMap. Web uygulamasında kaynak atfı görünür.
- Proje noktaları: özgün temsili demo kaydı; gerçek parsel ve adres yok.
- Çalışma pencereleri: koordinatları belirlenmiş inceleme çerçeveleri; veri kalitesi değerlendirmesi henüz tamamlanmadı.
- Bina oturumu, kadastro, imar, DEM, gerçek yürüyüş süresi: bu sürümde yok.

Web uygulaması şu an OpenFreeMap kamu servisini kullanır ve internet ister. Çevrimdışı harita paketi yoktur. Kamu OSM raster karolarını toplu indirip çevrimdışı paket üretmeyin.
