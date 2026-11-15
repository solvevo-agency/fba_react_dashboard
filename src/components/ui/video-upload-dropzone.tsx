import React, { useRef, useState } from 'react';
import { Video, Trash2, RefreshCw, Link as LinkIcon, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { courseApi } from '@/services/courseApi';

/**
 * Resolves a media path into an absolute playable URL:
 * Handles absolute URLs (http, https, blob, data), or prepends backend origin to /uploads/...
 */
export const resolveMediaUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const apiBase =
    (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5040/api/v1';
  const backendBase = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface VideoUploadDropzoneProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onUploadFile?: (file: File) => Promise<string>;
  onDurationChange?: (durationMinutes: number) => void;
  helperText?: string;
  className?: string;
}

export function VideoUploadDropzone({
  label,
  value,
  onChange,
  onUploadFile,
  onDurationChange,
  helperText,
  className = '',
}: VideoUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [videoLoadError, setVideoLoadError] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|ogg|m4v)$/i)) {
      toast.error('Please upload a valid video file (MP4, WebM, MOV, M4V)');
      return;
    }

    // 1. Create instant local blob URL for immediate zero-latency preview
    const blobUrl = URL.createObjectURL(file);
    setLocalBlobUrl(blobUrl);
    setVideoLoadError(false);

    // 2. Read video duration automatically
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = blobUrl;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && onDurationChange) {
        const minutes = Math.max(1, Math.round(tempVideo.duration / 60));
        onDurationChange(minutes);
      }
    };

    // 3. Upload file to backend storage (free local multer disk or custom handler)
    try {
      setIsUploading(true);
      let uploadedUrl = '';
      if (onUploadFile) {
        uploadedUrl = await onUploadFile(file);
      } else {
        const uploadRes = await courseApi.uploadMedia(file);
        uploadedUrl = uploadRes.url;
      }

      onChange(uploadedUrl);
      toast.success(`Video "${file.name}" uploaded successfully`);
    } catch (err: unknown) {
      console.warn('Video server upload warning, keeping local preview for session:', err);
      // Fallback: keep local blob url in state so playback still functions
      onChange(blobUrl);
      toast.info('Video loaded in local preview.');
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
    setLocalBlobUrl(null);
    setVideoLoadError(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Video removed');
  };

  const handleApplyUrl = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter a valid video streaming URL');
      return;
    }
    setLocalBlobUrl(null);
    setVideoLoadError(false);
    onChange(manualUrl.trim());
    setShowUrlInput(false);
    setManualUrl('');
    toast.success('Video URL applied');
  };

  // The actual media source URL passed to HTML5 <video>
  const effectiveSrc = localBlobUrl || resolveMediaUrl(value);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5 text-primary" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlInput ? 'Hide URL link' : 'Paste link'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pb-1 animate-in fade-in duration-200">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste direct stream URL (e.g. /uploads/videos/file.mp4 or CDN/YouTube embed)"
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
        accept="video/mp4, video/webm, video/ogg, video/quicktime, .mp4, .webm, .mov, .m4v"
        onChange={handleFileChange}
        className="hidden"
      />

      {effectiveSrc ? (
        <div className="relative group overflow-hidden rounded-xl border border-border shadow-xs bg-black h-48 max-w-md w-full flex items-center justify-center">
          {videoLoadError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center text-white/80">
              <Play className="h-8 w-8 text-destructive mb-2" />
              <p className="text-xs font-semibold">Video preview unavailable</p>
              <p className="text-[11px] text-white/60 mt-1 max-w-[240px] truncate">
                {effectiveSrc}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 h-7 text-xs bg-white text-black hover:bg-neutral-200"
              >
                Upload replacement
              </Button>
            </div>
          ) : (
            <video
              key={effectiveSrc}
              src={effectiveSrc}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoLoadError(true)}
              className="w-full h-full object-contain rounded-xl"
            />
          )}

          {/* Uploading Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs font-medium">Uploading video to server...</p>
              <p className="text-[10px] text-white/70">Saving file to backend storage</p>
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/75 backdrop-blur-xs p-1 rounded-md z-10 opacity-90 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-7 text-[11px] px-2 text-black bg-white hover:bg-neutral-200"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Change Video
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
              className="h-7 text-[11px] px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" />
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
          className={`cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-6 text-center h-48 max-w-md w-full ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-xs">
            <Video className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">Click to upload video or drag & drop</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            MP4, WebM, MOV, M4V (HTTP streaming playback enabled)
          </p>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-muted-foreground/80 leading-normal">{helperText}</p>
      )}
    </div>
  );
}
