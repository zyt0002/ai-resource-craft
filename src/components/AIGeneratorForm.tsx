
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

  // 支持的模型列表
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

  // 图片模型列表
  const imageModelList = [
    { value: "Kwai-Kolors/Kolors", label: "Kwai-Kolors/Kolors" },
    { value: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell" },
    { value: "SD 3.5 Large", label: "SD 3.5 Large" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("提交表单数据:", {
      prompt,
      generationType,
      model: selectedModel,
      fileUrl: uploadedFileUrl,
    });
    
    onGenerate({
      prompt,
      generationType,
      model: selectedModel,
      fileUrl: uploadedFileUrl,
    });
  };

  const handleGenerationTypeChange = (value: string) => {
    console.log("切换生成类型到:", value);
    setGenerationType(value);
    
    // 当切换到图片生成时，自动选择图片模型
    if (value === "image" && !imageModelList.find(m => m.value === selectedModel)) {
      console.log("切换到图片模型: Kwai-Kolors/Kolors");
      setSelectedModel("Kwai-Kolors/Kolors");
    }
    // 当切换到非图片生成时，如果当前是图片模型，则切换到文本模型
    if (value !== "image" && imageModelList.find(m => m.value === selectedModel)) {
      console.log("切换到文本模型: Qwen/Qwen2.5-7B-Instruct");
      setSelectedModel("Qwen/Qwen2.5-7B-Instruct");
    }
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
              {imageModelList.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
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
              {modelList.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <FileUploadComponent
        onFileUpload={(url, fileName, fileType) => {
          setUploadedFileUrl(url);
          setUploadedFileName(fileName);
        }}
      />
      
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
