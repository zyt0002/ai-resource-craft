
import { useState } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import StatsCard from "@/components/StatsCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import { Sparkles, FolderKanban, FileText, Image, Users, TrendingUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ResourcePreviewDialog from "@/components/ResourcePreviewDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState as useReactState } from "react";

const fakeResources = [
  { id: "1", title: "小学语文PPT范例", type: "document", updatedAt: "2024-06-12", category: "语文" },
  { id: "2", title: "科学课配图", type: "image", updatedAt: "2024-06-11", previewUrl: "https://placehold.co/36x36", category: "科学" },
  { id: "3", title: "教研会议录音", type: "audio", updatedAt: "2024-06-10", category: "会议" },
  { id: "4", title: "英语听力训练", type: "audio", updatedAt: "2024-06-08", category: "英语" },
  { id: "5", title: "数学公式图表", type: "image", updatedAt: "2024-06-07", category: "数学" },
  { id: "6", title: "历史课件模板", type: "document", updatedAt: "2024-06-06", category: "历史" },
];

const categories = ["语文", "数学", "英语", "科学", "历史", "会议"];
const types = ["document", "image", "audio", "video"];

export default function Index() {
  const [filteredResources, setFilteredResources] = useState(fakeResources);
  const [searchQuery, setSearchQuery] = useState("");
  // 新增：动态资源相关状态
  const { profile } = useAuth();
  const [previewResource, setPreviewResource] = useReactState<any>(null);

  // 动态资源
  const { data: myResources, isLoading: myResourcesLoading } = useQuery({
    queryKey: ["resources_mine", profile?.id],
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredResources(fakeResources);
      return;
    }
    const filtered = fakeResources.filter(resource =>
      resource.title.toLowerCase().includes(query.toLowerCase()) ||
      resource.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResources(filtered);
  };

  const handleFilter = (filters: any) => {
    let filtered = fakeResources;
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter(resource => resource.category === filters.category);
    }
    if (filters.type) {
      filtered = filtered.filter(resource => resource.type === filters.type);
    }
    setFilteredResources(filtered);
  };

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">欢迎使用 EduGen 智能教育资源平台 👋</h1>
          <div className="text-base text-muted-foreground mt-2">利用 AI 快速生成、管理并分享多格式教学资源</div>
        </div>
        <img src="https://placehold.co/88x88" className="rounded-full shadow" alt="用户头像" />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总资源数"
          value="127"
          description="全部教育资源"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="本月生成"
          value="23"
          description="AI生成的资源"
          icon={Sparkles}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="图片资源"
          value="45"
          description="图片和图表"
          icon={Image}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="活跃用户"
          value="89"
          description="本周活跃"
          icon={Users}
          trend={{ value: -2, isPositive: false }}
        />
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <Sparkles className="w-12 h-12" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">AI智能生成</h3>
                <p className="text-blue-100 mb-4">一键生成PPT、图片、教案等教学资源</p>
                <Button variant="secondary" asChild>
                  <a href="/ai-generator">开始生成</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <FolderKanban className="w-12 h-12" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">资源管理</h3>
                <p className="text-green-100 mb-4">管理所有教学资源，支持分类和搜索</p>
                <Button variant="secondary" asChild>
                  <a href="/resources">管理资源</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <Database className="w-12 h-12" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">知识库</h3>
                <p className="text-purple-100 mb-4">智能检索和RAG问答，构建教学知识体系</p>
                <Button variant="secondary" asChild>
                  <a href="/knowledge-base">进入知识库</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------- 静态资源部分保持不变 ---------- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">最近更新的教学资源</h2>
          <Button variant="outline" asChild>
            <a href="/resources">查看全部</a>
          </Button>
        </div>
        <div className="mb-6">
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            categories={categories}
            types={types}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource as any} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">未找到相关资源</h3>
              <p className="text-sm text-muted-foreground">尝试调整搜索条件或清除筛选器</p>
            </div>
          )}
        </div>
      </div>

      {/* -------- 新增：我的资源(动态) -------- */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">我的教学资源</h2>
        </div>
        {myResourcesLoading ? (
          <div className="flex items-center text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            加载中...
          </div>
        ) : !profile?.id ? (
          <div className="text-sm text-gray-400 text-center py-6">请登录后查看您的资源</div>
        ) : (myResources && myResources.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {myResources.map((res: any) => (
              <ResourceCard
                key={res.id}
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
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-10 text-gray-400">
            暂无资源，去"资源管理"上传您的第一个资源吧。
          </div>
        )}
      </div>
      {/* 资源预览弹窗 */}
      <ResourcePreviewDialog
        open={!!previewResource}
        onOpenChange={open => setPreviewResource(open ? previewResource : null)}
        resource={previewResource}
      />

      {/* ----------- 其它板块保持不变 ----------- */}
      {/* 使用提示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            快速上手
          </CardTitle>
          <CardDescription>
            几个简单步骤，快速开始使用EduGen平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-medium mb-2">配置API</h4>
              <p className="text-sm text-muted-foreground">在系统设置中配置您的AI模型API密钥</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-medium mb-2">生成资源</h4>
              <p className="text-sm text-muted-foreground">使用AI生成器创建您需要的教学资源</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-medium mb-2">管理分享</h4>
              <p className="text-sm text-muted-foreground">整理资源并与团队成员协作分享</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
