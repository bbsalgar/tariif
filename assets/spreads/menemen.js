/* Hand-drawn recipe pages in SVG, made to read like a keepsake notebook filled in with colored pencil:
   cream ruled paper, pencil strokes broken up by paper tooth (#cpF), a wobbly fine liner (#cpPen)
   and handwriting on the lines. A spread is viewBox 1400 × 1000 (two 5:7 pages); a single page is 700 × 1000.

   TariifSpreads.install()                  adds the shared filters, gradients and styles once per document
   TariifSpreads.render(id, lang, view)      lang: "tr" | "en" | "blank"; view: "both" | "left" | "right"
   TariifSpreads.renderPaint(id)             the painting alone, drawn live (exports/bake-spread.js bakes it)
   TariifSpreads.has(id)                     true when a painted spread exists for that recipe
   TariifSpreads.base                        path prefix for the baked image ("" from the site root, "../" from recipes/)
   TariifSpreads.live = true                 draw the painting live instead of using the baked image */
(function () {
  "use strict";

  var INK = "#2E2A26", NOTE = "#2B579C";

  /* ---------- drawing helpers ---------- */
  function rng(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function n1(v) { return Math.round(v * 10) / 10; }

  // an organic closed shape: an ellipse whose radius wobbles, smoothed with Catmull-Rom curves
  function blobD(cx, cy, rx, ry, seed, wob, n, rot) {
    var r = rng(seed), pts = [], a0 = (rot || 0) * Math.PI / 180, i;
    n = n || 10; wob = wob == null ? .18 : wob;
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, k = 1 + (r() * 2 - 1) * wob;
      var x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      pts.push([cx + x * Math.cos(a0) - y * Math.sin(a0), cy + x * Math.sin(a0) + y * Math.cos(a0)]);
    }
    var d = "M" + n1(pts[0][0]) + " " + n1(pts[0][1]);
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += "C" + n1(p1[0] + (p2[0] - p0[0]) / 6) + " " + n1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        n1(p2[0] - (p3[0] - p1[0]) / 6) + " " + n1(p2[1] - (p3[1] - p1[1]) / 6) + " " + n1(p2[0]) + " " + n1(p2[1]);
    }
    return d + "Z";
  }
  function blob(cx, cy, rx, ry, seed, wob, n, rot) { return '<path d="' + blobD(cx, cy, rx, ry, seed, wob, n, rot) + '"/>'; }
  function ellD(cx, cy, rx, ry) { return "M" + (cx - rx) + " " + cy + "a" + rx + " " + ry + " 0 1 0 " + 2 * rx + " 0a" + rx + " " + ry + " 0 1 0 " + -2 * rx + " 0Z"; }
  function ring(o, i) { return '<path fill-rule="evenodd" d="' + ellD.apply(null, o) + ellD.apply(null, i) + '"/>'; }
  function pts(n, cx, cy, rx, ry, seed) {
    var r = rng(seed), out = [];
    while (out.length < n) {
      var x = r() * 2 - 1, y = r() * 2 - 1;
      if (x * x + y * y <= 1) out.push([cx + x * rx, cy + y * ry, r()]);
    }
    return out;
  }
  function dots(n, cx, cy, rx, ry, seed, rmin, rmax) {
    return pts(n, cx, cy, rx, ry, seed).map(function (p) {
      return '<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="' + n1(rmin + p[2] * (rmax - rmin)) + '"/>';
    }).join("");
  }
  function leaves(n, cx, cy, rx, ry, seed, size) {
    var r = rng(seed + 9);
    return pts(n, cx, cy, rx, ry, seed).map(function (p, i) {
      return blob(p[0], p[1], size * (.8 + p[2] * .5), size * .5, seed + i * 7, .2, 6, r() * 180);
    }).join("");
  }

  // language layers: shown only for the listed variants
  function only(langs, inner) { return '<g class="' + langs.split(" ").map(function (l) { return "l-" + l; }).join(" ") + '">' + inner + "</g>"; }

  /* ---------- shared defs, installed once per document ---------- */
  var DEFS =
    '<svg class="mm-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    "<style>" +
      ".mm-hand{font-family:Kalam,'Segoe Print','Bradley Hand',cursive;fill:" + INK + "}" +
      ".mm-brush{font-family:'Caveat Brush',Kalam,'Segoe Print',cursive;fill:" + INK + "}" +
      ".mm-small{font-family:Figtree,system-ui,sans-serif;font-weight:600;letter-spacing:.16em;fill:#857B72}" +
      ".mm-note{fill:" + NOTE + "}" +
      ".mm-serif{font-family:'Young Serif',Georgia,serif;font-style:italic;fill:#8A7D72}" +
      ".mm-red{fill:#C8372D}" +
      ".mm-spread[data-lang=tr] .l-tr-hide,.mm-spread[data-lang=tr] .l-en:not(.l-tr),.mm-spread[data-lang=tr] .l-blank:not(.l-tr)," +
      ".mm-spread[data-lang=en] .l-tr:not(.l-en),.mm-spread[data-lang=en] .l-blank:not(.l-en)," +
      ".mm-spread[data-lang=blank] .l-tr:not(.l-blank),.mm-spread[data-lang=blank] .l-en:not(.l-blank){display:none}" +
    "</style>" +
    '<filter id="mmPaper" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="11" result="fine"/>' +
      '<feColorMatrix in="fine" type="matrix" values="0 0 0 0 .45  0 0 0 0 .40  0 0 0 0 .34  0 0 0 .10 0" result="f"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="23" result="tooth"/>' +
      '<feColorMatrix in="tooth" type="matrix" values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .38  0 0 0 .07 -.01" result="t"/>' +
      '<feMerge><feMergeNode in="t"/><feMergeNode in="f"/></feMerge>' +
    "</filter>" +
    '<filter id="cpF" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="s"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="t"/>' +
      '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2 1.8" result="tm"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="21" result="p"/>' +
      '<feColorMatrix in="p" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 .1" result="pm"/>' +
      '<feComposite in="tm" in2="pm" operator="arithmetic" k1="1" result="mask"/>' +
      '<feComposite in="s" in2="mask" operator="in"/>' +
    "</filter>" +
    '<filter id="cpE" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="6" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<filter id="cpPen" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="12" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<filter id="cpWob" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="31" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<pattern id="cpH1" width="4.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="2.3" height="4.2" fill="#fff"/></pattern>' +
    '<pattern id="cpH2" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)"><rect width="1.7" height="3.6" fill="#fff"/></pattern>' +
    '<mask id="cpM1" maskUnits="userSpaceOnUse" x="0" y="0" width="1400" height="1000"><rect width="1400" height="1000" fill="url(#cpH1)" filter="url(#cpWob)"/></mask>' +
    '<mask id="cpM2" maskUnits="userSpaceOnUse" x="0" y="0" width="1400" height="1000"><rect width="1400" height="1000" fill="url(#cpH2)" filter="url(#cpWob)"/></mask>' +
    '<linearGradient id="cpBind" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A4632" stop-opacity=".22"/><stop offset="1" stop-color="#5A4632" stop-opacity="0"/></linearGradient>' +
    "</svg>";

  function install() {
    if (typeof document === "undefined" || document.querySelector(".mm-defs")) return;
    var holder = document.createElement("div");
    holder.innerHTML = DEFS;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  /* ---------- colored-pencil kit ----------
     A fill is two passes of the same colour: a light even layer, then diagonal strokes (hatch mask),
     both broken up by paper tooth (#cpF). Shading crosses the strokes the other way (#cpM2).
     Outlines are a fine liner that wobbles (#cpPen), sometimes gone over twice. */
  var PEN = "#2B2522", RED = "#C8372D", SHEET = "#F8F1DF";
  function PF(color, inner, o, base) {
    return '<g filter="url(#cpF)" opacity="' + (o == null ? .95 : o) + '" style="mix-blend-mode:multiply">' +
      '<g fill="' + color + '" opacity="' + (base == null ? .6 : base) + '">' + inner + "</g>" +
      '<g fill="' + color + '" mask="url(#cpM1)">' + inner + "</g></g>";
  }
  function PS(color, inner, o) {
    return '<g filter="url(#cpF)" opacity="' + (o == null ? .9 : o) + '" style="mix-blend-mode:multiply"><g fill="' + color + '" mask="url(#cpM2)">' + inner + "</g></g>";
  }
  function PD(color, inner, o) {   // tiny marks: no stroke texture, just pressure and grain
    return '<g filter="url(#cpF)" fill="' + color + '" opacity="' + (o == null ? .9 : o) + '" style="mix-blend-mode:multiply">' + inner + "</g>";
  }
  function PE(inner, o) { return '<g filter="url(#cpE)" fill="' + SHEET + '" opacity="' + (o == null ? 1 : o) + '">' + inner + "</g>"; }
  function OL(inner, w, o, color, dash) {
    return '<g filter="url(#cpPen)" fill="none" stroke="' + (color || PEN) + '" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (o == null ? .92 : o) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + ">" + inner + "</g>";
  }
  function OL2(inner, w, o, color) {   // gone over twice, the second pass a little off
    return OL(inner, w, o, color) + '<g transform="translate(.9 .7)">' + OL(inner, (w || 1.6) * .7, (o == null ? .92 : o) * .45, color) + "</g>";
  }
  function P(d, extra) { return '<path d="' + d + '"' + (extra || "") + "/>"; }
  function at(d, x, y, s, r) { return '<path d="' + d + '" transform="translate(' + x + " " + y + ") rotate(" + (r || 0) + ") scale(" + (s || 1) + ')"/>'; }

  // handwriting: every line sits on the ruled line but leans and drifts a little
  var jit = rng(77);
  function HW(x, y, text, size, opts) {
    opts = opts || {};
    var r = (jit() - .5) * (opts.lean == null ? 1.4 : opts.lean), dx = (jit() - .5) * 3, dy = (jit() - .5) * 1.6;
    return '<text x="' + n1(x + dx) + '" y="' + n1(y + dy) + '" font-size="' + size + '" class="' + (opts.cls || "mm-hand") + '"' +
      (opts.weight ? ' font-weight="' + opts.weight + '"' : "") +
      (opts.anchor ? ' text-anchor="' + opts.anchor + '"' : "") +
      (opts.ls ? ' letter-spacing="' + opts.ls + '"' : "") +
      ' transform="rotate(' + n1(r) + " " + x + " " + y + ')">' + text + "</text>";
  }

  var LINE0 = 92, GAP = 30;            // ruled lines: y = 92 + 30k
  function ly(k) { return LINE0 + GAP * k; }

  var LEAF = "M0 0C-4 -6 -12 -8 -16 -3C-21 -9 -17 -19 -9 -18C-11 -27 -1 -31 4 -24C10 -30 20 -24 16 -16C24 -14 23 -4 15 -3C11 -9 5 -7 0 0Z";
  var VEIN = "M0 0L-9 -10M0 0L2 -20M0 0L11 -11";
  var BASIL = "M0 0C-8 -6 -9 -18 0 -26C9 -18 8 -6 0 0Z";

  /* ---------- No. 01 Menemen, one page in the style of a hand-drawn keepsake recipe notebook ---------- */
  function menemenPage() {
    var s = "", o = "";

    // cream ruled notebook page, bound on the left
    s += '<rect width="700" height="1000" fill="' + SHEET + '"/>';
    s += '<rect width="700" height="1000" filter="url(#mmPaper)"/>';
    var ruled = "";
    for (var k = 0; k <= 29; k++) ruled += "M34 " + ly(k) + "H666";
    s += '<path d="' + ruled + '" stroke="#AFBBC8" stroke-opacity=".55" stroke-width="1"/>';
    s += '<rect width="44" height="1000" fill="url(#cpBind)"/>';

    /* --- parsley sprig, top left --- */
    s += '<g transform="translate(-10 10)">';
    var sprig = [[46, 112, 1.2, -40], [138, 94, 1.15, 35], [104, 62, 1.2, 0], [64, 152, .9, -70], [124, 128, .9, 60], [84, 96, .95, -15]];
    var sprigLeaves = sprig.map(function (l) { return at(LEAF, l[0], l[1], l[2], l[3]); }).join("");
    s += PF("#86B653", sprigLeaves, .95, .5);
    s += PS("#4F7F32", sprig.map(function (l) { return at(LEAF, l[0] + 2, l[1] + 1, l[2] * .55, l[3]); }).join(""), .8);
    s += OL('<path d="M72 198C76 172 88 144 104 66M80 162C66 150 54 134 46 112M92 130C110 124 126 112 138 94M98 100C94 98 90 97 84 96"/>', 1.5, .85);
    s += PF("#9CC46A", '<path d="M70 198C74 172 86 144 102 66l4 0C90 144 78 172 74 198z"/>', .8, .6);
    s += OL2(sprigLeaves, 1.3, .85);
    s += OL(sprig.map(function (l) { return at(VEIN, l[0], l[1], l[2], l[3]); }).join(""), .9, .55);
    s += "</g>";

    /* --- the title sign, hanging from a nail --- */
    var board = "M182 100C240 96 380 96 438 100C442 125 444 155 440 182C380 186 240 186 180 182C176 155 178 125 182 100Z";
    s += OL('<path d="M310 66L196 102M310 66L424 102"/>', 1.2, .8);
    s += PD(PEN, '<circle cx="310" cy="64" r="3.6"/>', .9);
    s += PF("#F2D98A", P(board), .95, .55);
    s += PS("#D49E45", P("M184 160C240 168 380 168 438 160L440 182C380 186 240 186 180 182Z"), .75);
    s += OL('<path d="M194 110C250 107 372 107 428 110C431 132 431 152 429 172C372 175 250 175 192 172C190 152 190 132 194 110Z"/>', 1.1, .75, RED, "5 5");
    s += OL2(P(board), 1.8, .9);
    // cherry tomatoes and basil on the corners
    var cherries = '<circle cx="182" cy="98" r="11"/><circle cx="200" cy="90" r="10"/><circle cx="440" cy="96" r="11"/>';
    var basil = at(BASIL, 168, 104, 1, -60) + at(BASIL, 214, 92, .9, 55) + at(BASIL, 456, 104, .95, 50) + at(BASIL, 424, 92, .8, -40);
    s += PF("#6EA349", basil, .95, .5);
    s += PF("#E2483A", cherries, .95, .55);
    s += PS("#A62920", '<circle cx="186" cy="102" r="7"/><circle cx="204" cy="94" r="6"/><circle cx="444" cy="100" r="7"/>', .8);
    s += PE('<circle cx="178" cy="94" r="2.6"/><circle cx="197" cy="86" r="2.3"/><circle cx="436" cy="92" r="2.6"/>', .95);
    s += OL(cherries + basil + at("M0 0L0 -20", 168, 104, 1, -60) + at("M0 0L0 -20", 456, 104, .95, 50), 1.3, .85);

    /* --- çaydanlık and a tea glass, top right --- */
    var lower = "M545 232C530 226 528 192 545 172L640 172C657 192 655 226 640 232Z";
    var lowerSpout = "M546 202C526 197 516 182 509 167L517 164C524 177 533 187 549 192Z";
    var upper = "M566 170C556 152 561 127 576 117L609 117C624 127 629 152 619 170Z";
    var lid = "M573 117C576 101 609 101 612 117Z";
    var upperSpout = "M566 152C551 147 544 134 541 120L548 118C552 130 558 138 569 142Z";
    s += PS("#9C948C", blob(596, 236, 64, 7, 801, .1, 10), .5);
    s += PF("#48A0B2", P(lower) + P(lowerSpout), .95, .5);
    s += PS("#2B6E80", P("M615 176L640 172C657 192 655 226 640 232L612 232Z") + P("M520 168C526 180 534 188 548 192L546 202C530 198 520 186 514 172Z"), .85);
    s += PE(P("M552 184C548 198 548 214 554 226L560 226C556 214 556 198 560 184Z"), .9);
    s += PF("#7CC3D0", P(upper) + P(lid) + P(upperSpout), .95, .5);
    s += PS("#3F8C9E", P("M600 120L609 117C624 127 629 152 619 170L598 170Z"), .8);
    s += PE('<circle cx="566" cy="206" r="6"/><circle cx="592" cy="214" r="6.5"/><circle cx="618" cy="204" r="6"/><circle cx="588" cy="140" r="4.5"/>', .95);
    s += PD("#D8453A", '<circle cx="566" cy="206" r="2.2"/><circle cx="592" cy="214" r="2.4"/><circle cx="618" cy="204" r="2.2"/><circle cx="588" cy="140" r="1.8"/>', .9);
    s += OL2(P(lower) + P(lowerSpout) + P(upper) + P(lid) + P(upperSpout) + '<path d="' + ellD(592.5, 172, 47.5, 6) + '"/>', 1.5, .9);
    s += OL('<path d="M640 182C668 184 672 216 645 223M620 126C640 126 642 156 622 160"/>', 3, .9);
    s += PD(PEN, '<circle cx="592.5" cy="98" r="5"/>', .9);
    s += OL('<circle cx="566" cy="206" r="6"/><circle cx="592" cy="214" r="6.5"/><circle cx="618" cy="204" r="6"/>', .9, .6);
    // ince belli glass on its saucer
    var glass = "M474 166C472 182 482 190 483 198C484 208 476 216 478 226L500 226C502 216 494 208 495 198C496 190 506 182 504 166Z";
    var tea = "M476 176C476 188 484 194 485 200C486 209 479 216 480 223L498 223C499 216 492 209 493 200C494 194 502 188 502 176Z";
    s += PF("#C2502A", P(tea), .95, .6);
    s += PS("#7E2A12", P("M486 200C487 209 481 216 482 223L498 223C499 216 492 209 493 200Z"), .7);
    s += PE(P("M479 180C480 190 486 195 486 200L489 200C489 194 484 189 483 180Z"), .9);
    s += PF("#E7DCC6", '<path d="' + ellD(489, 228, 27, 6) + '"/>', .8, .6);
    s += OL(P(glass) + '<path d="' + ellD(489, 166, 15, 3) + '"/><path d="' + ellD(489, 228, 27, 6) + '"/>', 1.3, .85);
    s += OL('<path d="M484 150c-5-7 5-11 0-18M494 148c-5-7 5-11 0-18"/>', 1.1, .4);

    /* --- the finished menemen in a copper sahan --- */
    var cx = 512, cy = 372;
    s += PS("#9C948C", blob(cx + 14, cy + 22, 152, 104, 811, .05, 14), .5);
    s += PF("#CF7A42", blob(360, 368, 27, 12, 812, .08, 10, -8) + blob(664, 362, 27, 12, 813, .08, 10, 8), .95, .55);
    s += PF("#CF7A42", blob(cx, cy, 140, 100, 814, .03, 16), .95, .65);
    s += PS("#9E4E2C", ring([cx, cy, 140, 100], [cx - 6, cy + 4, 120, 84]), .8);
    s += PE(blob(cx, cy + 8, 120, 84, 815, .03, 16));
    s += PS("#A4552F", ring([cx, cy, 124, 88], [cx, cy + 8, 118, 82]), .7);
    s += PF("#DD4A33", blob(cx, cy + 8, 118, 82, 816, .04, 16), .95, .7);
    s += PS("#B2322A", blob(440, 410, 34, 20, 817, .3, 8) + blob(590, 336, 28, 18, 818, .3, 8) + blob(600, 420, 26, 16, 819, .3, 8) + blob(470, 318, 24, 14, 820, .3, 8), .75);
    s += PF("#F2A35A", blob(cx, 386, 60, 38, 821, .25, 10), .5, .5);
    var peppers = [[420, 360, 22, 7, -30], [532, 324, 24, 7, 15], [606, 392, 22, 6, 70], [444, 438, 20, 6, 20], [560, 440, 22, 6, -15], [520, 384, 17, 5, 40]];
    s += PF("#7DB04A", peppers.map(function (p, i) { return blob(p[0], p[1], p[2], p[3], 830 + i, .12, 8, p[4]); }).join(""), .95, .55);
    s += PS("#3F6E2A", peppers.map(function (p, i) { return blob(p[0] + 2, p[1] + 2, p[2] * .7, p[3] * .45, 840 + i, .2, 7, p[4]); }).join(""), .7);
    var eggs = [[474, 356, 40, 31, 851], [562, 380, 38, 29, 852], [500, 412, 34, 26, 853]];
    var whites = eggs.map(function (e) { return blob(e[0], e[1], e[2], e[3], e[4], .16, 11); }).join("");
    s += PE(whites);
    s += PS("#AEB6C2", eggs.map(function (e) { return blob(e[0] + 9, e[1] + 8, e[2] * .65, e[3] * .5, e[4] + 10, .2, 9); }).join(""), .55);
    s += PF("#F6B829", eggs.map(function (e) { return '<circle cx="' + (e[0] + 3) + '" cy="' + (e[1] - 2) + '" r="15"/>'; }).join(""), .95, .6);
    s += PS("#DD7E19", eggs.map(function (e) { return blob(e[0] + 8, e[1] + 3, 10, 7, e[4] + 20, .2, 8, 20); }).join(""), .75);
    s += PE(eggs.map(function (e) { return blob(e[0] - 3, e[1] - 8, 4, 2.6, e[4] + 30, .2, 6, -25); }).join(""), .95);
    s += PD("#4F8A35", leaves(14, cx, 380, 104, 70, 861, 4.5), .9);
    s += PD("#8E1E12", dots(32, cx, 382, 106, 72, 862, 1.1, 2.2), .85);
    s += OL2('<path d="' + ellD(cx + 2, cy - 3, 140, 100) + '"/><path d="' + blobD(358, 366, 27, 12, 812, .06, 10, -8) + '"/><path d="' + blobD(666, 360, 27, 12, 813, .06, 10, 8) + '"/>', 1.7, .9);
    s += OL('<path d="' + ellD(cx + 1, cy + 6, 121, 85) + '"/><circle cx="380" cy="364" r="2.4"/><circle cx="385" cy="376" r="2.4"/><circle cx="644" cy="358" r="2.4"/><circle cx="639" cy="370" r="2.4"/>', 1.3, .8);
    s += OL(eggs.map(function (e) { return '<path d="' + blobD(e[0] + 1, e[1] - 1, e[2], e[3], e[4], .16, 11) + '"/>'; }).join(""), 1.3, .75, null, "50 10 26 8");
    s += OL(eggs.map(function (e) { return '<circle cx="' + (e[0] + 4) + '" cy="' + (e[1] - 3) + '" r="15"/>'; }).join(""), 1.1, .7);
    s += OL('<path d="M586 446q6-4 11 0M612 420q6-5 10 1M392 420q6 4 11 1M420 452q6 3 12-1"/>', 1.1, .45);
    // wooden spoon resting in the pan
    var spoonBowl = blob(600, 338, 18, 11, 870, .05, 10, -28), spoon = "M612 330C632 318 660 300 684 286L688 292C664 307 637 325 617 337Z";
    s += PF("#C9944F", spoonBowl + P(spoon), .95, .55);
    s += PS("#93632F", blob(604, 342, 11, 6, 871, .1, 8, -28) + P("M650 314C664 304 676 297 686 290L688 292C676 300 664 308 652 317Z"), .75);
    s += OL2('<path d="' + blobD(600, 338, 18, 11, 870, .05, 10, -28) + '"/>' + P(spoon), 1.3, .85);
    // a slice of bread leaning on the pan
    var crust = "M-95 55C-105 -10 -70 -70 0 -72C70 -74 108 -15 98 55Z", crumb = "M-82 46C-90 -6 -60 -58 0 -60C60 -61 92 -10 85 46Z";
    s += '<g transform="translate(398 470) rotate(-12) scale(.7)">' +
      PF("#B9773A", P(crust), .95, .55) + PE(P(crumb)) + PF("#F0DCAE", P(crumb), .85, .6) +
      PD("#C9A46C", pts(14, 0, -6, 60, 36, 872).map(function (q, i) { return blob(q[0], q[1], 3 + q[2] * 5, 2 + q[2] * 3, 880 + i, .3, 6, q[2] * 90); }).join(""), .7) +
      OL2(P(crust), 2, .9) + OL(P(crumb), 1.4, .55, null, "40 14") + "</g>";

    /* --- red bullets, and the underline under NOT --- */
    var dashes = "";
    for (var i = 6; i <= 12; i++) dashes += "M62 " + (ly(i) - 7) + "l14 -.5";
    [16, 18, 21].forEach(function (k2) { dashes += "M42 " + (ly(k2) - 7) + "l15 -.5"; });
    s += OL('<path d="' + dashes + '"/>', 2.6, .85, RED);
    s += OL('<path d="M60 ' + (ly(23) + 5) + 'C76 ' + (ly(23) + 7) + " 96 " + (ly(23) + 4) + " 116 " + (ly(23) + 6) + '"/>', 1.8, .85, RED);
    s += OL('<path d="M60 ' + (ly(5) + 7) + "C110 " + (ly(5) + 11) + " 160 " + (ly(5) + 4) + " 214 " + (ly(5) + 8) + '"/><path d="M60 ' + (ly(15) + 7) + "C100 " + (ly(15) + 10) + " 140 " + (ly(15) + 4) + " 176 " + (ly(15) + 8) + '"/>', 1.6, .8);

    /* --- bottom row: tomatoes on the vine, eggs in a basket, two peppers --- */
    var toms = '<circle cx="92" cy="918" r="26"/><circle cx="140" cy="926" r="24"/><circle cx="180" cy="912" r="21"/>';
    s += PS("#9C948C", blob(140, 950, 80, 6, 890, .1, 10), .45);
    s += PF("#E2483A", toms, .95, .55);
    s += PS("#A62920", '<circle cx="100" cy="926" r="17"/><circle cx="147" cy="933" r="15"/><circle cx="186" cy="918" r="13"/>', .8);
    s += PE('<circle cx="82" cy="906" r="4.5"/><circle cx="131" cy="915" r="4"/><circle cx="172" cy="902" r="3.6"/>', .95);
    var calyx = function (x, y, seed) {
      var out = "";
      for (var c = 0; c < 5; c++) { var a = c / 5 * Math.PI * 2 - Math.PI / 2; out += blob(x + Math.cos(a) * 7, y + Math.sin(a) * 3.5, 8, 2.6, seed + c, .2, 6, a * 180 / Math.PI); }
      return out;
    };
    var cal = calyx(92, 893, 900) + calyx(140, 903, 910) + calyx(180, 892, 920);
    s += PF("#5E9A3E", cal, .95, .6);
    s += OL2(toms, 1.4, .9);
    s += OL('<path d="M74 880C96 872 124 874 186 878M92 880v12M140 878v24M180 879v12"/>' + cal, 1.2, .8);
    s += PF("#6E9C47", P("M74 879C96 871 124 873 186 877l0 3C124 877 96 875 74 882z"), .9, .6);
    // basket of eggs
    var basket = "M254 902L396 902L384 956L266 956Z", rim = "M250 897C300 889 350 889 400 897L398 908C350 900 300 900 252 908Z";
    var e1 = blob(292, 890, 19, 24, 930, .04, 10, -8), e2 = blob(328, 884, 20, 26, 931, .04, 10, 4), e3 = blob(363, 891, 18, 23, 932, .04, 10, 10);
    s += PS("#9C948C", blob(326, 960, 76, 6, 933, .1, 10), .45);
    s += PF("#F2E0BE", e1 + e3, .9, .6);
    s += PF("#D9A36E", e2, .95, .6);
    s += PS("#B98A5A", blob(298, 896, 9, 14, 934, .2, 8, -8) + blob(336, 892, 9, 15, 935, .2, 8, 4) + blob(369, 897, 8, 13, 936, .2, 8, 10), .5);
    s += PF("#C99A5A", P(basket) + P(rim) + '<path d="M262 902C270 842 380 842 388 902" fill="none" stroke="#C99A5A" stroke-width="7"/>', .95, .55);
    s += PS("#8C6033", P("M262 936L388 936L384 956L266 956Z"), .8);
    s += OL2(P(basket) + P(rim) + e1 + e2 + e3, 1.3, .85);
    s += OL('<path d="M262 902C270 842 380 842 388 902M262 908C270 852 380 852 388 908"/><path d="M262 918H390M264 930H388M266 942H386M290 908L292 956M314 908L314 956M338 908L337 956M362 908L360 956"/>', 1, .6);
    // two sivri biber
    var pa = "M420 900C450 892 500 894 540 910C552 914 560 920 566 928C554 928 544 924 532 920C496 908 456 908 424 912C416 910 414 902 420 900Z";
    var pb = "M430 920C460 916 506 922 540 938C548 942 554 947 557 952C548 952 538 950 528 946C498 934 462 932 434 934C426 932 424 922 430 920Z";
    s += PS("#9C948C", blob(492, 956, 70, 5, 940, .1, 10), .4);
    s += PF("#86B653", P(pa) + P(pb), .95, .55);
    s += PS("#3F6E2A", blob(500, 912, 40, 4, 941, .2, 8, 8) + blob(500, 934, 36, 4, 942, .2, 8, 12), .7);
    s += PE(P("M432 903C460 898 500 900 530 911C500 904 462 902 433 906Z") + P("M442 923C470 920 504 925 528 935C503 928 470 925 443 926Z"), .85);
    s += PF("#4C7A30", P("M420 901c-8 -3-14-2-20 2l2 3c5-3 10-4 17-2z") + P("M430 921c-8-3-14-2-20 2l2 3c5-3 10-4 17-2z"), .95, .6);
    s += OL2(P(pa) + P(pb) + P("M420 901c-8-3-14-2-20 2M430 921c-8-3-14-2-20 2"), 1.3, .85);

    // a jar of pul biber
    var jar = "M602 884C600 900 600 936 604 950C614 954 634 954 644 950C648 936 648 900 646 884Z", cork = "M606 870L642 870L640 886L608 886Z";
    s += PS("#9C948C", blob(626, 956, 34, 5, 950, .1, 10), .45);
    s += PF("#B5301F", P("M603 906C602 922 602 940 605 949C615 953 633 953 643 949C646 940 646 922 645 906Z"), .95, .7);
    s += PD("#7E1A10", dots(18, 624, 928, 18, 20, 951, 1, 2), .85);
    s += PD("#E8B04A", dots(8, 624, 928, 18, 20, 952, .8, 1.4), .8);
    s += PE(P("M607 890C606 906 606 928 608 944L612 944C610 928 610 906 611 890Z"), .85);
    s += PF("#C9944F", P(cork), .95, .6);
    s += OL2(P(jar) + P(cork) + '<path d="M604 896H644"/>', 1.3, .85);

    /* --- Afiyetle stamp --- */
    var bumps = "", n = 12, scx = 622, scy = 818, srx = 58, sry = 30;
    for (var b = 0; b <= n; b++) {
      var a2 = b / n * Math.PI * 2, x2 = scx + Math.cos(a2) * srx, y2 = scy + Math.sin(a2) * sry;
      bumps += b === 0 ? "M" + n1(x2) + " " + n1(y2) : "A13 13 0 0 1 " + n1(x2) + " " + n1(y2);
    }
    s += PF("#F2B3A8", P(bumps + "Z"), .55, .5);
    s += OL2(P(bumps + "Z"), 1.8, .85, RED);

    /* --- footer strip: when you first made it, and how it went --- */
    s += PF("#E6D8BA", '<rect x="34" y="966" width="632" height="26" rx="3"/>', .7, .7);
    var stars = "";
    for (var st = 0; st < 5; st++) {
      var sx = 574 + st * 20, sy = 979, pth = "";
      for (var q = 0; q < 10; q++) { var ang = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? 3 : 7; pth += (q ? "L" : "M") + n1(sx + Math.cos(ang) * rr) + " " + n1(sy + Math.sin(ang) * rr); }
      stars += P(pth + "Z");
    }
    s += OL(stars, 1.1, .7);

    /* ===== text, layered live on top ===== */
    // planner-style header, bilingual on every variant
    o += '<text x="300" y="52" font-size="16" class="mm-serif" text-anchor="end">Kahvaltı • Breakfast</text>';
    o += '<text x="350" y="60" font-size="36" class="mm-serif mm-red" text-anchor="middle">01</text>';
    o += only("tr", '<text x="400" y="52" font-size="16" class="mm-serif">2 kişilik • 20 dakika</text>');
    o += only("en", '<text x="400" y="52" font-size="16" class="mm-serif">serves 2 • 20 minutes</text>');
    o += only("blank", '<text x="400" y="52" font-size="16" class="mm-serif">___ kişilik • ___ dakika</text>');

    o += HW(310, 160, "MENEMEN", 52, { weight: 700, anchor: "middle", ls: 5, lean: .8 });

    o += only("tr blank", HW(60, ly(5), "Malzemeler", 30, { weight: 700 }));
    o += only("en", HW(60, ly(5), "Ingredients", 30, { weight: 700 }));
    var ingTR = ["4 yumurta", "3 olgun domates", "2 sivri biber", "1 soğan (isteğe bağlı)", "2 yemek kaşığı tereyağı", "1 tatlı kaşığı pul biber", "tuz, karabiber"];
    var ingEN = ["4 eggs", "3 ripe tomatoes", "2 green peppers", "1 onion (optional)", "2 tbsp butter", "1 tsp chilli flakes", "salt, black pepper"];
    o += only("tr", ingTR.map(function (t, i2) { return HW(84, ly(6 + i2), t, 22); }).join(""));
    o += only("en", ingEN.map(function (t, i2) { return HW(84, ly(6 + i2), t, 22); }).join(""));

    o += only("tr en", OL('<path d="M566 492C578 486 586 478 590 466M590 466l-8 4M590 466l1 9"/>', 1.4, .8));
    o += only("tr", HW(512, ly(14) - 2, "sıcak sıcak!", 22, { cls: "mm-hand mm-red" }));
    o += only("en", HW(512, ly(14) - 2, "serve it hot!", 22, { cls: "mm-hand mm-red" }));

    o += only("tr blank", HW(60, ly(15), "YAPILIŞI", 28, { weight: 700, ls: 2 }));
    o += only("en", HW(60, ly(15), "METHOD", 28, { weight: 700, ls: 2 }));
    var stepTR = ["Tereyağını sahanda erit, doğradığın biberleri", "ekle ve yumuşayana kadar kavur.",
      "Rendelediğin domatesleri ekle, suyunu çekene", "kadar ara ara karıştırarak pişir. Tuzunu,", "karabiberini ve pul biberini at.",
      "Yumurtaları kır, çok karıştırmadan pişir.", "Sahanı ocaktan alıp hemen sofraya getir!"];
    var stepEN = ["Melt the butter in the pan, add the chopped", "peppers and cook until soft.",
      "Add the grated tomatoes and cook, stirring now", "and then, until the juice is gone. Season with", "salt, black pepper and chilli flakes.",
      "Crack in the eggs and cook without much stirring.", "Bring the pan straight from the stove to the table!"];
    var starts = { 0: 1, 2: 1, 5: 1 };
    o += only("tr", stepTR.map(function (t, i2) { return HW(starts[i2] ? 64 : 42, ly(16 + i2), t, 22); }).join(""));
    o += only("en", stepEN.map(function (t, i2) { return HW(starts[i2] ? 64 : 42, ly(16 + i2), t, 22); }).join(""));

    o += only("tr blank", HW(60, ly(23), "NOT:", 24, { weight: 700, cls: "mm-hand mm-red", lean: .6 }));
    o += only("en", HW(60, ly(23), "NOTE:", 24, { weight: 700, cls: "mm-hand mm-red", lean: .6 }));
    o += only("tr", HW(124, ly(23), "Soğanlı mı soğansız mı?", 22) + HW(42, ly(24), "O karar senin. Ama taze ekmek", 22) + HW(42, ly(25), "olmadan menemen olmaz!", 22));
    o += only("en", HW(130, ly(23), "Onion or no onion?", 22) + HW(42, ly(24), "Your call. But never without", 22) + HW(42, ly(25), "fresh bread for dipping!", 22));

    o += only("tr blank", '<text x="622" y="830" font-size="34" class="mm-brush mm-red" text-anchor="middle" transform="rotate(-6 622 818)">Afiyetle</text>');
    o += only("en", '<text x="622" y="830" font-size="34" class="mm-brush mm-red" text-anchor="middle" transform="rotate(-6 622 818)">Enjoy!</text>');

    o += only("tr blank", '<text x="50" y="985" font-size="15" class="mm-hand">ilk denediğim gün:  ____ / ____ / ________</text><text x="556" y="985" font-size="15" class="mm-hand" text-anchor="end">puanım:</text>');
    o += only("en", '<text x="50" y="985" font-size="15" class="mm-hand">first made on:  ____ / ____ / ________</text><text x="556" y="985" font-size="15" class="mm-hand" text-anchor="end">my rating:</text>');

    return { paint: s, over: o };
  }

  // image: the painting baked to a bitmap (scripts in exports/ regenerate it). Pages then only draw text live,
  // which keeps several copies on one screen cheap. Without it, the painting is drawn live.
  var SPREADS = { menemen: { draw: menemenPage, title: "Menemen", pages: 1, image: "assets/spreads/menemen-paint.webp" } };
  var cache = {};
  var api = { base: "" };

  function parts(id) { return cache[id] || (cache[id] = SPREADS[id].draw()); }
  function svg(id, lang, view, inner) {
    var vb = SPREADS[id].pages === 1 ? "0 0 700 1000" : view === "left" ? "0 0 700 1000" : view === "right" ? "700 0 700 1000" : "0 0 1400 1000";
    return '<svg class="mm-spread mm-' + (view || "both") + '" data-lang="' + (lang || "tr") + '" viewBox="' + vb + '" role="img" aria-label="' +
      SPREADS[id].title + ' tarif sayfası" preserveAspectRatio="xMidYMid meet">' + inner + "</svg>";
  }
  api.render = function (id, lang, view) {
    var sp = SPREADS[id];
    if (!sp) return "";
    install();
    var p = parts(id);
    var w = sp.pages === 1 ? 700 : 1400;
    var paint = sp.image && !api.live ? '<image href="' + api.base + sp.image + '" width="' + w + '" height="1000" preserveAspectRatio="none"/>' : p.paint;
    return svg(id, lang, view, paint + p.over);
  };
  // the painting alone, live, for baking the image
  api.renderPaint = function (id) { install(); return svg(id, "tr", "both", parts(id).paint); };
  api.install = install;
  api.has = function (id) { return !!SPREADS[id]; };
  api.pages = function (id) { return SPREADS[id] ? SPREADS[id].pages || 2 : 0; };
  window.TariifSpreads = api;
})();
