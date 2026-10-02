(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Watercolour placeholder art: pigment glazes (SVG filters #wc1/#wc2
     in index.html give them soft, pooled edges and paper grain) under
     fine-liner linework. Swap these for the real Procreate exports later
     (see README: "Kendi çizimlerini eklemek").
  ------------------------------------------------------------------ */
  // W: one watercolour glaze in a single pigment. P: paper left white. PEN: fine-liner linework.
  function W(pigment, inner, f, extra) {
    return '<g class="wash ' + pigment + (extra ? " " + extra : "") + '" filter="url(#' + (f || "wc1") + ')">' + inner + "</g>";
  }
  function P(inner) { return '<g class="paper" filter="url(#wc2)">' + inner + "</g>"; }
  function PEN(inner) { return '<g class="pen" filter="url(#pen)">' + inner + "</g>"; }
  function dots(pts, r) {
    return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"/>'; }).join("");
  }
  function inkDots(pts) {
    return '<path class="dot" d="' + pts.map(function (p) { return "M" + p[0] + " " + p[1] + "h.01"; }).join("") + '"/>';
  }
  function grid(x0, y0, cols, rows, step, r) {
    var pts = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) pts.push([x0 + x * step + (y % 2) * step / 2, y0 + y * step * 0.85]);
    return dots(pts, r);
  }
  function petals(n, cy, rx, ry, offset) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<ellipse cx="60" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (offset + i * 360 / n) + ' 60 62)"/>';
    }
    return out;
  }

  var HEART = '<path d="M58 64c-10-8-14-14-8-18 4-3 8 0 8 3 0-3 4-6 8-3 6 4 2 10-8 18z"/>';

  var ART = {
    pan: // menemen in a copper sahan
      W("terra", '<circle cx="60" cy="64" r="40"/><ellipse cx="15" cy="64" rx="9" ry="5"/><ellipse cx="105" cy="64" rx="9" ry="5"/>', "wc1", "lt") +
      W("red", '<circle cx="60" cy="64" r="33"/>', "wc2") +
      W("orange", '<circle cx="68" cy="54" r="13"/><circle cx="46" cy="78" r="10"/>', "wc1", "lt") +
      P('<ellipse cx="50" cy="60" rx="14" ry="12"/><ellipse cx="72" cy="71" rx="13" ry="11"/>') +
      W("yellow", '<circle cx="50" cy="60" r="6.5"/><circle cx="72" cy="71" r="6"/>', "wc2") +
      W("green", '<ellipse cx="42" cy="80" rx="9" ry="3.2" transform="rotate(-20 42 80)"/><ellipse cx="82" cy="50" rx="8" ry="3" transform="rotate(25 82 50)"/><ellipse cx="64" cy="43" rx="6" ry="2.6" transform="rotate(-8 64 43)"/>', "wc1") +
      PEN('<circle cx="60" cy="64" r="40"/><circle cx="60" cy="64" r="34.5"/><circle cx="50" cy="60" r="6.5"/><circle cx="72" cy="71" r="6"/><path d="M6 61c2-2 6-2 8 0M106 61c2-2 6-2 8 0"/>' +
        inkDots([[38, 64], [62, 50], [86, 64], [58, 88], [44, 48], [80, 82]])),

    bowl: // mercimek in an İznik bowl
      W("blue", '<path d="M14 60h92c0 26-20 42-46 42S14 86 14 60z"/>', "wc1") +
      P('<path d="M21 76c12 7 66 7 78 0l-3 8c-14 6-58 6-72 0z"/>') +
      W("blue", dots([[34, 81], [47, 84], [60, 85], [73, 84], [86, 81]], 2.4), "wc2") +
      P('<ellipse cx="60" cy="60" rx="46" ry="10"/>') +
      W("orange", '<ellipse cx="60" cy="60" rx="46" ry="10"/>', "wc2") +
      W("yellow", '<path d="M78 58a12 12 0 0 1 24 0z"/>', "wc1") +
      W("green", '<ellipse cx="44" cy="58" rx="6" ry="2.6" transform="rotate(-20 44 58)"/><ellipse cx="53" cy="62" rx="6" ry="2.6" transform="rotate(30 53 62)"/>', "wc2") +
      W("red", dots([[38, 62], [64, 57], [70, 62], [58, 64]], 1.3), "wc1") +
      PEN('<path d="M14 60h92c0 26-20 42-46 42S14 86 14 60z"/><ellipse cx="60" cy="60" rx="46" ry="10"/><path d="M46 44c-5-5 5-9 0-16M62 40c-5-5 5-9 0-16M76 44c-4-4 4-7 0-12"/><path d="M78 58a12 12 0 0 1 24 0M90 58V47M90 58l-8-7M90 58l8-7"/><path d="M42 102h36"/>'),

    eggplant: // karnıyarık
      W("blue", '<ellipse cx="58" cy="94" rx="52" ry="8"/>', "wc1", "lt") +
      W("purple", '<ellipse cx="56" cy="70" rx="44" ry="18" transform="rotate(-10 56 70)"/>', "wc1") +
      W("purple", '<ellipse cx="60" cy="77" rx="34" ry="8" transform="rotate(-10 60 77)"/>', "wc2", "lt") +
      W("brown", '<ellipse cx="54" cy="62" rx="30" ry="7" transform="rotate(-10 54 62)"/>', "wc2") +
      W("red", '<circle cx="40" cy="62" r="5"/><circle cx="66" cy="57" r="5"/>', "wc1") +
      W("green", '<ellipse cx="53" cy="58" rx="14" ry="2.6" transform="rotate(-10 53 58)"/><path d="M96 56c6-2 10-8 12-16l4 2c-2 8-6 14-12 18z"/><path d="M90 53c4-6 12-6 14 2-6 4-10 4-14-2z"/>', "wc2") +
      PEN('<ellipse cx="56" cy="70" rx="44" ry="18" transform="rotate(-10 56 70)"/><path d="M26 66c18-6 40-10 58-12"/><circle cx="40" cy="62" r="5"/><circle cx="66" cy="57" r="5"/><path d="M98 54c6-3 9-9 11-16"/>'),

    dumplings: // mantı with garlic yogurt and pepper butter
      W("blue", '<circle cx="60" cy="62" r="48"/>', "wc1", "lt") +
      P('<ellipse cx="60" cy="62" rx="38" ry="32"/>') +
      W("cream", '<ellipse cx="60" cy="62" rx="36" ry="30"/>', "wc2", "lt") +
      W("ochre", grid(38, 46, 5, 5, 10.5, 4.3), "wc1", "lt") +
      W("s-red", '<path d="M32 52c8 6 14-6 22 0s14-6 22 0 12-6 18 0M34 74c8 6 14-6 22 0s14-6 22 0 10-6 16 0"/>', "wc2") +
      W("green", dots([[44, 42], [80, 44], [90, 70], [32, 68], [62, 90]], 1.8), "wc1") +
      PEN('<circle cx="60" cy="62" r="48"/><circle cx="60" cy="62" r="41"/><path d="M46 50l2 2M60 48l2 2M72 53l2 2M50 64l2 2M66 66l2 2M56 78l2 2"/>'),

    artichoke: // zeytinyağlı enginar with lemon and dill
      W("sage", petals(8, 37, 11, 25, 0), "wc1") +
      W("green", petals(8, 44, 8, 18, 22.5), "wc2") +
      W("yellow", '<circle cx="60" cy="62" r="11"/>', "wc1", "lt") +
      W("yellow", '<circle cx="100" cy="100" r="12"/>', "wc2") +
      PEN(petals(8, 44, 8, 18, 22.5) + '<circle cx="60" cy="62" r="11"/><path d="M12 102l10-10M16 108l6-12M24 96l-8-2"/><circle cx="100" cy="100" r="12"/><path d="M100 89v22M89 100h22"/>'),

    bread: // poğaça on a blue plate
      W("blue", '<ellipse cx="60" cy="96" rx="52" ry="10"/>', "wc1", "lt") +
      W("cream", '<ellipse cx="34" cy="80" rx="22" ry="16"/><ellipse cx="86" cy="80" rx="22" ry="16"/><ellipse cx="60" cy="58" rx="24" ry="18"/>', "wc2") +
      W("ochre", '<ellipse cx="34" cy="74" rx="15" ry="8"/><ellipse cx="86" cy="74" rx="15" ry="8"/><ellipse cx="60" cy="51" rx="16" ry="9"/>', "wc1") +
      PEN('<path d="M12 84c0-12 10-20 22-20s22 8 22 20M64 84c0-12 10-20 22-20s22 8 22 20M36 62c0-14 11-22 24-22s24 8 24 22"/><path d="M12 84c8 4 36 4 44 0M64 84c8 4 36 4 44 0"/>' +
        inkDots([[28, 70], [36, 67], [42, 72], [80, 70], [88, 67], [94, 72], [52, 48], [60, 45], [68, 49], [58, 53]])),

    slice: // revani with pistachio
      W("blue", '<ellipse cx="60" cy="94" rx="52" ry="9"/>', "wc1", "lt") +
      W("ochre", '<rect x="22" y="48" width="76" height="40" rx="2"/>', "wc2", "lt") +
      W("yellow", '<rect x="27" y="58" width="66" height="26"/>', "wc1", "lt") +
      W("orange", '<rect x="22" y="44" width="76" height="9" rx="2"/>', "wc1") +
      W("green", dots([[36, 44], [54, 43], [74, 44], [88, 43]], 2), "wc2") +
      PEN('<path d="M22 48v40h76V48M22 46c20-3 56-3 76 0M22 53h76M34 53v7M60 53v11M84 53v6"/>' +
        inkDots([[30, 66], [44, 72], [58, 64], [72, 76], [86, 68], [40, 82], [66, 84]])),

    ramekin: // fırın sütlaç in a clay güveç
      W("terra", '<path d="M22 58h76l-7 36a6 6 0 0 1-6 5H35a6 6 0 0 1-6-5z"/>', "wc1") +
      W("brown", '<path d="M24 64h72l-1 6H25z"/>', "wc2", "lt") +
      W("cream", '<ellipse cx="60" cy="58" rx="38" ry="10"/>', "wc2") +
      W("brown", '<ellipse cx="50" cy="57" rx="10" ry="4"/><ellipse cx="72" cy="60" rx="8" ry="3"/><ellipse cx="63" cy="54" rx="5" ry="2"/>', "wc1") +
      PEN('<path d="M22 58l7 36a6 6 0 0 0 6 5h50a6 6 0 0 0 6-5l7-36"/><ellipse cx="60" cy="58" rx="38" ry="10"/><path d="M26 70c20 4 48 4 68 0"/>' +
        inkDots([[42, 60], [80, 57], [56, 62], [68, 55]])),

    glass: // lemonade with mint
      W("yellow", '<path d="M37 44h46l-5 56H42z"/>', "wc1", "lt") +
      W("blue", '<path d="M40 50l2 46h4l-2-46z"/>', "wc2", "lt") +
      W("yellow", '<circle cx="88" cy="32" r="16"/><circle cx="58" cy="72" r="9"/>', "wc2") +
      W("green", '<ellipse cx="50" cy="38" rx="9" ry="3.6" transform="rotate(-30 50 38)"/><ellipse cx="60" cy="34" rx="9" ry="3.6" transform="rotate(20 60 34)"/>', "wc1") +
      PEN('<path d="M34 30h52l-7 72H41z"/><path d="M37 44h46"/><circle cx="88" cy="32" r="16"/><circle cx="88" cy="32" r="12"/><path d="M88 20v24M76 32h24M80 24l16 16M96 24L80 40"/><circle cx="58" cy="72" r="9"/><rect x="62" y="52" width="11" height="11" rx="2" transform="rotate(12 67 57)"/><rect x="46" y="82" width="10" height="10" rx="2" transform="rotate(-10 51 87)"/><path d="M71 12l-8 60M75 13l-8 60"/>'),

    frame: // the family-recipe page
      W("grey", '<rect x="20" y="26" width="84" height="74" rx="2" transform="rotate(-4 62 63)"/>', "wc1", "lt") +
      P('<rect x="16" y="22" width="84" height="74" rx="2" transform="rotate(-4 58 59)"/>') +
      W("sage", '<rect x="24" y="29" width="68" height="50" transform="rotate(-4 58 54)"/>', "wc2", "lt") +
      W("blue", '<rect x="42" y="12" width="34" height="12" transform="rotate(6 59 18)"/>', "wc1", "lt") +
      W("red", HEART, "wc2") +
      PEN('<rect x="16" y="22" width="84" height="74" rx="2" transform="rotate(-4 58 59)"/><rect x="24" y="29" width="68" height="50" transform="rotate(-4 58 54)"/>' + HEART + '<path d="M34 88c10-2 30-3 46-4"/>')
  };

  function art(motif) {
    return '<svg class="art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + (ART[motif] || "") + "</svg>";
  }

  /* ------------------------------------------------------------------
     Recipes. Turkish kitchen measures: 1 su bardağı ≈ 200 ml.
  ------------------------------------------------------------------ */
  var CATS = {
    kahvalti: "Kahvaltı", corba: "Çorba", ana: "Ana yemek", zeytinyagli: "Zeytinyağlı",
    hamur: "Hamur işi", tatli: "Tatlı", icecek: "İçecek", ozel: "Özel sayfa"
  };

  var RECIPES = [
    { id: "menemen", no: "01", cat: "kahvalti", motif: "pan", tr: "Menemen", en: "Menemen", langs: ["tr", "en", "blank"],
      serves: ["2 kişilik", "Serves 2"], time: ["20 dk", "20 min"],
      ingTR: ["4 yumurta", "3 olgun domates", "2 sivri biber", "2 yemek kaşığı tereyağı", "tuz, pul biber"],
      ingEN: ["4 eggs", "3 ripe tomatoes", "2 Turkish green peppers", "2 tbsp butter", "salt, Aleppo pepper flakes"],
      stTR: ["Biberleri tereyağında yumuşayana kadar kavur.", "Rendelenmiş domatesi ekle, suyunu çekene kadar pişir.", "Yumurtaları kır, çok karıştırmadan pişir. Pul biberle servis et."],
      stEN: ["Soften the peppers in butter.", "Add grated tomato and cook until most of the juice is gone.", "Crack in the eggs and stir gently until just set. Finish with pepper flakes."] },

    { id: "pogaca", no: "02", cat: "hamur", motif: "bread", tr: "Peynirli Poğaça", en: "Cheese Poğaça", langs: ["tr", "en", "blank"],
      serves: ["12 adet", "Makes 12"], time: ["50 dk", "50 min"],
      ingTR: ["3,5 su bardağı un", "1 su bardağı yoğurt", "½ su bardağı sıvı yağ", "125 g tereyağı", "1 paket kabartma tozu", "200 g beyaz peynir", "çörek otu"],
      ingEN: ["3½ cups flour", "1 cup yogurt", "½ cup sunflower oil", "125 g butter", "1 sachet baking powder", "200 g white cheese (feta)", "nigella seeds"],
      stTR: ["Un hariç her şeyi karıştır, unu azar azar ekleyip yumuşak bir hamur yap.", "Ceviz büyüklüğünde parçalar al, peyniri koyup kapat.", "Üstüne yumurta sarısı ve çörek otu sür, 180°C'de 25 dk pişir."],
      stEN: ["Mix everything but the flour, then add flour slowly to a soft dough.", "Pinch off walnut-sized pieces, fill with cheese and seal.", "Brush with egg yolk, sprinkle nigella, bake at 180°C for 25 min."] },

    { id: "mercimek", no: "03", cat: "corba", motif: "bowl", tr: "Mercimek Çorbası", en: "Red Lentil Soup", langs: ["tr", "en", "blank"],
      serves: ["4 kişilik", "Serves 4"], time: ["35 dk", "35 min"],
      ingTR: ["1 su bardağı kırmızı mercimek", "1 kuru soğan", "1 havuç", "1 yemek kaşığı salça", "6 su bardağı sıcak su", "1 çay kaşığı kimyon"],
      ingEN: ["1 cup red lentils", "1 onion", "1 carrot", "1 tbsp tomato paste", "6 cups hot water", "1 tsp cumin"],
      stTR: ["Soğan ve havucu tereyağında kavur, salçayı ekle.", "Mercimeği ve suyu ekle, 25 dk pişir.", "Blenderdan geçir. Limon ve pul biberle servis et."],
      stEN: ["Sauté onion and carrot in butter, stir in the paste.", "Add lentils and water, simmer for 25 min.", "Blend smooth. Serve with lemon and pepper flakes."] },

    { id: "karniyarik", no: "04", cat: "ana", motif: "eggplant", tr: "Karnıyarık", en: "Stuffed Aubergines", langs: ["tr", "en"],
      serves: ["4 kişilik", "Serves 4"], time: ["70 dk", "70 min"],
      ingTR: ["6 bostan patlıcan", "250 g kıyma", "2 kuru soğan", "2 domates", "3 sivri biber", "1 yemek kaşığı salça"],
      ingEN: ["6 small aubergines", "250 g minced beef", "2 onions", "2 tomatoes", "3 green peppers", "1 tbsp tomato paste"],
      stTR: ["Patlıcanları alacalı soy, kızart.", "Kıymayı soğanla kavur; domates ve biberi ekle.", "Patlıcanları ortadan yar, harcı doldur, 180°C'de 30 dk pişir."],
      stEN: ["Peel the aubergines in stripes and fry.", "Brown the mince with onion, add tomato and pepper.", "Split the aubergines, fill, bake at 180°C for 30 min."] },

    { id: "manti", no: "05", cat: "ana", motif: "dumplings", tr: "Kayseri Mantısı", en: "Turkish Mantı", langs: ["tr", "en", "blank"],
      serves: ["4 kişilik", "Serves 4"], time: ["90 dk", "90 min"],
      ingTR: ["3 su bardağı un", "1 yumurta", "1 su bardağı su", "250 g kıyma", "1 rendelenmiş soğan", "2 su bardağı sarımsaklı yoğurt", "2 yemek kaşığı tereyağı, pul biber"],
      ingEN: ["3 cups flour", "1 egg", "1 cup water", "250 g minced beef", "1 grated onion", "2 cups garlic yogurt", "2 tbsp butter, pepper flakes"],
      stTR: ["Hamuru yoğur, 30 dk dinlendir.", "İnce aç, minik kareler kes, kıyma koyup bohça gibi kapat.", "Kaynar suda 10 dk haşla. Yoğurt ve biberli tereyağıyla servis et."],
      stEN: ["Knead the dough and rest it for 30 min.", "Roll thin, cut tiny squares, fill and pinch shut.", "Boil for 10 min. Top with yogurt and pepper butter."] },

    { id: "enginar", no: "06", cat: "zeytinyagli", motif: "artichoke", tr: "Zeytinyağlı Enginar", en: "Artichokes in Olive Oil", langs: ["tr", "en", "blank"],
      serves: ["4 kişilik", "Serves 4"], time: ["45 dk", "45 min"],
      ingTR: ["4 enginar çanağı", "1 havuç", "1 patates", "1 su bardağı bezelye", "½ su bardağı zeytinyağı", "1 limon", "dereotu"],
      ingEN: ["4 artichoke hearts", "1 carrot", "1 potato", "1 cup peas", "½ cup olive oil", "1 lemon", "dill"],
      stTR: ["Enginarları limonlu suda beklet.", "Sebzeleri küp doğra, zeytinyağında çevir.", "Enginarlara doldur, 1 su bardağı su ekleyip kısık ateşte 35 dk pişir. Soğuk servis et."],
      stEN: ["Keep the artichokes in lemon water.", "Dice the vegetables, toss in olive oil.", "Fill the artichokes, add 1 cup water, simmer 35 min. Serve cold."] },

    { id: "revani", no: "07", cat: "tatli", motif: "slice", tr: "Revani", en: "Semolina Syrup Cake", langs: ["tr", "en", "blank"],
      serves: ["12 dilim", "12 slices"], time: ["60 dk", "60 min"],
      ingTR: ["3 yumurta", "1 su bardağı şeker", "1 su bardağı irmik", "1 su bardağı un", "1 su bardağı yoğurt", "Şerbet: 3 su bardağı şeker, 3,5 su bardağı su, ½ limon"],
      ingEN: ["3 eggs", "1 cup sugar", "1 cup semolina", "1 cup flour", "1 cup yogurt", "Syrup: 3 cups sugar, 3½ cups water, ½ lemon"],
      stTR: ["Şerbeti kaynat, soğumaya bırak.", "Yumurta ve şekeri köpürt, kalanları ekle.", "180°C'de 30 dk pişir. Sıcak keke soğuk şerbeti dök."],
      stEN: ["Boil the syrup and let it cool.", "Whisk eggs and sugar until pale, fold in the rest.", "Bake at 180°C for 30 min. Pour cold syrup over the hot cake."] },

    { id: "sutlac", no: "08", cat: "tatli", motif: "ramekin", tr: "Fırın Sütlaç", en: "Baked Rice Pudding", langs: ["tr", "en", "blank"],
      serves: ["6 kase", "6 bowls"], time: ["60 dk", "60 min"],
      ingTR: ["1 litre süt", "½ su bardağı pirinç", "1 su bardağı şeker", "2 yemek kaşığı pirinç unu", "1 paket vanilin"],
      ingEN: ["1 litre milk", "½ cup short-grain rice", "1 cup sugar", "2 tbsp rice flour", "1 sachet vanilla"],
      stTR: ["Pirinci az suyla yumuşayana kadar haşla.", "Süt ve şekeri ekle; pirinç ununu biraz sütle açıp ilave et, koyulaşana kadar karıştır.", "Kaselere paylaştır, fırının üst ızgarasında üstü kızarana kadar tut."],
      stEN: ["Cook the rice in a little water until soft.", "Add milk and sugar; loosen rice flour in milk, stir in until thick.", "Pour into bowls and grill until the tops brown."] },

    { id: "limonata", no: "09", cat: "icecek", motif: "glass", tr: "Ev Limonatası", en: "Homemade Lemonade", langs: ["tr", "en"],
      serves: ["1 litre", "1 litre"], time: ["15 dk + 1 gece", "15 min + overnight"],
      ingTR: ["4 limon", "1 su bardağı şeker", "5 su bardağı soğuk su", "taze nane"],
      ingEN: ["4 lemons", "1 cup sugar", "5 cups cold water", "fresh mint"],
      stTR: ["Limon kabuklarını şekerle ovup bir gece beklet.", "Limon suyunu ekle, şeker eriyene kadar karıştır.", "Suyu ekle, süz. Buz ve naneyle servis et."],
      stEN: ["Rub the peels with sugar and leave overnight.", "Add the juice and stir until the sugar dissolves.", "Add water, strain, serve with ice and mint."] },

    { id: "aile", no: "10", cat: "ozel", motif: "frame", tr: "Aile Tarifi", en: "Family Recipe", langs: ["blank"],
      serves: ["", ""], time: ["", ""], ingTR: [], ingEN: [], stTR: [], stEN: [] }
  ];

  var BY_ID = {};
  RECIPES.forEach(function (r) { BY_ID[r.id] = r; });

  var LANG_LABEL = { tr: "TR", en: "EN", blank: "Boş" };
  var COVERS = [
    { id: "mavi", name: "İznik mavisi", color: "var(--cobalt)" },
    { id: "adacayi", name: "Adaçayı", color: "#6F8B62" },
    { id: "nar", name: "Nar", color: "#9E2F37" },
    { id: "keten", name: "Keten", color: "#DCCDB0" }
  ];
  var BINDINGS = [
    { id: "spiral", name: "Spiral", price: 390 },
    { id: "dikis", name: "İplik dikiş", price: 540 }
  ];
  var PER_PAGE = 24, MIN_PAGES = 8, MAX_PAGES = 40;

  /* ------------------------------------------------------------------
     State, kept in this browser only.
  ------------------------------------------------------------------ */
  var KEY = "tariif-defter-v1";
  var state = load() || {
    items: [{ id: "menemen", lang: "tr" }, { id: "mercimek", lang: "tr" }, { id: "manti", lang: "blank" }, { id: "revani", lang: "en" }],
    cover: "mavi", name: "", binding: "spiral"
  };
  var filter = "all";
  var cardLang = {};
  RECIPES.forEach(function (r) { cardLang[r.id] = r.langs[0]; });
  state.items.forEach(function (it) { cardLang[it.id] = it.lang; });

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.items)) {
        s.items = s.items.filter(function (it) { return BY_ID[it.id] && BY_ID[it.id].langs.indexOf(it.lang) > -1; });
        return s;
      }
    } catch (e) { /* storage unavailable */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function indexOf(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return i;
    return -1;
  }
  function tl(n) { return n.toLocaleString("tr-TR") + " TL"; }

  /* ------------------------------------------------------------------
     Rendering
  ------------------------------------------------------------------ */
  function pageThumb(r, lang) {
    var title = lang === "en" ? r.en : r.tr;
    var lines = "";
    for (var i = 0; i < 4; i++) lines += '<i style="width:' + [92, 74, 86, 58][i] + '%"></i>';
    return '<div class="page">' +
      '<div class="page-no"><span>No. ' + r.no + '</span><span class="page-badge">' + LANG_LABEL[lang] + '</span></div>' +
      '<div class="page-art">' + art(r.motif) + '</div>' +
      '<div><div class="page-title">' + title + '</div>' +
      '<div class="page-lines' + (lang === "blank" ? " blank" : "") + '">' + lines + '</div></div>' +
      '</div>';
  }

  function segButtons(r, active) {
    return ["tr", "en", "blank"].map(function (l) {
      var ok = r.langs.indexOf(l) > -1;
      return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === active) + '"' + (ok ? "" : ' disabled title="Bu sayfada yok"') + '>' + LANG_LABEL[l] + '</button>';
    }).join("");
  }

  function cardHTML(r) {
    var inBook = indexOf(r.id) > -1;
    return '<article class="card' + (inBook ? " is-in" : "") + '" data-id="' + r.id + '">' +
      '<button class="card-page" type="button" data-open aria-label="' + r.tr + ' sayfasını büyüt">' + pageThumb(r, cardLang[r.id]) + '</button>' +
      '<div class="card-meta"><h3>' + r.tr + '</h3><span class="mono">' + CATS[r.cat] + '</span></div>' +
      '<div class="card-actions">' +
        '<div class="seg" role="group" aria-label="' + r.tr + ' sayfa dili">' + segButtons(r, cardLang[r.id]) + '</div>' +
        '<button class="add-btn" type="button" data-add aria-pressed="' + inBook + '">' + (inBook ? "Eklendi ✓" : "+ Ekle") + '</button>' +
      '</div></article>';
  }

  var $ = function (s) { return document.querySelector(s); };
  var catalog = $("#catalog");

  function renderFilters() {
    var used = {};
    RECIPES.forEach(function (r) { used[r.cat] = true; });
    var html = '<button class="chip" type="button" data-f="all" aria-pressed="' + (filter === "all") + '">Hepsi</button>';
    Object.keys(CATS).forEach(function (k) {
      if (used[k]) html += '<button class="chip" type="button" data-f="' + k + '" aria-pressed="' + (filter === k) + '">' + CATS[k] + '</button>';
    });
    $("#filters").innerHTML = html;
  }

  function renderCatalog() {
    catalog.innerHTML = RECIPES.filter(function (r) { return filter === "all" || r.cat === filter; }).map(cardHTML).join("");
  }

  function refreshCard(id, focusSel) {
    var el = catalog.querySelector('[data-id="' + id + '"]');
    if (!el) return;
    var tmp = document.createElement("div");
    tmp.innerHTML = cardHTML(BY_ID[id]);
    var fresh = tmp.firstChild;
    el.replaceWith(fresh);
    if (focusSel) { var f = fresh.querySelector(focusSel); if (f) f.focus(); }
  }

  function renderBook() {
    var n = state.items.length;
    var binding = BINDINGS.filter(function (b) { return b.id === state.binding; })[0] || BINDINGS[0];
    var cover = COVERS.filter(function (c) { return c.id === state.cover; })[0] || COVERS[0];

    // cover
    var cp = $("#coverPreview");
    cp.style.setProperty("--cover", cover.color);
    cp.dataset.binding = binding.id;
    cp.dataset.cover = cover.id;
    $("#coverName").textContent = state.name.trim() || "Benim Mutfağım";
    var nameInput = $("#nameInput");
    if (document.activeElement !== nameInput) nameInput.value = state.name;

    $("#coverSwatches").innerHTML = COVERS.map(function (c) {
      return '<button class="swatch" type="button" data-cover="' + c.id + '" aria-pressed="' + (c.id === cover.id) + '" style="--c:' + c.color + '"><span></span>' + c.name + '</button>';
    }).join("");
    $("#bindingSeg").innerHTML = BINDINGS.map(function (b) {
      return '<button type="button" data-binding="' + b.id + '" aria-pressed="' + (b.id === binding.id) + '">' + b.name + '</button>';
    }).join("");

    // page list
    $("#pageList").innerHTML = state.items.map(function (it, i) {
      var r = BY_ID[it.id];
      return '<li><span class="pl-name">' + r.tr + '</span>' +
        '<span class="pl-lang" data-l="' + it.lang + '">' + LANG_LABEL[it.lang] + '</span>' +
        '<span class="pl-tools">' +
          '<button class="icon-btn" type="button" data-move="-1" data-i="' + i + '" aria-label="' + r.tr + ' yukarı taşı"' + (i === 0 ? " disabled" : "") + '>↑</button>' +
          '<button class="icon-btn" type="button" data-move="1" data-i="' + i + '" aria-label="' + r.tr + ' aşağı taşı"' + (i === n - 1 ? " disabled" : "") + '>↓</button>' +
          '<button class="icon-btn" type="button" data-remove="' + i + '" aria-label="' + r.tr + ' çıkar">×</button>' +
        '</span></li>';
    }).join("");
    $("#emptyList").hidden = n > 0;

    // progress + totals
    $("#progressBar").style.width = Math.min(100, n / MIN_PAGES * 100) + "%";
    $("#minHint").textContent = n === 0 ? "En az " + MIN_PAGES + " sayfa ile defter olur."
      : n < MIN_PAGES ? (MIN_PAGES - n) + " sayfa daha, defterin olur!"
      : n >= MAX_PAGES ? "Tam dolu: " + MAX_PAGES + " sayfa."
      : "Basıma hazır ✎";
    var pagesCost = n * PER_PAGE, total = binding.price + pagesCost;
    $("#sumBinding").textContent = tl(binding.price);
    $("#sumPages").textContent = n + " × " + tl(PER_PAGE);
    $("#sumTotal").textContent = tl(total);
    $("#pageTally").textContent = n + " sayfa";
    $("#orderBtn").disabled = n < MIN_PAGES;
    $("#mobileTotal").textContent = tl(total);
    document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = n; });
  }

  /* ------------------------------------------------------------------
     Book actions
  ------------------------------------------------------------------ */
  function toggle(id) {
    var i = indexOf(id);
    if (i > -1) state.items.splice(i, 1);
    else if (state.items.length < MAX_PAGES) state.items.push({ id: id, lang: cardLang[id] });
    $("#orderMsg").textContent = "";
    save(); renderBook();
  }
  function setLang(id, lang) {
    if (BY_ID[id].langs.indexOf(lang) < 0) return;
    cardLang[id] = lang;
    var i = indexOf(id);
    if (i > -1) { state.items[i].lang = lang; save(); renderBook(); }
  }

  catalog.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    var id = card.dataset.id;
    var langBtn = e.target.closest("[data-lang]");
    if (langBtn && !langBtn.disabled) { setLang(id, langBtn.dataset.lang); refreshCard(id, '[data-lang="' + langBtn.dataset.lang + '"]'); return; }
    if (e.target.closest("[data-add]")) { toggle(id); refreshCard(id, "[data-add]"); return; }
    if (e.target.closest("[data-open]")) openSpread(id);
  });

  $("#filters").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]");
    if (!b) return;
    filter = b.dataset.f;
    renderFilters(); renderCatalog();
    var again = $('#filters [data-f="' + filter + '"]'); if (again) again.focus();
  });

  $("#nameInput").addEventListener("input", function (e) {
    state.name = e.target.value; save();
    $("#coverName").textContent = state.name.trim() || "Benim Mutfağım";
  });
  $("#coverSwatches").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cover]"); if (!b) return;
    state.cover = b.dataset.cover; save(); renderBook();
    $('#coverSwatches [data-cover="' + state.cover + '"]').focus();
  });
  $("#bindingSeg").addEventListener("click", function (e) {
    var b = e.target.closest("[data-binding]"); if (!b) return;
    state.binding = b.dataset.binding; save(); renderBook();
    $('#bindingSeg [data-binding="' + state.binding + '"]').focus();
  });
  $("#pageList").addEventListener("click", function (e) {
    var mv = e.target.closest("[data-move]"), rm = e.target.closest("[data-remove]");
    if (mv && !mv.disabled) {
      var i = +mv.dataset.i, j = i + (+mv.dataset.move);
      var t = state.items[i]; state.items[i] = state.items[j]; state.items[j] = t;
      save(); renderBook();
      var again = $('#pageList [data-move="' + mv.dataset.move + '"][data-i="' + j + '"]');
      if (again && !again.disabled) again.focus();
    } else if (rm) {
      var gone = state.items.splice(+rm.dataset.remove, 1)[0];
      save(); renderBook(); refreshCard(gone.id);
    }
  });
  $("#orderBtn").addEventListener("click", function () {
    $("#orderMsg").textContent = "Seçimin bu tarayıcıda kaydedildi. Ödeme adımı yakında burada olacak; şimdilik siparişini Instagram'dan mesajla iletebilirsin.";
  });

  /* ------------------------------------------------------------------
     Two-page spread preview
  ------------------------------------------------------------------ */
  var dlg = $("#spread"), spreadId = null;

  function lines(n) { var s = ""; for (var i = 0; i < n; i++) s += "<i></i>"; return '<div class="write-lines">' + s + "</div>"; }

  function spreadHTML(r, lang) {
    var en = lang === "en";
    var left, right;
    if (r.id === "aile") {
      left = '<div class="page page-left"><div class="page-no"><span>No. ' + r.no + '</span><span>' + CATS[r.cat] + '</span></div>' +
        '<div class="page-art"><div class="photo-slot">bir fotoğraf yapıştır<br>ya da çiz</div></div>' +
        '<div class="page-title" id="spreadTitle">Aile Tarifi<small>kimden: ……………</small></div></div>';
      right = '<div class="page page-right"><div class="recipe-body"><p class="hand-h">Malzemeler</p>' + lines(5) +
        '<p class="hand-h">Yapılışı</p>' + lines(6) + '</div><p class="write-prompt">bu sayfa tamamen senin ✎</p></div>';
      return left + right;
    }
    var title = en ? r.en : r.tr;
    var sub = en ? r.tr : r.en;
    left = '<div class="page page-left"><div class="page-no"><span>No. ' + r.no + '</span><span>' + CATS[r.cat] + '</span></div>' +
      '<div class="page-art">' + art(r.motif) + '</div>' +
      '<div><div class="page-title" id="spreadTitle">' + (lang === "blank" ? r.tr : title) + '<small lang="' + (en ? "tr" : "en") + '">' + (lang === "blank" ? r.en : sub) + '</small></div></div></div>';

    if (lang === "blank") {
      right = '<div class="page page-right"><div class="recipe-body">' +
        '<p class="hand-h">Malzemeler · Ingredients</p>' + lines(5) +
        '<p class="hand-h">Yapılışı · Method</p>' + lines(6) + '</div>' +
        '<p class="write-prompt">kendi tarifini buraya yaz ✎</p></div>';
    } else {
      var ing = en ? r.ingEN : r.ingTR, st = en ? r.stEN : r.stTR, i = en ? 1 : 0;
      right = '<div class="page page-right"><div class="recipe-body">' +
        '<div class="meta-row"><span>' + r.serves[i] + '</span><span>' + r.time[i] + '</span></div>' +
        '<div><p class="hand-h">' + (en ? "Ingredients" : "Malzemeler") + '</p><ul class="hand-list">' + ing.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></div>' +
        '<div><p class="hand-h">' + (en ? "Method" : "Yapılışı") + '</p><ol class="hand-list">' + st.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ol></div>' +
        '</div><p class="measure-note">' + (en ? "1 cup = 1 Turkish su bardağı ≈ 200 ml · tbsp ≈ 15 ml" : "1 su bardağı ≈ 200 ml · 1 yemek kaşığı ≈ 15 ml") + '</p></div>';
    }
    return left + right;
  }

  function renderSpread() {
    var r = BY_ID[spreadId], lang = cardLang[spreadId];
    $("#spreadLang").innerHTML = segButtons(r, lang);
    $("#spreadBody").innerHTML = spreadHTML(r, lang);
    var inBook = indexOf(spreadId) > -1;
    var add = $("#spreadAdd");
    add.textContent = inBook ? "Defterden çıkar" : "Deftere ekle (" + LANG_LABEL[lang] + ")";
  }
  function openSpread(id) {
    spreadId = id; renderSpread();
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  $("#spreadLang").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]"); if (!b || b.disabled) return;
    setLang(spreadId, b.dataset.lang); renderSpread(); refreshCard(spreadId);
    $('#spreadLang [data-lang="' + b.dataset.lang + '"]').focus();
  });
  $("#spreadAdd").addEventListener("click", function () { toggle(spreadId); renderSpread(); refreshCard(spreadId); });
  $("#closeSpread").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* ------------------------------------------------------------------
     Hero fan + studio grid
  ------------------------------------------------------------------ */
  $("#heroFan").innerHTML = pageThumb(BY_ID.sutlac, "en") + pageThumb(BY_ID.menemen, "tr") + pageThumb(BY_ID.mercimek, "blank");

  var posts = [["enginar", "sketch", "kalem"], ["enginar", "flat", "boya"], ["enginar", "", "son hali"],
               ["limonata", "sketch", "kalem"], ["pogaca", "flat", "boya"], ["karniyarik", "", "son hali"]];
  $("#studioGrid").innerHTML = posts.map(function (p) {
    return '<div class="post ' + p[1] + '">' + art(BY_ID[p[0]].motif) + '<span class="post-tag">' + p[2] + '</span></div>';
  }).join("");

  /* ------------------------------------------------------------------
     Scroll scenes. Each [data-scene] section is taller than the screen;
     its progress p runs 0 → 1 while its sticky child is pinned.
  ------------------------------------------------------------------ */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(p, a, b) { return clamp01((p - a) / (b - a)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // 1 · hero: cover swings open, the three pages fan out
  var heroScene = $('[data-scene="hero"]');
  var bookStage = $(".book-stage");
  var fanPages = [].slice.call(document.querySelectorAll("#heroFan .page"));
  var STACK = [[-5, 6, -2.5], [0, 0, 1], [5, -4, 3]];   // x px, y px, rotation
  var FAN = [[-1, 16, -10], [0, -12, 1.5], [1, 12, 9]]; // x in stage units
  function sceneHero(p) {
    var open = ease(seg(p, .04, .42)), fan = ease(seg(p, .34, .85));
    heroScene.style.setProperty("--open", open.toFixed(4));
    heroScene.style.setProperty("--fan", fan.toFixed(4));
    var unit = bookStage.clientWidth * .24;
    fanPages.forEach(function (el, i) {
      var s = STACK[i], f = FAN[i];
      var x = s[0] + (f[0] * unit - s[0]) * fan, y = s[1] + (f[1] - s[1]) * fan, r = s[2] + (f[2] - s[2]) * fan;
      el.style.transform = "translate(-50%, -50%) translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px) rotate(" + r.toFixed(2) + "deg)";
    });
  }

  // 2 · statement: words ink in one by one
  var sayEl = $("#say"), sayWords = [];
  (function splitWords() {
    var frag = document.createDocumentFragment();
    [].slice.call(sayEl.childNodes).forEach(function (node) {
      var hand = node.nodeType === 1;
      var target = hand ? document.createElement("em") : frag;
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span");
        w.className = "w"; w.textContent = part;
        target.appendChild(w); sayWords.push(w);
      });
      if (hand) frag.appendChild(target);
    });
    sayEl.textContent = "";
    sayEl.appendChild(frag);
  })();
  function sceneSay(p) {
    var lit = Math.floor(seg(p, .08, .8) * (sayWords.length + 1));
    sayWords.forEach(function (w, i) { w.classList.toggle("on", i < lit); });
  }

  // 3 · build: pen lines draw, paint glazes in, handwriting appears
  var buildPage = $("#buildPage");
  buildPage.innerHTML =
    '<div class="page-no"><span>No. 03</span><span>Çorba</span></div>' +
    '<div class="page-art">' + art("bowl") + '</div>' +
    '<div><div class="page-title build-title">Mercimek Çorbası</div>' +
    '<ul class="hand-list build-list"><li>1 su bardağı kırmızı mercimek</li><li>1 kuru soğan, 1 havuç</li><li>1 yemek kaşığı salça</li><li>1 çay kaşığı kimyon</li></ul></div>';
  var penLines = [].slice.call(buildPage.querySelectorAll(".pen > *:not(.dot)"));
  var penDots = [].slice.call(buildPage.querySelectorAll(".pen > .dot"));
  var paints = [].slice.call(buildPage.querySelectorAll(".wash, .paper"));
  var buildTitle = buildPage.querySelector(".build-title");
  var buildItems = [].slice.call(buildPage.querySelectorAll(".build-list li"));
  var buildSteps = [].slice.call(document.querySelectorAll("#buildSteps li"));
  penLines.forEach(function (el) { el.setAttribute("pathLength", "1"); el.style.strokeDasharray = "1 1"; });
  function sceneBuild(p) {
    var a = seg(p, .04, .34), b = seg(p, .36, .66), c = seg(p, .68, .94);
    penLines.forEach(function (el) { el.style.strokeDashoffset = (1 - a).toFixed(4); });
    penDots.forEach(function (el) { el.style.opacity = a > .9 ? 1 : 0; });
    paints.forEach(function (el, k) {
      var t = ease(seg(b, k / paints.length * .6, k / paints.length * .6 + .4));
      var full = el.classList.contains("paper") ? 1 : el.classList.contains("lt") ? .45 : .85;
      el.style.opacity = (t * full).toFixed(3);
      el.style.transform = "scale(" + (.94 + .06 * t).toFixed(4) + ")";
    });
    buildTitle.style.clipPath = "inset(-20% " + ((1 - seg(c, 0, .45)) * 100).toFixed(1) + "% -20% 0)";
    buildItems.forEach(function (li, i) {
      var t = seg(c, .4 + i * .12, .55 + i * .12);
      li.style.opacity = t.toFixed(3);
      li.style.transform = "translateY(" + ((1 - t) * 8).toFixed(1) + "px)";
    });
    var active = p < .35 ? 0 : p < .67 ? 1 : 2;
    buildSteps.forEach(function (li, i) {
      li.classList.toggle("on", i === active);
      li.style.setProperty("--sp", [a, b, c][i].toFixed(3));
    });
  }

  // 4 · language: the same page as TR, EN, then blank
  var LANG_DESC = [
    "Tarif Türkçe, el yazısıyla. Malzemeler ev ölçüleriyle: su bardağı, yemek kaşığı.",
    "Aynı sayfa İngilizce. Yurt dışındaki bir arkadaşa hediye için; ölçü notu da eklenir: 1 cup ≈ 200 ml.",
    "Çizim kalır, tarif alanı senin. Annenin tarifini kendi el yazınla yaz."
  ];
  var rv = BY_ID.revani;
  function langList(items) { return '<ul class="hand-list">' + items.slice(0, 4).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  $("#langPage").innerHTML =
    '<div class="page-no"><span>No. ' + rv.no + '</span><span class="page-badge" id="langBadge">TR</span></div>' +
    '<div class="page-art">' + art(rv.motif) + '</div>' +
    '<div class="lang-body">' +
      '<div class="lang-state"><div class="page-title">' + rv.tr + '</div>' + langList(rv.ingTR) + '</div>' +
      '<div class="lang-state"><div class="page-title" lang="en">' + rv.en + '</div>' + langList(rv.ingEN) + '</div>' +
      '<div class="lang-state"><div class="page-title">' + rv.tr + '</div>' + lines(4) + '<p class="write-prompt">kendi tarifini yaz ✎</p></div>' +
    '</div>';
  var langStates = [].slice.call(document.querySelectorAll("#langPage .lang-state"));
  var langDots = [].slice.call(document.querySelectorAll("#langDots span"));
  var langNow = -1;
  function sceneLang(p) {
    var idx = p < .36 ? 0 : p < .7 ? 1 : 2;
    if (idx === langNow) return;
    langNow = idx;
    langStates.forEach(function (el, i) { el.classList.toggle("on", i === idx); });
    langDots.forEach(function (el, i) { el.classList.toggle("on", i === idx); });
    $("#langBadge").textContent = LANG_LABEL[["tr", "en", "blank"][idx]];
    $("#langDesc").textContent = LANG_DESC[idx];
  }

  // 5 · gallery: vertical scroll moves the row of pages sideways
  var galleryScene = $('[data-scene="gallery"]'), track = $("#galleryTrack"), galleryDist = 0;
  track.innerHTML = RECIPES.map(function (r) {
    return '<button class="g-card" type="button" data-gopen="' + r.id + '" aria-label="' + r.tr + ' sayfasını büyüt">' +
      pageThumb(r, r.langs[0]) + '<span class="g-name">' + r.tr + '</span><span class="mono">' + CATS[r.cat] + '</span></button>';
  }).join("");
  track.addEventListener("click", function (e) {
    var b = e.target.closest("[data-gopen]"); if (b) openSpread(b.dataset.gopen);
  });
  function sizeGallery() {
    galleryDist = Math.max(0, track.scrollWidth - track.clientWidth);
    if (!isStatic) galleryScene.style.height = (window.innerHeight + galleryDist * 1.1) + "px";
  }
  function sceneGallery(p) {
    track.style.transform = "translateX(" + (-p * galleryDist).toFixed(1) + "px)";
  }

  // engine
  var isStatic = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var SCENES = [
    { el: heroScene, fn: sceneHero },
    { el: $('[data-scene="say"]'), fn: sceneSay },
    { el: $('[data-scene="build"]'), fn: sceneBuild },
    { el: $('[data-scene="lang"]'), fn: sceneLang },
    { el: galleryScene, fn: sceneGallery }
  ];
  var ticking = false;
  function tick() {
    ticking = false;
    var vh = window.innerHeight;
    SCENES.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var total = s.el.offsetHeight - vh;
      s.fn(total > 0 ? clamp01(-r.top / total) : 1);
    });
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }

  if (isStatic) {
    document.documentElement.classList.add("static");
    SCENES.forEach(function (s) { s.fn(s.fn === sceneLang ? 0 : 1); });
  } else {
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", function () { sizeGallery(); requestTick(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizeGallery(); requestTick(); });
    sizeGallery();
    tick();
  }

  renderFilters(); renderCatalog(); renderBook();
})();
