// Revisa la web en móvil y escritorio. Uso: node revisar.mjs <carpeta> [puerto]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.argv[2] || ".");
const PORT = +(process.argv[3] || 8799);
const OUT = path.join(ROOT, "revision");
const SKIP = new Set(["node_modules", ".git", ".claude", "revision", "dist"]);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };

let chromium;
{
  // Busca playwright en el proyecto y, si no, en la instalación global (ESM no usa NODE_PATH).
  const { createRequire } = await import("node:module");
  const { execSync } = await import("node:child_process");
  let globalRoot = "";
  try { globalRoot = execSync("npm root -g", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
  const rutas = [path.join(process.cwd(), "x.js"), ...(globalRoot ? [path.join(globalRoot, "x.js")] : [])];
  for (const nombre of ["playwright", "playwright-core"]) {
    for (const r of rutas) { try { ({ chromium } = createRequire(r)(nombre)); break; } catch {} }
    if (chromium) break;
  }
  if (!chromium) { console.error("Falta Playwright: npm i -D playwright-core"); process.exit(2); }
}

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = "/opt/pw-browsers";
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).filter((n) => /^chromium-\d+$/.test(n))) {
      const p = path.join(base, d, "chrome-linux", "chrome");
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined; // deja que Playwright use el suyo
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404).end("no encontrado"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

function pages(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) pages(full, out);
    else if (e.name === "index.html") out.push("/" + path.relative(ROOT, path.dirname(full)).split(path.sep).join("/") + (dir === ROOT ? "" : "/"));
  }
  return out.map((u) => (u === "/" || u === "//" ? "/" : u.replace(/^\/\//, "/")));
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox"] });
const VIEWS = [["movil", { width: 375, height: 812 }, true], ["escritorio", { width: 1280, height: 800 }, false]];
let problemas = 0;
const fila = (s) => console.log(s);

for (const url of pages()) {
  for (const [nombre, vp, mobile] of VIEWS) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const pg = await ctx.newPage();
    const errs = [], fallos = [];
    pg.on("pageerror", (e) => errs.push(e.message.slice(0, 100)));
    pg.on("requestfailed", (r) => { if (r.url().startsWith(`http://localhost:${PORT}`)) fallos.push(r.url()); });
    pg.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(`http://localhost:${PORT}`) && !/favicon/.test(r.url())) fallos.push(r.status() + " " + r.url().replace(`http://localhost:${PORT}`, "")); });
    const t0 = Date.now();
    await pg.goto(`http://localhost:${PORT}${url}`, { waitUntil: "load" }).catch((e) => errs.push("goto: " + e.message));
    const carga = Date.now() - t0;
    await pg.waitForTimeout(600);
    await pg.evaluate(async () => { document.documentElement.style.scrollBehavior = "auto"; for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => {
      const vw = innerWidth;
      const enlaces = [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h && !/^(https?:|mailto:|tel:|javascript:)/.test(h) && !h.startsWith("#") && !h.includes("${")))];
      const pequenos = [...document.querySelectorAll("a,button,summary,input,[role=button]")].filter((e) => { const b = e.getBoundingClientRect(), s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && (b.height < 44 || b.width < 44) && !(e.tagName === "A" && e.closest("p,li,span.fine,.fine")); }).length;
      const diminutos = [...document.querySelectorAll("body *")].filter((e) => { const s = getComputedStyle(e); return [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(s.fontSize) < 12 && s.display !== "none"; }).length;
      const imgs = [...document.images].map((i) => ({ src: i.currentSrc, ok: i.complete && i.naturalWidth > 0 }));
      return { sw: document.documentElement.scrollWidth, vw, enlaces, pequenos, diminutos, imgs };
    });
    const rotos = [];
    for (const h of r.enlaces) {
      const u = new URL(h, `http://localhost:${PORT}${url}`);
      const resp = await ctx.request.get(u.href.split("#")[0]).catch(() => null);
      if (!resp || resp.status() >= 400) rotos.push(h);
    }
    const pesadas = r.imgs.filter((i) => i.src.startsWith(`http://localhost:${PORT}`)).map((i) => ({ ...i, kb: (() => { try { return fs.statSync(path.join(ROOT, new URL(i.src).pathname)).size / 1024; } catch { return 0; } })() })).filter((i) => i.kb > 200);
    const imgRotas = r.imgs.filter((i) => !i.ok);
    const scroll = r.sw > r.vw;
    const grave = scroll || errs.length || rotos.length || fallos.length || imgRotas.length;
    if (grave) problemas++;
    const slug = (url === "/" ? "inicio" : url.replace(/^\/|\/$/g, "").replace(/\//g, "_")) + "-" + nombre;
    await pg.screenshot({ path: path.join(OUT, slug + ".png"), fullPage: true });
    fila(`${grave ? "⚠" : "✓"} ${url.padEnd(28)} ${nombre.padEnd(10)} ancho ${r.sw}/${r.vw}${scroll ? " SCROLL HORIZONTAL" : ""} · carga ${carga} ms${carga > 3000 ? " (lenta)" : ""} · táctiles<44: ${r.pequenos} · letra<12px: ${r.diminutos}${errs.length ? " · JS: " + errs.join("|") : ""}${rotos.length ? " · enlaces rotos: " + rotos.join(",") : ""}${fallos.length ? " · fallos: " + [...new Set(fallos)].join(",") : ""}${pesadas.length ? " · imágenes >200 KB: " + pesadas.map((i) => Math.round(i.kb) + " KB").join(",") : ""}${imgRotas.length ? " · imágenes sin cargar: " + imgRotas.length : ""}`);
    await ctx.close();
  }
}
await browser.close();
server.close();
fila(`\nCapturas en ${path.relative(process.cwd(), OUT) || OUT}. ${problemas ? problemas + " página(s) con problemas graves." : "Sin problemas graves."}`);
process.exit(problemas ? 1 : 0);
