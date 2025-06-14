
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
        "w-full max-w-[240px] h-44 rounded-2xl bg-gradient-to-br from-sky-50 via-emerald-50 to-orange-100 shadow-card hover:shadow-hover border border-orange-100 p-4 flex flex-col justify-between transition-all cursor-pointer group animate-fade-pop hover:scale-105"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-r from-orange-200 to-emerald-200 flex items-center justify-center text-primary group-hover:bg-fuchsia-200 group-hover:text-primary-foreground transition">
          {resource.type === "image" && resource.previewUrl ? (
            <img src={resource.previewUrl} alt={resource.title} className="w-8 h-8 object-cover rounded" />
          ) : (
            <Icon className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold truncate">{resource.title}</div>
          <div className="text-xs mt-1 text-muted-foreground">{resource.updatedAt}</div>
        </div>
      </div>
      <button
        className="mt-3 text-xs font-semibold text-fuchsia-700 bg-gradient-to-r from-orange-200 to-fuchsia-200 rounded-lg py-1 hover:bg-fuchsia-400 hover:text-white transition w-full shadow-sm"
        onClick={onPreview}
      >
        预览 / 下载
      </button>
    </div>
  );
}
