/* PRS alimentación&fuerza Mitxel · Recetas de comida real
   Sección "Recetas" de las apps. Datos nutricionales por 100 g (valores medios de tablas BEDCA/USDA,
   hidratos disponibles). Las kcal y los macros de cada receta se CALCULAN desde sus ingredientes.
   Las fotos van en assets/recetas/<id>.jpg; si no existe, se muestra la ilustración. */
(function () {
  "use strict";

  /* ---------- alimentos: p = proteína, c = hidratos, g = grasa (por 100 g) ---------- */
  const F = {
    pollo: { n: "pechuga de pollo", p: 23, c: 0, g: 2, grp: "pr" },
    pavo: { n: "pavo", p: 22, c: 0, g: 2, grp: "pr" },
    ternera: { n: "ternera magra", p: 21, c: 0, g: 5, grp: "pr" },
    merluza: { n: "merluza", p: 18, c: 0, g: 1, grp: "pr" },
    salmon: { n: "salmón", p: 20, c: 0, g: 12, grp: "pr", nota: "más grasa" },
    atun: { n: "atún al natural", p: 25, c: 0, g: 1, grp: "pr" },
    gambas: { n: "gambas", p: 20, c: 0, g: 1, grp: "pr" },
    huevo: { n: "huevo", p: 10.8, c: 0.8, g: 8.8, grp: "pr", unit: 53, nota: "más grasa" },
    claras: { n: "claras", p: 11, c: 0.7, g: 0.2, grp: "pr" },
    cottage: { n: "queso cottage", p: 11, c: 3.4, g: 4.3, grp: "pr" },
    skyr: { n: "skyr", p: 11, c: 4, g: 0.2, grp: "pr" },
    griego: { n: "yogur griego natural", p: 9, c: 4, g: 5, grp: "pr", nota: "más grasa" },
    patata: { n: "patata", p: 2, c: 18, g: 0.1, grp: "hc" },
    boniato: { n: "boniato", p: 1.6, c: 20, g: 0.1, grp: "hc" },
    arroz: { n: "arroz cocido", p: 2.7, c: 28, g: 0.3, grp: "hc", raw: 2.8 },
    lentejas: { n: "lentejas cocidas", p: 9, c: 20, g: 0.4, grp: "hc", nota: "más proteína" },
    garbanzos: { n: "garbanzos cocidos", p: 8.9, c: 27, g: 2.6, grp: "hc", nota: "más proteína" },
    avena: { n: "copos de avena", p: 13, c: 60, g: 7, grp: "hc", nota: "en crudo" },
    platano: { n: "plátano", p: 1, c: 23, g: 0.3, grp: "fr", ud: 120, u: ["plátano", "plátanos"] },
    manzana: { n: "manzana", p: 0.3, c: 12, g: 0.2, grp: "fr", ud: 150, u: ["manzana", "manzanas"] },
    naranja: { n: "naranja", p: 0.9, c: 9, g: 0.2, grp: "fr", ud: 150, u: ["naranja", "naranjas"] },
    kiwi: { n: "kiwi", p: 1, c: 9, g: 0.5, grp: "fr", ud: 80, u: ["kiwi", "kiwis"] },
    fresas: { n: "fresas", p: 0.7, c: 7.7, g: 0.3, grp: "fr" },
    pina: { n: "piña", p: 0.5, c: 12, g: 0.1, grp: "fr" },
    melon: { n: "melón", p: 0.8, c: 7, g: 0.2, grp: "fr" },
    arandanos: { n: "arándanos", p: 0.7, c: 12, g: 0.3, grp: "fr" },
    miel: { n: "miel", p: 0.3, c: 82, g: 0, grp: "x" },
    aove: { n: "AOVE", p: 0, c: 0, g: 100, grp: "gr" },
    aguacate: { n: "aguacate", p: 2, c: 9, g: 15, grp: "gr" },
    nueces: { n: "nueces", p: 15, c: 7, g: 65, grp: "gr", nota: "algo de proteína" },
    almendras: { n: "almendras", p: 21, c: 10, g: 50, grp: "gr", nota: "algo de proteína" },
    cacao: { n: "cacao puro en polvo", p: 22, c: 10, g: 11, grp: "x" },
    espinacas: { n: "espinacas", p: 2.9, c: 1.4, g: 0.4, grp: "v" },
    champi: { n: "champiñón", p: 3, c: 3, g: 0.3, grp: "v" },
    esparragos: { n: "espárragos trigueros", p: 2.2, c: 2, g: 0.2, grp: "v" },
    judias: { n: "judías verdes", p: 1.8, c: 4, g: 0.2, grp: "v" },
    brocoli: { n: "brócoli", p: 2.8, c: 4, g: 0.4, grp: "v" },
    calabacin: { n: "calabacín", p: 1.2, c: 2.5, g: 0.3, grp: "v" },
    pimiento: { n: "pimiento rojo", p: 1, c: 6, g: 0.3, grp: "v" },
    tomate: { n: "tomate", p: 1, c: 4, g: 0.2, grp: "v" },
    pepino: { n: "pepino", p: 0.7, c: 2, g: 0.1, grp: "v" },
    rucula: { n: "rúcula", p: 2.6, c: 2, g: 0.7, grp: "v" },
    canonigos: { n: "canónigos", p: 2, c: 1.5, g: 0.4, grp: "v" },
    remolacha: { n: "remolacha cocida", p: 1.7, c: 7, g: 0.2, grp: "v" },
    zanahoria: { n: "zanahoria", p: 0.9, c: 7, g: 0.2, grp: "v" },
    cebolla: { n: "cebolla", p: 1, c: 8, g: 0.1, grp: "v" },
    puerro: { n: "puerro", p: 1.5, c: 6, g: 0.3, grp: "v" },
  };
  const MAIN = { hc: "c", fr: "c", pr: "p", gr: "g" };
  const EQ = {
    hc: ["patata", "boniato", "arroz", "lentejas", "garbanzos", "avena"],
    fr: ["manzana", "naranja", "kiwi", "fresas", "pina", "melon", "platano"],
    pr: ["pollo", "pavo", "ternera", "merluza", "salmon", "atun", "gambas", "claras", "cottage", "skyr", "griego", "huevo"],
    gr: ["aove", "aguacate", "nueces", "almendras"],
  };
  const PRVEG = ["claras", "cottage", "skyr", "griego", "huevo"];
  const EGG = 53;
  /* ajustes por persona: PLAN.rcExclude (ids de recetas) y PLAN.rcSinAlimentos (alimentos que no se sugieren como cambio) */
  function cfg() {
    try { return { ex: (typeof PLAN !== "undefined" && PLAN.rcExclude) || [], noF: (typeof PLAN !== "undefined" && PLAN.rcSinAlimentos) || [] }; } catch (e) { return { ex: [], noF: [] }; }
  }

  /* ---------- recetas: s = D desayuno · C comida · M merienda · P pre-entreno · N cena ---------- */
  const S = { D: "Desayuno", C: "Comida", M: "Merienda", P: "Pre-entreno", N: "Cena" };
  const R = [
    { id: "d1", s: "D", n: "Tortilla de espinacas con boniato crujiente", veg: 1, ing: [["huevo", 2 * EGG], ["claras", 100], ["espinacas", 80], ["boniato", 200], ["aove", 5], ["naranja", 150]] },
    { id: "d2", s: "D", n: "Bol de cottage, avena tostada y frutos rojos", veg: 1, ing: [["cottage", 200], ["avena", 40], ["fresas", 100], ["arandanos", 50], ["nueces", 15]] },
    { id: "d3", s: "D", n: "Skyr de chocolate con plátano y almendras", veg: 1, ing: [["skyr", 250], ["cacao", 10], ["platano", 120], ["almendras", 15], ["avena", 30]] },
    { id: "d4", s: "D", n: "Revuelto de champiñón con patata al horno", veg: 1, ing: [["huevo", 3 * EGG], ["champi", 120], ["cebolla", 40], ["patata", 250], ["aove", 5], ["kiwi", 100]] },
    { id: "d5", s: "D", n: "Porridge de manzana y canela con yogur griego", veg: 1, ing: [["avena", 50], ["manzana", 150], ["griego", 150], ["nueces", 10], ["claras", 100]] },
    { id: "d6", s: "D", n: "Boniato relleno de cottage y huevo", veg: 1, ing: [["boniato", 250], ["cottage", 120], ["huevo", 2 * EGG], ["tomate", 100]] },
    { id: "c1", s: "C", n: "Pollo al pimentón con patata crujiente y rúcula", ing: [["pollo", 170], ["patata", 280], ["rucula", 40], ["tomate", 100], ["pepino", 60], ["aove", 10], ["naranja", 150]] },
    { id: "c2", s: "C", n: "Merluza al limón con boniato y judías verdes", ing: [["merluza", 230], ["boniato", 250], ["judias", 200], ["aove", 10], ["pina", 120]] },
    { id: "c3", s: "C", n: "Arroz con pavo, pimiento y calabacín al comino", ing: [["pavo", 160], ["arroz", 200], ["pimiento", 100], ["calabacin", 100], ["aove", 10], ["manzana", 150]] },
    { id: "c4", s: "C", n: "Ternera con cúrcuma, patata al horno y brócoli", ing: [["ternera", 150], ["patata", 250], ["brocoli", 200], ["aove", 10], ["fresas", 150]] },
    { id: "c5", s: "C", n: "Ensalada templada de lentejas y atún", ing: [["lentejas", 220], ["atun", 100], ["tomate", 100], ["pepino", 60], ["pimiento", 60], ["cebolla", 30], ["aove", 10], ["kiwi", 150]] },
    { id: "c6", s: "C", n: "Salmón al horno con boniato y espárragos", ing: [["salmon", 130], ["boniato", 230], ["esparragos", 150], ["aove", 5], ["melon", 150]] },
    { id: "c7", s: "C", n: "Garbanzos especiados con espinacas y huevo", veg: 1, ing: [["garbanzos", 180], ["espinacas", 100], ["huevo", 2 * EGG], ["tomate", 100], ["aove", 8], ["naranja", 150]] },
    { id: "m1", s: "M", n: "Cottage con piña y nueces", veg: 1, ing: [["cottage", 200], ["pina", 120], ["nueces", 15]] },
    { id: "m2", s: "M", n: "Yogur griego con frutos rojos y cacao", veg: 1, ing: [["griego", 170], ["fresas", 100], ["arandanos", 50], ["cacao", 8]] },
    { id: "m3", s: "M", n: "Huevos duros con tomate cherry y manzana", veg: 1, ing: [["huevo", 2 * EGG], ["tomate", 120], ["manzana", 150], ["claras", 60]] },
    { id: "p1", s: "P", n: "Plátano, skyr y miel", veg: 1, ing: [["platano", 130], ["skyr", 150], ["miel", 10]] },
    { id: "p2", s: "P", n: "Arroz blanco con pavo", ing: [["arroz", 220], ["pavo", 90], ["tomate", 80]] },
    { id: "p3", s: "P", n: "Avena cocida con plátano y canela", veg: 1, ing: [["avena", 50], ["platano", 110], ["claras", 120], ["miel", 8]] },
    { id: "n1", s: "N", n: "Revuelto de gambas y espárragos con patata", ing: [["huevo", 2 * EGG], ["gambas", 120], ["esparragos", 150], ["patata", 130], ["aove", 5], ["fresas", 120]] },
    { id: "n2", s: "N", n: "Merluza en papillote con verduras", ing: [["merluza", 200], ["calabacin", 120], ["zanahoria", 60], ["cebolla", 40], ["patata", 150], ["aove", 8], ["kiwi", 100]] },
    { id: "n3", s: "N", n: "Ensalada templada de pollo, espinacas y aguacate", ing: [["pollo", 140], ["espinacas", 80], ["tomate", 100], ["aguacate", 40], ["boniato", 150], ["melon", 150]] },
    { id: "n4", s: "N", n: "Pavo con canónigos, remolacha y cottage", ing: [["pavo", 140], ["canonigos", 50], ["remolacha", 100], ["cottage", 80], ["patata", 150], ["aove", 5], ["manzana", 120]] },
    { id: "n5", s: "N", n: "Tortilla de calabacín con ensalada y boniato", veg: 1, ing: [["huevo", 2 * EGG], ["claras", 100], ["calabacin", 150], ["cebolla", 50], ["tomate", 100], ["pepino", 60], ["boniato", 110], ["aove", 3], ["griego", 80]] },
    { id: "n6", s: "N", n: "Crema de calabacín con pollo desmenuzado", ing: [["calabacin", 250], ["puerro", 80], ["patata", 100], ["pollo", 130], ["aove", 8], ["cottage", 80], ["kiwi", 100]] },
  ];

  /* ---------- cálculo ---------- */
  function macros(r) {
    let p = 0, c = 0, g = 0;
    r.ing.forEach(([k, gr]) => { const f = F[k]; p += (f.p * gr) / 100; c += (f.c * gr) / 100; g += (f.g * gr) / 100; });
    return { p: Math.round(p), c: Math.round(c), g: Math.round(g), kcal: Math.round((p * 4 + c * 4 + g * 9) / 10) * 10 };
  }
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const half = (n) => { const w = Math.floor(n), h = n - w >= 0.5; return ((w ? String(w) : "") + (h ? "½" : "")) || "½"; };
  /* cantidad legible: huevos y fruta en piezas, arroz en crudo, el resto en gramos (r5 = redondeo a 5 g) */
  function qty(k, gr, r5) {
    const f = F[k];
    if (f.unit) { const n = Math.max(1, Math.round(gr / f.unit)); return n + " " + (n > 1 ? "huevos" : "huevo"); }
    if (f.ud) { const n = Math.max(0.5, Math.round((gr / f.ud) * 2) / 2); return half(n) + " " + (n <= 1 ? f.u[0] : f.u[1]); }
    if (f.raw) return fmt(Math.max(5, Math.round(gr / f.raw / 5) * 5)) + " g de arroz (en crudo)";
    return fmt(r5 && gr >= 20 ? Math.round(gr / 5) * 5 : Math.round(gr)) + " g de " + f.n;
  }
  const ingText = (k, gr) => qty(k, gr, false);
  /* alternativas con el mismo aporte del macro principal del grupo */
  function swaps(r) {
    const out = [];
    const used = new Set(r.ing.map((i) => i[0]));
    r.ing.forEach(([k, gr]) => {
      const f = F[k], grp = f.grp, main = MAIN[grp];
      if (!main || grp === "x") return;
      const base = (f[main] * gr) / 100;
      if (base < 2) return;
      let pool = EQ[grp].filter((x) => x !== k && !used.has(x) && !cfg().noF.includes(x));
      if (grp === "pr" && r.veg) pool = pool.filter((x) => PRVEG.includes(x));
      if (!pool.length) return;
      const off = (r.id.charCodeAt(1) + out.length) % pool.length;
      pool = pool.slice(off).concat(pool.slice(0, off));
      const pick = pool.slice(0, 3).map((x) => {
        const v = F[x];
        const g2 = (base / v[main]) * 100;
        const txt = qty(x, g2, true);
        return { t: txt, nota: v.nota || "" };
      });
      out.push({ de: ingText(k, gr), por: pick });
    });
    return out;
  }
  function group(grp, main, baseKey, baseG) {
    const base = (F[baseKey][main] * baseG) / 100;
    return EQ[grp].filter((x) => x !== baseKey && !cfg().noF.includes(x)).map((x) => {
      const v = F[x], g2 = (base / v[main]) * 100;
      return { k: x, n: v.n, t: qty(x, g2, true), nota: v.nota || "" };
    });
  }

  /* ---------- ilustraciones (vista cenital, estilo plano) ---------- */
  const a = (x, y, s, r, inner) => `<g transform="translate(${x} ${y}) rotate(${r || 0}) scale(${s || 1})">${inner}</g>`;
  const K = {
    wedge: (fill, st) => `<rect x="-17" y="-5.5" width="34" height="11" rx="5.5" fill="${fill}" stroke="${st}" stroke-width="1.2"/><circle cx="-6" cy="-1" r="1.4" fill="${st}" opacity=".5"/><circle cx="7" cy="1.5" r="1.2" fill="${st}" opacity=".5"/>`,
    meat: (fill, st) => `<rect x="-20" y="-8" width="40" height="16" rx="8" fill="${fill}" stroke="${st}" stroke-width="1.2"/><path d="M-12 -6l6 12M-3 -7l6 14M6 -6l6 12" stroke="${st}" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`,
    fish: () => `<path d="M-22 0C-14 -13 10 -14 22 -2 10 12-14 13-22 0z" fill="#F7EFE2" stroke="#DCCDB4" stroke-width="1.2"/><path d="M-10 -5q8 -3 16 0M-12 0q10 -3 20 0M-10 5q8 -2 16 0" stroke="#DCCDB4" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
    salmon: () => `<path d="M-24 0C-15 -14 12 -15 24 -3 12 13-15 14-24 0z" fill="#F08A6B" stroke="#D86244" stroke-width="1.2"/><path d="M-14 -7q8 4 14 -1M-16 -1q12 5 22 -1M-14 5q9 3 16 0" stroke="#FCD3C3" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    shrimp: () => `<path d="M-14 6C-18 -6-6 -14 6 -10 14 -8 16 2 10 8" fill="none" stroke="#F59A7B" stroke-width="9" stroke-linecap="round"/><path d="M-12 -2l5 3M-6 -8l5 4M2 -10l4 5" stroke="#D96A49" stroke-width="1.6" stroke-linecap="round"/>`,
    eggFried: () => `<path d="M-20 2C-24 -12-6 -20 8 -16 22 -12 26 4 14 12 4 18-16 16-20 2z" fill="#fff" stroke="#E6E2DA" stroke-width="1.2"/><circle cx="-1" cy="-1" r="8.5" fill="#F6B21B"/><circle cx="-4" cy="-4" r="2.6" fill="#FFE08A"/>`,
    eggHalf: () => `<ellipse rx="10" ry="13" fill="#fff" stroke="#E6E2DA" stroke-width="1.2"/><ellipse cy="1" rx="5" ry="6.5" fill="#F6B21B"/>`,
    tortilla: () => `<circle r="22" fill="#F4D77E" stroke="#D8B24F" stroke-width="1.4"/><circle cx="-8" cy="-6" r="2.6" fill="#7FB05B"/><circle cx="6" cy="-9" r="2.2" fill="#7FB05B"/><circle cx="9" cy="4" r="2.8" fill="#A9753C" opacity=".7"/><circle cx="-5" cy="8" r="2.2" fill="#7FB05B"/><circle cx="-12" cy="3" r="1.8" fill="#E8C060"/>`,
    leaves: () => `<ellipse cx="-10" cy="0" rx="11" ry="5.5" transform="rotate(-25 -10 0)" fill="#62A85B"/><ellipse cx="6" cy="-4" rx="11" ry="5.5" transform="rotate(20 6 -4)" fill="#7CC26C"/><ellipse cx="4" cy="8" rx="11" ry="5.5" transform="rotate(-8 4 8)" fill="#4F9650"/><path d="M-18 4L-2 -2M-2 -2L14 -8" stroke="#3E7A40" stroke-width="1" opacity=".6"/>`,
    tomato: () => `<circle r="7" fill="#E5484D"/><circle cx="-2.4" cy="-2.6" r="2" fill="#FF8C8C" opacity=".8"/><path d="M-2 -6l2 -2 2 2" stroke="#3E7A40" stroke-width="1.6" fill="none"/>`,
    cucumber: () => `<circle r="7" fill="#C5E09A" stroke="#7DAE52" stroke-width="1.5"/><circle r="4" fill="#E6F2C8"/><circle cx="-1" cy="-1" r=".9" fill="#9CC36B"/><circle cx="1.6" cy="1.4" r=".9" fill="#9CC36B"/>`,
    avocado: () => `<path d="M-14 6C-14 -8 -2 -16 8 -10 18 -4 16 12 4 14-6 15-14 12-14 6z" fill="#3E6B2A"/><path d="M-11 6C-11 -6-1 -13 7 -8 15 -3 13 10 3 12-5 12.5-11 10-11 6z" fill="#B7D95E"/><path d="M-9 6C-9 -4 -1 -10 6 -6 12 -2 10 8 3 10-4 10.5-9 9-9 6z" fill="#E4F0A8"/>`,
    avoPit: () => `<ellipse rx="15" ry="18" fill="#3E6B2A"/><ellipse rx="12.5" ry="15.5" fill="#B7D95E"/><ellipse rx="10" ry="13" fill="#E4F0A8"/><circle cy="3" r="6.5" fill="#8A5A36"/><circle cx="-2" cy="1" r="2" fill="#B98558"/>`,
    rice: () => Array.from({ length: 16 }, (_, i) => { const x = ((i * 7) % 26) - 13, y = ((i * 11) % 20) - 10; return `<ellipse cx="${x}" cy="${y}" rx="3.3" ry="1.6" transform="rotate(${(i * 37) % 90 - 45} ${x} ${y})" fill="#fff" stroke="#E6E2DA" stroke-width=".7"/>`; }).join(""),
    broccoli: () => `<path d="M-2 4h4v10h-4z" fill="#8FBF6A"/><circle cx="-8" cy="-2" r="8" fill="#4E9A4C"/><circle cx="8" cy="-3" r="8" fill="#5FAF57"/><circle cx="0" cy="-9" r="8" fill="#4E9A4C"/><circle cx="0" cy="0" r="8" fill="#63B25A"/>`,
    beans: () => `<path d="M-18 -6q18 -6 36 0M-18 0q18 -6 36 0M-18 6q18 -6 36 0M-16 12q16 -5 32 0" fill="none" stroke="#5CA35A" stroke-width="3.6" stroke-linecap="round"/>`,
    asparagus: () => `<path d="M-22 -8l40 -4M-22 -1l40 -3M-22 6l40 -2" stroke="#6DB05F" stroke-width="4.4" stroke-linecap="round"/><path d="M14 -13l6 -1M14 -7l6 0M14 0l6 -1" stroke="#3E7A40" stroke-width="5" stroke-linecap="round"/>`,
    zucchini: () => `<circle r="7" fill="#9CCB6B" stroke="#6FA444" stroke-width="1.4"/><circle r="4.4" fill="#E2F0C4"/><circle cx="-1.2" cy="-1" r=".8" fill="#BBD795"/><circle cx="1.6" cy="1.2" r=".8" fill="#BBD795"/>`,
    mushroom: () => `<path d="M-9 2C-9 -8 9 -8 9 2z" fill="#B98B64" stroke="#8F6443" stroke-width="1.2"/><rect x="-3" y="2" width="6" height="8" rx="2" fill="#F3E7D6" stroke="#D9C7AE" stroke-width="1"/>`,
    onion: () => `<ellipse rx="10" ry="6" fill="none" stroke="#E5D3F0" stroke-width="2.4"/><ellipse rx="6" ry="3.4" fill="none" stroke="#D5BCE6" stroke-width="2"/>`,
    beet: () => `<circle r="7.5" fill="#B5376B" stroke="#8C2552" stroke-width="1.2"/><circle r="4" fill="#C8507F"/>`,
    carrot: () => `<circle r="6" fill="#F0922F" stroke="#C86F16" stroke-width="1.2"/><circle r="2.2" fill="#F8B968"/>`,
    lentils: () => Array.from({ length: 26 }, (_, i) => { const x = ((i * 13) % 34) - 17, y = ((i * 7) % 24) - 12; return `<circle cx="${x}" cy="${y}" r="2.6" fill="${i % 3 ? "#9A6B3A" : "#B98A4C"}"/>`; }).join(""),
    chickpeas: () => Array.from({ length: 22 }, (_, i) => { const x = ((i * 13) % 34) - 17, y = ((i * 7) % 24) - 12; return `<circle cx="${x}" cy="${y}" r="3.2" fill="${i % 3 ? "#E8C37A" : "#D9AE58"}"/>`; }).join(""),
    berries: () => `<circle cx="-8" cy="-3" r="4" fill="#C2185B"/><circle cx="0" cy="3" r="4" fill="#6A3FA0"/><circle cx="8" cy="-2" r="4" fill="#C2185B"/><circle cx="-2" cy="-8" r="3.6" fill="#6A3FA0"/><circle cx="10" cy="7" r="3.4" fill="#C2185B"/>`,
    strawberry: () => `<path d="M0 9C-9 3-9 -6 0 -7 9 -6 9 3 0 9z" fill="#E5484D"/><path d="M-4 -8l4 -3 4 3" fill="#4F9650"/><circle cx="-2" cy="-1" r=".8" fill="#FFD0D0"/><circle cx="2" cy="2" r=".8" fill="#FFD0D0"/>`,
    banana: () => `<circle r="7.5" fill="#F7DA55" stroke="#D9B62E" stroke-width="1.2"/><circle r="2" fill="#F1C93C"/>`,
    apple: () => `<path d="M-9 4C-9 -8 9 -8 9 4 9 8 -9 8 -9 4z" fill="#F4F1C4" stroke="#C94A3A" stroke-width="2.2"/><circle cx="0" cy="0" r="1.2" fill="#8A5A36"/>`,
    orange: () => `<path d="M-11 4a11 11 0 0 1 22 0z" fill="#F5A43A" stroke="#D97F14" stroke-width="1.4"/><path d="M0 4L-6 -4M0 4V-6M0 4l6 -8" stroke="#FFD9A0" stroke-width="1"/>`,
    kiwi: () => `<circle r="8" fill="#9BC53D" stroke="#6E9426" stroke-width="1.2"/><circle r="5.6" fill="#DCE9A0"/><circle r="1.8" fill="#FFFBD0"/><circle cx="-3.4" cy="0" r=".7" fill="#2B2B2B"/><circle cx="3.4" cy="0" r=".7" fill="#2B2B2B"/><circle cx="0" cy="-3.4" r=".7" fill="#2B2B2B"/><circle cx="0" cy="3.4" r=".7" fill="#2B2B2B"/>`,
    pine: () => `<rect x="-6.5" y="-6.5" width="13" height="13" rx="3" fill="#F7D154" stroke="#D9AE2A" stroke-width="1.2"/>`,
    melon: () => `<rect x="-6.5" y="-6.5" width="13" height="13" rx="3" fill="#F8B883" stroke="#E08F55" stroke-width="1.2"/>`,
    walnut: () => `<ellipse rx="5" ry="4" fill="#B58A5B" stroke="#8E6840" stroke-width="1"/><path d="M-4 0q4 -3 8 0" stroke="#8E6840" stroke-width=".9" fill="none"/>`,
    almond: () => `<ellipse rx="3.2" ry="5.2" fill="#C9A26F" stroke="#9E7A49" stroke-width=".9"/>`,
    oats: () => Array.from({ length: 18 }, (_, i) => { const x = ((i * 9) % 28) - 14, y = ((i * 5) % 18) - 9; return `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.5" transform="rotate(${(i * 53) % 180} ${x} ${y})" fill="#D9C29A"/>`; }).join(""),
    boniato: () => `<ellipse rx="22" ry="11" fill="#D97A2F" stroke="#B85E1A" stroke-width="1.4"/><ellipse rx="18" ry="7.5" fill="#F3A04F"/>`,
    cocoa: () => Array.from({ length: 9 }, (_, i) => `<circle cx="${((i * 7) % 18) - 9}" cy="${((i * 5) % 12) - 6}" r="1.1" fill="#4A2C1D"/>`).join(""),
    swirl: (c) => `<path d="M-12 0q6 -8 12 0t12 0" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    dots: (c, n) => Array.from({ length: n }, (_, i) => `<circle cx="${((i * 11) % 30) - 15}" cy="${((i * 7) % 22) - 11}" r="2.2" fill="${c}"/>`).join(""),
  };
  const PLATE = `<ellipse cx="124" cy="100" rx="76" ry="70" fill="#000" opacity=".10"/><circle cx="120" cy="92" r="74" fill="#fff"/><circle cx="120" cy="92" r="62" fill="none" stroke="#EDEAE3" stroke-width="2"/><!--base-->`;
  const bowl = (fill, extra) => `<ellipse cx="124" cy="100" rx="70" ry="64" fill="#000" opacity=".10"/><circle cx="120" cy="92" r="68" fill="#F4EFE4"/><circle cx="120" cy="92" r="58" fill="#E9E1D2"/><circle cx="120" cy="92" r="52" fill="${fill}"/><!--base-->${extra || ""}`;
  const W = (x, y, s, r, k, ...args) => a(x, y, s, r, typeof k === "function" ? k(...args) : k);
  const T = "#E9E0CF";
  const ART = {
    d1: () => PLATE + W(84, 88, 1.15, -28, K.wedge, "#E98B3A", "#C26A1E") + W(92, 110, 1.15, 14, K.wedge, "#E98B3A", "#C26A1E") + W(76, 70, 1.05, 34, K.wedge, "#E98B3A", "#C26A1E") + W(140, 84, 1.35, 6, K.tortilla) + W(152, 112, 1, 8, K.orange),
    d2: () => bowl("#FBFAF5", K.dots("#E8DCC0", 0)) + W(120, 92, 1.3, 0, K.dots, "#F1ECDD", 14) + W(106, 82, 1, 10, K.oats) + W(134, 84, 1, 0, K.strawberry) + W(118, 104, 1, 0, K.strawberry) + W(104, 100, 1, 0, K.berries) + W(138, 100, 1, 0, K.walnut) + W(126, 76, 1, 30, K.walnut),
    d3: () => bowl("#7C4F3B") + W(120, 92, 1.6, 0, K.swirl, "#9A6A52") + W(104, 84, 1, 0, K.banana) + W(120, 78, 1, 0, K.banana) + W(136, 86, 1, 0, K.banana) + W(112, 102, 1, 40, K.almond) + W(130, 104, 1, -30, K.almond) + W(122, 92, 1.1, 0, K.cocoa),
    d4: () => PLATE + W(94, 90, 1.25, 0, K.dots, "#F6D25C", 12) + W(96, 88, 1, 0, K.mushroom) + W(108, 104, 1, 20, K.mushroom) + W(86, 104, 1, -20, K.onion) + W(148, 76, 1.05, 18, K.wedge, "#E9C46A", "#C9962F") + W(156, 98, 1.05, -20, K.wedge, "#E9C46A", "#C9962F") + W(140, 118, 1.05, 32, K.wedge, "#E9C46A", "#C9962F") + W(112, 124, 1.1, 0, K.kiwi),
    d5: () => bowl("#E8D7B2") + W(112, 92, 1.3, 0, K.dots, "#F4F1EA", 10) + W(130, 84, 1.2, 0, K.apple) + W(112, 106, 1.2, 140, K.apple) + W(132, 104, 1, 0, K.walnut) + W(104, 80, 1, 40, K.walnut) + W(120, 92, 1.2, 0, K.swirl, "#C99A5B"),
    d6: () => PLATE + W(118, 96, 1.6, -12, K.boniato) + W(114, 94, 1.15, -12, K.dots, "#FAF8F1", 12) + W(132, 88, 0.9, 0, K.eggHalf) + W(108, 104, 0.9, 0, K.tomato) + W(100, 116, 1, 0, K.leaves),
    c1: () => PLATE + W(112, 88, 1.35, -14, K.meat, "#F1D3A4", "#C99863") + W(116, 108, 1.25, 10, K.meat, "#F1D3A4", "#C99863") + W(166, 80, 1.1, 18, K.wedge, "#E9C46A", "#C9962F") + W(172, 100, 1.1, -14, K.wedge, "#E9C46A", "#C9962F") + W(160, 120, 1.1, 30, K.wedge, "#E9C46A", "#C9962F") + W(78, 74, 1.2, -40, K.leaves) + W(72, 96, 0.9, 0, K.tomato) + W(82, 110, 0.9, 0, K.cucumber),
    c2: () => PLATE + W(98, 90, 1.5, -10, K.fish) + W(150, 78, 1.1, 10, K.beans) + W(148, 112, 1.3, 0, K.boniato) + W(148, 112, 0.9, 0, K.dots, "#F7C58A", 8) + W(84, 122, 1, 0, K.pine) + W(98, 126, 1, 0, K.pine),
    c3: () => PLATE + W(112, 92, 1.7, 0, K.rice) + W(112, 92, 1.2, 0, K.dots, "#fff", 0) + W(100, 84, 1, 30, K.meat, "#F3DEC4", "#C9A67D") + W(126, 100, 1, -20, K.meat, "#F3DEC4", "#C9A67D") + W(100, 104, 0.9, 0, K.tomato) + W(130, 80, 0.9, 0, K.zucchini) + W(118, 120, 0.9, 0, K.zucchini) + W(86, 92, 0.9, 0, K.tomato) + W(156, 120, 1.2, 0, K.apple),
    c4: () => PLATE + W(96, 92, 1.3, -24, K.meat, "#8A4B3A", "#5F2E22") + W(104, 112, 1.2, 10, K.meat, "#8A4B3A", "#5F2E22") + W(156, 78, 1.1, 18, K.wedge, "#E9C46A", "#C9962F") + W(160, 100, 1.1, -14, K.wedge, "#E9C46A", "#C9962F") + W(150, 122, 1.1, 30, K.wedge, "#E9C46A", "#C9962F") + W(132, 70, 1.1, 0, K.broccoli) + W(84, 70, 1, 0, K.broccoli) + W(74, 112, 1, 0, K.strawberry) + W(84, 122, 1, 0, K.strawberry),
    c5: () => bowl("#CFA76A") + W(120, 92, 1.7, 0, K.lentils) + W(104, 84, 1, 20, K.meat, "#E8B8A0", "#C98A73") + W(130, 98, 1, -20, K.meat, "#E8B8A0", "#C98A73") + W(112, 104, 0.9, 0, K.tomato) + W(132, 80, 0.9, 0, K.cucumber) + W(100, 100, 0.9, 0, K.tomato) + W(120, 72, 1, 0, K.onion) + W(148, 104, 1, 0, K.kiwi),
    c6: () => PLATE + W(96, 90, 1.5, -10, K.salmon) + W(152, 76, 1.15, 10, K.asparagus) + W(148, 112, 1.25, 0, K.boniato) + W(148, 112, 0.9, 0, K.dots, "#F7C58A", 8) + W(84, 122, 1, 0, K.melon) + W(98, 126, 1, 0, K.melon),
    c7: () => bowl("#E8C37A") + W(120, 92, 1.7, 0, K.chickpeas) + W(104, 100, 1.2, 20, K.leaves) + W(136, 84, 1.1, -20, K.leaves) + W(122, 84, 1.05, 0, K.eggFried) + W(108, 82, 0.9, 0, K.tomato) + W(138, 106, 0.9, 0, K.tomato) + W(162, 122, 1.2, 0, K.orange),
    m1: () => bowl("#FBFAF5") + W(120, 92, 1.3, 0, K.dots, "#EFEAD9", 14) + W(104, 84, 1, 0, K.pine) + W(118, 76, 1, 0, K.pine) + W(134, 88, 1, 0, K.pine) + W(114, 104, 1, 10, K.walnut) + W(132, 106, 1, -10, K.walnut) + W(124, 94, 1, 0, K.cocoa),
    m2: () => bowl("#FBF8F1") + W(120, 92, 1.6, 0, K.swirl, "#EDE6D4") + W(104, 86, 1, 0, K.strawberry) + W(124, 76, 1, 0, K.strawberry) + W(136, 92, 1, 0, K.berries) + W(112, 106, 1, 0, K.berries) + W(122, 94, 1.3, 0, K.cocoa),
    m3: () => PLATE + W(104, 88, 1.15, 0, K.eggHalf) + W(124, 92, 1.15, 0, K.eggHalf) + W(112, 112, 0.9, 0, K.tomato) + W(130, 116, 0.9, 0, K.tomato) + W(100, 74, 0.9, 0, K.tomato) + W(160, 84, 1.3, 0, K.apple) + W(160, 108, 1.3, 140, K.apple),
    p1: () => bowl("#F6F1E4") + W(120, 92, 1.5, 0, K.swirl, "#E9E1CE") + W(104, 84, 1.05, 0, K.banana) + W(122, 76, 1.05, 0, K.banana) + W(138, 90, 1.05, 0, K.banana) + W(114, 106, 1.05, 0, K.banana) + W(124, 96, 1, 0, K.dots, "#E9B949", 4),
    p2: () => PLATE + W(108, 96, 1.7, 0, K.rice) + W(132, 82, 1.2, -20, K.meat, "#F3DEC4", "#C9A67D") + W(136, 106, 1.1, 14, K.meat, "#F3DEC4", "#C9A67D") + W(86, 112, 0.9, 0, K.tomato) + W(94, 76, 0.9, 0, K.tomato),
    p3: () => bowl("#E8D7B2") + W(112, 92, 1.3, 0, K.dots, "#F4F1EA", 10) + W(104, 86, 1, 0, K.banana) + W(120, 78, 1, 0, K.banana) + W(136, 90, 1, 0, K.banana) + W(116, 106, 1, 0, K.banana) + W(124, 96, 1.2, 0, K.swirl, "#C99A5B") + W(126, 94, 1, 0, K.cocoa),
    n1: () => PLATE + W(100, 88, 1.3, 0, K.dots, "#F6D25C", 12) + W(94, 76, 1, -20, K.shrimp) + W(112, 100, 1, 10, K.shrimp) + W(84, 102, 1, 30, K.shrimp) + W(150, 78, 1.1, 10, K.asparagus) + W(146, 112, 1.05, 18, K.wedge, "#E9C46A", "#C9962F") + W(160, 122, 1.05, -14, K.wedge, "#E9C46A", "#C9962F") + W(112, 124, 1, 0, K.strawberry) + W(126, 126, 1, 0, K.strawberry),
    n2: () => PLATE + W(104, 88, 1.4, -10, K.fish) + W(140, 76, 1, 0, K.zucchini) + W(158, 88, 1, 0, K.zucchini) + W(142, 100, 0.9, 0, K.carrot) + W(160, 110, 0.9, 0, K.carrot) + W(84, 110, 1.1, 0, K.onion) + W(112, 118, 1.2, 18, K.wedge, "#F3D47A", "#D9B04A") + W(132, 126, 1.2, -14, K.wedge, "#F3D47A", "#D9B04A") + W(84, 76, 1, 0, K.kiwi),
    n3: () => PLATE + W(108, 92, 1.5, 0, K.leaves) + W(96, 80, 1.3, -20, K.meat, "#F1D3A4", "#C99863") + W(128, 104, 1.2, 10, K.meat, "#F1D3A4", "#C99863") + W(150, 84, 1, 0, K.avocado) + W(160, 100, 1, 40, K.avocado) + W(84, 108, 0.9, 0, K.tomato) + W(130, 70, 0.9, 0, K.tomato) + W(112, 124, 1.15, 0, K.melon) + W(130, 126, 1.15, 0, K.melon),
    n4: () => PLATE + W(98, 92, 1.3, -14, K.meat, "#F3DEC4", "#C9A67D") + W(146, 78, 1.1, 0, K.leaves) + W(160, 98, 1, 0, K.beet) + W(146, 104, 1, 0, K.beet) + W(150, 120, 1, 0, K.dots, "#F8F6EE", 8) + W(84, 122, 1.05, 18, K.wedge, "#E9C46A", "#C9962F") + W(106, 128, 1.05, -14, K.wedge, "#E9C46A", "#C9962F") + W(84, 70, 1, 0, K.apple),
    n5: () => PLATE + W(106, 88, 1.6, 0, K.tortilla) + W(156, 76, 0.9, 0, K.tomato) + W(170, 90, 0.9, 0, K.tomato) + W(158, 100, 0.9, 0, K.cucumber) + W(146, 116, 1.2, 0, K.boniato) + W(146, 116, 0.8, 0, K.dots, "#F7C58A", 8) + W(92, 122, 1, 0, K.dots, "#F8F6EE", 8),
    n6: () => bowl("#A5CE6B") + W(120, 92, 1.6, 0, K.swirl, "#C7E594") + W(108, 86, 1, 24, K.meat, "#F1D3A4", "#C99863") + W(132, 98, 1, -24, K.meat, "#F1D3A4", "#C99863") + W(120, 108, 1, 0, K.dots, "#F8F6EE", 8) + W(138, 80, 0.9, 0, K.kiwi),
  };
  const BGC = { D: ["#F1E4C8", "#E9D3A8"], C: ["#E6E2D4", "#D6D1BF"], M: ["#F1DDD2", "#E9C9B9"], P: ["#F3E9BE", "#EBD994"], N: ["#D9E4E2", "#C3D4D1"] };
  function art(r) {
    const c = BGC[r.s];
    const uid = "g" + r.id;
    return `<svg viewBox="0 0 240 180" role="img" aria-label="${r.n}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="240" height="180" fill="url(#${uid})"/><path d="M0 40h240M0 90h240M0 140h240" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>${(() => { const x = ART[r.id]().split("<!--base-->"); return x[0] + `<g transform="translate(120 92) scale(1.26) translate(-120 -92)">${x[1]}</g>`; })()}</svg>`;
  }

  /* ---------- interfaz de la sección "Recetas" (usa las variables de color de la app) ---------- */
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CSS = `
.rc-top{display:flex;flex-direction:column;gap:10px}
.rc-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.rc-head span{font-size:12.5px;color:var(--muted);font-weight:600}
.rc-filters{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin:0 -16px;padding-inline:16px}
.rc-filters::-webkit-scrollbar{display:none}
.rc-f{flex:0 0 auto;min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);font-weight:700;font-size:13.5px;color:var(--ink)}
.rc-f[aria-pressed="true"]{background:var(--brand);border-color:var(--brand);color:var(--brand-ink)}
.rc-f.veg[aria-pressed="true"]{background:var(--green);border-color:var(--green);color:var(--brand-ink)}
.rc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:4px}
.rc-card{display:flex;flex-direction:column;text-align:left;background:var(--surface);border-radius:20px;box-shadow:var(--shadow);overflow:hidden;padding:0;transition:transform .18s}
.rc-card:active{transform:scale(.98)}
.rc-img{position:relative;display:block;aspect-ratio:4/3;background:var(--surface-2);overflow:hidden}
.rc-img svg,.rc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.rc-tag{position:absolute;left:8px;top:8px;z-index:2;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#14201C}
.rc-veg{position:absolute;right:8px;top:8px;z-index:2;width:22px;height:22px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:800}
.rc-body{display:flex;flex-direction:column;gap:5px;padding:10px 12px 13px}
.rc-name{font-family:var(--f-display);font-weight:600;font-size:14.5px;line-height:1.2;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.rc-kcal{font-family:var(--f-display);font-weight:800;font-size:19px;color:var(--amber-ink);line-height:1}
.rc-kcal small{font-family:var(--f-body);font-size:12px;font-weight:600;color:var(--muted);margin-left:3px}
.rc-mac{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:3px;padding-top:8px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.rc-mac span{display:flex;flex-direction:column;line-height:1.15}
.rc-mac b{font-size:13.5px;font-weight:800}
.rc-mac i{font-style:normal;font-size:11px;font-weight:600;color:var(--muted)}
.rc-mac .mp b{color:var(--brand)} .rc-mac .mh b{color:var(--amber-ink)} .rc-mac .mg b{color:var(--green)}
.rc-eq{background:var(--surface);border-radius:18px;box-shadow:var(--shadow);padding:0 16px}
.rc-eq summary{list-style:none;cursor:pointer;min-height:48px;display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:14.5px}
.rc-eq summary::-webkit-details-marker{display:none}
.rc-eq summary::after{content:"+";font-size:22px;color:var(--amber-ink);transition:transform .2s}
.rc-eq[open] summary::after{transform:rotate(45deg)}
.rc-eqg{padding:2px 0 14px;border-top:1px solid var(--line)}
.rc-eqg h4{margin:12px 0 8px;font-size:13.5px;color:var(--brand)}
.rc-eqg .chips{gap:6px}
.rc-eqg .chip{font-weight:600;font-size:12.5px}
.rc-eqg .chip.base{background:var(--brand);color:var(--brand-ink)}
.rc-back{position:fixed;inset:0;z-index:30;background:rgba(10,18,20,.55);width:100%;border-radius:0;animation:rcfade .2s both}
.rc-panel{position:fixed;left:50%;bottom:0;z-index:31;width:min(560px,100%);max-height:92vh;overflow-y:auto;transform:translateX(-50%);background:var(--bg);border-radius:26px 26px 0 0;padding:0 16px calc(24px + env(safe-area-inset-bottom));animation:rcup .28s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 -10px 40px rgba(0,0,0,.25)}
.rc-hero{position:relative;aspect-ratio:4/3;margin:0 -16px;background:var(--surface-2);overflow:hidden;border-radius:26px 26px 0 0}
.rc-hero svg,.rc-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.rc-x{position:absolute;right:12px;top:12px;z-index:3;width:44px;height:44px;border-radius:50%;background:rgba(20,32,28,.72);color:#fff;font-size:26px;line-height:1;display:grid;place-items:center}
.rc-sec{display:flex;flex-direction:column;gap:10px;padding-top:14px}
.rc-sec h2{font-size:22px;line-height:1.1}
.rc-sec h3{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:10px 0 2px}
.rc-ing{list-style:none;margin:0;padding:0}
.rc-ing li{padding:9px 0;border-top:1px solid var(--line);font-size:15px}
.rc-ing li:first-child{border-top:0}
.rc-sw{background:var(--surface);border-radius:14px;padding:11px 13px;font-size:14px;display:flex;flex-direction:column;gap:6px}
.rc-sw b{font-size:14px}
.rc-sw ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px;color:var(--muted)}
.rc-sw li::before{content:"≈ ";color:var(--amber-ink);font-weight:800}
.rc-sw em{font-style:normal;font-size:12px;color:var(--amber-ink);font-weight:700;margin-left:4px}
@keyframes rcup{from{transform:translate(-50%,40px);opacity:.001}to{transform:translate(-50%,0);opacity:1}}
@keyframes rcfade{from{opacity:0}to{opacity:1}}
@media (min-width:520px){.rc-name{font-size:16px}}
`;
  let cssDone = false;
  function ensureCss() {
    if (cssDone) return; cssDone = true;
    const st = document.createElement("style"); st.id = "rc-css"; st.textContent = CSS; document.head.appendChild(st);
  }
  const PHOTO = "../../assets/recetas/";
  const pic = (r) => `${art(r)}<img src="${PHOTO}${r.id}.jpg" alt="${esc(r.n)}" loading="lazy" onerror="this.remove()">`;
  function card(r) {
    const m = macros(r);
    return `<button class="rc-card" data-rc="${r.id}" aria-label="${esc(r.n)}, ${m.kcal} kcal"><span class="rc-img">${pic(r)}<span class="rc-tag">${S[r.s]}</span>${r.veg ? '<span class="rc-veg" title="Vegetariana" aria-label="Vegetariana">V</span>' : ""}</span><span class="rc-body"><span class="rc-name">${esc(r.n)}</span><span class="rc-kcal">${fmt(m.kcal)}<small>kcal</small></span><span class="rc-mac"><span class="mp"><b>${m.p} g</b><i>Prot.</i></span><span class="mh"><b>${m.c} g</b><i>Hidr.</i></span><span class="mg"><b>${m.g} g</b><i>Grasa</i></span></span></span></button>`;
  }
  function eqHtml() {
    const blk = (t, grp, main, key, g, baseLbl) =>
      `<div class="rc-eqg"><h4>${t}</h4><div class="chips"><span class="chip base">${baseLbl}</span>${group(grp, main, key, g).map((x) => `<span class="chip">${x.t}${x.nota ? " · " + x.nota : ""}</span>`).join("")}</div></div>`;
    return `<details class="rc-eq"><summary>Tabla de equivalencias</summary>${blk("Hidratos · misma cantidad que…", "hc", "c", "arroz", 100, "35 g de arroz (en crudo)")}${blk("Fruta · misma cantidad que…", "fr", "c", "manzana", 100, "100 g manzana")}${blk("Proteína · misma cantidad que…", "pr", "p", "pollo", 100, "100 g pechuga de pollo")}${blk("Grasa · misma cantidad que…", "gr", "g", "aove", 10, "10 g AOVE")}</details>`;
  }
  function list(filter, veg) {
    ensureCss();
    const items = R.filter((r) => !cfg().ex.includes(r.id) && (filter === "all" || r.s === filter) && (!veg || r.veg));
    const flt = [["all", "Todas"], ["D", "Desayuno"], ["C", "Comida"], ["M", "Merienda"], ["P", "Pre-entreno"], ["N", "Cena"]]
      .map(([k, t]) => `<button class="rc-f" data-rcf="${k}" aria-pressed="${filter === k}">${t}</button>`).join("") +
      `<button class="rc-f veg" data-rcv="1" aria-pressed="${!!veg}">Vegetariana</button>`;
    return `<div class="view rc-top"><div class="rc-head"><h2>Recetas</h2><span>${items.length} ${items.length === 1 ? "opción" : "opciones"}</span></div><div class="rc-filters" role="group" aria-label="Filtrar recetas">${flt}</div>${eqHtml()}<div class="rc-grid">${items.map(card).join("") || '<p class="muted">Sin recetas con este filtro.</p>'}</div></div>`;
  }
  function detail(id) {
    const r = R.find((x) => x.id === id); if (!r) return "";
    ensureCss();
    const m = macros(r);
    const sw = swaps(r);
    return `<button class="rc-back" data-rcx="1" aria-label="Cerrar receta"></button><div class="rc-panel" role="dialog" aria-modal="true" aria-label="${esc(r.n)}"><div class="rc-hero">${pic(r)}<button class="rc-x" data-rcx="1" aria-label="Cerrar receta">×</button></div><div class="rc-sec"><div class="chips"><span class="chip">${S[r.s]}</span>${r.veg ? '<span class="chip baja">Vegetariana</span>' : ""}</div><h2>${esc(r.n)}</h2><div class="macros"><div class="m kcal"><b>${fmt(m.kcal)}</b><span>kcal</span></div><div class="m"><b>${m.p} g</b><span>Proteína</span></div><div class="m"><b style="color:var(--amber-ink)">${m.c} g</b><span>Hidratos</span></div><div class="m"><b style="color:var(--green)">${m.g} g</b><span>Grasa</span></div></div><h3>Ingredientes</h3><ul class="rc-ing">${r.ing.map(([k, g]) => `<li>${esc(ingText(k, g))}</li>`).join("")}</ul>${sw.length ? "<h3>Cambios</h3>" + sw.map((s) => `<div class="rc-sw"><b>${esc(s.de)}</b><ul>${s.por.map((p) => `<li>${esc(p.t)}${p.nota ? `<em>${esc(p.nota)}</em>` : ""}</li>`).join("")}</ul></div>`).join("") : ""}</div></div>`;
  }

  window.RECETAS = { F, R, S, macros, ingText, swaps, group, art, fmt, EQ, list, detail };
})();
