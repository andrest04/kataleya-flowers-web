'use client';

import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface SignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats?: string;
  maxFileSize?: number;
}

interface UploadResult {
  secure_url: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadImage = useCallback(async (file: File, folder?: string): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no puede superar 10 MB');
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get signature from our API
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!signRes.ok) {
        throw new Error('Error al obtener firma de upload');
      }

      const sign: SignResponse = await signRes.json();

      // 2. Upload to Cloudinary via XMLHttpRequest (supports progress)
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText) as UploadResult);
          } else {
            reject(new Error('Error al subir imagen a Cloudinary'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red al subir imagen'));
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sign.apiKey);
        formData.append('timestamp', String(sign.timestamp));
        formData.append('signature', sign.signature);
        if (sign.folder) formData.append('folder', sign.folder);
        // Reenviamos los params firmados — Cloudinary los aplica server-side
        if (sign.allowedFormats) formData.append('allowed_formats', sign.allowedFormats);
        if (sign.maxFileSize) formData.append('max_file_size', String(sign.maxFileSize));

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`);
        xhr.send(formData);
      });

      setProgress(100);
      return result.secure_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
      xhrRef.current = null;
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
      setIsUploading(false);
      setProgress(0);
    }
  }, []);

  return { uploadImage, cancelUpload, isUploading, progress, error };
}
