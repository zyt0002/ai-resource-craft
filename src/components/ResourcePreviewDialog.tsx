
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Resource = {
  id: string;
  title: string;
  type: "document" | "image" | "video" | "audio" | "other";
  previewUrl?: string;
  file_path?: string;
  file_type?: string;
  content?: string;
};

export default function ResourcePreviewDialog({
  open,
  onOpenChange,
  resource,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resource: Resource | null;
}) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [fullResourceData, setFullResourceData] = useState<any>(null);

  useEffect(() => {
    setTextContent(null);
    setFullResourceData(null);

    if (!resource || !open) return;

    // 从数据库获取完整的资源数据，包括content字段
    const fetchFullResourceData = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resource.id)
        .single();

      if (error) {
        console.error('Error fetching resource data:', error);
        return;
      }

      setFullResourceData(data);

      // 如果有直接保存的content，使用它
      if (data.content) {
        setTextContent(data.content);
        return;
      }

      // 否则尝试从文件URL获取内容
      if (
        resource.type === "document" &&
        resource.file_type &&
        (resource.file_type.startsWith("text/") || resource.file_type === "application/json") &&
        resource.previewUrl
      ) {
        fetch(resource.previewUrl)
          .then((r) => r.text())
          .then(setTextContent)
          .catch(() => setTextContent("加载文本失败"));
      }
    };

    fetchFullResourceData();
  }, [resource, open]);

  if (!resource) return null;

  // 检查是否为文本文档
  const isTextDoc =
    resource.type === "document" &&
    (
      resource.file_type?.startsWith("text/") ||
      resource.file_type === "application/json" ||
      resource.file_type === undefined ||
      resource.file_type === "" ||
      /\.(txt|md|json)$/i.test(resource.title) ||
      fullResourceData?.content // 如果有直接保存的内容也视为文本文档
    );

  const renderPreview = () => {
    if (resource.type === "image" && resource.previewUrl) {
      return (
        <img
          src={resource.previewUrl}
          alt={resource.title}
          className="max-w-full max-h-[60vh] mx-auto object-contain"
        />
      );
    }
    if (resource.type === "audio" && resource.previewUrl) {
      return (
        <audio controls className="w-full mt-4">
          <source src={resource.previewUrl} type={resource.file_type || "audio/mpeg"} />
          您的浏览器不支持音频播放。
        </audio>
      );
    }
    if (resource.type === "video" && resource.previewUrl) {
      return (
        <video controls className="w-full mt-4 max-h-[48vh]">
          <source src={resource.previewUrl} type={resource.file_type || "video/mp4"} />
          您的浏览器不支持视频播放。
        </video>
      );
    }
    
    // 文本类文件预览
    if (isTextDoc) {
      // 优先显示数据库中直接保存的content
      if (fullResourceData?.content) {
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh] whitespace-pre-wrap">
            {fullResourceData.content}
          </pre>
        );
      }
      // 其次显示从URL获取的内容
      if (textContent !== null) {
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh] whitespace-pre-wrap">
            {textContent}
          </pre>
        );
      }
      // 如果有URL但还在加载
      if (resource.previewUrl) {
        return (
          <div className="py-8 text-center text-muted-foreground">正在加载内容…</div>
        );
      }
      return (
        <div className="text-center text-muted-foreground py-12">暂无内容可预览。</div>
      );
    }
    
    // PDF 预览
    if (
      resource.type === "document" &&
      resource.previewUrl &&
      resource.file_type === "application/pdf"
    ) {
      return (
        <iframe
          src={resource.previewUrl}
          title={resource.title}
          className="w-full min-h-[60vh] max-h-[60vh] border rounded"
        />
      );
    }
    
    return (
      <div className="text-center text-muted-foreground py-12">
        暂不支持该类型文件的在线预览，请下载后查看。
      </div>
    );
  };

  // 检查是否可以下载
  const canDownload = !!(
    resource?.previewUrl || 
    (isTextDoc && (fullResourceData?.content || textContent))
  );

  const handleDownload = () => {
    // 1. 有 previewUrl链接，直接跳转
    if (resource?.previewUrl) {
      window.open(resource.previewUrl, "_blank");
      return;
    }
    
    // 2. 有文本内容（优先使用数据库中的content），允许本地导出
    const contentToDownload = fullResourceData?.content || textContent;
    if (isTextDoc && contentToDownload) {
      let suffix = ".txt";
      if (/\.md$/i.test(resource.title)) {
        suffix = ".md";
      } else if (/\.json$/i.test(resource.title)) {
        suffix = ".json";
      }
      
      const blob = new Blob([contentToDownload], {
        type: resource.file_type || "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title.endsWith(suffix)
        ? resource.title
        : resource.title + suffix;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 600);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>资源预览：{resource.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-3 mb-6">{renderPreview()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {canDownload && (
            <Button onClick={handleDownload}>
              <Download className="mr-2 w-4 h-4" />
              下载
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
