---
name: revisar-web
description: Revisa la web PRSMITXEL en móvil (375 px) y escritorio (1280 px) con un navegador real: scroll horizontal, enlaces internos rotos, errores de JavaScript, zonas táctiles pequeñas, letra diminuta, peso de imágenes y tiempo de carga; y guarda capturas. Úsala antes de cada vista previa o publicación, o cuando pida "revisa la web".
---

# Revisar la web

## Qué hace
Levanta un servidor local con la carpeta de la web, abre **cada `index.html`** (portada, `/app/demo/`, cada `/p/<cliente>/`, páginas legales…) en dos tamaños y guarda capturas en `revision/`.

## Cómo se usa
1. Sitúate en la carpeta raíz de la web (la que tiene `index.html`, `p/` y `leeme.txt`).
2. Si no existe Playwright: `npm i -D playwright-core`. Usa el Chromium del sistema (`CHROMIUM_PATH`) o el de Playwright.
3. Ejecuta: `node .claude/skills/revisar-web/revisar.mjs . 8799`
4. Lee el resumen. Debe salir **sin ⚠** en: scroll horizontal, errores de JS y enlaces internos rotos.
5. Mira las capturas de `revision/` (al menos la portada en móvil y la app demo) antes de dar nada por bueno.

## Qué cuenta como problema (por orden)
1. Scroll horizontal a 375 px, errores de JavaScript, enlaces internos rotos, imágenes que no cargan.
2. Zonas táctiles de menos de 44 px en botones y enlaces que no estén dentro de un párrafo.
3. Letra de menos de 12 px; contraste bajo (revísalo a ojo en las capturas).
4. Imágenes de más de 200 KB o carga local superior a 3 s.

## Reglas
- Los enlaces externos (Tally, Calendly, correo) **no** se comprueban desde aquí: ábrelos a mano o dilo en el resumen.
- Las fuentes de Google pueden no cargar en entornos sin internet; no es un fallo de la web.
- No modifiques archivos de la web durante la revisión: solo informa. Los arreglos se proponen y se aplican con el OK de Mitxel.
- No subas `revision/` a Netlify ni a git (añádela al `.gitignore`).
