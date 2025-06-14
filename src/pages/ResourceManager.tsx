
import { ResourceCard } from "@/components/ResourceCard";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResourceManager() {
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

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

  // 刷新资源列表（例如：在其他页面保存新资源后可手动刷新）
  const handleRefresh = () => setRefreshKey((k) => k + 1);

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
              <ResourceCard key={res.id} resource={{
                id: res.id,
                title: res.title,
                type: res.type,
                updatedAt: res.updated_at?.slice(0, 10) || "",
                previewUrl: res.thumbnail_url
              }} />
            ))
          ) : (
            <div className="text-gray-400 text-center w-full py-24">暂无资源</div>
          )}
        </div>
      )}
    </div>
  );
}
