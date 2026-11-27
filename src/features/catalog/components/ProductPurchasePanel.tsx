"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import Button from "@/components/ui/Button";
import type { Product } from "@/features/catalog/types";
import {
  interpolateProductMessage,
  whatsappWithMessage,
} from "@/lib/contactLinks";
import { cn } from "@/lib/utils";

interface ProductPurchasePanelProps {
  phone: string;
  product: Product;
  proofLine: string;
  whatsappProductTemplate: string;
}

const VARIANT_PARAM = "variante";
export const PAGE_END_ID = "product-page-end";

function subscribeToNothing() {
  // The variant param is only read once per navigation; nothing to unsubscribe from.
  return () => {
    return undefined;
  };
}

function getVariantParamSnapshot(): string | null {
  return new URLSearchParams(window.location.search).get(VARIANT_PARAM);
}

function getServerVariantParamSnapshot(): string | null {
  return null;
}

function WhatsAppIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ProductPurchasePanel({
  phone,
  product,
  proofLine,
  whatsappProductTemplate,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const variants = useMemo(
    () => product.priceTable ?? [],
    [product.priceTable],
  );

  // Reads the ?variante= param without branching render on `window`: the
  // server snapshot always matches the SSR default, so hydration can't
  // mismatch, and no effect/setState is needed to sync it in afterwards.
  const variantParam = useSyncExternalStore(
    subscribeToNothing,
    getVariantParamSnapshot,
    getServerVariantParamSnapshot,
  );
  const [userSelectedLabel, setUserSelectedLabel] = useState<
    string | undefined
  >(undefined);

  const paramLabel =
    variantParam && variants.some((v) => v.label === variantParam)
      ? variantParam
      : undefined;
  const selectedLabel = userSelectedLabel ?? paramLabel ?? variants[0]?.label;

  const handleSelectVariant = (label: string) => {
    setUserSelectedLabel(label);
    const params = new URLSearchParams(window.location.search);
    params.set(VARIANT_PARAM, label);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectedVariant = variants.find((v) => v.label === selectedLabel);
  const displayPrice = selectedVariant?.price ?? product.price;
  const hasChosenVariant =
    userSelectedLabel !== undefined || paramLabel !== undefined;
  const showsStartingPrice = variants.length > 0 && !hasChosenVariant;

  const baseMessage = interpolateProductMessage(
    whatsappProductTemplate,
    product.name,
  );
  const whatsappMessage = selectedVariant
    ? `${baseMessage} (${selectedVariant.label})`
    : baseMessage;
  const whatsappUrl = whatsappWithMessage(phone, whatsappMessage);
  const priceLabel = `${showsStartingPrice ? "Desde " : ""}S/ ${displayPrice.toLocaleString(
    "es-PE",
    {
      minimumFractionDigits: displayPrice % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    },
  )}`;

  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [pageEndVisible, setPageEndVisible] = useState(false);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setCtaVisible(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = document.getElementById(PAGE_END_ID);
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPageEndVisible(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const barHidden = ctaVisible || pageEndVisible;

  return (
    <div className="flex flex-col">
      <p className="font-body text-primary mb-2 text-2xl font-semibold tabular-nums">
        {priceLabel}
      </p>

      {variants.length > 0 && (
        <div className="mt-6">
          <p className="font-body text-sm font-semibold text-dark mb-3">
            Elige un tamaño
          </p>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => {
              const isSelected = variant.label === selectedLabel;
              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => handleSelectVariant(variant.label)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-h-11 min-w-28 flex-col items-center rounded border px-4 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-(color:--color-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--color-cream) focus-visible:outline-none",
                    isSelected
                      ? "border-(--color-primary) bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                      : "border-(--color-border) bg-(--color-white) hover:border-(--color-primary)",
                  )}
                >
                  <span className="font-body text-dark text-base">
                    {variant.label}
                  </span>
                  <span className="font-body text-dark/70 mt-0.5 text-sm tabular-nums">
                    S/{" "}
                    {variant.price.toLocaleString("es-PE", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </button>
              );
            })}
          </div>
          {product.note && (
            <p className="mt-2 text-sm font-body font-semibold text-(--color-gold-text)">
              {product.note}
            </p>
          )}
        </div>
      )}

      <div ref={ctaRef} className="mt-6">
        <Button
          variant="whatsapp"
          size="md"
          href={whatsappUrl}
          external
          fullWidth
          className="font-body h-14"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Pedir este ramo por WhatsApp
        </Button>

        <div className="mt-4 font-body text-sm">
          <p className="text-dark font-semibold">{proofLine}</p>
          <p className="mt-1 text-(--color-muted)">
            Te responderemos a la brevedad con disponibilidad y opciones de
            entrega.
          </p>
        </div>
      </div>

      <div
        aria-hidden={barHidden}
        inert={barHidden}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex items-center gap-4 border-t border-(--color-border) bg-(--color-white) px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 lg:hidden",
          barHidden ? "translate-y-full" : "translate-y-0",
        )}
      >
        <p className="font-body text-primary shrink-0 text-lg font-semibold tabular-nums">
          {priceLabel}
        </p>
        <Button
          variant="whatsapp"
          size="md"
          href={whatsappUrl}
          external
          className="font-body h-12 min-w-0 flex-1 px-3 text-sm whitespace-nowrap"
        >
          <WhatsAppIcon className="hidden h-5 w-5 min-[360px]:block" />
          Pedir por WhatsApp
        </Button>
      </div>
    </div>
  );
}
