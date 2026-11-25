import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: 'proj-test',
  }),
}));

const { promoBannerSchema } = await import('./promoBanner');

const IMAGE_URL =
  'https://nyc.cloud.appwrite.io/v1/storage/buckets/content_images/files/file-1/view?project=proj-test';

function banner(ctaValue: string) {
  return {
    contentPosition: 'bottom' as const,
    ctaLabel: 'Ver más',
    ctaType: 'url' as const,
    ctaValue,
    description: 'Peonías de temporada',
    imageUrl: IMAGE_URL,
    isActive: true,
    name: 'Banner 1',
    title: 'Peonías',
  };
}

function ctaValueIssues(ctaValue: string) {
  const result = promoBannerSchema.safeParse(banner(ctaValue));
  if (result.success) return [];
  return result.error.issues.filter((issue) => issue.path[0] === 'ctaValue');
}

describe('promoBannerSchema ctaValue', () => {
  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['//evil.com'],
    ['/\\evil.com/x'],
    ['http://example.com'],
    ['/catalogo/cumpleanos'],
    ['#contacto'],
  ])('rejects the unsafe or non-absolute URL %s', (ctaValue) => {
    expect(ctaValueIssues(ctaValue)).toHaveLength(1);
  });

  it.each([['https://www.kataleyaflowers.com/catalogo'], ['https://example.com/promo']])(
    'accepts the https URL %s',
    (ctaValue) => {
      expect(promoBannerSchema.safeParse(banner(ctaValue)).success).toBe(true);
    },
  );
});
