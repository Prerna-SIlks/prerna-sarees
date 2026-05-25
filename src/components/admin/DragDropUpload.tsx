"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface DragDropUploadProps {
  bucket: "product-images" | "homepage-images" | "videos" | "admin-uploads" | "bills";
  folder?: string;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (urls: string[]) => void;
  onUpload?: (url: string) => void;
  currentUrl?: string;
  autoUpload?: boolean;
}

export function DragDropUpload({
  bucket,
  folder = "uploads",
  maxFiles = 5,
  accept = "image/*",
  maxSizeMB = 5,
  onUploadComplete,
  onUpload,
  currentUrl,
  autoUpload = false
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFiles = (newFiles: File[]): File[] => {
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        continue;
      }
      
      if (accept !== "*") {
        const fileType = file.type.split('/')[0];
        const acceptType = accept.split('/')[0];
        if (fileType !== acceptType && accept !== file.type) {
          toast.error(`${file.name} has an invalid file type.`);
          continue;
        }
      }
      
      validFiles.push(file);
    }
    
    return validFiles.slice(0, maxFiles - files.length);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (files.length >= maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    
    if (autoUpload) {
      performUpload(validFiles);
    } else {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (files.length >= maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files.`);
        return;
      }
      
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      
      if (autoUpload) {
        performUpload(validFiles);
      } else {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const performUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    const newUrls: string[] = [];
    
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        setProgress(Math.round(((i) / filesToUpload.length) * 100));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        if (folder) formData.append('folder', folder);

        const res = await fetch('/api/upload-admin', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to upload');
        }
          
        newUrls.push(data.url);
        setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
      }
      

      if (onUploadComplete) onUploadComplete(newUrls);
      if (onUpload && newUrls.length > 0) onUpload(newUrls[0]);
      
      toast.success(`Successfully uploaded ${newUrls.length} file(s)`);
      
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + ((error as Error).message || "Please try again."));
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    await performUpload(files);
    setFiles([]);
  };

  // If currentUrl is provided, just show the preview
  if (currentUrl) {
    return (
      <div className="relative w-full h-full min-h-[120px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        {currentUrl.match(/\.(mp4|webm)$/i) ? (
          <video src={currentUrl} className="h-full w-full object-cover" />
        ) : (
          <Image src={currentUrl} alt="upload preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Dropzone */}
      <div 
        className={`relative p-4 w-full h-full min-h-[120px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
          isDragging 
            ? "border-[#C9A84C] bg-[#C9A84C]/5 shadow-inner" 
            : "border-gray-300 bg-gray-50 hover:border-[#C9A84C]/50 hover:bg-white"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept={accept} 
          multiple={maxFiles > 1}
          disabled={isUploading}
          className="hidden" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#C9A84C] mb-2" />
            <p className="text-xs font-semibold text-[#1A0A0A] mb-1">
              Uploading...
            </p>
            <p className="text-[10px] text-gray-500">
              {progress}%
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 mb-2">
              <UploadCloud className={`h-5 w-5 ${isDragging ? "text-[#C9A84C]" : "text-gray-400"}`} />
            </div>
            <p className="text-[10px] font-semibold text-[#1A0A0A] mb-0.5 px-2">
              Upload
            </p>
            <p className="text-[9px] text-gray-500 hidden sm:block">
              {accept === "image/*" ? "Image" : "Video"}
            </p>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-[#C9A84C] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Selected Files List */}
      {!autoUpload && files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="truncate">
                  <p className="text-[10px] font-medium text-gray-700 truncate">{file.name}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                disabled={isUploading}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpload(); }} 
            disabled={isUploading}
            className="w-full mt-2 bg-[#1A0A0A] hover:bg-[#1A0A0A]/90 text-white font-medium py-1.5 text-xs rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}

