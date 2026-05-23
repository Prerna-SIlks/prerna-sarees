"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface DragDropUploadProps {
  bucket: string;
  folder?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  previewHeight?: string;
  accept?: string;
}


const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function DragDropUpload({
  bucket,
  folder = "",
  currentUrl,
  onUpload,
  onRemove,
  className = "",
  previewHeight = "200px",
  accept = "image/*",
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (accept.startsWith("image/") && !file.type.startsWith("image/")) {
        toast.error("Only images are allowed here.");
        return;
      }
      if (accept.startsWith("video/") && !file.type.startsWith("video/")) {
        toast.error("Only videos are allowed here.");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("File size must be under 5MB.");
        return;
      }

      setUploading(true);
      setProgress(10);

      const ext = file.name.split(".").pop();
      const fileName = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      setProgress(30);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      setProgress(80);

      if (error) {
        toast.error("Upload failed: " + error.message);
        setUploading(false);
        setProgress(0);
        return;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      setProgress(100);
      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success("File uploaded successfully!");

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    },
    [bucket, folder, onUpload, supabase, accept]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [uploadFile]
  );

  const handleRemove = () => {
    setPreview("");
    onRemove?.();
  };

  if (preview && !uploading) {
    return (
      <div className={`relative group rounded-lg overflow-hidden border border-[#d4a853]/30 ${className}`} style={{ height: previewHeight }}>
        {accept.startsWith("video/") ? (
          <video src={preview} className="w-full h-full object-cover" muted />
        ) : (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            Change
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 ${
        isDragging
          ? "border-[#d4a853] bg-[#d4a853]/10"
          : "border-gray-300 hover:border-[#d4a853] hover:bg-[#d4a853]/5"
      } ${className}`}
      style={{ minHeight: previewHeight }}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3 px-4">
          <div className="h-5 w-5 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Uploading...</p>
          <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d4a853] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-6">
          {isDragging ? (
            <ImageIcon className="h-8 w-8 text-[#d4a853]" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <p className="text-sm text-gray-500 text-center">
            <span className="font-semibold text-[#d4a853]">Drop file here</span> or click to upload
          </p>
          <p className="text-[10px] text-gray-400">Max 5MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
