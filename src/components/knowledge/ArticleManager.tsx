
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash, MoreVertical, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArticleEditDialog } from "@/components/knowledge/ArticleEditDialog";

export function ArticleManager() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: articles, refetch } = useQuery({
    queryKey: ['knowledge-articles', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base_articles')
        .select(`
          id,
          title,
          summary,
          category,
          status,
          view_count,
          created_at,
          updated_at,
          profiles:created_by (
            full_name,
            username
          )
        `)
        .order('updated_at', { ascending: false });

      // 如果不是管理员，只显示自己的文章
      if (profile?.role !== 'admin') {
        query = query.eq('created_by', profile?.id);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (articleId: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      const { error } = await supabase
        .from('knowledge_base_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({ title: "文章删除成功" });
      refetch();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base_articles')
        .update({ status: newStatus })
        .eq('id', articleId);

      if (error) throw error;

      toast({ title: "状态更新成功" });
      refetch();
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      draft: "secondary",
      archived: "outline",
    } as const;
    
    const labels = {
      active: "已发布",
      draft: "草稿",
      archived: "已归档",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>文章管理</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {articles && articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>作者</TableHead>
                  <TableHead>浏览量</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{article.title}</div>
                        {article.summary && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {article.summary}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.category && (
                        <Badge variant="outline">{article.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(article.status)}</TableCell>
                    <TableCell>
                      {article.profiles?.full_name || article.profiles?.username || '匿名'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.view_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(article.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedArticle(article);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          {article.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(article.id, 'active')}
                            >
                              发布
                            </DropdownMenuItem>
                          )}
                          {article.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(article.id, 'archived')}
                            >
                              归档
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(article.id)}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "未找到匹配的文章" : "暂无文章，请先上传文章"}
            </div>
          )}
        </CardContent>
      </Card>

      <ArticleEditDialog
        article={selectedArticle}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          refetch();
          setEditDialogOpen(false);
          setSelectedArticle(null);
        }}
      />
    </div>
  );
}
