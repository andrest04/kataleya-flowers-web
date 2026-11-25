import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: 'proj-test',
  }),
}));

const { heroSlideSchema } = await import('./heroSlide');

const IMAGE_URL =
  'https://nyc.cloud.appwrite.io/v1/storage/buckets/content_images/files/file-1/view?project=proj-test';

function slide(ctaValue: string) {
  return {
    altText: 'Ramo de rosas',
    ctaLabel: 'Ver más',
    ctaType: 'url' as const,
    ctaValue,
    imageUrl: IMAGE_URL,
    isActive: true,
    kicker: 'Nuevo',
    name: 'Slide 1',
    title: 'Rosas frescas',
  };
}

function ctaValueIssues(ctaValue: string) {
  const result = heroSlideSchema.safeParse(slide(ctaValue));
  if (result.success) return [];
  return result.error.issues.filter((issue) => issue.path[0] === 'ctaValue');
}

describe('heroSlideSchema ctaValue', () => {
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
      expect(heroSlideSchema.safeParse(slide(ctaValue)).success).toBe(true);
    },
  );

  it('ignores ctaValue when the CTA is not a URL', () => {
    const result = heroSlideSchema.safeParse({ ...slide('javascript:alert(1)'), ctaType: 'whatsapp' });
    expect(result.success).toBe(true);
  });
});
