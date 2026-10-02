// Bakes a painted spread to images with Playwright (Chromium).
//   node exports/bake-spread.js menemen
// Writes:
//   assets/spreads/<id>-paint.webp          the drawing alone at 2×, used by the site under live text
//   exports/<id>/<id>-<lang>.jpg             the finished page or spread with text, at 2×, for print proofs
//   exports/<id>/<id>-instagram-<…>.jpg      each page on a 1080×1350 (4:5) post
// Fonts come from Google Fonts, so run it with network access.
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const id = process.argv[2] || "menemen";
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "exports", id);
fs.mkdirSync(outDir, { recursive: true });

const FONTS = "https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Figtree:wght@400..700&family=Kalam:wght@400;700&display=swap";

async function page(browser, w, h) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  if (process.env.FONT_CSS) {   // offline: serve a local copy of the Google Fonts stylesheet
    await p.route(/fonts\.googleapis/, (r) => r.fulfill({ contentType: "text/css", body: fs.readFileSync(process.env.FONT_CSS, "utf8") }));
  }
  await p.goto("file://" + path.join(root, "recipes", "menemen.html"));   // any local page, so file:// assets load
  await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${FONTS}">
    <style>html,body{margin:0;background:#EEEAE2}svg{display:block}</style></head><body><div id="stage"></div></body></html>`);
  await p.addScriptTag({ path: path.join(root, "assets", "spreads", id + ".js") });
  await p.evaluate((base) => { TariifSpreads.base = base; }, "file://" + root + "/");
  return p;
}

(async () => {
  const browser = await chromium.launch();
  const probe = await page(browser, 100, 100);
  const pages = await probe.evaluate((id) => TariifSpreads.pages(id), id);
  await probe.close();
  const W = pages === 1 ? 700 : 1400;

  // 1 · the painting alone → webp
  let p = await page(browser, W, 1000);
  await p.evaluate(([id, W]) => {
    document.getElementById("stage").innerHTML = TariifSpreads.renderPaint(id);
    document.querySelector("#stage svg").setAttribute("width", W);
  }, [id, W]);
  await p.waitForTimeout(1500);
  const png = await (await p.$("#stage svg")).screenshot();
  const webp = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/webp", 0.9).split(",")[1];
  }, png.toString("base64"));
  fs.writeFileSync(path.join(root, "assets", "spreads", id + "-paint.webp"), Buffer.from(webp, "base64"));
  await p.close();

  // 2 · the finished page or spread with text, one per language
  p = await page(browser, W, 1000);
  for (const lang of ["tr", "en", "blank"]) {
    await p.evaluate(([id, lang, W]) => {
      document.getElementById("stage").innerHTML = TariifSpreads.render(id, lang, "both");
      document.querySelector("#stage svg").setAttribute("width", W);
    }, [id, lang, W]);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(600);
    await (await p.$("#stage svg")).screenshot({ path: path.join(outDir, `${id}-${lang}.jpg`), type: "jpeg", quality: 90 });
  }
  await p.close();

  // 3 · Instagram posts: each page on a 4:5 desk (a single page gets a Turkish and an English post)
  p = await page(browser, 540, 675);
  const posts = pages === 1 ? [["tr", "both", "tr"], ["en", "both", "en"]] : [["tr", "left", "1"], ["tr", "right", "2"]];
  for (const [lang, view, name] of posts) {
    await p.evaluate(([id, lang, view]) => {
      document.getElementById("stage").innerHTML = '<div style="width:540px;height:675px;display:grid;place-items:center">' +
        '<div style="height:620px;aspect-ratio:7/10;box-shadow:0 1px 1px rgba(42,38,35,.08),0 24px 40px -22px rgba(42,38,35,.55)">' +
        TariifSpreads.render(id, lang, view) + "</div></div>";
      document.querySelector("#stage svg").style.cssText = "width:100%;height:100%";
    }, [id, lang, view]);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(outDir, `${id}-instagram-${name}.jpg`), type: "jpeg", quality: 92 });
  }
  await browser.close();
  console.log("baked", id);
})();
