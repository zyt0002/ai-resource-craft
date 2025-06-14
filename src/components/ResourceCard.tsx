
import { FileText, FileImage, FileVideo2, FileAudio2, File } from "lucide-react";
import { cn } from "@/lib/utils";

type Resource = {
  id: string;
  title: string;
  type: "document" | "image" | "video" | "audio" | "other";
  previewUrl?: string;
  updatedAt: string;
};

export function ResourceCard({ resource }: { resource: Resource }) {
  let icon = File;
  if (resource.type === "document") icon = FileText;
  if (resource.type === "image") icon = FileImage;
  if (resource.type === "video") icon = FileVideo2;
  if (resource.type === "audio") icon = FileAudio2;

  return (
    <div
      className={cn(
        "w-full max-w-[240px] h-44 rounded-lg bg-card shadow hover:shadow-lg border p-4 flex flex-col justify-between transition-all cursor-pointer group animate-fade-in"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-accent flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
          {resource.type === "image" && resource.previewUrl ? (
            <img src={resource.previewUrl} alt={resource.title} className="w-8 h-8 object-cover rounded" />
          ) : (
            <icon className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold truncate">{resource.title}</div>
          <div className="text-xs mt-1 text-muted-foreground">{resource.updatedAt}</div>
        </div>
      </div>
      <button className="mt-3 text-xs text-primary bg-accent rounded py-1 hover:bg-primary hover:text-primary-foreground transition w-full">
        预览 / 下载
      </button>
    </div>
  );
}
