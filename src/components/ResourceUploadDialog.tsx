
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUploadComponent from "./FileUploadComponent";
import { useUploadToSupabase } from "@/hooks/useUploadToSupabase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

export default function ResourceUploadDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"document" | "audio" | "video" | "image" | "courseware">("document");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: string;
    file: File;
  } | null>(null);
  const { toast } = useToast();

  // 资源类型
  const resourceTypes = [
    { value: "courseware", label: "课件" },
    { value: "document", label: "文档" },
    { value: "image", label: "图片" },
    { value: "video", label: "视频" },
    { value: "audio", label: "音频" },
  ];

  const handleFileUpload = (url: string, fileName: string, fileType: string, fileObj?: File) => {
    setSelectedFile({ url, name: fileName, type: fileType, file: fileObj ?? (undefined as any) });
    if (!title) setTitle(fileName.replace(/\.[^/.]+$/, "")); // 默认用文件名作为标题
    if (!type && fileType) {
      if (fileType.startsWith("image/")) setType("image");
      else if (fileType.startsWith("video/")) setType("video");
      else if (fileType.startsWith("audio/")) setType("audio");
      else setType("document");
    }
  };

  // 上传表单提交
  const handleSubmit = async () => {
    if (!selectedFile || !selectedFile.url) {
      toast({ title: "请先上传文件", variant: "destructive" });
      return;
    }
    setUploading(true);

    // 类型断言保证 type 字段正确
    const insertObj: TablesInsert<"resources"> = {
      title: title.trim() || selectedFile.name,
      type: type,
      file_path: selectedFile.url,
      file_type: selectedFile.type,
      thumbnail_url: type === "image" ? selectedFile.url : null,
      // 其他可选字段按需添加
    };
    const { error } = await supabase.from("resources").insert(insertObj);
    setUploading(false);
    if (error) {
      toast({ title: "资源保存失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "资源上传成功" });
      setTitle("");
      setType("document");
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess && onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传资源</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FileUploadComponent
            onFileUpload={(url, fileName, fileType) =>
              handleFileUpload(url, fileName, fileType)
            }
            maxFiles={1}
            multiple={false}
          />
          {selectedFile && (
            <div className="border border-muted rounded p-3 space-y-2">
              <div className="text-xs text-muted-foreground">上传预览：</div>
              <div className="font-medium break-words">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground">{selectedFile.type}</div>
              <div className="mt-2">
                {type === "image" ? (
                  <img src={selectedFile.url} alt={selectedFile.name} className="max-h-24 rounded shadow" />
                ) : (
                  <a href={selectedFile.url} target="_blank" rel="noopener" className="text-blue-600 underline">查看文件</a>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block mb-1 text-sm font-medium">标题</label>
            <Input placeholder="资源标题" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">类型</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={type}
              onChange={e => setType(e.target.value as typeof type)}
              disabled={uploading}
            >
              {resourceTypes.map(t => (
                <option value={t.value} key={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={uploading}>取消</Button>
          <Button onClick={handleSubmit} disabled={uploading || !selectedFile}>
            {uploading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
