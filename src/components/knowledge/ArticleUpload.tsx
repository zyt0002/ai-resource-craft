import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function ArticleUpload() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "",
    tags: "",
    sourceType: "manual",
    sourceUrl: "",
  });
  const [tagList, setTagList] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const processFileContent = (content: string, fileName: string): { title: string; content: string; summary: string } => {
    // 清理内容，移除可能引起问题的字符
    const cleanContent = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符
      .replace(/\0/g, '') // 移除null字符
      .trim();
    
    // 自动生成标题（如果未设置）
    const title = formData.title || fileName.replace(/\.[^/.]+$/, "");
    
    // 自动生成摘要（取前200字符）
    const summary = formData.summary || cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
    
    return { title, content: cleanContent, summary };
  };

  const handleFileUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let content = '';
          const result = e.target?.result;
          
          if (typeof result === 'string') {
            content = result;
          } else if (result instanceof ArrayBuffer) {
            // 如果是二进制数据，尝试解码为UTF-8
            const decoder = new TextDecoder('utf-8', { fatal: false });
            content = decoder.decode(result);
          }
          
          console.log('文件读取成功:', { fileName: file.name, contentLength: content.length });
          
          const { title, content: processedContent, summary } = processFileContent(content, file.name);
          
          const { error } = await supabase
            .from('knowledge_base_articles')
            .insert({
              title,
              content: processedContent,
              summary,
              tags: tagList.length > 0 ? tagList : null,
              category: formData.category || null,
              source_type: 'file_upload',
              file_type: file.type,
              created_by: profile?.id,
              status: 'active',
            });

          if (error) {
            console.error('数据库插入错误:', error);
            throw error;
          }
          
          console.log('文章保存成功:', title);
          resolve();
        } catch (error) {
          console.error('文件处理错误:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('文件读取失败:', file.name);
        reject(new Error('文件读取失败'));
      };
      
      // 优先使用 readAsText 并指定编码
      try {
        reader.readAsText(file, 'UTF-8');
      } catch (error) {
        console.error('读取文件时出错:', error);
        // 如果 readAsText 失败，尝试 readAsArrayBuffer
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title && !files) {
      toast({ title: "请输入标题或选择文件", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    try {
      if (files && files.length > 0) {
        // 批量上传文件
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < files.length; i++) {
          try {
            await handleFileUpload(files[i]);
            successCount++;
          } catch (error) {
            console.error(`文件 ${files[i].name} 上传失败:`, error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          toast({ 
            title: `成功上传 ${successCount} 个文件` + (errorCount > 0 ? `，${errorCount} 个文件上传失败` : '') 
          });
        } else {
          toast({ 
            title: "文件上传失败", 
            description: "请检查文件格式或内容是否正确",
            variant: "destructive" 
          });
        }
      } else {
        // 手动输入的文章
        const { error } = await supabase
          .from('knowledge_base_articles')
          .insert({
            title: formData.title,
            content: formData.content,
            summary: formData.summary || formData.content.substring(0, 200),
            tags: tagList.length > 0 ? tagList : null,
            category: formData.category || null,
            source_type: formData.sourceType,
            source_url: formData.sourceUrl || null,
            created_by: profile?.id,
            status: 'active',
          });

        if (error) throw error;
        toast({ title: "文章上传成功" });
      }

      // 重置表单
      setFormData({
        title: "",
        content: "",
        summary: "",
        category: "",
        tags: "",
        sourceType: "manual",
        sourceUrl: "",
      });
      setTagList([]);
      setFiles(null);
      
    } catch (error: any) {
      console.error('上传失败:', error);
      toast({
        title: "上传失败",
        description: error.message || "请检查文件内容或网络连接",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            上传知识库文章
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">文章标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="输入文章标题"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label htmlFor="summary">文章摘要</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="输入文章摘要（可选，如未填写将自动生成）"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">文章内容</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="输入文章内容，支持Markdown格式"
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="space-y-2">
                <Input
                  id="tags"
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
              <Label htmlFor="file-upload">文件上传</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".txt,.md,.doc,.docx,.csv"
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    点击选择文件或拖拽文件到此处
                    <br />
                    支持 .txt, .md, .doc, .docx, .csv 格式
                  </p>
                </label>
                {files && files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">已选择文件：</p>
                    <ul className="text-sm text-muted-foreground">
                      {Array.from(files).map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceType">来源类型</Label>
                <Select value={formData.sourceType} onValueChange={(value) => handleInputChange('sourceType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">手动输入</SelectItem>
                    <SelectItem value="file_upload">文件上传</SelectItem>
                    <SelectItem value="web_crawl">网页抓取</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">来源链接（可选）</Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                  placeholder="输入原始链接"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? "上传中..." : "上传文章"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
