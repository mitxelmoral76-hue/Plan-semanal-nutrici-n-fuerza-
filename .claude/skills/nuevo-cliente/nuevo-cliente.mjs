// Crea /p/<nombre>-<código>/ desde app/demo/ y lo añade a leeme.txt.
// Uso (desde la carpeta raíz de la web): node nuevo-cliente.mjs "Nombre Apellido" plan.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [nombre, planFile] = process.argv.slice(2);
if (!nombre || !planFile) { console.error('Uso: node nuevo-cliente.mjs "Nombre Apellido" plan.json'); process.exit(1); }

const ROOT = process.cwd();
const TPL = path.join(ROOT, "app", "demo");
for (const f of ["index.html", "sw.js", "manifest.webmanifest"]) {
  if (!fs.existsSync(path.join(TPL, f))) { console.error(`Falta la plantilla app/demo/${f}. Ejecuta esto desde la carpeta raíz de la web.`); process.exit(1); }
}
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
for (const k of ["defaultAssign", "templates"]) if (!plan[k]) { console.error(`El plan no tiene "${k}".`); process.exit(1); }

const slug = nombre.split(/\s+/)[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
if (!slug) { console.error("Nombre no válido."); process.exit(1); }
const P = path.join(ROOT, "p");
fs.mkdirSync(P, { recursive: true });
const existente = fs.readdirSync(P).find((d) => d === slug || d.startsWith(slug + "-"));
if (existente) { console.error(`Ya existe p/${existente}/. Las rutas de los clientes no se cambian: usa otro nombre o edita esa carpeta a mano.`); process.exit(1); }

const dir = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
const out = path.join(P, dir);
fs.mkdirSync(out);

plan.id = slug;
plan.client = plan.client || nombre;
plan.short = plan.short || "PRSMITXEL";
plan.sw = true;
plan.icon = plan.icon || "../../icon-192.png";
plan.shopping = plan.shopping || [];
plan.guide = plan.guide || [];
plan.contact = plan.contact || { email: "mitxelmoral76@gmail.com", calendly: "https://calendly.com/mitxelmoral76/llamada-inicial-plan-nutricional" };
plan.forms = plan.forms || { nutri: "https://tally.so/r/QKPr2g", fuerza: "https://tally.so/r/Y5NaB0" };

let html = fs.readFileSync(path.join(TPL, "index.html"), "utf8");
if (!/const PLAN=\{.*?\};\n/s.test(html)) { console.error("No encuentro `const PLAN=` en la plantilla."); process.exit(1); }
html = html.replace(/const PLAN=\{.*?\};\n/s, () => "const PLAN=" + JSON.stringify(plan) + ";\n");
html = html.replace(/<title>[^<]*<\/title>/, `<title>PRSMITXEL · ${plan.client.replace(/[<>&]/g, "")}</title>`);
fs.writeFileSync(path.join(out, "index.html"), html);
fs.copyFileSync(path.join(TPL, "sw.js"), path.join(out, "sw.js"));
const m = JSON.parse(fs.readFileSync(path.join(TPL, "manifest.webmanifest"), "utf8"));
m.name = `PRSMITXEL · ${plan.client}`;
fs.writeFileSync(path.join(out, "manifest.webmanifest"), JSON.stringify(m));

const leeme = path.join(ROOT, "leeme.txt");
const linea = `${nombre.split(/\s+/)[0]}: https://prsnutricionyfuerza.pages.dev/p/${dir}/\n`;
const prev = fs.existsSync(leeme) ? fs.readFileSync(leeme, "utf8") : "Apps privadas (no indexadas):\n";
fs.writeFileSync(leeme, prev.endsWith("\n") ? prev + linea : prev + "\n" + linea);

console.log(`Creada p/${dir}/ y añadida a leeme.txt\nEnlace: https://prsnutricionyfuerza.pages.dev/p/${dir}/\nSiguiente: skill revisar-web, enseñar el resumen a Mitxel y publicar solo con su OK.`);
