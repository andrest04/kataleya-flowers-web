import { describe, expect, it } from 'vitest';

import { mergeUploadedUrls } from './mergeUploadedUrls';

describe('mergeUploadedUrls', () => {
  it('appends every uploaded url in selection order', () => {
    expect(mergeUploadedUrls(['a'], ['b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps the successful uploads when some fail', () => {
    expect(mergeUploadedUrls(['a'], ['b', null, 'c', null])).toEqual(['a', 'b', 'c']);
  });

  it('returns the current urls when every upload fails', () => {
    expect(mergeUploadedUrls(['a', 'b'], [null, null])).toEqual(['a', 'b']);
  });

  it('starts from an empty list', () => {
    expect(mergeUploadedUrls([], ['x', 'y'])).toEqual(['x', 'y']);
  });

  it('drops duplicates while keeping the first occurrence', () => {
    expect(mergeUploadedUrls(['a', 'b'], ['b', 'c', 'c', 'a'])).toEqual(['a', 'b', 'c']);
  });

  it('ignores empty strings', () => {
    expect(mergeUploadedUrls(['a'], ['', 'b'])).toEqual(['a', 'b']);
  });

  it('does not mutate its inputs', () => {
    const current = ['a'];
    const uploaded = ['b'];
    mergeUploadedUrls(current, uploaded);
    expect(current).toEqual(['a']);
    expect(uploaded).toEqual(['b']);
  });
});
