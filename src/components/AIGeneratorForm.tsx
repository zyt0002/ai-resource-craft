
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
    voice?: string;
  }) => void;
  loading: boolean;
}

export function AIGeneratorForm({ onGenerate, loading }: AIGeneratorFormProps) {
  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState("courseware");
  const [selectedModel, setSelectedModel] = useState("Qwen/Qwen2.5-7B-Instruct");
  const [selectedVoice, setSelectedVoice] = useState("FunAudioLLM/CosyVoice2-0.5B:alex");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 音色选项
  const voiceOptions = [
    { value: "FunAudioLLM/CosyVoice2-0.5B:alex", label: "Alex (男声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:anna", label: "Anna (女声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:bella", label: "Bella (女声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:benjamin", label: "Benjamin (男声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:charles", label: "Charles (男声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:claire", label: "Claire (女声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:david", label: "David (男声)" },
    { value: "FunAudioLLM/CosyVoice2-0.5B:diana", label: "Diana (女声)" },
  ];

  // 视频生成模型选项
  const videoModels = [
    { value: "Wan-AI/Wan2.1-T2V-14B", label: "Wan2.1-T2V-14B (文本生成视频)" },
    { value: "Wan-AI/Wan2.1-T2V-14B-Turbo", label: "Wan2.1-T2V-14B-Turbo (快速版)" },
    { value: "Wan-AI/Wan2.1-I2V-14B-720P", label: "Wan2.1-I2V-14B-720P (图片生成视频)" },
    { value: "Wan-AI/Wan2.1-I2V-14B-720P-Turbo", label: "Wan2.1-I2V-14B-720P-Turbo (快速版)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt,
      generationType,
      model: selectedModel,
      fileUrl: uploadedFileUrl,
      voice: generationType === "audio" ? selectedVoice : undefined,
    });
  };

  const handleGenerationTypeChange = (value: string) => {
    setGenerationType(value);
    // 切换到视频生成时，自动选中默认视频模型
    if (value === "video-generation") {
      setSelectedModel("Wan-AI/Wan2.1-T2V-14B");
    }
    // 语音转文字功能使用SenseVoiceSmall模型
    else if (value === "speech-to-text") {
      setSelectedModel("FunAudioLLM/SenseVoiceSmall");
    }
    // 图片生成
    else if (value === "image") {
      setSelectedModel("Kwai-Kolors/Kolors");
    }
    // 其它类型还原默认文本模型
    else if (value !== "video-generation" && value !== "image" && value !== "speech-to-text") {
      setSelectedModel("Qwen/Qwen2.5-7B-Instruct");
    }
  };

  const handleFileUpload = (url: string, fileName: string, fileType: string) => {
    setUploadedFileUrl(url);
    setUploadedFileName(fileName);
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
            <SelectItem value="video-generation">视频生成</SelectItem>
            <SelectItem value="audio">语音生成</SelectItem>
            <SelectItem value="speech-to-text">语音转文字</SelectItem>
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
      ) : generationType === "video-generation" ? (
        <div className="space-y-2">
          <Label htmlFor="video-model">视频生成模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="请选择视频生成模型" />
            </SelectTrigger>
            <SelectContent>
              {videoModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : generationType === "speech-to-text" ? (
        <div className="space-y-2">
          <Label htmlFor="speech-model">语音转文字模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="请选择语音转文字模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FunAudioLLM/SenseVoiceSmall">
                FunAudioLLM/SenseVoiceSmall
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : generationType === "audio" ? (
        <div className="space-y-2">
          <Label htmlFor="voice">选择音色</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="请选择音色" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
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
        <Label htmlFor="prompt">
          {generationType === "speech-to-text" ? "备注信息（可选）" : generationType === "video-generation" ? "视频描述" : "生成提示"}
        </Label>
        <Textarea
          id="prompt"
          placeholder={
            generationType === "speech-to-text"
              ? "请上传音频文件进行语音转文字，此处可添加备注信息..."
            : generationType === "audio" 
              ? "请输入要转换为语音的文本内容..." 
            : generationType === "video-generation"
              ? "描述您想要生成的视频内容，例如：一只可爱的小猫在花园里玩耍..."
              : "请描述您想要生成的内容，例如：生成一份关于植物光合作用的小学科学课件..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          required={generationType !== "speech-to-text"}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {generationType === "speech-to-text" ? "转换中..." : generationType === "video-generation" ? "生成中（最多需要10分钟）..." : "生成中..."}
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {generationType === "speech-to-text" ? "开始转换" : generationType === "video-generation" ? "开始生成视频" : "开始生成"}
          </>
        )}
      </Button>
    </form>
  );
}
