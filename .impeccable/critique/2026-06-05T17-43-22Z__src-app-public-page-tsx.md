---
target: landing page (auditoría de diseño)
total_score: 28
p0_count: 0
p1_count: 4
timestamp: 2026-06-05T17-43-22Z
slug: src-app-public-page-tsx
---
# Critique — Kataleya Flawers Landing (src/app/(public)/page.tsx)

Fecha: 2026-06-05 · Branch: feat/hero-redesign · Assessments: A (design review, blind) + B (detector + browser) + pasada visual del orquestador (1440×900 y 390×844).

## Design Health Score — Nielsen

| # | Heurística | Score | Issue clave |
|---|-----------|-------|-------------|
| 1 | Visibilidad de estado | 3 | Navbar scroll-aware, badge ABIERTO/CERRADO, dots con progreso. Falta feedback hover en "Ver catálogo completo" |
| 2 | Sistema ↔ mundo real | 4 | "Pedir por WhatsApp", "Desde S/ 30", mapa, Libro de Reclamaciones — habla el idioma del cliente |
| 3 | Control y libertad | 3 | Carrusel con prev/next + dots + swipe + pausa reduced-motion. Sin "saltar carrusel" |
| 4 | Consistencia y estándares | 2 | Dos sistemas de botones (DS Button vs cards bespoke en Contact); 3 labels para la misma acción; tildes ausentes en footer |
| 5 | Prevención de errores | n/a | Sin formularios; handoff a WhatsApp |
| 6 | Reconocimiento vs recuerdo | 4 | Todo visible y etiquetado, íconos con texto |
| 7 | Flexibilidad y eficiencia | 3 | 5 caminos a WhatsApp; search con autocomplete en desktop |
| 8 | Estética y minimalismo | 3 | Limpio y con aire. Lastres: kickers repetidos, "o" huérfana, banner de catálogo vacío con 1 categoría |
| 9 | Recuperación de errores | n/a | Sin superficies de error en happy path (error.tsx fuera de scope) |
| 10 | Ayuda y documentación | 3 | Horarios, mapa, badge en vivo actúan como ayuda inline |
| **Total** | | **28/40** (8 aplicables) | **Good — base sólida, atacar consistencia (#4)** |

## Veredicto Anti-Patrones

**LLM (Assessment A): PASS con reservas** — no grita "hecho con IA". Imágenes reales (clientas de Lima, hero de ramos reales) son el antídoto. Limpio de: gradient text, glassmorphism, card grids idénticas, hero-metric en hero.
**El tell más grande: eyebrow uppercase tracked en 5 secciones** (hero kicker + NUESTRAS COLECCIONES + MOMENTOS ESPECIALES + DESDE LIMA PARA CADA OCASIÓN + ATENCIÓN CERCANA, vía SectionHeader.tsx:24). La skill lo define como "AI grammar". Sobrevive solo porque el copy es específico y en español.

**Detector (Assessment B):** CLI scan = 0 hallazgos. Browser detect.js = 20 hallazgos:
- **Reales:** low-contrast 1.8:1 (#e8b84b sobre #fdfcfa, kicker + precios) ×2; low-contrast 2.0:1 / 1.9:1 (blanco sobre #25d366, cards WhatsApp); hero-eyebrow-chip; image-hover-transform.
- **Falsos positivos:** 1.0:1 cream-on-cream en hero/catálogo (detector muestrea bg CSS, no el scrim sobre la foto); text-overflow del skip link (sr-only intencional); clipped-overflow ×7 de las polaroids (mismo componente en loop, overflow-hidden intencional para radius); transition:height en body (tooling dev).
- Coincidencia A+B+orquestador: el dorado #e8b84b como color de texto falla AA en todos los contextos claros (verificado matemáticamente: 1.80:1 sobre crema, 4.37:1 sobre verde footer).

## Impresión general

Página honesta y bien construida que vende con fotos reales — exactamente la tesis de marca. El hero es el mejor trabajo de ingeniería (LCP server-rendered, scrims, reduced-motion, focus móvil por slide). Las fugas son de detalle, no de estructura: contraste del dorado, español sin tildes en el cierre, y una gramática de sección (eyebrow + heading serif) que se repite hasta volverse plantilla. La mayor oportunidad: convertir el muro de polaroids (el pico emocional real) en el cierre de venta con palabras de clientas reales.

## Lo que funciona

1. **Sistema de imágenes auténtico de punta a punta**: hero con ramos reales, polaroids de clientas reales en calles de Lima (rotación -3°/+3°), mesa de florista en About. Es el diferencial de PRODUCT.md ejecutado con gusto.
2. **Hero bien hecho**: H1 server-rendered, pointer-events-none con CTAs re-habilitados, variants reduced-motion, --hero-focus por slide en móvil, dots fuera del FAB.
3. **Disciplina mobile-first real**: CTAs full-width en thumb zone, drawer con "Hacer pedido" sticky, trust bar 2×2, snap carousels.

## Priority Issues

**[P1] Dorado #e8b84b como texto falla WCAG AA (1.8:1 sobre claros; 4.37:1 sobre verde).**
Kicker del hero ("FLORERÍA PREMIUM…" ilegible sobre slide de peonías claras en 390px), precios "Desde S/ 30" sobre fotos variables, link "Ver ubicacion y mapa" del footer. Tres fuentes confirman (A, B, matemática). Fix: token `--color-gold-text` oscurecido AA-safe para texto; dorado vivo queda para fills/íconos; o kicker en crema + scrim local. → /i-impeccable polish

**[P1] Footer sin tildes — rompe el principio "español peruano correcto" en la última impresión.**
Footer.tsx: "ocasion" (23), "Navegacion" (70-72), "Atencion" (94), "ubicacion" (102). Peak-end: lo último que lee la clienta está mal escrito. Fix mecánico. → /i-impeccable clarify

**[P1] Catálogo degrada feo con pocas categorías.**
getLayout(1) estira un tile a banner full-width con banda vacía; el snap-carousel móvil con 1 tile invita un swipe muerto. El layout de 6 (bento con hero 2×2) es genuinamente bueno; la fragilidad es en counts bajos, alcanzables desde el admin. Fix: fallback centrado con max-width para ≤2 tiles. → /i-impeccable harden

**[P1·verificar] El pin del mapa dice "Florería Floritel", no Kataleya Flawers.**
Detectado por el orquestador en ambos viewports (iframe de ContactSection). Una clienta que valida legitimidad en el mapa ve OTRO negocio. Si es nombre registral antiguo del local → actualizar Google Business; si es pin equivocado → corregir el embed. Requiere dato del dueño.

**[P2] Blanco sobre verde WhatsApp #25d366 = 2.0:1 (detector; A no lo vio).**
Cards de contacto y botón footer. Convención de marca WhatsApp vs WCAG: fix pragmático = superficie `--color-whatsapp-deep` (~#075e54, 7.7:1 con blanco) para superficies con texto; #25d366 queda para el FAB icon-only (aunque 1.4.11 también pide 3:1 en íconos). → /i-impeccable polish

**[P2] Tres labels para una acción + dos sistemas de botones.**
"Hacer pedido" (nav) / "Pedir por WhatsApp" (hero, footer, FAB) / "Escribir por WhatsApp" (contact); ContactSection hand-rollea action cards fuera del DS. Fix: un solo verbo de marca repetido verbatim; decidir si las cards de contacto son variante sancionada del DS. → /i-impeccable clarify

**[P2] Eyebrow en todas las secciones = gramática de scaffold.**
SectionHeader impone subtitle-uppercase + heading serif en cada sección. Fix: variar la cadencia (alguna sección sin kicker, kicker integrado al heading, o solo 1-2 deliberados). → /i-impeccable typeset

**[P2] "Testimonios" sin testimonios + stats template en About.**
Nav promete testimonios; la sección son fotos sin palabras. Y las 3 stat-cards (32 / 500+ / 100%) rozan el hero-metric template; "100% Dedicación y amor" es métrica de vanidad que debilita las dos reales. Fix: 2-3 quotes reales (nombre + ocasión) sobre las polaroids; tercera stat real o quitar la card. → /i-impeccable delight

## Persona Red Flags

- **Daniela (28-45, Limeña desde IG, móvil):** convierte gracias a polaroids + WhatsApp 1-tap; la frenan las tildes faltantes (lee descuido) y el pin "Floritel" si valida el mapa. Si llega con catálogo de 1 categoría, la promesa "premium" sub-entrega y vuelve al feed.
- **Casey (móvil distraída):** thumb-zone impecable; el iframe del mapa captura el scroll táctil (gesture trap); kicker ilegible en slides claros → lo saltea.
- **Jordan (primeriza):** clic en "Testimonios" → fotos sin palabras (expectativa rota leve); 3 labels de WhatsApp la hacen dudar si van al mismo lado.
- **Riley (stress tester):** swipe muerto en carrusel de 1 tile; la "o" huérfana entre Instagram y horarios (ContactSection.tsx:110) implica un "o" sin alternativa — la flaggea al instante.

## Observaciones menores

- Párrafos del About pegados (sin gap entre `<p>` siblings dentro del header) — confirmado en screenshot.
- "o" separadora huérfana en ContactSection.tsx:110-117 — quitar.
- Radii arbitrarios fuera de escala: rounded-[1.5rem], rounded-[2rem] (About), borderRadius 12px inline (iframe).
- Sin OG image: shares en redes salen sin preview — para un negocio que vive de IG/WhatsApp es pérdida real.
- WhatsAppFloat focus ring hereda --ring rojo sobre botón verde.
- TestimonialsSection usa max-w-4xl vs max-w-7xl del resto (muesca en viewports anchos).
- about-florist-table.jpg es imagen generada donde la tesis de marca es foto real — reemplazar con foto del local/dueña cuando exista.
- Logo navbar text-[1.5rem] fuera de escala tipográfica.
- next-themes instalado sin uso en landing; COPYRIGHT_YEAR hardcodeado.

## Preguntas provocadoras

1. ¿Qué pasaría si las polaroids llevaran 2-3 frases reales de clientas ("Para el cumpleaños de mi mamá — Andrea, San Isidro")? ¿Haría más por la conversión que todo el About?
2. WhatsApp aparece 5 veces bajo 3 nombres: ¿y si fuera UN solo verbo de marca repetido verbatim?
3. El kicker del hero es tu primera palabra y tu elemento menos legible: ¿se gana el primer lugar, o el H1 "Flores que emocionan" debería ser lo primero que toca el ojo?
