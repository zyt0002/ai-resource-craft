
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function KnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, refetch } = useQuery({
    queryKey: ['knowledge-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select(`
          id,
          title,
          content,
          summary,
          tags,
          category,
          created_at,
          view_count,
          profiles:created_by (
            full_name,
            username
          )
        `)
        .eq('status', 'active')
        .textSearch('search_vector', searchQuery, {
          type: 'websearch',
          config: 'simple'
        })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "请输入搜索关键词", variant: "destructive" });
      return;
    }
    
    setIsSearching(true);
    try {
      await refetch();
    } catch (error: any) {
      toast({
        title: "搜索失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            知识库全文检索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入关键词搜索知识库..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "搜索中..." : "搜索"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            找到 {searchResults.length} 条相关结果
          </div>
          
          {searchResults.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 
                      className="text-lg font-semibold line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(article.title, searchQuery)
                      }}
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {article.summary && (
                    <p 
                      className="text-muted-foreground text-sm line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(article.summary, searchQuery)
                      }}
                    />
                  )}
                  
                  <div 
                    className="text-sm line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        article.content.substring(0, 200) + (article.content.length > 200 ? '...' : ''),
                        searchQuery
                      )
                    }}
                  />
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {article.category && (
                        <Badge variant="secondary">{article.category}</Badge>
                      )}
                      {article.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.profiles?.full_name || article.profiles?.username || '匿名'}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        浏览 {article.view_count || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults && searchResults.length === 0 && searchQuery && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>未找到相关结果，请尝试其他关键词</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
