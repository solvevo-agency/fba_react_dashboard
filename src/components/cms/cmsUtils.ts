/* eslint-disable @typescript-eslint/no-explicit-any */
import { cmsApi } from '@/services/cmsApi';
import { toast } from 'sonner';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

/**
 * Reusable upload helper for image files with backend API upload
 * and base64 instant fallback preview.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type');
  }

  // 1. Try backend storage upload if server endpoint is active
  try {
    const res = await cmsApi.uploadMedia(file);
    if (res?.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('Backend upload unavailable, falling back to local preview:', err);
  }

  // 2. Fallback to instant local base64 preview so admin UI stays 100% functional
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        toast.success('Image selected successfully');
        resolve(result);
      } else {
        reject(new Error('Failed to read image'));
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      reject(new Error('File read error'));
    };
    reader.readAsDataURL(file);
  });
};
