'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { useImageUpload } from '@/features/admin/hooks/useImageUpload';

// ── Types ────────────────────────────────────────────────────────────────────

interface BaseProps {
  folder?: string;
  className?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

type ImageUploaderProps = SingleProps | MultiProps;

// ── Component ────────────────────────────────────────────────────────────────

export default function ImageUploader(props: ImageUploaderProps) {
  const { folder, className = '' } = props;
  const { uploadImage, cancelUpload, isUploading, progress, error } = useImageUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = props.multiple ? props.value : props.value ? [props.value] : [];
  const maxFiles = props.multiple ? (props.maxFiles ?? 10) : 1;
  const canAddMore = urls.length < maxFiles && !isUploading;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const slots = maxFiles - urls.length;
    const toUpload = fileArray.slice(0, slots);

    for (const file of toUpload) {
      const url = await uploadImage(file, folder);
      if (!url) continue;

      if (props.multiple) {
        props.onChange([...props.value, url]);
      } else {
        props.onChange(url);
      }
    }
  }, [uploadImage, folder, maxFiles, urls.length, props]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!canAddMore) return;
    void handleFiles(e.dataTransfer.files);
  }, [canAddMore, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) setIsDragOver(true);
  }, [canAddMore]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleFiles(e.target.files);
      e.target.value = '';
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    if (props.multiple) {
      props.onChange(props.value.filter((_, i) => i !== index));
    } else {
      props.onChange('');
    }
  }, [props]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={className}>
      {/* Previews */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {urls.map((url, i) => (
            <div
              key={url}
              className="relative group rounded-lg overflow-hidden"
              style={{
                width: 96,
                height: 96,
                border: '1px solid var(--color-border)',
              }}
            >
              <Image
                src={url}
                alt={`Imagen ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-cream)',
                }}
                aria-label={`Eliminar imagen ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="w-full rounded-lg p-6 text-center cursor-pointer transition-colors"
          style={{
            border: `2px dashed ${isDragOver ? 'var(--color-secondary)' : 'var(--color-border)'}`,
            background: isDragOver
              ? 'color-mix(in srgb, var(--color-secondary) 8%, var(--color-cream))'
              : 'var(--color-surface)',
            color: 'var(--color-muted)',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm">
              {isDragOver
                ? 'Soltá la imagen acá'
                : 'Arrastrá una imagen o hacé click'}
            </span>
            {props.multiple && (
              <span className="text-xs">
                {urls.length}/{maxFiles} imágenes
              </span>
            )}
          </div>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={props.multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Progress bar */}
      {isUploading && (
        <div className="mt-3">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'var(--color-secondary)',
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span
              className="text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              Subiendo… {progress}%
            </span>
            <button
              type="button"
              onClick={cancelUpload}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
