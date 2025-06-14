
import { ResourceCard } from "@/components/ResourceCard";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import ResourceEditDialog from "@/components/ResourceEditDialog";
import ResourcePreviewDialog from "@/components/ResourcePreviewDialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function ResourceManager() {
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editResource, setEditResource] = useState<any>(null); // 当前正在编辑的资源
  const [deleteResource, setDeleteResource] = useState<any>(null); // 待删除资源
  const [previewResource, setPreviewResource] = useState<any>(null); // 预览资源

  // 拉取资源表，仅属于当前登录用户的资源
  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ["resources", profile?.id, refreshKey],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("owner_id", profile.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // 刷新资源列表
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // 删除资源
  const handleRemove = async () => {
    if (!deleteResource) return;
    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", deleteResource.id);
    setDeleteResource(null);
    if (error) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "删除成功", description: "资源已被移除" });
      refetch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">全部资源</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="px-4"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-1 animate-spin" />加载中...</>) : "刷新"}
          </Button>
          <Button
            onClick={() => toast({ title: "上传资源", description: "暂未接入Supabase存储，后续支持多格式上传。" })}
          >
            上传资源
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex w-full h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          正在加载资源...
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {resources && resources.length > 0 ? (
            resources.map((res: any) => (
              <div key={res.id} className="relative group">
                <ResourceCard
                  resource={{
                    id: res.id,
                    title: res.title,
                    type: res.type,
                    updatedAt: res.updated_at?.slice(0, 10) || "",
                    previewUrl: res.thumbnail_url,
                    file_path: res.file_path,
                    file_type: res.file_type,
                  }}
                  onPreview={() => setPreviewResource({
                    id: res.id,
                    title: res.title,
                    type: res.type,
                    previewUrl: res.thumbnail_url,
                    file_path: res.file_path,
                    file_type: res.file_type,
                  })}
                />
                <div className="absolute right-3 top-3 z-10 flex opacity-0 group-hover:opacity-100 transition gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditResource(res)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog open={!!deleteResource && deleteResource.id === res.id} onOpenChange={open => !open && setDeleteResource(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteResource(res);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription>
                          该操作无法撤销，将永久移除此资源。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove}>删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center w-full py-24">暂无资源</div>
          )}
        </div>
      )}
      <ResourceEditDialog
        open={Boolean(editResource)}
        onOpenChange={(v) => setEditResource(v ? editResource : null)}
        resource={editResource ?? {}}
        onSuccess={refetch}
      />
      <ResourcePreviewDialog
        open={!!previewResource}
        onOpenChange={(open) => setPreviewResource(open ? previewResource : null)}
        resource={previewResource}
      />
    </div>
  );
}
