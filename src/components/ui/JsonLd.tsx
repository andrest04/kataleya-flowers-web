import type React from "react";

import { type JsonLdData, serializeJsonLd } from "@/lib/jsonLd";

interface JsonLdProps {
  data: JsonLdData;
}

export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export default JsonLd;
