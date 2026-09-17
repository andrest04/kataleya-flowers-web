'use client';

import NextImage, { type ImageProps } from 'next/image';

import storedImageLoader from '@/lib/imageLoader';

export default function StoredImage(props: ImageProps) {
  return <NextImage {...props} loader={storedImageLoader} />;
}
