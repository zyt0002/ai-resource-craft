
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const resourceTypes = [
  { value: "courseware", label: "课件" },
  { value: "document", label: "文档" },
  { value: "image", label: "图片" },
  { value: "video", label: "视频" },
  { value: "audio", label: "音频" },
];

export default function ResourceEditDialog({ open, onOpenChange, resource, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resource: any;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState(resource.title ?? "");
  const [type, setType] = useState(resource.type ?? "document");
  const [saving, setSaving] = useState(false);

  // 每次打开时设置初始值
  // eslint-disable-next-line
  const [hasInit, setHasInit] = useState(false);
  if (!hasInit && open) {
    setTitle(resource.title ?? "");
    setType(resource.type ?? "document");
    setHasInit(true);
  }
  if (!open && hasInit) setHasInit(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("resources")
      .update({ title, type })
      .eq("id", resource.id);

    setSaving(false);
    if (error) {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "保存成功", description: "资源信息已更新" });
      onOpenChange(false);
      onSuccess && onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑资源</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block mb-1 text-sm font-medium">标题</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} disabled={saving} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">类型</label>
            <Select value={type} onValueChange={setType} disabled={saving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent zIndex={50}>
                {resourceTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={saving}>取消</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
