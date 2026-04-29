import { Button } from '@/components/ui';
import {
  type ProductWhatsAppConversion,
} from '@/features/admin/queries/analytics';

import { MIN_FRICTION_PRODUCT_VIEWS } from './analyticsShared';

type ProductConversionRankingVariant = 'best' | 'friction';

interface Props {
  data: ProductWhatsAppConversion[];
  variant?: ProductConversionRankingVariant;
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getRateColor(variant: ProductConversionRankingVariant): string {
  return variant === 'best' ? 'var(--color-accent)' : 'var(--color-primary)';
}

function getDescription(variant: ProductConversionRankingVariant): string {
  if (variant === 'friction') {
    return `Detectá productos con interés pero poco contacto: el ranking considera solo productos con al menos ${MIN_FRICTION_PRODUCT_VIEWS} vistas de detalle, prioriza menor conversión a WhatsApp desde detalle de producto y, ante empate, más vistas.`;
  }

  return 'Ranking operativo por producto: vistas de detalle vs clicks a WhatsApp desde detalle de producto. No deduplica usuarios ni sesiones.';
}

function getEmptyStateCopy(variant: ProductConversionRankingVariant): {
  title: string;
  description: string;
} {
  if (variant === 'friction') {
    return {
      title: 'Todavía no hay productos con volumen suficiente para medir fricción en este rango.',
      description:
        `Ampliá el rango o esperá más visitas. La lista aparece cuando al menos un producto alcanza ${MIN_FRICTION_PRODUCT_VIEWS} vistas de detalle para evaluar interés vs contacto por WhatsApp desde detalle de producto.`,
    };
  }

  return {
    title: 'Todavía no hay productos con vistas de detalle en este rango.',
    description:
      'Cuando entren nuevas vistas vas a poder detectar qué productos convierten mejor. La conversión usa solo clicks a WhatsApp desde detalle de producto.',
  };
}

export default function ProductConversionRanking({ data, variant = 'best' }: Props) {
  const emptyStateCopy = getEmptyStateCopy(variant);

  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{
          background: 'color-mix(in srgb, var(--color-dark) 3%, var(--color-white))',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          {emptyStateCopy.title}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
          {emptyStateCopy.description}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
        {getDescription(variant)}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium pb-3 pr-4" style={{ color: 'var(--color-muted)' }}>
                Producto
              </th>
              <th className="text-right text-xs font-medium pb-3 px-4" style={{ color: 'var(--color-muted)' }}>
                Vistas
              </th>
              <th className="text-right text-xs font-medium pb-3 px-4" style={{ color: 'var(--color-muted)' }}>
                WhatsApp
              </th>
              <th className="text-right text-xs font-medium pb-3 pl-4" style={{ color: 'var(--color-muted)' }}>
                Conversión
              </th>
              <th className="text-right text-xs font-medium pb-3 pl-4" style={{ color: 'var(--color-muted)' }}>
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr key={product.id}>
                <td
                  className="py-3 pr-4 text-sm font-medium"
                  style={{
                    color: 'var(--color-dark)',
                    borderTop: index === 0 ? '1px solid var(--color-border)' : undefined,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span>{product.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      /{product.slug}
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-4 text-sm text-right"
                  style={{
                    color: 'var(--color-dark)',
                    borderTop: index === 0 ? '1px solid var(--color-border)' : undefined,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {product.views}
                </td>
                <td
                  className="py-3 px-4 text-sm text-right"
                  style={{
                    color: 'var(--color-dark)',
                    borderTop: index === 0 ? '1px solid var(--color-border)' : undefined,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {product.whatsAppClicks}
                </td>
                <td
                  className="py-3 pl-4 text-sm text-right font-semibold"
                  style={{
                    color: getRateColor(variant),
                    borderTop: index === 0 ? '1px solid var(--color-border)' : undefined,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {formatRate(product.conversionRate)}
                </td>
                <td
                  className="py-3 pl-4 text-right"
                  style={{
                    borderTop: index === 0 ? '1px solid var(--color-border)' : undefined,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-end gap-2">
                    {product.publicPath ? (
                      <Button variant="secondary" size="sm" href={product.publicPath}>
                        Ver público
                      </Button>
                    ) : null}

                    <Button variant="ghost" size="sm" href={`/admin/productos/${product.id}`}>
                      Editar producto
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
