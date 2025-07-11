
import { FileText, FileImage, FileVideo2, FileAudio2, File } from "lucide-react";
import { cn } from "@/lib/utils";

type Resource = {
  id: string;
  title: string;
  type: "document" | "image" | "video" | "audio" | "other";
  previewUrl?: string;
  updatedAt: string;
  file_path?: string;
  file_type?: string;
};

const colorMap = {
  document: "bg-blue-100 text-blue-600",
  image: "bg-orange-100 text-orange-500",
  video: "bg-purple-100 text-purple-500",
  audio: "bg-green-100 text-green-600",
  other: "bg-gray-100 text-gray-500",
};

export function ResourceCard({
  resource,
  onPreview
}: {
  resource: Resource;
  onPreview?: () => void;
}) {
  let Icon = File;
  if (resource.type === "document") Icon = FileText;
  if (resource.type === "image") Icon = FileImage;
  if (resource.type === "video") Icon = FileVideo2;
  if (resource.type === "audio") Icon = FileAudio2;

  return (
    <div
      className={cn(
        "w-full max-w-[230px] h-40 rounded-xl bg-white border border-gray-200 shadow-card hover:shadow-soft p-4 flex flex-col justify-between transition-all cursor-pointer group animate-fade-in"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded flex items-center justify-center text-white text-lg",
          colorMap[resource.type] || "bg-gray-100 text-gray-500"
        )}>
          {resource.type === "image" && resource.previewUrl ? (
            <img src={resource.previewUrl} alt={resource.title} className="w-8 h-8 object-cover rounded" />
          ) : (
            <Icon className="w-7 h-7" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold truncate text-gray-800">{resource.title}</div>
          <div className="text-xs mt-1 text-gray-400">{resource.updatedAt}</div>
        </div>
      </div>
      <button
        className="mt-3 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg py-1 hover:bg-blue-100 hover:text-blue-700 transition w-full shadow-sm"
        onClick={onPreview}
      >
        预览 / 下载
      </button>
    </div>
  );
}
