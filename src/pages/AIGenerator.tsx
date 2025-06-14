
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIGeneratorForm } from "@/components/AIGeneratorForm";
import { GeneratedContentDisplay } from "@/components/GeneratedContentDisplay";
import { GenerationHistory } from "@/components/GenerationHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AIGenerator() {
  const { profile } = useAuth();
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string, type: string, file?: File) => {
    if (!profile?.id) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能使用AI生成功能",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedImageBase64(null);
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('type', type);
      formData.append('user_id', profile.id);
      
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/functions/v1/ai-generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const result = await response.json();
      
      if (type === 'image' && result.image) {
        setGeneratedImageBase64(result.image);
      } else if (result.content) {
        setGeneratedContent(result.content);
      }

      toast({
        title: "生成成功",
        description: "内容已生成完成",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "生成失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsResource = async () => {
    if (!profile?.id) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能保存资源",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "请输入标题",
        description: "资源标题不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      let resourceData: any = {
        title: title.trim(),
        description: description.trim() || null,
        owner_id: profile.id,
        type: generatedImageBase64 ? 'image' : 'document',
      };

      if (generatedImageBase64) {
        // 处理图片：将base64转换为blob并上传
        const base64Data = generatedImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        const fileName = `generated-image-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        resourceData.file_path = uploadData.path;
        resourceData.file_type = 'image/png';
        resourceData.thumbnail_url = `${supabase.supabaseUrl}/storage/v1/object/public/resources/${uploadData.path}`;
      } else if (generatedContent) {
        // 处理文字内容：直接保存到content字段
        resourceData.content = generatedContent;
        resourceData.file_type = 'text/plain';
      }

      const { error } = await supabase
        .from('resources')
        .insert([resourceData]);

      if (error) throw error;

      toast({
        title: "保存成功",
        description: "资源已保存到资源库",
      });

      // 清空表单
      setGeneratedContent("");
      setGeneratedImageBase64(null);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">AI 智能生成器</h1>
        <p className="text-muted-foreground">使用人工智能快速生成教学资源</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">生成内容</TabsTrigger>
          <TabsTrigger value="history">生成历史</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>输入参数</CardTitle>
              </CardHeader>
              <CardContent>
                <AIGeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>生成结果</CardTitle>
              </CardHeader>
              <CardContent>
                <GeneratedContentDisplay
                  generatedContent={generatedContent}
                  generatedImageBase64={generatedImageBase64}
                  title={title}
                  description={description}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onSaveAsResource={handleSaveAsResource}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>生成历史</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerationHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
