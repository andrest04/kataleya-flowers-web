'use client';

import NextImage, { type ImageProps } from 'next/image';

import appwriteImageLoader from '@/lib/imageLoader';

export default function AppwriteImage(props: ImageProps) {
  return <NextImage {...props} loader={appwriteImageLoader} />;
}
