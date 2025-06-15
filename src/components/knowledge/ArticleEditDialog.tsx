
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ArticleEditDialogProps {
  article: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ArticleEditDialog({ article, open, onOpenChange, onSuccess }: ArticleEditDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "none",
    tags: "",
    status: "active",
  });
  const [tagList, setTagList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (article && open) {
      console.log('Setting form data for article:', article);
      setFormData({
        title: article.title || "",
        content: article.content || "",
        summary: article.summary || "",
        category: article.category || "none",
        tags: "",
        status: article.status || "active",
      });
      setTagList(article.tags || []);
    }
  }, [article, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !tagList.includes(tag)) {
      setTagList(prev => [...prev, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagList(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = formData.tags.trim();
      if (tag) {
        addTag(tag);
        setFormData(prev => ({ ...prev, tags: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: "请输入文章标题", variant: "destructive" });
      return;
    }

    if (!article?.id) {
      toast({ title: "文章ID不存在", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category === "none" ? null : formData.category,
        tags: tagList.length > 0 ? tagList : null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating article with data:', updateData);

      const { error } = await supabase
        .from('knowledge_base_articles')
        .update(updateData)
        .eq('id', article.id);

      if (error) throw error;

      toast({ title: "文章更新成功" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!article) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑文章</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">文章标题</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="输入文章标题"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">分类</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无分类</SelectItem>
                  <SelectItem value="技术文档">技术文档</SelectItem>
                  <SelectItem value="产品说明">产品说明</SelectItem>
                  <SelectItem value="用户手册">用户手册</SelectItem>
                  <SelectItem value="培训资料">培训资料</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-summary">文章摘要</Label>
            <Textarea
              id="edit-summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="输入文章摘要"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">文章内容</Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="输入文章内容"
              rows={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">标签</Label>
            <div className="space-y-2">
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                onKeyDown={handleTagKeyPress}
                placeholder="输入标签后按回车或逗号添加"
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagList.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">状态</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">已发布</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
