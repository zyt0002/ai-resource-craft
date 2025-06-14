import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUploadComponent from "./FileUploadComponent";
import { useUploadToSupabase } from "@/hooks/useUploadToSupabase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth"; // 新增: 获取当前登录用户
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

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

  const { profile } = useAuth(); // 新增：获取当前用户 profile

  // 分类数据
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
  const [categoryId, setCategoryId] = useState<string>("");

  // 资源类型
  const resourceTypes = [
    { value: "courseware", label: "课件" },
    { value: "document", label: "文档" },
    { value: "image", label: "图片" },
    { value: "video", label: "视频" },
    { value: "audio", label: "音频" },
  ];

  // 使用 useUploadToSupabase 上传文件时，提前取到公开链接
  const handleFileUpload = async (url: string, fileName: string, fileType: string, fileObj?: File) => {
    // 1. 取得 supabase 存储公开 url
    let publicUrl = url;
    if (fileObj) {
      const { data } = supabase.storage.from("user-uploads").getPublicUrl(fileName);
      if (data?.publicUrl) publicUrl = data.publicUrl;
    }
    setSelectedFile({ url: publicUrl, name: fileName, type: fileType, file: fileObj ?? (undefined as any) });
    if (!title) setTitle(fileName.replace(/\.[^/.]+$/, ""));
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
    if (!profile?.id) {
      toast({ title: "未检测到用户，请重新登录", variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: "请选择分类", variant: "destructive" });
      return;
    }
    setUploading(true);

    // 获取公开URL，始终写入 thumbnail_url
    const filePublicUrl =
      selectedFile.url.startsWith("http") ? selectedFile.url :
      supabase.storage.from("user-uploads").getPublicUrl(selectedFile.name).data?.publicUrl ?? "";

    const insertObj: TablesInsert<"resources"> = {
      title: title.trim() || selectedFile.name,
      type: type,
      file_path: selectedFile.url,     // 保持存储内部路径
      file_type: selectedFile.type,
      thumbnail_url: filePublicUrl,    // 永远写公网可访问URL
      owner_id: profile.id,
      category_id: categoryId
      // 可选: 其它字段
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
      setCategoryId("");
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
          <div>
            <label className="block mb-1 text-sm font-medium">分类</label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={catLoading || uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder={catLoading ? "加载中..." : "请选择分类"} />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    暂无分类
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
