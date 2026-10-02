# tariif — el çizimi tarif defteri

Kişiselleştirilebilir tarif defteri sitesinin ilk prototipi. Ziyaretçi elle çizilmiş tarif sayfalarını seçer, her sayfa için **TR / EN / Boş** dilini belirler, kapak rengini, kapak yazısını ve cildi seçer, sayfa sırasını düzenler.

## Çalıştırma

Derleme adımı yok. `index.html` dosyasını tarayıcıda açman yeterli.

```
index.html          sayfa iskeleti
assets/styles.css   tasarım (renk, yazı tipi, düzen)
assets/app.js       tarif verisi, defter oluşturucu, iki sayfalık önizleme
```

## Kendi çizimlerini eklemek

Şu anki görseller risograf tarzında yer tutucular. Procreate'ten gelen sayfalar hazır olunca:

1. Her tarif için PNG dışa aktar (5:7 oran, örn. 1500×2100 px) ve `assets/pages/` içine koy: `mercimek-tr.png`, `mercimek-en.png`, `mercimek-blank.png`.
2. `assets/app.js` içindeki `RECIPES` listesine yeni tarifi ekle (`id`, `tr`, `en`, `langs` …).
3. `pageThumb` ve `spreadHTML` fonksiyonlarında `art(r.motif)` yerine `<img src="assets/pages/ID-DIL.png">` kullan.

## Sonraki adımlar

- Gerçek ödeme / sipariş altyapısı (şu an seçim yalnızca tarayıcıda saklanıyor).
- Fiyatlar örnek: spiral ₺390, iplik dikiş ₺540, sayfa başı ₺24, en az 8, en çok 40 sayfa.
- Instagram bağlantısını kendi hesabına göre güncelle (`index.html` içindeki `instagram.com/`).
