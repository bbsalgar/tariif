# Tutam

**Tutam**, **Manyetik Mürekkep** stüdyosunun el çizimi, kişiselleştirilebilir tarif defteri.
Manyetik Mürekkep sanatçı ve Instagram hesabının adı; Tutam bu stüdyonun defter ürünü ("Tutam · bir Manyetik Mürekkep defteri").

Kişiselleştirilebilir tarif defteri sitesinin ilk prototipi. Ziyaretçi elle çizilmiş tarif sayfalarını seçer, her sayfa için **TR / EN / Boş** dilini belirler, kapak rengini, kapak yazısını ve cildi seçer, sayfa sırasını düzenler.

## Çalıştırma

Derleme adımı yok. `index.html` dosyasını tarayıcıda açman yeterli.

```
index.html          sayfa iskeleti
assets/styles.css   tasarım (renk, yazı tipi, düzen)
assets/app.js       tarif verisi, defter oluşturucu, iki sayfalık önizleme
```

## Kendi çizimlerini eklemek

Şu anki görseller suluboya tarzında yer tutucular (SVG filtreleriyle boyanmış şekiller). Procreate'ten gelen sayfalar hazır olunca:

1. Her tarif için PNG dışa aktar (5:7 oran, örn. 1500×2100 px) ve `assets/pages/` içine koy: `mercimek-tr.png`, `mercimek-en.png`, `mercimek-blank.png`.
2. `assets/app.js` içindeki `RECIPES` listesine yeni tarifi ekle (`id`, `tr`, `en`, `langs` …).
3. `pageThumb` ve `spreadHTML` fonksiyonlarında `art(r.motif)` yerine `<img src="assets/pages/ID-DIL.png">` kullan.

## Boyalı tarif sayfaları (spreads)

İlk tam sayfa örneği: **No. 01 Menemen** (`recipes/menemen.html`). Tek sayfa, çizgili kağıtta kuru boya hissi; TR / EN / Boş halleriyle.

```
assets/spreads/menemen.js          sayfanın çizimi (SVG kuru boya + kalem) ve el yazısı metinler
assets/spreads/menemen-paint.webp  boya katmanının hazır görseli; site bunun üstüne metni canlı yazar
exports/bake-spread.js             boya katmanını görsele çevirir, baskı ve Instagram görsellerini üretir
exports/menemen/                   1400×2000 sayfa (TR/EN/Boş) ve 1080×1350 Instagram postları (TR/EN)
```

Çizimi değiştirdikten sonra görselleri yeniden üret:

```
npm i -D playwright && npx playwright install chromium
node exports/bake-spread.js menemen
```

Procreate sayfaları hazır olduğunda `menemen-paint.webp` yerine kendi dışa aktarımını koyman yeterli
(tek sayfa için 700×1000 oranında, 1400×2000 önerilir); metin katmanı üstünde çalışmaya devam eder.

## Sonraki adımlar

- Gerçek ödeme / sipariş altyapısı (şu an seçim yalnızca tarayıcıda saklanıyor).
- Fiyatlar örnek: spiral 390 TL, iplik dikiş 540 TL, sayfa başı 24 TL, en az 8, en çok 40 sayfa.
- Instagram bağlantısını kendi hesabına göre güncelle (`index.html` içindeki `instagram.com/`).
