'use client';

import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadResult {
  url: string;
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
            reject(new Error('Error al subir imagen'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red al subir imagen'));
        });

        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);

        xhr.open('POST', '/api/images/upload');
        xhr.send(formData);
      });

      setProgress(100);
      return result.url;
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
