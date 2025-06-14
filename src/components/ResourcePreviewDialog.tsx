
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

    // 若本地 content 没有内容，再尝试 fetch
    if (
      resource &&
      resource.type === "document" &&
      !resource.content && // 仅在本地没有内容时 fetch
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

  // 检查是否应以 Markdown 渲染
  const isMarkdown = (
    resource.file_type === "text/markdown"
    || /\.md$/i.test(resource.title)
    || (!!resource.content && /^# /.test(resource.content?.trim()))
  );

  // 兼容文件类型不规范的情况
  const isTextDoc =
    resource.type === "document" &&
    (
      resource.file_type?.startsWith("text/") ||
      resource.file_type === "application/json" ||
      resource.file_type === undefined ||
      resource.file_type === "" ||
      // fallback: 标题有.txt/.md/.json后缀也认为是文本
      /\.(txt|md|json)$/i.test(resource.title)
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
    // ⚡️【文本类文件】
    if (isTextDoc) {
      // markdown 渲染
      if (isMarkdown) {
        const markdownContent = resource.content ?? textContent;
        if (markdownContent == null) {
          return <div className="py-8 text-center text-muted-foreground">正在加载内容…</div>;
        }
        return (
          <div className="prose prose-neutral prose-p:my-1 max-h-[60vh] overflow-auto bg-muted px-4 py-3 rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        );
      }
      // 普通文本渲染
      if (resource.content) {
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh] whitespace-pre-wrap">{resource.content}</pre>
        );
      }
      if (resource.previewUrl) {
        if (textContent === null) {
          return (
            <div className="py-8 text-center text-muted-foreground">正在加载内容…</div>
          );
        }
        return (
          <pre className="bg-muted px-4 py-3 rounded overflow-auto text-sm max-h-[60vh] whitespace-pre-wrap">{textContent}</pre>
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

  // 只要有 content 或可用链接就允许下载
  const canDownload = !!(resource?.previewUrl || (isTextDoc && resource?.content));

  const handleDownload = () => {
    // 1. 有 previewUrl链接，直接跳转
    if (resource?.previewUrl) {
      window.open(resource.previewUrl, "_blank");
      return;
    }
    // 2. 有文本内容，允许本地导出，自动判断文件后缀
    if (isTextDoc && resource?.content) {
      let suffix = ".txt";
      if (/\.md$/i.test(resource.title)) {
        suffix = ".md";
      } else if (/\.json$/i.test(resource.title)) {
        suffix = ".json";
      }
      const blob = new Blob([resource.content], {
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
