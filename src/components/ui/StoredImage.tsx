'use client';

import NextImage, { type ImageProps } from 'next/image';

import storedImageLoader, { isLocalAssetSrc } from '@/lib/imageLoader';

export default function StoredImage(props: ImageProps) {
  const optimizeLocally = typeof props.src !== 'string' || isLocalAssetSrc(props.src);
  return <NextImage {...props} loader={optimizeLocally ? undefined : storedImageLoader} />;
}
