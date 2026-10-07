import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { processImageFile } from '../utils/imageUtils';

interface PhotoUploadFieldProps {
  value: string;
  onChange: (photoUrl: string) => void;
  label?: string;
  helperText?: string;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  value,
  onChange,
  label = 'Profile Photo',
  helperText = 'Upload a clear portrait from your device (JPG, PNG, WebP)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    setErrorMessage('');
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      setFileName(file.name);
      const optimizedDataUrl = await processImageFile(file);
      onChange(optimizedDataUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const hasPhoto = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-800">
          {label}
        </label>
        {hasPhoto && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Photo selected</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Upload Dropzone Container */}
      <div
        onClick={handleTriggerClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative group rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-amber-600 bg-amber-50/70'
            : hasPhoto
            ? 'border-[#E0D7C8] bg-[#FDFBF7] hover:border-amber-500/80 hover:bg-[#F9F5EC]'
            : 'border-[#DDD5C7] bg-[#F9F6F0] hover:border-amber-600/70 hover:bg-[#F5F0E6]'
        }`}
      >
        {/* Preview Avatar or Placeholder Icon */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D8CEBC] bg-[#EFEAE0] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
            {hasPhoto ? (
              <img
                src={value}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  setErrorMessage('Failed to load image preview');
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400">
                <Camera className="w-7 h-7 text-stone-500 stroke-[1.8]" />
              </div>
            )}
          </div>

          {/* Quick upload icon badge on bottom-right of avatar */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-xs border-2 border-white">
            <Upload className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Text & Action Controls */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {isProcessing ? (
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-amber-800 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
              <span>Optimizing photo...</span>
            </div>
          ) : hasPhoto ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-900 truncate">
                {fileName || 'Custom Student Photo'}
              </p>
              <p className="text-[11px] text-stone-500">
                Click anywhere to choose a different photo
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-100 rounded-md border border-amber-200/80 transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200/70 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-900">
                <span className="text-amber-800 underline decoration-amber-400 font-bold">
                  Click to upload
                </span>{' '}
                or drag & drop your photo
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                {helperText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
