
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useUploadToSupabase } from "@/hooks/useUploadToSupabase";

interface FileUploadComponentProps {
  onFileUploaded: (url: string, fileName: string) => void;
  onFileRemoved: () => void;
  uploadedFileUrl: string | null;
  uploadedFileName: string | null;
}

export function FileUploadComponent({ 
  onFileUploaded, 
  onFileRemoved, 
  uploadedFileUrl, 
  uploadedFileName 
}: FileUploadComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useUploadToSupabase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        toast({ title: "上传中...", description: e.target.files[0].name });
        const url = await uploadFile(e.target.files[0]);
        onFileUploaded(url, e.target.files[0].name);
        toast({ title: "上传成功", description: url });
      } catch (err: any) {
        toast({ title: "上传失败", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleFileRemove = () => {
    onFileRemoved();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>上传文件（可选）</Label>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="block w-full border p-2 rounded text-sm"
        disabled={uploading}
      />
      {uploadedFileUrl && (
        <div className="text-xs text-green-700 break-all">
          已上传: <a href={uploadedFileUrl} className="underline" target="_blank" rel="noreferrer">{uploadedFileName}</a>
          <Button variant="ghost" size="sm" className="ml-2" onClick={handleFileRemove}>移除</Button>
        </div>
      )}
    </div>
  );
}
