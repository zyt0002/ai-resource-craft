
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUploadToSupabase(bucket: string = "user-uploads") {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      // 处理中文文件名：使用时间戳+随机数+原扩展名
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || '';
      const safeFileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      console.log('上传文件:', { 
        originalName: file.name, 
        safeFileName, 
        fileSize: file.size,
        fileType: file.type 
      });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(safeFileName, file, { upsert: true });

      if (error) {
        console.error('Supabase 上传错误:', error);
        throw error;
      }

      console.log('上传成功:', data);

      // 获取公开URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(safeFileName);
      
      console.log('获取公开URL:', urlData?.publicUrl);
      
      return urlData?.publicUrl || null;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
}
