
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FilePreview from "@/components/FilePreview";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadToSupabase } from "@/hooks/useUploadToSupabase";

interface FileUploadComponentProps {
  onFileUpload?: (fileUrl: string, fileName: string, fileType: string) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
}

export default function FileUploadComponent({
  onFileUpload,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.mp4'],
  multiple = false
}: FileUploadComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, name: string, type: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useUploadToSupabase();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          let message = '';
          switch (error.code) {
            case 'file-too-large':
              message = `文件 "${file.name}" 太大，最大支持 ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
              break;
            case 'file-invalid-type':
              message = `文件 "${file.name}" 格式不支持`;
              break;
            case 'too-many-files':
              message = `最多只能上传 ${maxFiles} 个文件`;
              break;
            default:
              message = `文件 "${file.name}" 上传失败`;
          }
          toast({
            title: "文件上传错误",
            description: message,
            variant: "destructive"
          });
        });
      });
    }

    // 处理接受的文件
    if (acceptedFiles.length > 0) {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      const limitedFiles = newFiles.slice(0, maxFiles);
      setFiles(limitedFiles);
      
      if (newFiles.length > maxFiles) {
        toast({
          title: "文件数量限制",
          description: `最多只能上传 ${maxFiles} 个文件，已自动选择前 ${maxFiles} 个`,
          variant: "destructive"
        });
      }
    }
  }, [files, maxFiles, maxSize, multiple, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        acc[`application/*`] = [type];
        acc[`image/*`] = [type];
        acc[`audio/*`] = [type];
        acc[`video/*`] = [type];
        acc[`text/*`] = [type];
      }
      return acc;
    }, {} as any),
    multiple
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要上传的文件",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const newUploadedFiles = [];
      for (const file of files) {
        const fileUrl = await uploadFile(file);
        if (fileUrl) {
          const uploadedFile = { url: fileUrl, name: file.name, type: file.type };
          newUploadedFiles.push(uploadedFile);
          
          // 通知父组件文件已上传
          if (onFileUpload) {
            onFileUpload(fileUrl, file.name, file.type);
          }
        }
      }
      
      // 将新上传的文件添加到已上传列表
      setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
      
      toast({
        title: "上传成功",
        description: `成功上传 ${files.length} 个文件`,
      });
      
      // 清空待上传文件列表
      setFiles([]);
    } catch (error) {
      console.error('文件上传失败:', error);
      toast({
        title: "上传失败",
        description: "文件上传过程中出现错误，请重试",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {/* 已上传文件显示区域 */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-600">已上传的文件 ({uploadedFiles.length})</h4>
              </div>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={`uploaded-${index}`} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{file.name}</p>
                        <p className="text-xs text-green-600">{file.type}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadedFile(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      移除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-lg font-medium">放下文件即可上传...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">点击或拖拽文件到此处上传</p>
                <p className="text-sm text-muted-foreground mb-4">
                  支持 {acceptedTypes.join(', ')} 格式，最大 {formatFileSize(maxSize)}
                </p>
                <Button variant="outline">选择文件</Button>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">待上传的文件 ({files.length})</h4>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="min-w-20"
                >
                  {uploading ? "上传中..." : "上传文件"}
                </Button>
              </div>
              
              <div className="space-y-2">
                {files.map((file, index) => (
                  <FilePreview
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">上传说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>上传后的文件会保持显示，直到您手动移除</li>
                  <li>单个文件大小不超过 {formatFileSize(maxSize)}</li>
                  <li>上传的文件会自动用于AI生成时的分析</li>
                  <li>您可以继续上传其他文件或在生成前移除不需要的文件</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
