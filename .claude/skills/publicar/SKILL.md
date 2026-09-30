---
name: publicar
description: Publica la web PRSMITXEL en Netlify (proyecto prsmitxel) en dos pasos - primero vista previa, y producción solo cuando Mitxel diga "publica". Úsala cuando pida "publica", "vista previa" o "sube la web".
---

# Publicar

## Reglas
- **Nunca** `--prod` sin un "publica" u OK explícito de Mitxel **después** de ver la vista previa.
- No cambiar las rutas `/p/` de los clientes ni crear un proyecto nuevo en Netlify (usar `netlify link` con el existente `prsmitxel`).
- No subir `CLAUDE.md`, `.claude/`, `.git/`, `revision/`, `dist/`, `.netlify/` ni `node_modules/`.
- Commit en castellano después de cada cambio aprobado.

## Pasos
1. Ejecuta la skill `revisar-web` y resume el resultado. Si hay ⚠ graves, avisa antes de seguir.
2. Comprueba herramientas: `node -v` y `netlify --version` (si falta: `npm i -g netlify-cli`).
3. Comprueba sesión y enlace: `netlify status`. Si no hay login: `netlify login`; si no está enlazado: `netlify link` (elegir el sitio existente `prsmitxel`, **no crear uno nuevo**).
4. Prepara la carpeta limpia `dist/`:
   ```
   rm -rf dist && mkdir dist
   rsync -a --exclude='.git' --exclude='.claude' --exclude='.netlify' --exclude='node_modules' --exclude='revision' --exclude='dist' --exclude='CLAUDE.md' --exclude='src' --exclude='supabase' --exclude='package*.json' ./ dist/
   ```
5. **Vista previa** (sin `--prod`): `netlify deploy --dir dist`. Enseña a Mitxel la URL del borrador y espera.
6. Solo con su "publica": `netlify deploy --dir dist --prod`. Comprueba que la URL de producción carga y que `/p/` sigue con noindex.
7. `git add -A && git commit -m "Publicado: <qué cambia>"`.

## Si no hay acceso a Netlify (p. ej. entorno en la nube sin red a api.netlify.com)
Prepara `dist/` igual (paso 4), genera un zip con **toda** la carpeta (`cd dist && zip -r ../web-prsmitxel.zip .`) y entrégalo a Mitxel para arrastrarlo a Netlify > Deploys.
Avisa siempre: arrastrar un zip **sustituye todo el sitio**, así que debe contener todas las carpetas (`p/`, `app/`, `assets/`…) y `leeme.txt`.
