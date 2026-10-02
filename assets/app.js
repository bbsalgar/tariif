(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Risograph placeholder art. Each motif is printed in three inks:
     yellow, blue, then an off-register pink plate, with ink linework
     on top. Swap these for the real Procreate exports later
     (see README: "Kendi çizimlerini eklemek").
  ------------------------------------------------------------------ */
  function petals(n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<ellipse class="b" cx="60" cy="38" rx="10" ry="24" transform="rotate(' + (i * 360 / n) + ' 60 62)" opacity=".75"/>';
    }
    return out;
  }
  function dots(cls, pts, r) {
    return pts.map(function (p) { return '<circle class="' + cls + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"/>'; }).join("");
  }
  function grid(cls, x0, y0, cols, rows, step, r) {
    var pts = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) pts.push([x0 + x * step + (y % 2) * step / 2, y0 + y * step * 0.85]);
    return dots(cls, pts, r);
  }

  var ART = {
    pan:
      '<circle class="b" cx="54" cy="64" r="38"/><rect class="b" x="86" y="58" width="32" height="11" rx="5.5"/>' +
      '<g class="plate-p">' + dots("p", [[38, 50], [68, 46], [72, 80], [40, 82], [56, 88]], 6.5) + '</g>' +
      '<ellipse class="w" cx="48" cy="64" rx="14" ry="12"/><ellipse class="w" cx="68" cy="62" rx="12" ry="11"/>' +
      '<circle class="y" cx="48" cy="64" r="7.5"/><circle class="y" cx="68" cy="62" r="6.5"/>' +
      '<path class="ln" d="M30 66l2 3M78 50l2-3M60 80l3 1M36 46l3-1"/>',
    bowl:
      '<circle class="y" cx="80" cy="34" r="22"/>' +
      '<path class="b" d="M14 62h92c0 26-20 42-46 42S14 88 14 62z"/>' +
      '<g class="plate-p"><ellipse class="p" cx="60" cy="62" rx="46" ry="9"/></g>' +
      '<circle class="y" cx="86" cy="60" r="7"/>' +
      '<path class="ln" d="M44 48c-6-6 6-10 0-18M60 44c-6-6 6-10 0-18M76 48c-6-6 6-10 0-16M46 61l2 2M58 63l2-1M70 60l1 2"/>',
    eggplant:
      '<ellipse class="b" cx="58" cy="70" rx="46" ry="22" transform="rotate(-8 58 70)"/>' +
      '<g class="plate-p"><ellipse class="p" cx="58" cy="70" rx="46" ry="22" transform="rotate(-8 58 70)"/></g>' +
      '<ellipse class="y" cx="56" cy="62" rx="32" ry="8" transform="rotate(-8 56 62)"/>' +
      dots("p", [[46, 62], [60, 59], [72, 58]], 3.4) +
      '<path class="ln" d="M100 56c6-4 10-10 10-18M95 51l9 10"/>',
    dumplings:
      '<circle class="ln" cx="60" cy="62" r="46"/>' +
      '<ellipse class="w" cx="60" cy="62" rx="36" ry="30"/>' +
      grid("y", 36, 44, 5, 5, 11, 4.6) +
      '<g class="plate-p"><path class="pl" d="M30 54c8 6 14-6 22 0s14-6 22 0 14-6 20 0M32 76c8 6 14-6 22 0s14-6 22 0 12-6 18 0"/></g>' +
      dots("b", [[40, 40], [80, 42], [92, 70], [30, 70], [62, 92]], 1.8),
    artichoke:
      '<circle class="y" cx="60" cy="62" r="42"/>' + petals(8) +
      '<g class="plate-p"><circle class="p" cx="60" cy="62" r="14"/></g>' +
      '<path class="ln" d="M18 100l10-10M24 104l6-12M100 18l-8 12M106 26l-12 6"/>',
    bread:
      '<g class="plate-p"><ellipse class="p" cx="60" cy="96" rx="50" ry="8"/></g>' +
      '<ellipse class="y" cx="34" cy="78" rx="21" ry="16"/><ellipse class="y" cx="86" cy="78" rx="21" ry="16"/><ellipse class="y" cx="60" cy="56" rx="23" ry="18"/>' +
      dots("b", [[28, 70], [36, 66], [42, 72], [80, 70], [88, 66], [94, 72], [52, 48], [60, 44], [68, 49], [58, 52]], 1.6) +
      '<path class="ln" d="M20 82c8 4 18 4 26 0M72 82c8 4 18 4 26 0M44 62c8 4 24 4 32 0"/>',
    slice:
      '<ellipse class="b" cx="60" cy="94" rx="52" ry="9"/>' +
      '<rect class="y" x="22" y="50" width="76" height="40" rx="3"/>' +
      '<g class="plate-p"><rect class="p" x="22" y="44" width="76" height="10" rx="3"/>' +
      '<path class="p" d="M30 52v9a3 3 0 0 0 6 0v-9zM58 52v13a3 3 0 0 0 6 0V52zM82 52v7a3 3 0 0 0 6 0v-7z"/></g>' +
      '<path class="ln" d="M34 46l2 1M50 45l1 2M70 46l2-1M88 45l1 2M22 70h76"/>',
    ramekin:
      '<path class="b" d="M22 58h76l-7 36a6 6 0 0 1-6 5H35a6 6 0 0 1-6-5z"/>' +
      '<ellipse class="y" cx="60" cy="58" rx="38" ry="10"/>' +
      '<g class="plate-p"><ellipse class="p" cx="50" cy="57" rx="10" ry="4"/><ellipse class="p" cx="72" cy="60" rx="8" ry="3"/><ellipse class="p" cx="62" cy="54" rx="5" ry="2"/></g>' +
      '<path class="ln" d="M30 76h60M32 86h56M40 58l1 1M80 56l1 1M58 62l1 1"/>',
    glass:
      '<circle class="y" cx="86" cy="32" r="17"/><circle class="w" cx="86" cy="32" r="12"/><circle class="y" cx="86" cy="32" r="10" opacity=".55"/>' +
      '<path class="b" d="M34 30h48l-6 72H40z" opacity=".7"/>' +
      '<rect class="w" x="46" y="54" width="12" height="12" rx="2" transform="rotate(12 52 60)" opacity=".7"/><rect class="w" x="60" y="70" width="11" height="11" rx="2" transform="rotate(-10 65 75)" opacity=".7"/>' +
      '<g class="plate-p"><rect class="p" x="62" y="10" width="5" height="54" rx="2.5" transform="rotate(14 64 37)"/></g>' +
      '<path class="ln" d="M86 21v22M75 32h22M36 46h44"/>',
    frame:
      '<rect class="y" x="16" y="24" width="88" height="72" rx="2" transform="rotate(-4 60 60)"/>' +
      '<rect class="w" x="23" y="30" width="74" height="52" transform="rotate(-4 60 60)"/>' +
      '<g class="plate-p"><rect class="p" x="44" y="14" width="32" height="12" transform="rotate(6 60 20)" opacity=".85"/></g>' +
      '<path class="ln" d="M60 66c-10-8-14-14-8-18 4-3 8 0 8 3 0-3 4-6 8-3 6 4 2 10-8 18z"/>'
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
    { id: "mavi", name: "Fırın mavisi", color: "var(--riso-blue)" },
    { id: "pembe", name: "Nar pembesi", color: "var(--riso-pink)" },
    { id: "hardal", name: "Hardal", color: "#C98B12" },
    { id: "murekkep", name: "Mürekkep", color: "var(--ink)" }
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
  function tl(n) { return "₺" + n.toLocaleString("tr-TR"); }

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

  var posts = [["enginar", "sketch", "eskiz"], ["enginar", "flat", "renk"], ["enginar", "", "son hali"],
               ["limonata", "sketch", "eskiz"], ["pogaca", "flat", "renk"], ["karniyarik", "", "son hali"]];
  $("#studioGrid").innerHTML = posts.map(function (p) {
    return '<div class="post ' + p[1] + '">' + art(BY_ID[p[0]].motif) + '<span class="post-tag">' + p[2] + '</span></div>';
  }).join("");

  renderFilters(); renderCatalog(); renderBook();
})();
