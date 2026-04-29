// Tailwind v4 es CSS-puro: toda la config vive en `globals.css` como custom properties.
// Si aparece un `tailwind.config.*` es porque alguien (o un copy/paste) volvió a v3.
// Falla el build temprano para que no se cuele en producción.

import fs from 'node:fs';

const FORBIDDEN = [
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
];

const found = FORBIDDEN.filter((f) => fs.existsSync(f));

if (found.length > 0) {
  console.error(
    `✖ Tailwind v4 es CSS-puro. Remové ${found.join(', ')} y mové la config a globals.css como CSS custom properties.`,
  );
  process.exit(1);
}
