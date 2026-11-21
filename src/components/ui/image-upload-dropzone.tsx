import React, { useRef, useState } from 'react';
import { Upload, Trash2, RefreshCw, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cmsApi } from '@/services/cmsApi';
import { resolveMediaUrl } from './video-upload-dropzone';

interface ImageUploadDropzoneProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onUploadFile?: (file: File) => Promise<string>;
  aspectRatio?: 'banner' | 'video' | 'square' | 'wide';
  objectPosition?: 'top' | 'center' | 'bottom';
  helperText?: string;
  className?: string;
}

export function ImageUploadDropzone({
  label,
  value,
  onChange,
  onUploadFile,
  aspectRatio = 'banner',
  objectPosition = 'top',
  helperText,
  className = '',
}: ImageUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const aspectClass =
    aspectRatio === 'square'
      ? 'w-full h-48'
      : aspectRatio === 'wide'
      ? 'w-full h-52 sm:h-60'
      : aspectRatio === 'video'
      ? 'max-w-md w-full h-48'
      : 'w-full h-32 md:h-40 lg:h-48';

  const posClass =
    objectPosition === 'center'
      ? 'object-center'
      : objectPosition === 'bottom'
      ? 'object-bottom'
      : 'object-[center_top]';

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    // Always upload to the API as a file URL — never persist multi‑MB base64 into CMS JSON.
    try {
      setIsUploading(true);
      const upload =
        onUploadFile ??
        (async (f: File) => {
          const res = await cmsApi.uploadMedia(f);
          return res.url;
        });
      const uploadedUrl = await upload(file);
      onChange(uploadedUrl);
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Image removed');
  };

  const handleApplyUrl = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    onChange(manualUrl.trim());
    setShowUrlInput(false);
    setManualUrl('');
    toast.success('Image URL applied');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          {label}
        </label>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pb-1 animate-in fade-in duration-200">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste direct image URL (https://...)"
            className="text-xs h-8 placeholder:text-xs placeholder:text-muted-foreground/60"
          />
          <Button type="button" size="sm" onClick={handleApplyUrl} className="h-8 text-xs shrink-0">
            Apply
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading ? (
        <div
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center ${aspectClass} bg-muted/20 border-primary/40`}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-xs font-semibold text-foreground">Uploading image...</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Optimizing & saving image</p>
        </div>
      ) : value ? (
        <div
          className={`relative group overflow-hidden rounded-xl border border-border shadow-xs bg-muted/30 ${aspectClass}`}
        >
          <img
            src={resolveMediaUrl(value)}
            alt={label}
            className={`w-full h-full object-contain ${posClass} transition-transform duration-300 group-hover:scale-[1.02]`}
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-white text-xs font-medium drop-shadow-sm">Current {label}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs gap-1.5 bg-white text-black hover:bg-neutral-100 shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Change Image
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-8 text-xs gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>

          {/* Mobile visible action pill */}
          <div className="absolute bottom-2 right-2 flex sm:hidden gap-1.5 bg-black/70 backdrop-blur-xs p-1 rounded-md">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 text-[11px] px-2 text-black bg-white"
            >
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="h-7 text-[11px] px-2"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-6 text-center ${aspectClass} ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-xs">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">Click to upload or drag & drop</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PNG, JPG, WebP or GIF (Up to 8MB)
          </p>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-muted-foreground/80 leading-normal">{helperText}</p>
      )}
    </div>
  );
}

