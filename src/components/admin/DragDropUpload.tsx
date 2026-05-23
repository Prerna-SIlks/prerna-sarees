"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, X, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface DragDropUploadProps {
  bucket: "product-images" | "homepage-images" | "videos" | "admin-uploads";
  folder?: string;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (urls: string[]) => void;
  autoUpload?: boolean;
}

export function DragDropUpload({
  bucket,
  folder = "uploads",
  maxFiles = 5,
  accept = "image/*",
  maxSizeMB = 5,
  onUploadComplete,
  autoUpload = false
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
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
      const supabase = createClient(); // fresh client
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        
        setProgress(Math.round(((i) / filesToUpload.length) * 100));

        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, file, { upsert: true });
          
        if (uploadError) throw uploadError;
          
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
          
        newUrls.push(publicUrlData.publicUrl);
        setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
      }
      
      setUploadedUrls(prev => [...prev, ...newUrls]);
      onUploadComplete(newUrls);
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

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div 
        className={`relative p-8 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
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
          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C] mb-3" />
            <p className="text-sm font-semibold text-[#1A0A0A] mb-1">
              Uploading file(s)...
            </p>
            <p className="text-xs text-gray-500">
              {progress}% completed
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100 mb-4">
              <UploadCloud className={`h-8 w-8 ${isDragging ? "text-[#C9A84C]" : "text-gray-400"}`} />
            </div>
            <p className="text-sm font-semibold text-[#1A0A0A] mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept === "image/*" ? "SVG, PNG, JPG or GIF" : "MP4, WebM"} (max. {maxSizeMB}MB)
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-[#C9A84C] mt-2 font-medium">
                You can upload up to {maxFiles} files
              </p>
            )}
          </>
        )}
      </div>

      {/* Progress Bar (Always show when uploading, even for autoUpload) */}
      {isUploading && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-[#C9A84C] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Selected Files List */}
      {!autoUpload && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-[#FDF8F0] rounded text-[#6B1D1D]">
                  <File className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => removeFile(index)}
                disabled={isUploading}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          <button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full mt-4 bg-[#1A0A0A] hover:bg-[#1A0A0A]/90 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {progress === 0 ? "Preparing upload..." : progress === 100 ? "Processing..." : `Uploading... ${progress}%`}
              </>
            ) : (
              `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {/* Previously Uploaded Previews (Optional UI) */}
      {uploadedUrls.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-3 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Recently Uploaded
          </p>
          <div className="flex flex-wrap gap-2">
            {uploadedUrls.map((url, i) => (
              <div key={i} className="relative h-16 w-16 rounded border border-gray-200 overflow-hidden bg-gray-50">
                {url.match(/\.(mp4|webm)$/i) ? (
                  <video src={url} className="h-full w-full object-cover" />
                ) : (
                  <Image src={url} alt="upload" fill className="object-cover" sizes="64px" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
