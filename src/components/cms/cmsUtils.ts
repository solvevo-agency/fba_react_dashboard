/* eslint-disable @typescript-eslint/no-explicit-any */
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

/**
 * Automatically compress large images before upload to ensure ultra-fast uploads (< 500ms)
 * and prevent network timeouts or huge payloads.
 */
export const compressImageIfNeeded = async (
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<File> => {
  if (
    file.size <= 800 * 1024 ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            return resolve(file);
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

/**
 * Reusable upload helper for image files with backend API upload.
 * Compresses files on client if needed, ensuring fast transfers and no timeouts.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    throw new Error('Invalid file type');
  }

  try {
    const optimizedFile = await compressImageIfNeeded(file);
    const res = await cmsApi.uploadMedia(optimizedFile);
    if (res?.url) {
      toast.success('Image uploaded successfully');
      return res.url;
    }
    throw new Error('No image URL returned from server');
  } catch (err: any) {
    console.error('Image upload failed:', err);
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to upload image. Please try again.';
    toast.error(errorMsg);
    throw err;
  }
};
