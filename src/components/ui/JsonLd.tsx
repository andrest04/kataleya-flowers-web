import type React from "react";

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  data: JsonLdData;
}

/**
 * Inyecta JSON-LD (schema.org) como `<script type="application/ld+json">`.
 *
 * Se usa en Server Components y se posiciona al inicio del page para que
 * los crawlers lo encuentren temprano. Acepta un objeto o un array de
 * objetos (para emitir múltiples bloques en un solo `<script>`).
 */
export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
