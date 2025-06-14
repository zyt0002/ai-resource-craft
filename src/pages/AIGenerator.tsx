
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ResourceCard } from "@/components/ResourceCard";
const fakeData = [
  { id: "1", title: "小学语文课件生成", type: "document", updatedAt: "2024-06-14" },
  { id: "2", title: "数学教学图片", type: "image", updatedAt: "2024-06-13", previewUrl: "https://placehold.co/36x36" },
  { id: "3", title: "口语训练音频", type: "audio", updatedAt: "2024-06-13" },
];

export default function AIGenerator() {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto mt-4">
      <div className="flex items-center gap-4 mb-8">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-lg font-bold shadow hover:scale-105 hover:bg-blue-800 transition"
          onClick={() => toast({ title: "AI资源生成", description: "（功能占位）将对接Supabase后端与AI能力" })}
        >
          <Sparkles className="w-6 h-6 mr-1" /> 发起AI智能资源生成
        </button>
        <span className="text-muted-foreground text-sm">(例：输入学科+需求，自动生成资源)</span>
      </div>
      <div>
        <h2 className="font-semibold text-lg mb-2">历史生成</h2>
        <div className="flex flex-wrap gap-6">
          {fakeData.map((res) => (
            <ResourceCard key={res.id} resource={res as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
