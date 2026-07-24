import { NextResponse } from 'next/server';

import { isAdminUserAppwrite } from '@/features/admin/utils/adminMembership.appwrite';
import { getUser } from '@/lib/appwrite/account';
import { getSessionCookie } from '@/lib/appwrite/cookies';
import { imageStorage, isAllowedImageFolder } from '@/lib/imageStorage';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isPng(buffer: Buffer): boolean {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 45 || !buffer.subarray(0, 8).equals(signature)) return false;

  let offset = 8;
  let sawHeader = false;
  let sawImageData = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const end = offset + 12 + length;
    if (end > buffer.length) return false;
    if (type === 'IHDR') {
      if (sawHeader || length !== 13 || offset !== 8) return false;
      sawHeader = true;
    } else if (type === 'IDAT') {
      if (!sawHeader || length === 0) return false;
      sawImageData = true;
    } else if (type === 'IEND') {
      return sawHeader && sawImageData && length === 0 && end === buffer.length;
    }
    offset = end;
  }
  return false;
}

function isJpeg(buffer: Buffer): boolean {
  if (buffer.length < 16 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;

  let offset = 2;
  let sawFrame = false;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return false;
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd9) return sawFrame && offset === buffer.length;
    if (marker === 0x00 || marker === 0xd8 || marker === undefined) return false;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (offset + 2 > buffer.length) return false;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) return false;
    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      if (segmentLength < 8 || buffer.readUInt16BE(offset + 3) === 0 || buffer.readUInt16BE(offset + 5) === 0) return false;
      sawFrame = true;
    }
    if (marker === 0xda) {
      if (!sawFrame || segmentLength < 8) return false;
      const scanStart = offset + segmentLength;
      const eoi = buffer.lastIndexOf(Buffer.from([0xff, 0xd9]));
      return eoi > scanStart && eoi === buffer.length - 2;
    }
    offset += segmentLength;
  }
  return false;
}

function isGif(buffer: Buffer): boolean {
  const isHeader = buffer.subarray(0, 6).equals(Buffer.from('GIF87a')) || buffer.subarray(0, 6).equals(Buffer.from('GIF89a'));
  if (buffer.length < 14 || !isHeader) return false;

  let offset = 13;
  if (buffer[10] & 0x80) offset += 3 * (2 ** ((buffer[10] & 0x07) + 1));
  let sawImage = false;
  while (offset < buffer.length) {
    const block = buffer[offset++];
    if (block === 0x3b) return sawImage && offset === buffer.length;
    if (block === 0x2c) {
      if (offset + 9 > buffer.length) return false;
      const width = buffer.readUInt16LE(offset + 4);
      const height = buffer.readUInt16LE(offset + 6);
      const packed = buffer[offset + 8];
      if (width === 0 || height === 0) return false;
      offset += 9;
      if (packed & 0x80) offset += 3 * (2 ** ((packed & 0x07) + 1));
      if (offset >= buffer.length || buffer[offset++] < 2) return false;
      sawImage = true;
    } else if (block === 0x21) {
      if (offset >= buffer.length) return false;
      offset += 1;
    } else {
      return false;
    }

    let sawData = false;
    while (offset < buffer.length) {
      const length = buffer[offset++];
      if (length === 0) break;
      if (offset + length > buffer.length) return false;
      offset += length;
      sawData = true;
    }
    if (!sawData || offset > buffer.length) return false;
  }
  return false;
}

function isWebpBitstream(type: string, data: Buffer): boolean {
  if (type === 'VP8 ') {
    return data.length >= 10 && data.subarray(3, 6).equals(Buffer.from([0x9d, 0x01, 0x2a]));
  }
  return type === 'VP8L' && data.length >= 5 && data[0] === 0x2f;
}

function hasWebpFrame(data: Buffer): boolean {
  if (data.length < 24) return false;
  let offset = 16;
  let sawBitstream = false;
  while (offset + 8 <= data.length) {
    const type = data.subarray(offset, offset + 4).toString('ascii');
    const length = data.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > data.length) return false;
    if (isWebpBitstream(type, data.subarray(dataStart, dataEnd))) sawBitstream = true;
    offset = dataEnd + (length % 2);
  }
  return sawBitstream && offset === data.length;
}

