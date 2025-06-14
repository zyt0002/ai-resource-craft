
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUploadToSupabase(bucket: string = "user-uploads") {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const filePath = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });
    setUploading(false);
    if (error) throw error;
    // 获取公开URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  return { uploadFile, uploading };
}
