
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIGeneratorMain } from "@/components/ai/AIGeneratorMain";
import { GenerationHistory } from "@/components/GenerationHistory";
import { useAIGeneration } from "@/hooks/useAIGeneration";

export default function AIGenerator() {
  const { aiGenerations } = useAIGeneration("", "", () => {}, () => {});

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto mt-4 gap-6 h-[calc(100vh-8rem)]">
      <div className="flex-1">
        <AIGeneratorMain />
      </div>
      <Card className="flex-shrink-0">
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
