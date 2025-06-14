
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUploadComponent from "./FileUploadComponent";

interface AIGeneratorFormProps {
  onGenerate: (data: {
    prompt: string;
    generationType: string;
    model: string;
    fileUrl: string | null;
  }) => void;
  loading: boolean;
}

export function AIGeneratorForm({ onGenerate, loading }: AIGeneratorFormProps) {
  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState("courseware");
  const [selectedModel, setSelectedModel] = useState("Qwen/Qwen2.5-7B-Instruct");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 支持的模型列表（文本/文档/课件/视频/音频）
  const modelList = [
    { value: "Qwen/Qwen2.5-7B-Instruct", label: "Qwen/Qwen2.5-7B-Instruct" },
    { value: "Tongyi-Zhiwen/QwenLong-L1-32B", label: "Tongyi-Zhiwen/QwenLong-L1-32B" },
    { value: "Qwen/Qwen3-32B", label: "Qwen/Qwen3-32B" },
    { value: "THUDM/GLM-Z1-32B-0414", label: "THUDM/GLM-Z1-32B-0414" },
    { value: "Qwen/Qwen2.5-VL-32B-Instruct", label: "Qwen/Qwen2.5-VL-32B-Instruct" },
    { value: "Qwen/QwQ-32B", label: "Qwen/QwQ-32B" },
    { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", label: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B" },
    { value: "Qwen/Qwen2.5-Coder-32B-Instruct", label: "Qwen/Qwen2.5-Coder-32B-Instruct" },
    { value: "Qwen/Qwen2.5-32B-Instruct", label: "Qwen/Qwen2.5-32B-Instruct" },
    { value: "THUDM/GLM-4-32B-0414", label: "THUDM/GLM-4-32B-0414" },
    { value: "THUDM/GLM-Z1-Rumination-32B-0414", label: "THUDM/GLM-Z1-Rumination-32B-0414" },
    { value: "Qwen/Qwen3-14B", label: "Qwen/Qwen3-14B" },
    { value: "Qwen/Qwen2.5-14B-Instruct", label: "Qwen/Qwen2.5-14B-Instruct" },
    { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", label: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B" },
  ];

  // 只保留Kolors 图片模型
  const imageModelList = [
    { value: "Kwai-Kolors/Kolors", label: "Kwai-Kolors/Kolors" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt,
      generationType,
      model: selectedModel,
      fileUrl: uploadedFileUrl,
    });
  };

  const handleGenerationTypeChange = (value: string) => {
    setGenerationType(value);
    // 切换到图片生成时，自动选Kolors
    if (value === "image") {
      setSelectedModel("Kwai-Kolors/Kolors");
    }
    // 切换回文本/其它时选文本默认模型
    if (value !== "image") {
      setSelectedModel("Qwen/Qwen2.5-7B-Instruct");
    }
  };

  // 只保存文件信息，不触发生成
  const handleFileUpload = (url: string, fileName: string, fileType: string) => {
    setUploadedFileUrl(url);
    setUploadedFileName(fileName);
    console.log('文件上传完成，已保存文件信息:', { url, fileName, fileType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">生成类型</Label>
        <Select value={generationType} onValueChange={handleGenerationTypeChange}>
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

      {generationType === "image" ? (
        <div className="space-y-2">
          <Label htmlFor="image-model">图片生成模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="请选择图片生成模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kwai-Kolors/Kolors">Kwai-Kolors/Kolors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="model">选择模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="请选择模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Qwen/Qwen2.5-7B-Instruct">Qwen/Qwen2.5-7B-Instruct</SelectItem>
              <SelectItem value="Tongyi-Zhiwen/QwenLong-L1-32B">Tongyi-Zhiwen/QwenLong-L1-32B</SelectItem>
              <SelectItem value="Qwen/Qwen3-32B">Qwen/Qwen3-32B</SelectItem>
              <SelectItem value="THUDM/GLM-Z1-32B-0414">THUDM/GLM-Z1-32B-0414</SelectItem>
              <SelectItem value="Qwen/Qwen2.5-VL-32B-Instruct">Qwen/Qwen2.5-VL-32B-Instruct</SelectItem>
              <SelectItem value="Qwen/QwQ-32B">Qwen/QwQ-32B</SelectItem>
              <SelectItem value="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B">deepseek-ai/DeepSeek-R1-Distill-Qwen-32B</SelectItem>
              <SelectItem value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen/Qwen2.5-Coder-32B-Instruct</SelectItem>
              <SelectItem value="Qwen/Qwen2.5-32B-Instruct">Qwen/Qwen2.5-32B-Instruct</SelectItem>
              <SelectItem value="THUDM/GLM-4-32B-0414">THUDM/GLM-4-32B-0414</SelectItem>
              <SelectItem value="THUDM/GLM-Z1-Rumination-32B-0414">THUDM/GLM-Z1-Rumination-32B-0414</SelectItem>
              <SelectItem value="Qwen/Qwen3-14B">Qwen/Qwen3-14B</SelectItem>
              <SelectItem value="Qwen/Qwen2.5-14B-Instruct">Qwen/Qwen2.5-14B-Instruct</SelectItem>
              <SelectItem value="deepseek-ai/DeepSeek-R1-Distill-Qwen-14B">deepseek-ai/DeepSeek-R1-Distill-Qwen-14B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <FileUploadComponent
        onFileUpload={handleFileUpload}
        maxFiles={1}
        multiple={false}
      />

      {uploadedFileName && (
        <div className="text-sm text-muted-foreground">
          当前文件：{uploadedFileName}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="prompt">生成提示</Label>
        <Textarea
          id="prompt"
          placeholder="请描述您想要生成的内容，例如：生成一份关于植物光合作用的小学科学课件..."
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
  );
}
