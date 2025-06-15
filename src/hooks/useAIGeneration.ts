
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useAIGeneration(
  title: string,
  description: string,
  setTitle: (title: string) => void,
  setDescription: (description: string) => void
) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);

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
    voice?: string;
  }) => {
    if (!data.prompt.trim()) {
      toast({ title: "请输入生成提示", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: data.prompt,
          generationType: data.generationType,
          model: data.model,
          fileUrl: data.fileUrl,
          voice: data.voice,
        },
      });

      console.log("AI raw result:", result);

      if (error) throw error;

      if (result.success) {
        // 处理音频生成
        if (data.generationType === "audio" && result.audioBase64) {
          console.log("处理音频生成结果");
          setGeneratedContent("");
          setGeneratedImageBase64(null);
          setGeneratedImageUrl(null);
          setGeneratedVideoUrl(null);
          setGeneratedAudioBase64(result.audioBase64);
        }
        // 处理图片生成
        else if (data.generationType === "image" && (result.imageBase64 || result.imageUrl)) {
          console.log("处理图片生成结果");
          setGeneratedContent("");
          setGeneratedImageBase64(result.imageBase64 ?? null);
          setGeneratedImageUrl(result.imageUrl ?? null);
          setGeneratedVideoUrl(null);
          setGeneratedAudioBase64(null);
        } 
        // 处理视频生成
        else if (data.generationType === "video-generation" && result.videoUrl) {
          console.log("处理视频生成结果，videoUrl:", result.videoUrl);
          setGeneratedContent("");
          setGeneratedImageBase64(null);
          setGeneratedImageUrl(null);
          setGeneratedVideoUrl(result.videoUrl);
          setGeneratedAudioBase64(null);
        }
        // 处理文本内容生成
        else if (typeof result.content === "string" && result.content.trim()) {
          console.log("处理文本内容生成");
          setGeneratedContent(result.content);
          setGeneratedImageBase64(null);
          setGeneratedImageUrl(null);
          setGeneratedVideoUrl(null);
          setGeneratedAudioBase64(null);
        } else {
          console.log("未匹配到任何生成类型，清空所有状态");
          setGeneratedContent("");
          setGeneratedImageBase64(null);
          setGeneratedImageUrl(null);
          setGeneratedVideoUrl(null);
          setGeneratedAudioBase64(null);
        }

        // 保存到数据库
        const { error: saveError } = await supabase
          .from('ai_generations')
          .insert({
            user_id: profile?.id,
            prompt: data.prompt,
            generation_type: data.generationType,
            result_data: { content: result.content, model: result.model },
            model: result.model,
          });

        if (saveError) {
          console.error('保存生成历史失败:', saveError);
        } else {
          refetch();
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
    console.log("即将保存的内容：", {
      title, description, generatedContent, generatedImageBase64, generatedImageUrl, generatedVideoUrl, generatedAudioBase64
    });

    if (!(generatedContent || generatedImageBase64 || generatedImageUrl || generatedVideoUrl || generatedAudioBase64) || !title.trim()) {
      toast({ title: "请填写标题并生成内容", variant: "destructive" });
      return;
    }

    let type: "document" | "image" | "courseware" | "video" | "audio" = "courseware";
    let file_type = undefined;

    if (generatedAudioBase64) {
      type = "audio";
      file_type = "audio/mp3";
    } else if (generatedVideoUrl) {
      type = "video";
      file_type = "video/mp4";
    } else if (generatedImageBase64 || generatedImageUrl) {
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
          thumbnail_url: generatedImageBase64 ? generatedImageBase64 : generatedImageUrl ? generatedImageUrl : generatedVideoUrl ? generatedVideoUrl : generatedAudioBase64 ? `data:audio/mp3;base64,${generatedAudioBase64}` : undefined,
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

  return {
    loading,
    generatedContent,
    generatedImageBase64,
    generatedImageUrl,
    generatedVideoUrl,
    generatedAudioBase64,
    aiGenerations,
    handleGenerate,
    handleSaveAsResource
  };
}
