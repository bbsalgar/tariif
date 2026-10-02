/* Illustrated two-page recipe spreads, painted in SVG to read like a Procreate watercolour page:
   pigment glazes with pooled edges and paper grain (filters #mmA/#mmB), white paper left unpainted
   for highlights (#mmS), loose fine-liner linework that doesn't quite sit on the paint (#mmPen),
   and handwriting. One spread = viewBox 1400 × 1000, two 5:7 pages side by side.

   TariifSpreads.install()                  adds the shared filters, gradients and styles once per document
   TariifSpreads.render(id, lang, view)      lang: "tr" | "en" | "blank"; view: "both" | "left" | "right"
   TariifSpreads.renderPaint(id)             the painting alone, drawn live (exports/bake-spread.js bakes it)
   TariifSpreads.has(id)                     true when a painted spread exists for that recipe
   TariifSpreads.base                        path prefix for the baked image ("" from the site root, "../" from recipes/)
   TariifSpreads.live = true                 draw the painting live instead of using the baked image */
(function () {
  "use strict";

  var INK = "#2E2A26", NOTE = "#2B579C", PAPER = "#FFFDF8", PAGE = "#FBF8F1";

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

  // W: one watercolour glaze. H: paper left white. L: pen linework. T: handwriting.
  function W(fill, inner, o, f) {
    return '<g filter="url(#' + (f || "mmA") + ')" fill="' + fill + '" opacity="' + (o == null ? .88 : o) + '" style="mix-blend-mode:multiply">' + inner + "</g>";
  }
  function H(inner, o) { return '<g filter="url(#mmS)" fill="' + PAPER + '" opacity="' + (o == null ? 1 : o) + '">' + inner + "</g>"; }
  function L(inner, w, o, color, dash) {
    return '<g filter="url(#mmPen)" fill="none" stroke="' + (color || INK) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (o == null ? .9 : o) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + ">" + inner + "</g>";
  }
  function T(x, y, text, size, opts) {
    opts = opts || {};
    var rot = opts.rot || 0;
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" class="' + (opts.cls || "mm-hand") + '"' +
      (opts.anchor ? ' text-anchor="' + opts.anchor + '"' : "") +
      (opts.fill ? ' fill="' + opts.fill + '"' : "") +
      (rot ? ' transform="rotate(' + rot + " " + x + " " + y + ')"' : "") + ">" + text + "</text>";
  }
  // language layers: shown only for the listed variants
  function only(langs, inner) { return '<g class="' + langs.split(" ").map(function (l) { return "l-" + l; }).join(" ") + '">' + inner + "</g>"; }
  function ruled(x1, x2, y, o) { return L('<path d="M' + x1 + " " + y + "C" + (x1 + (x2 - x1) * .3) + " " + (y + 1.5) + " " + (x1 + (x2 - x1) * .7) + " " + (y - 1.5) + " " + x2 + " " + y + '"/>', 1.4, o == null ? .35 : o); }

  /* ---------- shared defs, installed once per document ---------- */
  var DEFS =
    '<svg class="mm-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    "<style>" +
      ".mm-hand{font-family:Kalam,'Segoe Print','Bradley Hand',cursive;fill:" + INK + "}" +
      ".mm-brush{font-family:'Caveat Brush',Kalam,'Segoe Print',cursive;fill:" + INK + "}" +
      ".mm-small{font-family:Figtree,system-ui,sans-serif;font-weight:600;letter-spacing:.16em;fill:#857B72}" +
      ".mm-note{fill:" + NOTE + "}" +
      ".mm-spread[data-lang=tr] .l-tr-hide,.mm-spread[data-lang=tr] .l-en:not(.l-tr),.mm-spread[data-lang=tr] .l-blank:not(.l-tr)," +
      ".mm-spread[data-lang=en] .l-tr:not(.l-en),.mm-spread[data-lang=en] .l-blank:not(.l-en)," +
      ".mm-spread[data-lang=blank] .l-tr:not(.l-blank),.mm-spread[data-lang=blank] .l-en:not(.l-blank){display:none}" +
    "</style>" +
    '<filter id="mmA" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="3" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="s"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves="2" seed="14" result="b"/>' +
      '<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.25 .3" result="bm"/>' +
      '<feComposite in="s" in2="bm" operator="in" result="w"/>' +
      '<feMorphology in="s" operator="erode" radius="2" result="i"/>' +
      '<feComposite in="s" in2="i" operator="out" result="rim"/>' +
      '<feGaussianBlur in="rim" stdDeviation="1" result="rs"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="7" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.5 1.12" result="gm"/>' +
      '<feMerge result="p"><feMergeNode in="w"/><feMergeNode in="rs"/></feMerge>' +
      '<feComposite in="p" in2="gm" operator="in"/>' +
    "</filter>" +
    '<filter id="mmB" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="27" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="G" yChannelSelector="R" result="s"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" seed="41" result="b"/>' +
      '<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 .35" result="bm"/>' +
      '<feComposite in="s" in2="bm" operator="in" result="w"/>' +
      '<feMorphology in="s" operator="erode" radius="1.4" result="i"/>' +
      '<feComposite in="s" in2="i" operator="out" result="rim"/>' +
      '<feGaussianBlur in="rim" stdDeviation=".7" result="rs"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="19" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.5 1.12" result="gm"/>' +
      '<feMerge result="p"><feMergeNode in="w"/><feMergeNode in="rs"/></feMerge>' +
      '<feComposite in="p" in2="gm" operator="in"/>' +
    "</filter>" +
    '<filter id="mmS" x="-25%" y="-25%" width="150%" height="150%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="s"/>' +
      '<feGaussianBlur in="s" stdDeviation=".6"/>' +
    "</filter>" +
    '<filter id="mmPen" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<filter id="mmText" x="-5%" y="-20%" width="110%" height="140%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="1" seed="2" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<filter id="mmPaper" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="11" result="fine"/>' +
      '<feColorMatrix in="fine" type="matrix" values="0 0 0 0 .45  0 0 0 0 .40  0 0 0 0 .34  0 0 0 .10 0" result="f"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="23" result="tooth"/>' +
      '<feColorMatrix in="tooth" type="matrix" values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .38  0 0 0 .07 -.01" result="t"/>' +
      '<feMerge><feMergeNode in="t"/><feMergeNode in="f"/></feMerge>' +
    "</filter>" +
    '<radialGradient id="mmCopper" cx=".38" cy=".34" r=".78"><stop offset="0" stop-color="#EDAA76"/><stop offset=".55" stop-color="#CC7642"/><stop offset="1" stop-color="#97492A"/></radialGradient>' +
    '<linearGradient id="mmRimShade" x1="0" y1="0" x2="1" y2="1"><stop offset=".35" stop-color="#7E3A1F" stop-opacity="0"/><stop offset="1" stop-color="#7E3A1F"/></linearGradient>' +
    '<radialGradient id="mmSauce" cx=".5" cy=".45" r=".62"><stop offset="0" stop-color="#F27E4C"/><stop offset=".6" stop-color="#DF5137"/><stop offset="1" stop-color="#B3302A"/></radialGradient>' +
    '<radialGradient id="mmYolk" cx=".4" cy=".36" r=".66"><stop offset="0" stop-color="#FFDB5C"/><stop offset=".7" stop-color="#F8B42A"/><stop offset="1" stop-color="#E88B1B"/></radialGradient>' +
    '<linearGradient id="mmPepper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9D77B"/><stop offset=".6" stop-color="#7EAB4B"/><stop offset="1" stop-color="#4E7C33"/></linearGradient>' +
    '<radialGradient id="mmTomato" cx=".36" cy=".34" r=".72"><stop offset="0" stop-color="#F4775A"/><stop offset=".62" stop-color="#DA3D2F"/><stop offset="1" stop-color="#A62424"/></radialGradient>' +
    '<linearGradient id="mmCrust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9F5B27"/><stop offset="1" stop-color="#CC944E"/></linearGradient>' +
    '<radialGradient id="mmCrumb" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#FCF1D6"/><stop offset="1" stop-color="#EAD09C"/></radialGradient>' +
    '<linearGradient id="mmTea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DC6A3C"/><stop offset="1" stop-color="#8A2912"/></linearGradient>' +
    '<radialGradient id="mmShell" cx=".34" cy=".3" r=".82"><stop offset="0" stop-color="#FCF3E0"/><stop offset="1" stop-color="#E0C9A0"/></radialGradient>' +
    '<radialGradient id="mmBrownEgg" cx=".34" cy=".3" r=".82"><stop offset="0" stop-color="#F2D3A8"/><stop offset="1" stop-color="#C68A57"/></radialGradient>' +
    '<radialGradient id="mmOnion" cx=".4" cy=".46" r=".7"><stop offset="0" stop-color="#E9A9C0"/><stop offset=".6" stop-color="#BA5A81"/><stop offset="1" stop-color="#7C3057"/></radialGradient>' +
    '<linearGradient id="mmGutter" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A4632" stop-opacity="0"/><stop offset=".5" stop-color="#5A4632" stop-opacity=".14"/><stop offset="1" stop-color="#5A4632" stop-opacity="0"/></linearGradient>' +
    "</svg>";

  function install() {
    if (typeof document === "undefined" || document.querySelector(".mm-defs")) return;
    var holder = document.createElement("div");
    holder.innerHTML = DEFS;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  /* ---------- menemen ---------- */
  function menemen() {
    var s = "", o = "";   // s: the painting (can be baked to an image), o: text and language-dependent marks

    // paper, gutter shadow, page edge
    s += '<rect width="1400" height="1000" fill="' + PAGE + '"/>';
    s += '<rect width="1400" height="1000" filter="url(#mmPaper)"/>';
    s += '<rect x="590" width="220" height="1000" fill="url(#mmGutter)"/>';
    s += '<path d="M700 0V1000" stroke="#5A4632" stroke-opacity=".08" stroke-width="1.5"/>';

    /* ===== LEFT PAGE: title + the finished dish ===== */
    o += '<g>';
    o += only("tr blank", T(72, 82, "NO. 01", 17, { cls: "mm-small" }) + T(628, 82, "KAHVALTI", 17, { cls: "mm-small", anchor: "end" }));
    o += only("en", T(72, 82, "NO. 01", 17, { cls: "mm-small" }) + T(628, 82, "BREAKFAST", 17, { cls: "mm-small", anchor: "end" }));
    o += "</g>";

    // title with a yellow wash under it
    o += W("#F2C14E", blob(250, 182, 178, 24, 5, .14, 12, -3), .5, "mmB");
    o += '<g>' + T(74, 202, "Menemen", 136, { cls: "mm-brush", rot: -3 }) + "</g>";
    o += '<g>';
    o += only("tr", T(92, 262, "2 kişilik · 20 dakika", 32, { rot: -2 }));
    o += only("en", T(92, 262, "Turkish scrambled eggs · serves 2", 30, { rot: -2 }));
    o += only("blank", T(92, 262, "kimden:", 30, { rot: -2 }));
    o += "</g>";
    o += only("blank", ruled(200, 420, 258, .4));

    // little splatters, the way a loaded brush leaves them
    s += W("#D94A35", dots(7, 560, 400, 50, 26, 301, 2, 5.5), .55, "mmB");
    s += W("#6A9A4A", dots(4, 150, 730, 40, 18, 302, 2, 4), .5, "mmB");

    // the copper sahan
    var cx = 350, cy = 582;
    s += W("#8C8278", blob(cx + 22, cy + 32, 224, 178, 11, .05, 14), .2, "mmB");                       // shadow on the table
    s += W("url(#mmCopper)", blob(126, 566, 46, 21, 21, .08, 10, -6) + blob(576, 560, 46, 21, 22, .08, 10, 6), .9);
    s += W("url(#mmCopper)", blob(cx, cy, 206, 170, 31, .03, 16), .92);
    s += W("url(#mmRimShade)", ring([cx, cy, 206, 170], [cx, cy + 10, 174, 140]), .55, "mmB");
    s += W("#A65A33", ring([cx, cy, 183, 151], [cx, cy + 10, 173, 139]), .75, "mmB");                   // far inner wall
    s += H(blob(cx, cy + 10, 172, 138, 41, .02, 16));                                                // keep the food area clean
    s += W("url(#mmSauce)", blob(cx, cy + 10, 170, 136, 42, .04, 16), .93);
    s += W("#B52F27", blob(262, 642, 48, 30, 43, .3, 8) + blob(442, 540, 40, 26, 44, .3, 8) + blob(472, 652, 36, 22, 45, .3, 8) + blob(300, 522, 30, 18, 46, .3, 8), .5, "mmB");
    s += W("#F59A4E", blob(cx, 604, 92, 58, 47, .25, 10) + blob(228, 582, 30, 24, 48, .3, 8), .42);
    s += H(blob(250, 562, 11, 5, 51, .2, 6, -20) + blob(396, 652, 13, 5, 52, .2, 6, 10) + blob(458, 590, 9, 4, 53, .2, 6, 0) + blob(312, 622, 7, 3, 54, .2, 6, 30), .85);

    // peppers in the pan
    var strips = [[226, 530, 32, 9, -30], [374, 520, 34, 9, 15], [482, 612, 30, 8, 70], [252, 690, 28, 8, 20], [412, 702, 30, 8, -15], [354, 612, 24, 7, 40], [196, 628, 22, 7, 80]];
    s += W("url(#mmPepper)", strips.map(function (p, i) { return blob(p[0], p[1], p[2], p[3], 71 + i, .12, 8, p[4]); }).join(""), .92);
    s += W("#3F6E2A", strips.map(function (p, i) { return blob(p[0] + 3, p[1] + 3, p[2] * .7, p[3] * .45, 171 + i, .2, 7, p[4]); }).join(""), .35, "mmB");

    // eggs
    var eggs = [[282, 548, 64, 50, 61], [428, 606, 60, 48, 62], [318, 668, 56, 42, 63]];
    s += H(eggs.map(function (e) { return blob(e[0], e[1], e[2], e[3], e[4], .16, 11); }).join(""));
    s += W("#F5E9CF", eggs.map(function (e) { return blob(e[0], e[1], e[2], e[3], e[4], .16, 11); }).join(""), .55, "mmB");
    s += W("#AEB7C4", eggs.map(function (e) { return blob(e[0] + 14, e[1] + 12, e[2] * .68, e[3] * .5, e[4] + 100, .2, 9); }).join(""), .32, "mmB");
    s += W("url(#mmYolk)", eggs.map(function (e) { return blob(e[0] + 4, e[1] - 2, 25, 23, e[4] + 200, .05, 10); }).join(""), .96);
    s += W("#E07B14", eggs.map(function (e) { return blob(e[0] + 11, e[1] + 6, 17, 11, e[4] + 300, .2, 8, 20); }).join(""), .35, "mmB");
    s += H(eggs.map(function (e) { return blob(e[0] - 6, e[1] - 11, 7, 4, e[4] + 400, .2, 7, -25); }).join(""), .95);
    s += W("#F9D77A", blob(372, 560, 14, 9, 81, .3, 7) + blob(238, 622, 13, 8, 82, .3, 7) + blob(474, 558, 12, 8, 83, .3, 7) + blob(392, 690, 13, 8, 84, .3, 7), .7);

    // parsley and pul biber
    s += W("#4F8A35", leaves(22, cx, 596, 150, 112, 91, 6.5), .85, "mmB");
    s += W("#8E1E12", dots(46, cx, 598, 152, 116, 92, 1.4, 3), .8, "mmB");

    // pen linework, deliberately a little off the paint
    var eggLines = eggs.map(function (e) { return '<path d="' + blobD(e[0] + 2, e[1] - 2, e[2], e[3], e[4], .16, 11) + '"/>'; }).join("");
    var yolkLines = eggs.map(function (e) { return '<circle cx="' + (e[0] + 5) + '" cy="' + (e[1] - 4) + '" r="24"/>'; }).join("");
    s += L('<path d="' + ellD(cx + 3, cy - 4, 205, 169) + '"/><path d="' + ellD(cx + 1, cy + 5, 181, 149) + '"/>' +
      '<path d="' + blobD(124, 563, 46, 20, 23, .06, 10, -6) + '"/><path d="' + blobD(578, 557, 46, 20, 24, .06, 10, 6) + '"/>' +
      '<circle cx="150" cy="560" r="3"/><circle cx="158" cy="574" r="3"/><circle cx="550" cy="554" r="3"/><circle cx="542" cy="568" r="3"/>', 2.3, .85);
    s += L(eggLines, 1.8, .7, null, "70 16 34 12");
    s += L(yolkLines, 1.6, .65, null, "50 14 40 20");
    s += L(strips.slice(0, 4).map(function (p, i) { return '<path d="' + blobD(p[0] + 1, p[1] - 1, p[2], p[3], 71 + i, .12, 8, p[4]) + '"/>'; }).join(""), 1.5, .6, null, "30 8");
    s += L('<path d="M470 700q8-5 14 0M500 660q7-6 12 1M520 610q6-6 11 0M432 736q8-4 14 1M246 744q8 4 14-1M200 700q6 5 12 2"/>', 1.6, .45);   // hammered copper
    s += L('<path d="M300 432c-12-14 12-24 0-40M346 420c-12-14 12-24 0-42M392 432c-10-12 10-20 0-34"/>', 1.8, .45);                          // steam

    // bread slice
    var crust = "M-95 55C-105 -10 -70 -70 0 -72C70 -74 108 -15 98 55Z", crumb = "M-82 46C-90 -6 -60 -58 0 -60C60 -61 92 -10 85 46Z";
    s += '<g transform="translate(140 866) rotate(-10)">' +
      W("#8C8278", blob(4, 64, 102, 13, 501, .1, 10), .2, "mmB") +
      W("url(#mmCrust)", '<path d="' + crust + '"/>', .92) +
      H('<path d="' + crumb + '"/>') +
      W("url(#mmCrumb)", '<path d="' + crumb + '"/>', .88) +
      W("#D4B47C", pts(14, 0, -6, 62, 38, 502).map(function (p, i) { return blob(p[0], p[1], 3 + p[2] * 5, 2 + p[2] * 3, 510 + i, .3, 6, p[2] * 90); }).join(""), .6, "mmB") +
      H(dots(10, 0, -66, 70, 6, 503, 1.2, 2.4), .8) +
      L('<path d="' + crust + '"/>', 2, .8, null, "90 14 40 10") + L('<path d="' + crumb + '"/>', 1.4, .5, null, "40 18") +
      "</g>";

    // tea in an ince belli glass
    var glass = "M550 792C547 822 566 842 568 862C570 884 553 902 556 920L624 920C627 902 610 884 612 862C614 842 633 822 630 792Z";
    var tea = "M553 806C552 828 569 845 571 864C573 884 558 900 560 915L620 915C622 900 607 884 609 864C611 845 628 828 627 806Z";
    s += '<g transform="translate(18 0)">';
    s += W("#8C8278", blob(596, 930, 94, 20, 601, .06, 12), .2, "mmB");
    s += H('<path d="' + ellD(590, 922, 84, 20) + '"/>');
    s += W(NOTE, ring([590, 922, 84, 20], [590, 921, 75, 15]), .55, "mmB");
    s += W("url(#mmTea)", '<path d="' + tea + '"/>', .93);
    s += W("#E58A55", '<path d="' + ellD(590, 806, 37, 6) + '"/>', .8, "mmB");
    s += H('<path d="M561 814C561 832 573 848 575 864C576 880 567 893 567 906L572 906C572 893 581 880 580 864C578 848 567 832 567 814Z"/>', .85);
    s += L('<path d="' + glass + '"/><path d="' + ellD(590, 792, 40, 6) + '"/><path d="' + ellD(590, 922, 84, 20) + '"/>', 2, .85);
    s += L('<path d="M578 774c-8-10 8-16 0-28M600 770c-8-10 8-16 0-28"/>', 1.5, .35);
    s += "</g>";

    // notes in blue
    o += only("tr en", L('<path d="M524 368C530 384 528 398 514 414M514 414l1-11M514 414l10-4"/><path d="M262 900C244 898 228 890 214 876M214 876l2 11M214 876l11 3"/>', 2, .8, NOTE));
    o += '<g>';
    o += only("tr", T(462, 318, "bakır sahanda,", 27, { cls: "mm-hand mm-note", rot: 4 }) + T(470, 350, "ocaktan sofraya", 27, { cls: "mm-hand mm-note", rot: 4 }) +
      T(262, 914, "ekmeği banmadan olmaz!", 25, { cls: "mm-hand mm-note", rot: -4 }));
    o += only("en", T(462, 318, "in a copper pan,", 27, { cls: "mm-hand mm-note", rot: 4 }) + T(470, 350, "stove to table", 27, { cls: "mm-hand mm-note", rot: 4 }) +
      T(262, 914, "bread for dipping!", 25, { cls: "mm-hand mm-note", rot: -4 }));
    o += T(72, 966, "01", 16, { cls: "mm-small" });
    o += "</g>";

    /* ===== RIGHT PAGE: ingredients, one by one, then the method ===== */
    s += W("#3E70B5", blob(870, 122, 104, 17, 701, .16, 10, -2), .16, "mmB");
    o += '<g>';
    o += only("tr blank", T(772, 140, "Malzemeler", 66, { cls: "mm-brush mm-note", rot: -2 }));
    o += only("en", T(772, 140, "Ingredients", 66, { cls: "mm-brush mm-note", rot: -2 }));
    o += "</g>";

    // eggs
    s += W("#8C8278", blob(838, 270, 70, 9, 702, .1, 10), .2, "mmB");
    s += W("url(#mmShell)", blob(812, 222, 33, 43, 101, .04, 12, -14), .92);
    s += W("url(#mmBrownEgg)", blob(860, 232, 31, 40, 102, .04, 12, 12), .92);
    s += W("#B9966A", blob(824, 238, 17, 27, 103, .15, 8, -14) + blob(870, 248, 15, 23, 104, .15, 8, 12), .3, "mmB");
    s += W("#8E5A33", dots(10, 862, 232, 22, 30, 705, .8, 1.6), .55, "mmB");
    s += H(blob(800, 205, 7, 11, 105, .2, 7, -14) + blob(851, 214, 6, 10, 106, .2, 7, 12), .9);
    s += L('<path d="' + blobD(814, 220, 33, 43, 101, .03, 12, -14) + '"/><path d="' + blobD(862, 230, 31, 40, 102, .03, 12, 12) + '"/>', 1.8, .75, null, "80 12 40 10");

    // tomatoes: one whole, one halved
    function calyx(x, y, seed) {
      var out = "";
      for (var k = 0; k < 5; k++) {
        var a = k / 5 * Math.PI * 2 - Math.PI / 2;
        out += blob(x + Math.cos(a) * 10, y + Math.sin(a) * 5, 11, 3.6, seed + k, .2, 6, a * 180 / Math.PI);
      }
      return out;
    }
    s += W("#8C8278", blob(1050, 272, 70, 9, 706, .1, 10), .2, "mmB");
    s += W("url(#mmTomato)", blob(1022, 228, 44, 40, 111, .06, 12), .93);
    s += W("#5E8C3A", calyx(1020, 192, 120) + '<path d="M1019 192c1-8 4-14 9-18l3 2c-5 4-7 9-8 16z"/>', .9, "mmB");
    s += H(blob(1006, 212, 9, 6, 113, .2, 7, -30), .9);
    s += W("url(#mmTomato)", blob(1080, 252, 32, 25, 114, .04, 12, -8), .93);
    s += H(blob(1080, 252, 26, 19, 115, .05, 12, -8));
    s += W("#F39478", blob(1080, 252, 26, 19, 115, .05, 12, -8), .8, "mmB");
    s += W("#F2C14E", blob(1069, 247, 7, 5, 116, .2, 6, 30) + blob(1090, 247, 7, 5, 117, .2, 6, -30) + blob(1080, 262, 7, 5, 118, .2, 6, 90), .7, "mmB");
    s += L('<path d="' + blobD(1024, 226, 44, 40, 111, .05, 12) + '"/><path d="' + blobD(1082, 250, 32, 25, 114, .04, 12, -8) + '"/>' +
      '<path d="M1002 222c4 10 10 16 18 20M1040 218c-2 10-8 18-16 22"/>', 1.8, .75, null, "70 10 30 8");
    s += L('<path d="M1068 246h.01M1072 250h.01M1088 245h.01M1092 249h.01M1078 263h.01M1083 261h.01"/>', 2.6, .7);

    // two sivri biber
    var p1 = "M1192 168C1226 172 1258 194 1280 232C1290 250 1297 263 1300 274C1291 270 1282 261 1272 248C1250 220 1224 200 1188 186C1182 180 1184 170 1192 168Z";
    var p2 = "M1186 198C1218 206 1246 228 1262 262C1268 275 1272 285 1273 294C1265 289 1257 280 1250 268C1234 242 1212 224 1182 216C1176 210 1178 200 1186 198Z";
    s += W("#8C8278", blob(1250, 300, 66, 8, 707, .1, 10), .18, "mmB");
    s += W("url(#mmPepper)", '<path d="' + p1 + '"/><path d="' + p2 + '"/>', .92);
    s += W("#3F6E2A", blob(1258, 236, 34, 5, 131, .2, 8, 42) + blob(1236, 262, 30, 4, 132, .2, 8, 46), .35, "mmB");
    s += W("#4C7A30", '<path d="M1190 170c-9-3-15-11-16-21l5-1c1 8 6 14 13 17z"/><path d="M1184 200c-9-3-15-11-16-21l5-1c1 8 6 14 13 17z"/>' + blob(1190, 177, 7, 9, 133, .2, 7) + blob(1184, 207, 7, 9, 134, .2, 7), .9, "mmB");
    s += H('<path d="M1206 176C1232 182 1253 198 1268 222C1260 214 1240 196 1207 182Z"/><path d="M1199 206C1222 214 1241 230 1252 252C1244 244 1226 228 1200 212Z"/>', .8);
    s += L('<path d="' + p1 + '"/><path d="' + p2 + '"/><path d="M1190 170c-9-3-15-11-16-21M1184 200c-9-3-15-11-16-21"/>', 1.8, .75, null, "90 12 50 10");

    // butter
    var top = "M775 410L850 392L900 412L825 432Z", front = "M775 410L825 432L825 470L775 448Z", side = "M825 432L900 412L900 450L825 470Z";
    s += W("#C9D3DE", '<path d="M752 442L860 412L928 446L820 482Z"/>', .35, "mmB");
    s += W("#FCEFB4", '<path d="' + top + '"/>', .95);
    s += W("#F2D36E", '<path d="' + front + '"/>', .9, "mmB");
    s += W("#E2BB50", '<path d="' + side + '"/>', .9);
    s += W("#F6DC86", blob(846, 404, 16, 7, 141, .2, 8, -10), .9, "mmB");
    s += L('<path d="' + top + '"/><path d="M775 410V448L825 470L900 450V412M825 432V470"/><path d="M834 405c5-7 18-7 22 0c3 5-6 9-13 5"/><path d="M790 412l30 8M800 404l26 7"/>', 1.8, .75);

    // salt and pul biber, in a small İznik bowl
    var bowl = "M978 428h80c0 26-18 40-40 40s-40-14-40-40z";
    s += W("#8C8278", blob(1030, 474, 64, 8, 708, .1, 10), .18, "mmB");
    s += W("#3E70B5", '<path d="' + bowl + '"/>', .85);
    s += H('<path d="M984 446c10 5 58 5 68 0l-2 6c-10 4-54 4-64 0z"/>', .95);
    s += W("#3E70B5", dots(5, 1018, 449, 26, 1, 709, 2, 2.4), .8, "mmB");
    s += W("#B5301F", blob(1018, 424, 37, 10, 151, .2, 10), .9);
    s += W("#7E1A10", dots(18, 1018, 421, 30, 7, 152, 1.3, 2.6), .8, "mmB");
    s += W("#E8B04A", dots(6, 1018, 421, 26, 6, 153, 1, 1.6), .7, "mmB");
    s += W("#AEB7C4", blob(1096, 458, 22, 7, 154, .2, 8), .45, "mmB");
    s += W("#9AA5B4", dots(16, 1096, 452, 18, 6, 155, .9, 1.8), .7, "mmB");
    s += L('<path d="' + bowl + '"/><path d="' + ellD(1018, 428, 40, 6) + '"/>', 1.8, .75);
    s += L('<path d="M1078 459c6-11 30-13 38 0"/>', 1.4, .35);
    o += only("tr en", L('<path d="M1112 404C1116 420 1112 432 1102 440M1102 440l3-10M1102 440l10-2"/>', 1.8, .8, NOTE));

    // onion, optional
    var bulb = "M1250 382C1262 398 1290 410 1290 440C1290 466 1272 478 1250 478C1228 478 1210 466 1210 440C1210 410 1238 398 1250 382Z";
    s += W("#8C8278", blob(1254, 484, 50, 7, 710, .1, 10), .2, "mmB");
    s += W("url(#mmOnion)", '<path d="' + bulb + '"/>', .9);
    s += W("#7C3057", blob(1238, 440, 5, 30, 161, .2, 8, 8) + blob(1264, 442, 5, 28, 162, .2, 8, -8), .3, "mmB");
    s += W("#9BB86A", '<path d="M1250 384c-3-12-2-22 2-31c2 8 3 19-2 31z"/>', .9, "mmB");
    s += H(blob(1230, 428, 6, 17, 163, .2, 7, 8), .8);
    s += L('<path d="' + bulb + '"/><path d="M1250 384C1236 410 1232 450 1240 476M1250 384C1264 410 1268 450 1260 476M1242 480l-4 10M1250 480v11M1258 480l4 10"/><path d="M1250 384c-3-12-2-22 2-31"/>', 1.8, .75);

    // ingredient labels
    function label(x, y, tr, en, two) {
      var o = '<g>' + only("tr", T(x, y, tr[0], 27, { anchor: "middle" }) + (tr[1] ? T(x, y + 30, tr[1], 27, { anchor: "middle" }) : "")) +
        only("en", T(x, y, en[0], 27, { anchor: "middle" }) + (en[1] ? T(x, y + 30, en[1], 27, { anchor: "middle" }) : "")) + "</g>";
      return o + only("blank", ruled(x - 64, x + 64, y + 2) + (two ? ruled(x - 48, x + 48, y + 32) : ""));
    }
    o += label(835, 330, ["4 yumurta"], ["4 eggs"]);
    o += label(1045, 330, ["3 olgun domates"], ["3 ripe tomatoes"]);
    o += label(1245, 330, ["2 sivri biber"], ["2 green peppers"]);
    o += label(838, 520, ["2 yemek kaşığı", "tereyağı"], ["2 tbsp butter"], true);
    o += label(1040, 520, ["tuz, pul biber"], ["salt, chilli flakes"]);
    o += label(1250, 520, ["1 soğan", "(isteğe bağlı)"], ["1 onion", "(optional)"], true);
    o += '<g>';
    o += only("tr", T(1072, 394, "bir tutam!", 24, { cls: "mm-hand mm-note", rot: 6 }) + T(1250, 588, "soğanlı mı, soğansız mı?", 23, { cls: "mm-hand mm-note", anchor: "middle", rot: -2 }));
    o += only("en", T(1072, 394, "a pinch!", 24, { cls: "mm-hand mm-note", rot: 6 }) + T(1250, 588, "onion or not? you decide", 23, { cls: "mm-hand mm-note", anchor: "middle", rot: -2 }));
    o += "</g>";

    // divider
    s += L('<path d="M782 614C900 606 980 620 1040 612M1080 612C1150 606 1240 618 1320 610"/><path d="M1060 612c-6-8-2-16 6-18c2 8-1 14-6 18zM1060 612c8-4 16-2 18 4c-8 2-14 0-18-4z"/>', 1.5, .45);

    o += '<g>';
    o += only("tr blank", T(772, 676, "Yapılışı", 60, { cls: "mm-brush mm-note", rot: -2 }));
    o += only("en", T(772, 676, "Method", 60, { cls: "mm-brush mm-note", rot: -2 }));
    o += "</g>";

    // method: three steps, each with a tiny sketch
    var steps = [
      [724, ["Biberleri tereyağında,", "yumuşayana kadar kavur."], ["Soften the peppers", "gently in the butter."]],
      [812, ["Rendelenmiş domatesi ekle,", "suyunu çekene kadar pişir."], ["Add the grated tomatoes and", "cook until the juice is gone."]],
      [900, ["Yumurtaları kır, çok karıştırma.", "Pul biberle sıcak servis et."], ["Crack in the eggs, stir gently.", "Serve hot with chilli flakes."]]
    ];
    var icons =
      W("url(#mmCopper)", blob(800, 724, 26, 20, 171, .05, 10), .85) + H(blob(800, 726, 19, 14, 172, .05, 10)) +
      W("url(#mmPepper)", blob(794, 722, 9, 3, 173, .2, 6, -20) + blob(806, 729, 9, 3, 174, .2, 6, 30), .9, "mmB") +
      L('<path d="' + ellD(800, 724, 26, 20) + '"/><path d="M825 716l24-9"/>', 1.6, .75) +
      W("#DA3D2F", blob(812, 840, 18, 6, 175, .2, 8), .8, "mmB") +
      L('<path d="M790 836L796 786H816L822 836Z"/><path d="M801 786c0-9 10-9 10 0"/><path d="M800 798h.01M808 798h.01M800 808h.01M808 808h.01M812 818h.01M800 818h.01M806 826h.01"/>', 1.6, .75) +
      W("url(#mmShell)", '<path d="M786 892c0-14 8-24 18-24s18 10 18 24l-6-4-6 5-6-5-6 5-6-5z"/>', .9) +
      W("url(#mmYolk)", blob(806, 916, 8, 7, 176, .1, 8), .95, "mmB") +
      L('<path d="M786 892c0-14 8-24 18-24s18 10 18 24l-6-4-6 5-6-5-6 5-6-5z"/><path d="M804 900v6"/>', 1.6, .75);
    o += only("tr en", icons);
    o += '<g>';
    steps.forEach(function (st, i) {
      o += only("tr en", T(858, st[0] + 6, String(i + 1), 40, { cls: "mm-brush mm-note" }));
      o += only("tr", T(892, st[0], st[1][0], 27) + T(892, st[0] + 34, st[1][1], 27));
      o += only("en", T(892, st[0], st[2][0], 27) + T(892, st[0] + 34, st[2][1], 27));
    });
    o += "</g>";
    var blankLines = "";
    for (var k = 0; k < 6; k++) blankLines += ruled(782, 1320, 726 + k * 38);
    o += only("blank", blankLines + '<g>' + T(1320, 934, "kendi tarifini yaz ✎", 25, { cls: "mm-hand mm-note", anchor: "end", rot: -2 }) + "</g>");

    o += '<g>';
    o += only("tr", T(772, 966, "1 yemek kaşığı ≈ 15 ml · 1 su bardağı ≈ 200 ml", 15, { cls: "mm-small" }));
    o += only("en", T(772, 966, "1 TBSP ≈ 15 ML · 1 TURKISH CUP ≈ 200 ML", 15, { cls: "mm-small" }));
    o += T(1328, 966, "02", 16, { cls: "mm-small", anchor: "end" });
    o += "</g>";
    return { paint: s, over: o };
  }

  // image: the painting baked to a bitmap (scripts in exports/ regenerate it). Pages then only draw text live,
  // which keeps several copies on one screen cheap. Without it, the painting is drawn live.
  var SPREADS = { menemen: { draw: menemen, title: "Menemen", image: "assets/spreads/menemen-paint.webp" } };
  var cache = {};
  var api = { base: "" };

  function parts(id) { return cache[id] || (cache[id] = SPREADS[id].draw()); }
  function svg(id, lang, view, inner) {
    var vb = view === "left" ? "0 0 700 1000" : view === "right" ? "700 0 700 1000" : "0 0 1400 1000";
    return '<svg class="mm-spread mm-' + (view || "both") + '" data-lang="' + (lang || "tr") + '" viewBox="' + vb + '" role="img" aria-label="' +
      SPREADS[id].title + ' tarif sayfası" preserveAspectRatio="xMidYMid meet">' + inner + "</svg>";
  }
  api.render = function (id, lang, view) {
    var sp = SPREADS[id];
    if (!sp) return "";
    install();
    var p = parts(id);
    var paint = sp.image && !api.live ? '<image href="' + api.base + sp.image + '" width="1400" height="1000" preserveAspectRatio="none"/>' : p.paint;
    return svg(id, lang, view, paint + p.over);
  };
  // the painting alone, live, for baking the image
  api.renderPaint = function (id) { install(); return svg(id, "tr", "both", parts(id).paint); };
  api.install = install;
  api.has = function (id) { return !!SPREADS[id]; };
  window.TariifSpreads = api;
})();
