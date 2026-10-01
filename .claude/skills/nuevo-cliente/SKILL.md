---
name: nuevo-cliente
description: Crea la app de un cliente nuevo en /p/<nombre>-<código>/ a partir de la plantilla (app/demo/) y la añade a leeme.txt. Antes de crearla, recoge la SEMANA TIPO del cliente con horarios concretos. Úsala cuando Mitxel diga "nuevo cliente", "crea la app de…" o pase las respuestas de un cuestionario.
---

# Nuevo cliente

## Principio
Una app útil sale de conocer **la semana tipo con horas concretas**. Sin eso, el plan necesita casuísticas ("si entrenas por la mañana… si por la tarde…"). Con eso, cada día tiene su plan y no hay que explicar nada más.

## Paso 1 · Recoger la semana tipo (obligatorio antes de crear nada)
Si falta algún dato, pídelo **de una vez** en una sola lista corta. Plantilla completa en `semana-tipo.md`. Mínimo imprescindible:
- Datos: nombre, edad, sexo, peso, altura, objetivo principal y plazo.
- **Cada día de lunes a domingo**: hora de levantarse y de acostarse, trabajo/estudios (de qué hora a qué hora), entrenos (qué, a qué hora, cuánto dura), partido o competición, y hora de las comidas que ya hace.
- Quién cocina, cuántas veces come fuera, si lleva tupper.
- Alergias, intolerancias, lo que no come y lo que le sienta mal.
- Suplementos que toma, estrés, sueño, alcohol.

## Paso 2 · Decidir los tipos de día
Un tipo de día por cada situación distinta de la semana (máximo 7): por ejemplo *Fuerza*, *Campo + fuerza*, *Partido*, *Descanso*. Cada tipo lleva: nivel de carga (`alta`, `media`, `baja`, `carga`, `partido`), macros, horario con comidas y eventos, y opcionalmente una sesión de fuerza.

## Paso 3 · Calcular
- Energía: Mifflin-St Jeor × nivel de actividad, ajustada al objetivo y al tipo de día.
- Proteína 1,6–2,2 g/kg; grasa ≥ 0,8 g/kg; hidratos por carga (descanso 3–4, entreno 5–6,5, partido 7–8 g/kg).
- **Arroz en crudo y fruta en piezas** (no arroz cocido en gramos): así los gramos cuadran con las calorías.
- Una sola fuente principal de hidrato por comida. Sin pasta ni pan ni ultraprocesados. Respeta lo que le sienta mal.
- Comprueba que las comidas sumen los macros del día (±3 %).

## Paso 4 · Crear la carpeta
Guarda el plan como JSON (estructura igual que `const PLAN` de `app/demo/index.html`; incluye `rcExclude` y `rcSinAlimentos` si hay intolerancias) y ejecuta:

```
node .claude/skills/nuevo-cliente/nuevo-cliente.mjs "Nombre Apellido" plan.json
```

Crea `p/<nombre>-<código de 6 letras>/` con `index.html`, `sw.js` y `manifest.webmanifest`, y añade su enlace a `leeme.txt`. Si ya existe una carpeta de esa persona, **se detiene**: las rutas `/p/` de los clientes no se cambian nunca.

## Paso 5 · Revisar y entregar
1. Ejecuta la skill `revisar-web`.
2. Enseña a Mitxel el resumen de la semana (macros por día y horarios) y espera su OK.
3. Publica solo con la skill `publicar`. El enlace privado se entrega al cliente; la ruta lleva `noindex`.

## Reglas
- Nada de "dietista-nutricionista", tratamientos ni promesas de resultados. Es asesoramiento en hábitos y planificación de comida real.
- Si hay patología, medicación o embarazo: no crear el plan; derivar al médico o dietista-nutricionista.
- Los datos de salud del cliente son confidenciales: no los pegues en git ni en textos públicos.
