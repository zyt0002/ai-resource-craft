
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AIGeneratorForm } from "@/components/AIGeneratorForm";
import { GeneratedContentDisplay } from "@/components/GeneratedContentDisplay";
import { GenerationHistory } from "@/components/GenerationHistory";

export default function AIGenerator() {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);

  // 获取 AI 生成历史
  const { data: aiGenerations, refetch } = useQuery({
    queryKey: ['ai-generations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const handleGenerate = async (data: {
    prompt: string;
    generationType: string;
    model: string;
    fileUrl: string | null;
  }) => {
    if (!data.prompt.trim()) {
      toast({ title: "请输入生成提示", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 多模态：将上传文件URL一并提交
      const { data: result, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: data.prompt,
          generationType: data.generationType,
          model: data.model,
          fileUrl: data.fileUrl,
        },
      });

      // Debug: 输出 AI 返回内容
      console.log("AI raw result:", result);

      if (error) throw error;

      if (result.success) {
        if (data.generationType === "image" && result.imageBase64) {
          setGeneratedContent(""); // 清空文本
          setGeneratedImageBase64(result.imageBase64);
        } else if (typeof result.content === "string" && result.content.trim()) {
          setGeneratedContent(result.content);
          setGeneratedImageBase64(null);
        } else {
          // 文本内容为空或未返回，清空
          setGeneratedContent("");
          setGeneratedImageBase64(null);
        }

        // 保存到数据库时也一并存模型信息
        const { error: saveError } = await supabase
          .from('ai_generations')
          .insert({
            user_id: profile?.id,
            prompt: data.prompt,
            generation_type: data.generationType,
            result_data: { content: result.content, model: result.model },
            model: result.model, // 记录模型
          });

        if (saveError) {
          console.error('保存生成历史失败:', saveError);
        } else {
          refetch(); // 刷新历史记录
        }

        toast({ title: "AI 生成成功！", description: "内容已生成，您可以进一步编辑" });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsResource = async () => {
    // Debug: 打印待保存内容和设置的 content 字段
    console.log("即将保存的内容：", {
      title, description, generatedContent, generatedImageBase64
    });

    if (!(generatedContent || generatedImageBase64) || !title.trim()) {
      toast({ title: "请填写标题并生成内容", variant: "destructive" });
      return;
    }

    let type: "document" | "image" | "courseware" = "courseware";
    let file_type = undefined;

    if (generatedImageBase64) {
      // 图片 AI 生成
      type = "image";
      file_type = "image/png";
    } else if (generatedContent) {
      type = "document";
      try {
        const testContent = generatedContent.trim();
        if (
          (testContent.startsWith("{") && testContent.endsWith("}")) ||
          (testContent.startsWith("[") && testContent.endsWith("]"))
        ) {
          JSON.parse(testContent);
          file_type = "application/json";
        } else {
          file_type = "text/plain";
        }
      } catch {
        file_type = "text/plain";
      }
    }

    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          title,
          description,
          content: generatedContent && generatedContent.trim() ? generatedContent : null,
          type: type,
          status: 'draft',
          owner_id: profile?.id,
          thumbnail_url: generatedImageBase64 ? generatedImageBase64 : undefined,
          file_type: file_type,
        });
      if (error) throw error;

      toast({ title: "保存成功！", description: "资源已保存为草稿，在资源管理中可查看和管理" });
      setTitle("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto mt-4 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生成表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI 智能生成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIGeneratorForm onGenerate={handleGenerate} loading={loading} />
          </CardContent>
        </Card>

        {/* 生成结果区 */}
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

      {/* 生成历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近生成记录</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerationHistory aiGenerations={aiGenerations} />
        </CardContent>
      </Card>
    </div>
  );
}
