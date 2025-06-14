
import { ResourceCard } from "@/components/ResourceCard";
import { toast } from "@/hooks/use-toast";

const resources = [
  { id: "1", title: "Unit 1 PPT", type: "document", updatedAt: "2024-05-29" },
  { id: "2", title: "教学插图-春天", type: "image", updatedAt: "2024-05-28", previewUrl: "https://placehold.co/36x36" },
  { id: "3", title: "科学实验讲解视频", type: "video", updatedAt: "2024-05-26" },
];

export default function ResourceManager() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">全部资源</h2>
        <button
          className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
          onClick={() => toast({ title: "上传资源", description: "暂未接入Supabase存储，后续支持多格式上传。" })}
        >
          上传资源
        </button>
      </div>
      <div className="flex flex-wrap gap-6">
        {resources.map((res) => (
          <ResourceCard key={res.id} resource={res as any} />
        ))}
      </div>
    </div>
  );
}
