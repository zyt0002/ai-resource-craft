
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, BookOpen, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArticleManager } from "@/components/knowledge/ArticleManager";
import { ArticleUpload } from "@/components/knowledge/ArticleUpload";
import { KnowledgeSearch } from "@/components/knowledge/KnowledgeSearch";
import { RAGChat } from "@/components/knowledge/RAGChat";

export default function KnowledgeBase() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");

  // 获取知识库统计信息
  const { data: stats } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select('status, created_by')
        .eq('status', 'active');
      
      if (error) throw error;
      
      return {
        total: data.length,
        myArticles: data.filter(article => article.created_by === profile?.id).length,
      };
    },
  });

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">知识库管理</h2>
          <p className="text-muted-foreground mt-2">
            管理知识库文章，进行智能检索和RAG问答
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
            <div>总文章数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats?.myArticles || 0}</div>
            <div>我的文章</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            智能检索
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            RAG问答
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            文章管理
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            上传文章
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="search">
            <KnowledgeSearch />
          </TabsContent>

          <TabsContent value="chat">
            <RAGChat />
          </TabsContent>

          <TabsContent value="manage">
            <ArticleManager />
          </TabsContent>

          <TabsContent value="upload">
            <ArticleUpload />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
