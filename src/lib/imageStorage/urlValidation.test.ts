import { describe, expect, it } from 'vitest';

import { parseStorageViewPath } from './urlValidation';

const CANONICAL = 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/file-1/view?project=proj-test';

describe('parseStorageViewPath', () => {
  it('parses a canonical view URL into its parts', () => {
    expect(parseStorageViewPath(CANONICAL)).toEqual({
      host: 'nyc.cloud.appwrite.io',
      endpointPath: '/v1',
      bucketId: 'product_images',
      fileId: 'file-1',
      projectParams: ['proj-test'],
      paramCount: 1,
    });
  });

  it('reports every project param so callers can reject duplicates', () => {
    const parsed = parseStorageViewPath(`${CANONICAL}&project=other`);
    expect(parsed?.projectParams).toEqual(['proj-test', 'other']);
    expect(parsed?.paramCount).toBe(2);
  });

  it.each([
    ['a storage pattern carried in the query string', 'https://nyc.cloud.appwrite.io/v1/locale?x=/storage/buckets/product_images/files/a/view&project=p'],
    ['a storage pattern carried in the fragment', 'https://nyc.cloud.appwrite.io/v1/locale#/storage/buckets/product_images/files/a/view?project=proj-test'],
    ['a fragment after a canonical URL', `${CANONICAL}#frag`],
    ['a dot-segment traversal', 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/../../account/view?project=proj-test'],
    ['a dot-segment prefix', 'https://nyc.cloud.appwrite.io/v1/x/../storage/buckets/product_images/files/file-1/view?project=proj-test'],
    ['a percent-encoded traversal', 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/%2e%2e%2f%2e%2e%2faccount/view?project=proj-test'],
    ['a backslash traversal in the file id', 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/a\\..\\..\\account/view?project=proj-test'],
    ['an http URL', CANONICAL.replace('https:', 'http:')],
    ['a URL with userinfo', 'https://user:pass@nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/file-1/view?project=proj-test'],
    ['a URL with a username only', 'https://nyc.cloud.appwrite.io@evil.example/v1/storage/buckets/product_images/files/file-1/view?project=proj-test'],
    ['a non-special scheme', 'foo://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/file-1/view?project=proj-test'],
    ['an unknown bucket', CANONICAL.replace('product_images', 'other_images')],
    ['a file id that starts with a dot', CANONICAL.replace('file-1', '.hidden')],
    ['a file id longer than 36 characters', CANONICAL.replace('file-1', 'a'.repeat(37))],
    ['a trailing segment after view', CANONICAL.replace('/view?', '/view/extra?')],
    ['a control character', `${CANONICAL}\n`],
    ['surrounding whitespace', ` ${CANONICAL}`],
    ['a relative path', '/v1/storage/buckets/product_images/files/file-1/view'],
    ['garbage', 'not-a-url'],
  ])('rejects %s', (_label, url) => {
    expect(parseStorageViewPath(url)).toBeNull();
  });
});
