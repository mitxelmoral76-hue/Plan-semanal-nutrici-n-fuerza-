---
name: publicar
description: Prepara la web PRS Mitxel para publicarla en Cloudflare Pages (proyecto prsnutricionyfuerza, subida arrastrando la carpeta o el zip) en dos pasos - primero vista previa, y producción solo cuando Mitxel diga "publica". Úsala cuando pida "publica", "vista previa" o "sube la web".
---

# Publicar (Cloudflare Pages · subida directa)

Web oficial: https://prsnutricionyfuerza.pages.dev/ · La raíz del sitio es la carpeta `sitio/` del repo.

## Reglas
- **Nunca** presentar algo como "publicado" ni indicar subir a producción sin un "publica" u OK explícito de Mitxel **después** de ver la vista previa.
- Desde el entorno en la nube **no hay acceso** a Cloudflare: yo preparo el zip y Mitxel lo sube a mano.
- No cambiar las rutas `/p/` de los clientes.
- Una subida **sustituye todo el sitio**: el zip debe llevar todas las carpetas (`p/`, `app/`, `assets/`, `ig/`, páginas legales…), no solo lo que cambia.
- **No incluir en el zip:** `leeme.txt` (tiene los enlaces privados de los clientes), `revision/`, `CLAUDE.md`, `.claude/`, `.git/`, `node_modules/`, `dist/`.
- En `p/` solo van las apps que Mitxel haya dado por buenas (no borradores como una app pendiente de visto bueno médico).
- Commit en castellano después de cada cambio aprobado.

## Pasos
1. Ejecuta la skill `revisar-web` sobre `sitio/` y resume el resultado. Si hay ⚠ graves, avisa antes de seguir.
2. Comprueba que `sitio/_headers` sigue teniendo `noindex` para `/p/*` y `/ig/*`.
3. Prepara el zip (sin `rsync`, que no está instalado):
   ```
   cd sitio && zip -rq ../web-prs-cloudflare.zip . -x 'leeme.txt' 'revision/*' '.DS_Store' '*/.DS_Store'
   ```
   Coloca el zip en la carpeta de trabajo y entrégalo a Mitxel. Dile qué apps de `p/` incluye.
4. **Vista previa:** Mitxel entra en dash.cloudflare.com → Workers & Pages → `prsnutricionyfuerza` → *Create new deployment*, arrastra el zip (o la carpeta descomprimida) y elige la rama de **vista previa**. Cloudflare le da una URL de borrador; me la pasa o la revisa él.
5. Solo con su "publica": repite la subida eligiendo la rama de **producción** (la rama de producción del proyecto). Después comprueba que https://prsnutricionyfuerza.pages.dev/ carga y que cualquier `/p/…` devuelve la cabecera `X-Robots-Tag: noindex`.
6. `git add -A && git commit -m "Publicado: <qué cambia>"`.

## Si más adelante se conecta el repo a Cloudflare Pages
Con integración con GitHub, cada push a la rama de producción publica solo. En ese caso: carpeta de salida = `sitio`, sin comando de build, y `sitio/p/` (que está en `.gitignore`) **no** se subiría: las apps de clientes tendrían que seguir subiéndose por subida directa. Por eso conviene mantener la subida manual mientras `p/` no esté en git.
