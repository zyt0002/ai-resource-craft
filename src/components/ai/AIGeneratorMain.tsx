
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { AIGeneratorForm } from "@/components/AIGeneratorForm";
import { GeneratedContentDisplay } from "@/components/GeneratedContentDisplay";
import { useAIGeneration } from "@/hooks/useAIGeneration";

export function AIGeneratorMain() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const {
    loading,
    generatedContent,
    generatedImageBase64,
    generatedImageUrl,
    generatedVideoUrl,
    generatedAudioBase64,
    handleGenerate,
    handleSaveAsResource
  } = useAIGeneration(title, description, setTitle, setDescription);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>生成结果</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneratedContentDisplay
            generatedContent={generatedContent}
            generatedImageBase64={generatedImageBase64}
            generatedImageUrl={generatedImageUrl}
            generatedVideoUrl={generatedVideoUrl}
            generatedAudioBase64={generatedAudioBase64}
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSaveAsResource={handleSaveAsResource}
          />
        </CardContent>
      </Card>
    </div>
  );
}
