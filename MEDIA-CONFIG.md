# Daire planları ve harici medya bağlantıları

## Şimdiki demo

48 daire `Unit.planId` ile dört ölçeksiz SVG yerleşim şemasına bağlanır. Şemalar `src/domain/unit-presentation.ts` içindedir; net/brüt alan çizimden hesaplanmaz. Gerçek plan belgesi, sanal tur veya AR/VR içeriği sağlanmadığı için `src/data/unit-media.json` başlangıçta boştur.

`Luma Avlu → İncele → bir daire seç → Plan ve daire dosyası` akışı planı açar. Dosyada önceki/sonraki geçişleri yalnızca mevcut filtreye uyan daireler arasında gezinir. “Bu daireyi 3B'de göster” aynı daire kimliğine odaklanır. Bu, oda geometrisi veya BIM eşleştirmesi değildir. Dosya açıkken arka plandaki 3B çizim duraklatılır.

## Gerçek içerik bağlama

Kullanım hakkına sahip olduğunuz belgenin dosyasını `public/plans/` içine koyun veya bir HTTPS adresi sağlayın. Daha sonra `src/data/unit-media.json` içine ilgili **daire kimliği** altında kaydedin:

```json
{
  "luma-a-01": {
    "planUrl": "/plans/a-01.pdf",
    "links": [
      { "kind": "matterport", "url": "https://my.matterport.com/show/?m=GERCEK_MODEL_KIMLIGI" },
      { "kind": "tour", "url": "https://icerik-alan-adiniz.example/tur/a-01" },
      { "kind": "ar", "url": "https://icerik-alan-adiniz.example/ar/a-01" },
      { "kind": "vr", "url": "https://icerik-alan-adiniz.example/vr/a-01" },
      { "kind": "video", "url": "https://icerik-alan-adiniz.example/video/a-01" }
    ]
  }
}
```

Bu örnekteki adresler **yer tutucudur**, uygulama verisine eklenmemiştir. Yalnızca mevcut gerçek içerikler için satır ekleyin; diğerlerini boş bırakın. Örnek JSON'u olduğu gibi etkinleştirmeyin. `planUrl` eklemek ölçeksiz şemanın yerini değiştirmez; ayrı “Bağlı plan belgesi” bağlantısı oluşturur. Gerçek plana geçilecek bir sonraki müşteri uygulamasında plan kaynağının türü ayrıca ele alınmalıdır.

Harici adresler HTTPS olmalı; URL içinde kullanıcı adı/parola bulunmamalıdır. Yerel planlar yalnızca `/plans/` altından bağlanır. Matterport türü `my.matterport.com` alanını kabul eder. Geçersiz/tekrarlı adresler bağlantı listesine alınmaz. Bağlantılar yeni sekmede `noopener noreferrer` ile, yalnızca kullanıcı tıklamasıyla açılır. Otomatik iframe, üçüncü taraf veri aktarımı veya WebXR oturumu başlatılmaz.

Bu doğrulama URL biçimini denetler; içeriğin varlığını, erişim iznini veya daireye ait olduğunu doğrulamaz. Gerçek bağlantıları yayın öncesi ayrı ayrı kontrol edin. WebXR, cihaz AR görüntüleyicisi ve gömülü Matterport entegrasyonu bu aşamada yapılmadı.
