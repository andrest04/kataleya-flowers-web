export function rotatedSize(width: number, height: number, rotation: number): {
  height: number;
  width: number;
} {
  return rotation % 180 === 0
    ? { height, width }
    : { height: width, width: height };
}

export function coverScale(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
  rotation: number,
): number {
  const size = rotatedSize(imageWidth, imageHeight, rotation);
  return Math.max(viewWidth / size.width, viewHeight / size.height);
}

export function clampPan(pan: number, view: number, drawn: number): number {
  const extra = Math.max(0, drawn - view);
  const max = extra / 2;
  return Math.min(max, Math.max(-max, pan));
}

export async function renderCoverCrop(input: {
  image: HTMLImageElement;
  outputWidth: number;
  panX: number;
  panY: number;
  rotation: number;
  viewHeight: number;
  viewWidth: number;
  zoom: number;
}): Promise<Blob> {
  const outputHeight = Math.round(input.outputWidth * input.viewHeight / input.viewWidth);
  const canvas = document.createElement('canvas');
  canvas.width = input.outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas');

  const scale = coverScale(
    input.image.naturalWidth,
    input.image.naturalHeight,
    input.viewWidth,
    input.viewHeight,
    input.rotation,
  ) * input.zoom;
  const k = input.outputWidth / input.viewWidth;

  context.fillStyle = 'black';
  context.fillRect(0, 0, input.outputWidth, outputHeight);
  context.translate(input.outputWidth / 2 + input.panX * k, outputHeight / 2 + input.panY * k);
  context.rotate((input.rotation * Math.PI) / 180);
  context.scale(scale * k, scale * k);
  context.drawImage(
    input.image,
    -input.image.naturalWidth / 2,
    -input.image.naturalHeight / 2,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('blob'));
    }, 'image/jpeg', 0.9);
  });
}

export function sourceUrlForCrop(url: string): string {
  if (url.startsWith('blob:')) return url;
  return `/api/images/source?url=${encodeURIComponent(url)}`;
}
