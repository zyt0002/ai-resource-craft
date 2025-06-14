
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";

type Resource = {
  id: string;
  title: string;
  type: "document" | "image" | "video" | "audio" | "other";
  previewUrl?: string;
  file_path?: string;
  file_type?: string;
  content?: string; // 增加本地保存内容字段
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

  useEffect(() => {
    setTextContent(null);

    if (
      resource &&
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
  }, [resource]);

  if (!resource) return null;

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
    // 新增：本地文本内容直接渲染
    if (
      resource.type === "document" &&
      (resource.file_type?.startsWith("text/") || resource.file_type === "application/json")
    ) {
      if (resource.content) {
        // 本地直接有内容
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh]">{resource.content}</pre>
        );
      }
      if (resource.previewUrl) {
        // 否则继续走 fetch 逻辑
        if (textContent === null) {
          return (
            <div className="py-8 text-center text-muted-foreground">正在加载内容…</div>
          );
        }
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh]">{textContent}</pre>
        );
      }
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

  const handleDownload = () => {
    if (resource?.previewUrl) {
      window.open(resource.previewUrl, "_blank");
      return;
    }
    // 若本地有内容
    if (
      resource?.type === "document" &&
      resource?.content &&
      (resource.file_type?.startsWith("text/") || resource.file_type === "application/json")
    ) {
      const blob = new Blob([resource.content], {
        type: resource.file_type || "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title + (resource.file_type === "application/json"
        ? ".json"
        : ".txt");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          {(resource.previewUrl ||
            (resource.content &&
              (resource.file_type?.startsWith("text/") || resource.file_type === "application/json"))) && (
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
