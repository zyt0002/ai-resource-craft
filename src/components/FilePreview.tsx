
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Volume2, Video, Download, Eye, X } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  showPreview?: boolean;
}

export default function FilePreview({ file, onRemove, showPreview = true }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Volume2 className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('docx')) return 'word';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = () => {
    if (file.type.startsWith('image/') && !previewUrl) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    setShowFullPreview(true);
  };

  return (
    <>
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getFileTypeLabel(file.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showFullPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{file.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              {file.type.startsWith('image/') && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center py-8">
                  {getFileIcon(file.type)}
                  <p className="mt-2 text-muted-foreground">
                    无法预览此文件类型
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
