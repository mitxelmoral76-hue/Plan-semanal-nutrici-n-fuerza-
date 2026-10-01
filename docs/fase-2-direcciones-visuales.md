# Fase 2 · Dos direcciones visuales en 3D

Las dos comparten lo funcional: el color tiene significado (**ámbar = carga/acción**, **verde azulado = estructura**, **verde = hecho**), tipografías Bricolage Grotesque + Instrument Sans, modo claro/oscuro y `prefers-reduced-motion`.

## Dirección 1 · "Tablero semanal" (papel + isométrico) — **construida**
- **Fondo**: papel cálido con rejilla técnica muy tenue; bloques oscuros azul petróleo para el móvil.
- **3D**: la semana son 7 torres isométricas (SVG) cuyo alto es la carga de hidratos; el móvil de la app gira con el puntero (CSS 3D).
- **Sensación**: informe técnico, serio, legible, continuidad con las apps de clientes (mismos colores).
- **Riesgo bajo**: sin librerías, ligero, accesible con teclado y lector de pantalla.

## Dirección 2 · "Campo en perspectiva" (oscura, deportiva) — descrita, no construida
- **Fondo**: verde césped muy oscuro con líneas de campo; acento lima + ámbar.
- **3D**: la semana como baldosas sobre un campo en perspectiva (CSS `perspective`), cada baldosa se levanta según la carga; el móvil flota con sombra.
- **Sensación**: más emocional y de "vestuario", menos informe.
- **Riesgo**: modo claro menos natural, más peso visual, y se separa de la identidad ya usada en las apps.

**Recomendación: Dirección 1.** Mantiene la coherencia con las apps, es más clara para quien rellena un cuestionario de salud y pesa menos. Si prefieres la 2, el sistema de diseño (`assets/sistema.css`) está hecho con variables para cambiarla sin rehacer las páginas.
