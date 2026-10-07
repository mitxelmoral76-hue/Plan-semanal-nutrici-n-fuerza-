/* Portada · demo "Prueba tu semana" (objetivo + peso + tipo de cada día → semana isométrica en 3D),
   apariciones al hacer scroll e inclinación suave del móvil. Sin librerías. Respeta prefers-reduced-motion.
   Rangos: consenso UEFA para fútbol 2021 y COI 2016 (hidratos por carga) e ISSN 2017 (proteína). Son orientativos. */
(() => {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const svgEl = (name, attrs = {}, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const r10 = (n) => Math.round(n / 10) * 10;
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function tween(from, to, ms, step) {
    if (RM || from === to) { step(to); return { cancel() {} }; }
    let raf, t0;
    const loop = (t) => {
      t0 = t0 ?? t;
      const k = Math.min(1, (t - t0) / ms);
      step(from + (to - from) * ease(k));
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return { cancel: () => cancelAnimationFrame(raf) };
  }

  /* Proyección isométrica */
  const makeIso = ({ ex, ey, ox, oy, zs }) => (x, y, z) => [ox + x * ex[0] + y * ey[0], oy + x * ex[1] + y * ey[1] - z * zs];
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  function boxFaces(P, x, y, z0, w, d, h) {
    return {
      top: pts([P(x, y, z0 + h), P(x + w, y, z0 + h), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)]),
      left: pts([P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x, y + d, z0 + h)]),
      right: pts([P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, z0 + h), P(x + w, y, z0 + h)]),
      topCenter: P(x + w / 2, y + d / 2, z0 + h),
    };
  }
  const setFaces = (g, f) => { g.top.setAttribute("points", f.top); g.left.setAttribute("points", f.left); g.right.setAttribute("points", f.right); };
  const makeBoxGroup = (parent, cls) => {
    const g = svgEl("g", { class: cls }, parent);
    return { g, left: svgEl("polygon", { class: "f-left" }, g), right: svgEl("polygon", { class: "f-right" }, g), top: svgEl("polygon", { class: "f-top" }, g) };
  };

  /* ---------- modelo de necesidades ---------- */
  const TYPES = [
    { n: "Descanso", s: "Desc.", load: 0, d: "Recuperar" },
    { n: "Entreno", s: "Entr.", load: 1, d: "Sesión de ~1 h" },
    { n: "Partido", s: "Part.", load: 3, d: "Competición de ~90 min" },
  ];
  const CHR = { 0: [3, 5], 1: [5, 7], 3: [6, 8] };                       // g de hidratos por kg
  const PRR = { salud: [1.2, 1.6], grasa: [1.8, 2.4], musculo: [1.6, 2.2], rend: [1.4, 2.0] }; // g de proteína por kg
  const CF = { salud: 1, grasa: 0.85, musculo: 1.05, rend: 1 };          // ajuste de energía por objetivo
  const mid = (a) => (a[0] + a[1]) / 2;
  function macros(kg, load, goal) {
    const c = mid(CHR[load]) * kg * CF[goal];
    const p = mid(PRR[goal]) * kg;
    const fMin = (((4 * c + 4 * p) / 0.8) * 0.2) / 9;                     // grasa ≥ 20 % de la energía
    const f = Math.max(kg * 1.0, fMin);
    return { c, p, f, kcal: 4 * c + 4 * p + 9 * f };
  }

  /* ---------- demo ---------- */
  function initDemo() {
    const host = $("#semana3d");
    if (!host) return;
    const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const LET = ["L", "M", "X", "J", "V", "S", "D"];
    const state = [1, 1, 0, 1, 0, 2, 0];                                   // ejemplo: partido el sábado
    let goal = "salud", kg = 70, sel = 5;

    const svg = svgEl("svg", { viewBox: "0 -44 500 392", class: "iso", "aria-hidden": "true", focusable: "false" }, host);
    const W = 44, GAP = 16, N = 7, DEPTH = 44, H = 560;
    const P = makeIso({ ex: [0.95, 0.3], ey: [-0.78, 0.6], ox: 92, oy: 168, zs: 240 / H });
    const widthAll = N * (W + GAP) - GAP;
    setFaces(makeBoxGroup(svg, "slab"), boxFaces(P, -18, -18, -12, widthAll + 36, DEPTH + 36, 12));
    for (let i = 0; i < N; i++) {
      const x = i * (W + GAP) + W / 2, a = P(x, -18, 0), b = P(x, DEPTH + 18, 0);
      svgEl("line", { class: "rail", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, svg);
    }
    const dayLbls = LET.map((l, i) => {
      const [x, y] = P(i * (W + GAP) + W / 2, DEPTH + 26, 0);
      const t = svgEl("text", { class: "daylbl", x: x.toFixed(1), y: (y + 4).toFixed(1) }, svg);
      t.textContent = l;
      return t;
    });
    const cur = state.map(() => 0);
    const bars = state.map(() => {
      const grp = makeBoxGroup(svg, "bar");
      const flag = svgEl("g", {}, grp.g);
      return { grp, flag, pole: svgEl("line", { class: "pole" }, flag), pennant: svgEl("polygon", { class: "pennant" }, flag) };
    });
    const tip = $("#tip"), chipsHost = $("#dchips"), sr = $("#semanaTxt"), msg = $("#msg"), typesHost = $("#types");

    const target = () => {
      const top = macros(kg, 3, goal).c * 1.05;
      return state.map((t) => (macros(kg, TYPES[t].load, goal).c / top) * H);
    };
    const draw = (i) => {
      const h = Math.max(6, cur[i]);
      const f = boxFaces(P, i * (W + GAP), 0, 0, W, DEPTH, h);
      setFaces(bars[i].grp, f);
      bars[i].grp.g.classList.toggle("rest", state[i] === 0);
      const match = state[i] === 2;
      bars[i].flag.style.display = match ? "" : "none";
      if (match) {
        const [tx, ty] = f.topCenter;
        bars[i].pole.setAttribute("x1", tx); bars[i].pole.setAttribute("y1", ty);
        bars[i].pole.setAttribute("x2", tx); bars[i].pole.setAttribute("y2", ty - 34);
        bars[i].pennant.setAttribute("points", `${tx},${ty - 34} ${tx + 22},${ty - 27} ${tx},${ty - 20}`);
      }
    };
    const tipPos = () => {
      const f = boxFaces(P, sel * (W + GAP), 0, 0, W, DEPTH, cur[sel]);
      const [tx, ty] = f.topCenter;
      tip.style.left = Math.min(86, Math.max(14, (tx / 500) * 100)) + "%";
      tip.style.top = ((ty + 44) / 392) * 100 - (state[sel] === 2 ? 8 : 3) + "%";
    };
    const tw = [];
    const animate = () => {
      const tg = target();
      state.forEach((_, i) => { tw[i] && tw[i].cancel(); tw[i] = tween(cur[i], tg[i], 600, (v) => { cur[i] = v; draw(i); if (i === sel) tipPos(); }); });
    };

    const text = () => {
      const m = state.map((t) => macros(kg, TYPES[t].load, goal));
      const t = TYPES[state[sel]], ms = m[sel];
      tip.innerHTML = `<b>${fmt(ms.c)} g</b><span>${DAYS[sel]} · ${t.n}</span>`;
      sr.textContent = DAYS.map((d, i) => `${d}: ${TYPES[state[i]].n}, ${fmt(m[i].c)} gramos de hidratos y ${fmt(r10(m[i].kcal))} kilocalorías`).join(". ");
      $$(".dchip", chipsHost).forEach((c, i) => {
        c.classList.toggle("sel", i === sel);
        c.dataset.t = state[i];
        $(".tn", c).textContent = TYPES[state[i]].s;
        c.setAttribute("aria-label", `${DAYS[i]}: ${TYPES[state[i]].n}. Pulsa para cambiarlo.`);
      });
      $$(".bar", svg).forEach((g, i) => g.classList.toggle("sel", i === sel));
      dayLbls.forEach((t, i) => t.classList.toggle("sel", i === sel));
      typesHost.innerHTML = TYPES.map((ty, k) => {
        const x = macros(kg, ty.load, goal);
        return `<div class="type${state[sel] === k ? " on" : ""}"><h3>${ty.n}</h3><div class="k">${fmt(r10(x.kcal))}<small>kcal</small></div><div class="d">${fmt(x.c)} g hidratos<br>${fmt(x.p)} g proteína</div></div>`;
      }).join("");
      const ks = m.map((x) => x.kcal), avg = ks.reduce((a, b) => a + b, 0) / 7, mx = Math.max(...ks), mn = Math.min(...ks);
      if (mx - mn < 50) {
        msg.innerHTML = "Toca algún día como <b>entreno</b> o <b>partido</b> y mira cómo cambia lo que tu cuerpo necesita.";
      } else {
        msg.innerHTML = `Tu semana pide entre <b>${fmt(r10(mn))} y ${fmt(r10(mx))} kcal</b> según el día. Una dieta genérica te daría unas <b>${fmt(r10(avg))} cada día</b>: te quedarías corto los días duros y te pasarías los de descanso.`;
      }
    };
    const refresh = () => { text(); tipPos(); };
    const pick = (i) => { sel = i; refresh(); };
    const cycle = (i) => { state[i] = (state[i] + 1) % TYPES.length; sel = i; text(); animate(); };

    LET.forEach((l, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "dchip";
      b.innerHTML = `<span class="dl">${l}</span><span class="mini"></span><span class="tn"></span>`;
      b.addEventListener("click", () => cycle(i));
      b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pick(i); });
      b.addEventListener("focus", () => pick(i));
      chipsHost.appendChild(b);
    });
    // las barras también se pueden pulsar (la vía accesible son los botones de día)
    svg.style.pointerEvents = "none";
    state.forEach((_, i) => {
      const h = svgEl("polygon", { class: "hit" }, svg);
      const f = boxFaces(P, i * (W + GAP) - 4, -4, 0, W + 8, DEPTH + 8, H);
      h.setAttribute("points", [f.left, f.right, f.top].join(" "));
      h.style.pointerEvents = "all";
      h.addEventListener("click", () => cycle(i));
      h.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pick(i); });
    });

    $$("#goal button").forEach((b) => b.addEventListener("click", () => {
      $$("#goal button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      goal = b.dataset.v; text(); animate();
    }));
    const kgIn = $("#kg"), kgOut = $("#kgOut");
    const setKg = () => { kg = +kgIn.value; kgOut.textContent = kg + " kg"; text(); animate(); };
    kgIn.addEventListener("input", setKg);
    kgOut.textContent = kg + " kg";

    state.forEach((_, i) => draw(i));
    text();
    const start = () => { host.classList.add("ready"); animate(); setTimeout(tipPos, RM ? 0 : 700); };
    if ("IntersectionObserver" in window && !RM) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.25 });
      io.observe(host);
    } else start();
  }

  /* ---------- apariciones ---------- */
  function initReveal() {
    const els = $$(".rv, #steps");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in", "lit")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.id === "steps") e.target.classList.add("lit"); io.unobserve(e.target); }
    }), { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    // seguridad: si por algo no se dispara, no dejamos contenido oculto
    setTimeout(() => els.forEach((e) => { if (!e.classList.contains("in") && !e.classList.contains("lit")) e.classList.add("in", "lit"); }), 4000);
  }

  /* ---------- móvil 3D ---------- */
  function initPhoneTilt() {
    const stage = $(".phone3d");
    if (!stage || RM || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const phone = $(".phone", stage);
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty("--ry", (-14 + x * 10).toFixed(2) + "deg");
      phone.style.setProperty("--rx", (4 - y * 8).toFixed(2) + "deg");
    });
    stage.addEventListener("pointerleave", () => { phone.style.removeProperty("--ry"); phone.style.removeProperty("--rx"); });
  }

  function initProgress() {
    const root = document.documentElement;
    const set = () => { const m = root.scrollHeight - innerHeight; root.style.setProperty("--p", m > 0 ? Math.min(1, scrollY / m).toFixed(3) : 0); };
    addEventListener("scroll", set, { passive: true }); addEventListener("resize", set); set();
  }

  const boot = () => { initDemo(); initReveal(); initPhoneTilt(); initProgress(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
