# Contraste UrbanStems vs Kataleya

UrbanStems es e-commerce Shopify nacional (carrito, checkout, suscripciones, rewards, ~200 colecciones). Kataleya es vitrina Lima → WhatsApp. Copiar sus rutas enteras sería un error de producto, no de diseño.

Fuente viva: [urbanstems.com](https://urbanstems.com/) y su [sitemap](https://urbanstems.com/pages/sitemap). Relevado el 10 sep 2026. Producto nuestro: [`product.md`](product.md).

## Qué hacer con esto

1. Usar UrbanStems como referencia de **composición y catálogo**, no como backlog de páginas.
2. Copiar solo lo que cabe en vitrina + WhatsApp.
3. No abrir carrito, cuenta, suscripción, rewards ni landings de ciudad.

## Home: ya está calcado

| UrbanStems | Kataleya (`src/app/(public)/page.tsx`) |
|---|---|
| Announcement bar + hero de campaña | Announcement en Configuración + `HeroSection` |
| Carrusel de ocasiones | `CatalogSection` |
| Reviews (“20,000 five-star”) | `TestimonialsSection` |
| Banners de campaña / bundles | `PromoBanners` |
| Best sellers | `BestSellersSection` |
| Discover more | `DiscoverMoreSection` |
| Instagram + referrals + help | Contacto local (`ContactSection`) + WhatsApp float |

El gap no es “faltan 150 páginas”. Búsqueda (`SearchOverlay`) y menú de catálogo (`CatalogMenu`) ya existen. Lo que todavía se siente distinto es la card del catálogo (no revela segunda foto) y una página de cuidados.

## Mapa de rutas

### Núcleo (sí comparar)

| UrbanStems | Kataleya | Decisión |
|---|---|---|
| `/` | `/` | Pulir composición, no clonar. |
| `/collections/all` | `/catalogo` | PLP ya replica UrbanStems (jul 2026). |
| `/collections/{ocasión}` | `/catalogo/{categoria}` | Tenemos ~6 categorías. Ellos, decenas de ocasiones + color + flor. |
| `/products/{slug}` | `/catalogo/{cat}/{slug}` | Misma idea. `ProductGallery` ya tiene varias fotos + lightbox. |
| `/search` | `/buscar` + overlay en Navbar | Página real + lupa del header. Submit va a `/buscar?q=`. |
| `/pages/care-instructions` | — | Página corta de cuidados. Alta confianza, bajo costo. |
| `/pages/reviews` | `#testimonios` | Ellos página. Nosotros sección. Suficiente salvo que se quiera URL propia. |
| `/pages/about` | `#nosotros` | Ancla. Correcto para local. |
| `/pages/contact` | `#contacto` | Ancla + mapa. Correcto para local. |
| — | `/libro-de-reclamaciones` | Nuestro. Ellos no lo tienen. |

Nav nuestra (`src/lib/navigation.ts`): Inicio, Catálogo, Nosotros, Testimonios, Contacto. `CatalogMenu` ya baja las categorías. No replica el mega-menú de ocasiones/campaña de UrbanStems; no hace falta para 6 categorías.

### No copiar

| UrbanStems | Por qué no |
|---|---|
| `/cart` `/account` `/checkout` | WhatsApp es la caja (`product.md`). |
| `/products/seasonal-flower-subscription` | Operación DTC, no florería de barrio. |
| `/pages/rewards` `/pages/referrals` | Programa de puntos. Fuera de modelo. |
| `/pages/gift-shop` wine shop, collabs (Levain, Coterie, Boarderie) | Marketplace de partners. |
| 80+ `/collections/{ciudad}-flower-delivery` | SEO de marketplace USA. |
| `/blogs/news` | Opcional mucho más adelante. No es launch. |

### Colecciones de ellos, agrupadas

No clonar la lista. Sirve para ver **cómo piensan la IA**:

- **Occasions:** birthday, sympathy, new baby, thank you, friendship, just because, congratulations, anniversary, miss you, entertaining, self send, get well, romance, wedding, housewarming, graduation.
- **Product type:** flowers, plants, orchids, peonies, roses, gifts/bundles, centerpieces, vessels.
- **Campaign / season:** fall, spring, summer, winter, Valentine’s, Mother’s Day, Christmas, etc.
- **Color / flower:** pink, red, white, yellow, sunflowers, tulips, hydrangeas…
- **Delivery promise:** same-day, next-day, last-minute, y una colección por ciudad.
- **Price bands:** under $50 / $75 / $100.

Nuestras 6 categorías base cubren ocasión (Amor y Romance, Cumpleaños, Orquídeas Premium, Flores Amarillas, Corporativo y Eventos, Condolencias). Color y tipo de flor ya viven como **filtros** del catálogo, no como rutas.

## Qué sí vale copiar

Sin volvernos Shopify. Orden recomendado:

1. **Cards del catálogo:** segunda foto al hover (UrbanStems signature). Los datos ya están en `product.images`; `CatalogCollectionCard` hoy solo hace zoom. No inventar estrellas por producto: no hay reviews por SKU.
2. **`/cuidados`:** página real, corta, de cómo cuidar el ramo. Confianza, bajo costo.
3. **Toolbar del catálogo** (Block 2 pendiente de jul 2026): barra más sólida + densidad de grilla.

## Qué no copiar aunque “se vea lindo”

Carrito, cuenta, suscripción, rewards, wine/gift shop, landings de ciudad, blog entero. Eso es otra empresa.

## Por dónde empezar

**Hover de segunda foto en las cards.** Es lo que más se parece a UrbanStems por hora de trabajo, vive en la superficie más vista después del home, y no inventa features que ya tenemos.
