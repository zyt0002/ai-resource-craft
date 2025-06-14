
import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function AIGenerator() {
  const { profile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState("courseware");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({ title: "请输入生成提示", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 调用硅基流动 Edge Function
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt,
          generationType,
        },
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.content);
        
        // 保存到数据库
        const { error: saveError } = await supabase
          .from('ai_generations')
          .insert({
            user_id: profile?.id,
            prompt,
            generation_type: generationType,
            result_data: { content: data.content, model: data.model },
          });

        if (saveError) {
          console.error('保存生成历史失败:', saveError);
        } else {
          refetch(); // 刷新历史记录
        }

        toast({ title: "AI 生成成功！", description: "内容已生成，您可以进一步编辑" });
      } else {
        throw new Error(data.error);
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
    if (!generatedContent || !title.trim()) {
      toast({ title: "请填写标题并生成内容", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          title,
          description,
          content: generatedContent,
          type: generationType as any,
          status: 'draft',
          owner_id: profile?.id,
        });

      if (error) throw error;

      toast({ title: "保存成功！", description: "资源已保存为草稿" });
      setTitle("");
      setDescription("");
      setGeneratedContent("");
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
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">生成类型</Label>
                <Select value={generationType} onValueChange={setGenerationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courseware">课件 PPT</SelectItem>
                    <SelectItem value="document">教学文档</SelectItem>
                    <SelectItem value="image">教学图片</SelectItem>
                    <SelectItem value="video">视频脚本</SelectItem>
                    <SelectItem value="audio">音频脚本</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">生成提示</Label>
                <Textarea
                  id="prompt"
                  placeholder="请描述您想要生成的内容，例如：生成一份关于"植物光合作用"的小学科学课件..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 生成结果 */}
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">资源标题</Label>
                  <Input
                    id="title"
                    placeholder="为生成的内容起个标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">资源描述</Label>
                  <Input
                    id="description"
                    placeholder="简单描述这个资源"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>生成内容</Label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                  </div>
                </div>
                <Button onClick={handleSaveAsResource} className="w-full">
                  保存为资源
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                请在左侧输入提示并点击生成
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 生成历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近生成记录</CardTitle>
        </CardHeader>
        <CardContent>
          {aiGenerations?.length ? (
            <div className="space-y-3">
              {aiGenerations.map((generation) => (
                <div key={generation.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{generation.generation_type}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(generation.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{generation.prompt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">暂无生成记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