function isWebp(buffer: Buffer): boolean {
  if (buffer.length < 20 || !buffer.subarray(0, 4).equals(Buffer.from('RIFF')) || buffer.readUInt32LE(4) + 8 !== buffer.length || !buffer.subarray(8, 12).equals(Buffer.from('WEBP'))) return false;

  let offset = 12;
  let sawExtendedHeader = false;
  let sawImageData = false;
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString('ascii');
    const length = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > buffer.length) return false;
    const data = buffer.subarray(dataStart, dataEnd);
    if (type === 'VP8X') {
      if (data.length !== 10) return false;
      sawExtendedHeader = true;
    } else if (isWebpBitstream(type, data)) {
      sawImageData = true;
    } else if (type === 'ANMF' && hasWebpFrame(data)) {
      sawImageData = true;
    }
    offset = dataEnd + (length % 2);
  }
  return sawImageData && offset === buffer.length && (!sawExtendedHeader || buffer.length > 30);
}

interface IsoBox {
  type: string;
  dataStart: number;
  end: number;
}

function parseIsoBoxes(buffer: Buffer, start: number, end: number): IsoBox[] | null {
  const boxes: IsoBox[] = [];
  let offset = start;
  while (offset < end) {
    if (offset + 8 > end) return null;
    let size = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) return null;
      const largeSize = buffer.readBigUInt64BE(offset + 8);
      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) return null;
      size = Number(largeSize);
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) return null;
    boxes.push({ type, dataStart: offset + headerSize, end: offset + size });
    offset += size;
  }
  return offset === end ? boxes : null;
}

function isAvif(buffer: Buffer): boolean {
  const boxes = parseIsoBoxes(buffer, 0, buffer.length);
  if (!boxes || boxes.length < 2 || boxes[0]?.type !== 'ftyp') return false;

  const fileType = boxes[0];
  const fileTypeLength = fileType.end - fileType.dataStart;
  if (fileTypeLength < 8 || fileTypeLength % 4 !== 0) return false;
  const majorBrand = buffer.subarray(fileType.dataStart, fileType.dataStart + 4).toString('ascii');
  const compatibleBrands: string[] = [];
  for (let offset = fileType.dataStart + 8; offset < fileType.end; offset += 4) {
    compatibleBrands.push(buffer.subarray(offset, offset + 4).toString('ascii'));
  }
  if (!['avif', 'avis'].includes(majorBrand) && !compatibleBrands.some((brand) => brand === 'avif' || brand === 'avis')) return false;

  const meta = boxes.find((box) => box.type === 'meta');
  if (!meta || meta.end - meta.dataStart < 12) return false;
  const metaChildren = parseIsoBoxes(buffer, meta.dataStart + 4, meta.end);
  if (!metaChildren) return false;
  const childTypes = new Set(metaChildren.map((box) => box.type));
  const hasTopLevelMediaData = boxes.some((box) => box.type === 'mdat' && box.end > box.dataStart);
  const hasMetaItemData = metaChildren.some((box) => box.type === 'idat' && box.end > box.dataStart);
  return childTypes.has('iloc') && childTypes.has('iinf') && childTypes.has('iprp') && (hasTopLevelMediaData || hasMetaItemData);
}

function detectImageMimeType(buffer: Buffer): string | null {
  if (isPng(buffer)) return 'image/png';
  if (isJpeg(buffer)) return 'image/jpeg';
  if (isGif(buffer)) return 'image/gif';
  if (isWebp(buffer)) return 'image/webp';
  if (isAvif(buffer)) return 'image/avif';
  return null;
}

function normalizeImageMimeType(mimeType: string): string {
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();
}

export async function POST(request: Request) {
  const sessionSecret = await getSessionCookie();
  if (!sessionSecret) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const appwriteUser = await getUser(sessionSecret);
  if (!appwriteUser) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const isAdmin = await isAdminUserAppwrite(appwriteUser.$id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = formData.get('folder');

  if (!isAllowedImageFolder(folder)) {
    console.warn('[images/upload] folder rechazado', { folder });
    return NextResponse.json(
      { error: 'invalid_folder', message: 'Folder debe ser uno de: productos, categorias' },
      { status: 400 },
    );
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'invalid_file' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'file_too_large', message: 'La imagen no puede superar 10 MB' },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = detectImageMimeType(buffer);
    if (!mimeType) {
      return NextResponse.json(
        { error: 'invalid_file_type', message: 'El archivo debe ser una imagen válida' },
        { status: 400 },
      );
    }
    if (file.type && normalizeImageMimeType(file.type) !== mimeType) {
      return NextResponse.json(
        { error: 'mime_mismatch', message: 'El tipo declarado no coincide con el contenido de la imagen' },
        { status: 400 },
      );
    }
    const filename = file instanceof File ? file.name : 'upload';

    const url = await imageStorage.upload({
      folder,
      buffer,
      filename,
      mimeType,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[images/upload] fallo inesperado', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
