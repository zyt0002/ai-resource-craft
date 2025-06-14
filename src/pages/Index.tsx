
import { ResourceCard } from "@/components/ResourceCard";
import { Sparkles, FolderKanban } from "lucide-react";

const fakeResources = [
  { id: "1", title: "小学语文PPT范例", type: "document", updatedAt: "2024-06-12" },
  { id: "2", title: "科学课配图", type: "image", updatedAt: "2024-06-11", previewUrl: "https://placehold.co/36x36" },
  { id: "3", title: "教研会议录音", type: "audio", updatedAt: "2024-06-10" },
  { id: "4", title: "英语听力训练", type: "audio", updatedAt: "2024-06-08" },
];

export default function Index() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">欢迎使用 EduGen 智能教育资源平台 👋</h1>
          <div className="text-base text-muted-foreground mt-2">利用 AI 快速生成、管理并分享多格式教学资源</div>
        </div>
        <img src="https://placehold.co/88x88" className="rounded-full shadow" />
      </div>
      <div className="grid grid-cols-2 gap-8 mb-8 max-w-3xl">
        <a href="/ai-generator" className="flex items-center p-5 rounded-2xl bg-primary/80 text-white shadow-lg hover:scale-105 transition hover:bg-primary gap-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <div className="text-lg font-bold">AI智能生成</div>
            <div className="text-xs">一键生成PPT/图片/教案</div>
          </div>
        </a>
        <a href="/resources" className="flex items-center p-5 rounded-2xl bg-blue-100 text-blue-900 shadow hover:scale-105 gap-3 transition">
          <FolderKanban className="w-8 h-8" />
          <div>
            <div className="text-lg font-bold">资源管理</div>
            <div className="text-xs">全部课件/图片等资源</div>
          </div>
        </a>
      </div>
      <h2 className="text-lg font-semibold mb-4">最近更新的教学资源</h2>
      <div className="flex flex-wrap gap-6">
        {fakeResources.map((res) => (
          <ResourceCard key={res.id} resource={res as any} />
        ))}
      </div>
    </>
  );
}
